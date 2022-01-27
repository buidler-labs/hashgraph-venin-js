import { EventEmitter } from "events";

import { Interface } from '@ethersproject/abi';
import { 
  AccountId,
  ContractCallQuery, 
  ContractExecuteTransaction,
  ContractFunctionResult, 
  ContractId, 
  FileContentsQuery, 
  FileId, 
  Key, 
  Query, 
  Timestamp, 
  TokenCreateTransaction, 
  TokenSupplyType, 
  TokenType, 
  Transaction,
  TransactionReceipt,
  TransactionRecord,
  TransactionRecordQuery,
  TransactionResponse 
} from '@hashgraph/sdk';
import Duration from '@hashgraph/sdk/lib/Duration';
import { 
  HederaNetwork
} from './HederaNetwork';

import { ContractFunctionCall, LiveContract } from './live/LiveContract';
import { LiveEntity } from './live/LiveEntity';
import { LiveJson } from './live/LiveJson';
import { LiveToken } from './live/LiveToken';
import { SolidityAddressable } from './SolidityAddressable';
import { Json } from './static/Json';
import { UploadableEntity } from './static/UploadableEntity';
import { StratoClient } from "./client/StratoClient";
import { StratoLogger } from "./StratoLogger";
import { 
  ClientColdStartData, 
  ClientType, 
  StratoParametersSource, 
  StratoRuntimeParameters 
} from "./StratoRuntimeParameters";
import { HederaClientProvider } from "./client/HederaClient";
import { HashConnectClientProvider as HashConnectClientProvider } from "./client/HashConnectClient";

type ApiSessionConstructorArgs = {
  log: StratoLogger,
  network: HederaNetwork,
  client: StratoClient,
  defaults: SessionDefaults
};
type ExecutableTransaction = ContractFunctionCall|Transaction;
type TransactionedReceipt = {
  transaction: ExecutableTransaction,
  receipt: TransactionReceipt
};

export const enum TypeOfExecutionReturn {
  Receipt = "Receipt",
  Record = "Record",
  Result = "Result"
};

type ExecutionReturnTypes<T> = {
  [TypeOfExecutionReturn.Receipt]: TransactionReceipt,
  [TypeOfExecutionReturn.Record]: TransactionRecord,
  [TypeOfExecutionReturn.Result]: T
};

export type PublicAccountInfo = {
  id: AccountId;
  publicKey: Key;
}

export type SessionDefaults = { 
  contractCreationGas: number,
  contractTransactionGas: number,
  emitConstructorLogs: boolean,
  emitLiveContractReceipts: boolean,
  paymentForContractQuery: number
};

type TokenKeys = {
  admin?: Key,
  feeSchedule?: Key,
  freeze?: Key,
  kyc?: Key,
  pause?: Key,
  supply?: Key,
  wipe?: Key
};

type TokenFeatures = {
  name: string,
  symbol: string,
  decimals?: number | Long.Long,
  initialSupply?: number | Long.Long,
  treasuryAccountId?: string | AccountId,
  keys?: TokenKeys,
  freezeDefault?: boolean,
  autoRenewAccountId?: string | AccountId,
  expirationTime?: Date | Timestamp,
  autoRenewPeriod?: number | Long.Long | Duration,
  tokenMemo?: string,
  customFees?: { feeCollectorAccountId?: string | AccountId | undefined }[],
  type: TokenType,
  supplyType?: TokenSupplyType,
  maxSupply?: number | Long.Long
};

const SESSION_CONSTRUCTOR_GUARD = {};

// The inner-name for the receipt pub-sub event slot
const TRANSACTION_ON_RECEIPT_EVENT_NAME = "__TransactionOnReceiptAvailable_EventName__";

/**
 * The core class used for all business-logic, runtime network-interactions.
 * 
 * Should only be instantiable through a {@link HederaNetwork} method such as the {@link HederaNetwork.defaultApiSession} one.
 */
export class ApiSession implements SolidityAddressable {
  /**
   * Builds and retrieves the default {@link ApiSession} associated with this runtime. There are currently 2 ways of providing the parameters requried for the api-session to be built:
   * - either pass them through the {@param source.env} parameter property (defaults to the `process.env` for node environments) or 
   * - give the path to a [dotenv](https://www.npmjs.com/package/dotenv) like file (defaults to `.env`) from which they are loaded by the library (the {@link source.path} parameter)
   * 
   * `Note:` At least one source must be properly wired and if both these parameter sources are set, the environment/runtime values overwrite the file-loaded ones.
   * 
   * In order for the default {@link ApiSession} to be generated, the resulting resolved parameters must have the following values present:
   * - `HEDERAS_NETWORK` : the targeted hedera-network cluster. Can be one of the following: `mainnet`, `testnet`, `previewnet` or {@link HEDERA_CUSTOM_NET_NAME | customnet}
   * - `HEDERAS_NODES` : (mandatory if `HEDERAS_NETWORK={$link HEDERA_CUSTOM_NET_NAME}`) a comma separated list of addressbook nodes encoded in the following format
   *                    `<node_ip>#<account_number>`. Eg. `127.0.0.1#3` would be parsed in an address book having a node with IP `127.0.0.1` associated with {@link AccountId} `3`                                                            
   * - `HEDERAS_OPERATOR_ID` : the string representation of the {@link AccountId} operating the resulting session (eg. `0.0.2`)
   * - `HEDERAS_OPERATOR_KEY` : the string representation of the private key of the `HEDERAS_OPERATOR_ID` operator paying for the session 
   * 
   * @param {HederaDefaultApiSessionParamsSource} source
   */
  public static async default({ env = process.env, path = process.env.HEDERAS_ENV_PATH || '.env' }: StratoParametersSource = {}): Promise<ApiSession> {
    const params = new StratoRuntimeParameters({ env, path });
    
    return this.buildFrom(params);
  }

  public static async buildFrom(params: StratoRuntimeParameters): Promise<ApiSession> {
    const log = new StratoLogger(params);

    return new SessionBuilder(log, params.network)
      .setClientProviderType(params.client.type)
      .setClientColdStartData(params.client.coldStartData)
      .setClientSavedState(params.client.savedState)  
      .setDefaults(params.session.defaults)
      .build();
  }

  private readonly events: EventEmitter;
  public readonly log: StratoLogger;
  public readonly network: HederaNetwork;
  private readonly client: StratoClient;
  public readonly defaults: SessionDefaults;

  /**
   * @hidden
   */
  constructor(constructorGuard: any, { log, network, client, defaults }: ApiSessionConstructorArgs) {
    if (constructorGuard !== SESSION_CONSTRUCTOR_GUARD) {
      throw new Error("API sessions can only be constructed through a SessionBuilder instance!");
    }

    this.log = log;
    this.network = network;
    this.client = client;
    this.defaults = defaults;
    this.events = new EventEmitter();
  }

  /**
   * Retrieves the operator {@link AccountId} for this {@link ApiSession}.
   */
  public get accountId() {
    return this.client.account.id;
  }

  /**
   * Retrieves the operator's public-key.
   */
  public get publicKey() {
    return this.client.account.publicKey;
  }

  /**
   * Creates a new Token on the network returning a {@link LiveToken} in the process.
   * 
   * @param features - The token's feature as accepted by the {@link TokenCreateTransaction} constructor
   * @returns - an interactive {@link LiveToken} instance
   */
  public async createToken(features: TokenFeatures): Promise<any> {
    const constructorArgs = {
      // First map to expected properties
      adminKey: this.publicKey,
      feeScheduleKey: this.publicKey,
      freezeKey: this.publicKey,
      kycKey: this.publicKey,
      pauseKey: this.publicKey,
      supplyKey: this.publicKey,
      tokenName: features.name,
      tokenType: features.type,
      tokenSymbol: features.symbol,
      treasuryAccountId: this.accountId,
      wipeKey: this.publicKey,

      // Merge everything with what's provided
      ...features
    };
    const createTokenTransaction = new TokenCreateTransaction(constructorArgs as any);
    const creationReceipt = await this.execute(createTokenTransaction, TypeOfExecutionReturn.Receipt, true);

    return new LiveToken({ session: this, id: creationReceipt.tokenId });
  }

   /**
    * Queries/Executes a contract function, capable of returning the {@link ContractFunctionResult} if successfull. This depends on the {@param returnType} of course.
    */
  public async execute<T extends TypeOfExecutionReturn>(transaction: ContractFunctionCall, returnType?: T, getReceipt?: boolean)
    : Promise<ExecutionReturnTypes<ContractFunctionResult>[T]>;

   /**
    * A catch-all/generic {@link Transaction} execution operation yeilding, upon success, of a {@link TransactionResponse}.
    */
  public async execute<T extends TypeOfExecutionReturn>(transaction: Transaction, returnType?: T, getReceipt?: boolean)
    : Promise<ExecutionReturnTypes<TransactionResponse>[T]>;

  /**
    * A catch-all/generic {@link Query<R>} execution operation yeilding, upon success, of the underlying generic-bounded response type, R.
    */
  public async execute<T extends TypeOfExecutionReturn, R>(transaction: Query<R>, returnType?: T, getReceipt?: boolean)
   : Promise<ExecutionReturnTypes<R>[T]>;

   // Overload implementation
  public async execute<T extends TypeOfExecutionReturn, R>(
      transaction: ExecutableTransaction|Query<R>, 
      returnType: T, 
      getReceipt: boolean = false)
    : Promise<ExecutionReturnTypes<ContractFunctionResult|TransactionResponse|R>[T]> {
    const isContractTransaction = transaction instanceof ContractCallQuery || transaction instanceof ContractExecuteTransaction;
    let executionResult: ContractFunctionResult|TransactionResponse|R;
    let txReceipt: TransactionReceipt;
    let txRecord: TransactionRecord;
    const txResponse = await this.client.execute(transaction);

    // start with the assumption that either the execution is not a contract-transaction or that the transaction-response is not a TransactionResponse
    executionResult = txResponse;

    // see if the above assumption holds and refine executionResult if case may be
    if (txResponse instanceof TransactionResponse) {
      // start out by emiting the receipt for the original transaction, if required, and someone is interested in it
      if (this.canReceiptBeEmitted(getReceipt) || returnType === TypeOfExecutionReturn.Receipt) {
        txReceipt = await this.client.getReceipt(txResponse);
        if (this.canReceiptBeEmitted(getReceipt)) {
          this.events.emit(TRANSACTION_ON_RECEIPT_EVENT_NAME, { transaction, receipt: txReceipt });
        }
      }
      
      if (returnType === TypeOfExecutionReturn.Record || (isContractTransaction && returnType === TypeOfExecutionReturn.Result)) {
        if (!txReceipt) {
          txReceipt = await this.client.getReceipt(txResponse);
        }

        const txRecordQuery = new TransactionRecordQuery().setTransactionId(txResponse.transactionId);

        txRecord = await this.client.execute(txRecordQuery);

        // try sending the receipt for the underlying TransactionRecordQuery
        if (this.canReceiptBeEmitted(getReceipt)) {
          this.events.emit(TRANSACTION_ON_RECEIPT_EVENT_NAME, { transaction: txRecordQuery, receipt: txRecord.receipt });
        }

        // lock onto the contract-function-result of the record just in case a Result return-type is expected
        executionResult = txRecord.contractFunctionResult;
      }
    } else {
      // Note: ContractFunctionResult-s cannot emit receipts!
    }

    // Depending on the return-type resolution, fetch the typed-result
    return {
      [TypeOfExecutionReturn.Record]: txRecord,
      [TypeOfExecutionReturn.Receipt]: txReceipt,
      [TypeOfExecutionReturn.Result]: executionResult
    }[returnType];
  }

  /**
   * Retrieves the solidity-address of the underlying {@link AccountId} that's operating this session.
   */
  async getSolidityAddress(): Promise<string> {
    return this.accountId.toSolidityAddress();
  }

  /**
   * Loads a pre-deployed {@link LiveContract} ready to be called into at runtime. The contract-interface is passed in raw-ly 
   * through the {@link abi} param.
   * 
   * @param {object} options
   * @param {ContractId|string} options.id - the {@link ContractId} to load being it string-serialized or already parsed
   * @param {Interface|Array} options.abi - either the [etherjs contract interface](https://docs.ethers.io/v5/api/utils/abi/interface/) or the [etherjs Interface compatible ABI 
   *                                        definitions](https://docs.ethers.io/v5/api/utils/abi/interface/#Interface--creating) to use with the resulting live-contract
   */
  public async getLiveContract({ id, abi = [] }: { id: ContractId|string, abi?: Interface|any[] }): Promise<LiveContract> {
    let targetedContractId: ContractId;

    try {
      targetedContractId = id instanceof ContractId ? id : ContractId.fromString(id)
    } catch(e) {
      throw new Error("Please provide a valid Hedera contract id in order try to lock onto an already-deployed contract.");
    }
    return new LiveContract({ 
      session: this,
      id: targetedContractId,
      cInterface: abi instanceof Interface ? abi : new Interface(abi)
    });
  }

  /**
   * Given a {@link FileId} (string-serialized or parsed) of a deployed {@link Json} instance, retrieves a {@link LiveJson} reference.
   * 
   * @param {object} options 
   * @param {FileId | string} options.id - the file-id to load parsed as a {@link FileId} or raw in a string-serialized
   */
  public async getLiveJson({ id }: { id: FileId|string }): Promise<LiveJson> {
    let targetedFileId: FileId;

    try {
      targetedFileId = id instanceof FileId ? id : FileId.fromString(id)
    } catch(e) {
      throw new Error("Please provide a valid Hedera file id in order try to lock onto an already-deployed Json object.");
    }
    const fileContentsQuery = await new FileContentsQuery().setFileId(targetedFileId);
    const fileContentsBuffer = await this.execute(fileContentsQuery, TypeOfExecutionReturn.Result, false);
    const fileContents = new TextDecoder('utf8').decode(fileContentsBuffer);
    
    // TODO: use file Memo to store hash of file-contents and only return LiveJson instance if the 2 values match
    return new LiveJson({ 
      session: this,
      id: targetedFileId,
      data: JSON.parse(fileContents)
    });
  }

  /**
   * Register a callback to be called when a receipt is required and available for a transaction.
   * 
   * @param clb - Callback function to be called when a {@link TransactionedReceipt} is available. The `transactionedReceipt` contains
   *              a reference to both the actual transaction being executed and the resulting receipt.
   * @returns {ReceiptSubscription} - A subscription object that exposes a 'unsubscribe' method to cancel a subscription.
   */
  public subscribeToReceiptsWith(clb: {(receipt: TransactionedReceipt): any}): ReceiptSubscription {
    return new ReceiptSubscription(this.events, clb);
  }

  /**
   * Given an {@link UploadableEntity}, it triest ot upload it using the currently configured {@link ApiSession} passing in-it any provided {@link args}.
   * 
   * @param {Uploadable} what - The {@link UploadableEntity} to push through this {@link ApiSession}
   * @param {*} args - A list of arguments to pass through the upload operation itself.
   *                   Note: this list has, by convention, at various unpaking stages in the call hierarchy, the capabilities to specify SDK behaviour through
   *                         eg. "_file" ({@link UploadableEntity}) or "_contract" ({@link Contract})
   * @returns - An instance of the {@link UploadableEntity} concrete result-type which is a subtype of {@link LiveEntity}.
   */
  public async upload<T extends LiveEntity<R>, R>(what: UploadableEntity<T, R>, ...args: any[]): Promise<T>;

  /**
  * Given a raw JSON {@link object}, it triest ot upload it using the currently configured {@link Client} passing in-it any provided {@link args}.
  * 
  * `Note:` This is the same as calling the more verbose equivalent of `upload(new Json(what))`.
  * 
  * Example of usage:
  * ```js
  * await apiSession.upload({a: 1, {b: "c"}})
  * ```
  * 
  * @param {object} what - The {@link Json}-acceptable payload to push through this {@link ApiSession}
  * @param {*} args - A list of arguments to pass through the upload operation itself.
  *                   Note: this list has, by convention, at various unpaking stages in the call hierarchy, the capabilities to specify SDK behaviour through
  *                         eg. "_file" ({@link Uploadable}) or "_contract" ({@link Contract})
  * @returns - An instance of the associated {@link LiveJson} resulting {@link LiveEntity}.
  */
  public async upload(what: object, ...args: any[]): Promise<LiveJson>;

  // Overload implementation
  public async upload<T extends LiveEntity<R>, R>(what: UploadableEntity<T, R>|object, ...args: any[]): Promise<T|LiveJson> {
    let uploadableWhat: UploadableEntity<T, R>;

    this.log.debug("Starting a new entity upload to the Hedera File Service.");
    if (what instanceof UploadableEntity === false) {
      // Try to go with a live-json upload
      if (Json.isInfoAcceptable(what)) {
        uploadableWhat = (new Json(what) as unknown) as UploadableEntity<T, R>;
      } else {
        // There's nothing we can do
        throw new Error("Can only upload UploadableFile-s or Json-file acceptable content.");
      }
    } else {
      // upload what was given as is since it's an UploadableEntity type already
      uploadableWhat = (what as unknown) as UploadableEntity<T, R>;
    }
    return uploadableWhat.uploadTo({ session: this, args });
  }

  private canReceiptBeEmitted(isEmitReceiptRequested: boolean): boolean {
    return (isEmitReceiptRequested && this.events.listenerCount(TRANSACTION_ON_RECEIPT_EVENT_NAME) !== 0);
  }
}

class ReceiptSubscription {
  constructor(
    private readonly events: EventEmitter, 
    private readonly clb: {(receipt: TransactionedReceipt): any}) {
      events.on(TRANSACTION_ON_RECEIPT_EVENT_NAME, clb);
    }
  
  public unsubscribe() {
    this.events.off(TRANSACTION_ON_RECEIPT_EVENT_NAME, this.clb);
  }
}

export class SessionBuilder {
  private clientColdStartData: ClientColdStartData;
  private clientSavedState: string;
  private clientType: ClientType;
  private defaults: SessionDefaults;
  
  public constructor (
    private readonly log: StratoLogger,
    private readonly network: HederaNetwork
  ) {}

  public async build(): Promise<ApiSession> {
    const settledDefaults: SessionDefaults = {
      contractCreationGas: (this.defaults && this.defaults.contractCreationGas) || 150_000,
      contractTransactionGas: (this.defaults && this.defaults.contractTransactionGas) || 169_000,
      emitConstructorLogs: this.defaults ? this.defaults.emitConstructorLogs : true,
      emitLiveContractReceipts: this.defaults ? this.defaults.emitLiveContractReceipts : false,
      paymentForContractQuery: (this.defaults && this.defaults.paymentForContractQuery) || 0
    };
    let client: StratoClient;
    let clientProvider;

    switch(this.clientType) {
      case ClientType.Hedera:
        clientProvider = new HederaClientProvider(this.log);
        break;
      case ClientType.HashConnect:
        clientProvider = new HashConnectClientProvider(this.log);
        break;
      default:
        throw new Error("Please provide a valid ClientType so that a known, sane, client-provider can be created from.");
    }
    clientProvider.setNetwork(this.network);
    if (this.clientSavedState) {
      client = await clientProvider.buildRestoring(this.clientSavedState);
    } else if (this.clientColdStartData) {
      client = await clientProvider.buildColdFor(this.clientColdStartData);
    } else {
      throw new Error("Please provide either the cold-start data or a saved-state from where to create the bounded underlying Client with.");
    }

    return new ApiSession(SESSION_CONSTRUCTOR_GUARD, {
      log: this.log, 
      network: this.network, 
      client, 
      defaults: settledDefaults
    });
  }

  public setClientProviderType(type: ClientType): this {
    this.clientType = type;
    return this;
  }
  public setClientColdStartData(data: ClientColdStartData): this {
    this.clientColdStartData = data;
    return this;
  }

  public setClientSavedState(serializedState: string): this {
    this.clientSavedState = serializedState;
    return this;
  }

  public setDefaults(defaults: SessionDefaults): this {
    this.defaults = defaults;
    return this;
  }
}
