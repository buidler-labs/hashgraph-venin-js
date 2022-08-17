import {
  AccountId,
  ContractCallQuery,
  ContractExecuteTransaction,
  ContractFunctionResult,
  ContractId,
  FileContentsQuery,
  FileId,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  Wallet,
  PublicKey,
  Query,
  Transaction,
  TransactionReceipt,
  TransactionRecord,
  TransactionRecordQuery,
  TransactionResponse,
} from "@hashgraph/sdk";
import { EventEmitter } from "events";
import { Interface } from "@ethersproject/abi";

import { ContractFunctionCall, LiveContract } from "./live/LiveContract";
import { HederaEntityId, LiveEntity } from "./live/LiveEntity";
import { Promised, RecursivePartial } from "./core/UsefulTypes";
import {
  StratoContext,
  StratoContextSource,
  StratoParameters,
} from "./StratoContext";
import { BasicUploadableEntity } from "./static/upload/BasicUploadableEntity";
import { CreatableEntity } from "./core/CreatableEntity";
import { File } from "./static/upload/File";
import { HederaNetwork } from "./HederaNetwork";
import { Json } from "./static/upload/Json";
import { LiveFile } from "./live/LiveFile";
import { LiveJson } from "./live/LiveJson";
import { SolidityAddressable } from "./core/SolidityAddressable";
import { StratoLogger } from "./StratoLogger";
import { StratoWallet } from "./core/wallet/StratoWallet";
import { Subscription } from "./core/Subscription";
import { UploadableEntity } from "./core/UploadableEntity";
import { WalletController } from "./core/wallet/WalletController";
import { WalletInfo } from "./core/wallet/WalletInfo";
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { WalletTypes } from "./wallet/WalletType";

type ApiSessionConstructorArgs = {
  ctx: StratoContext;
  client: StratoWallet;
};
type ControlledSession = {
  controller: WalletController;
  session: ApiSession;
};
type SessionExecutable<R> = Query<R> | Transaction;
type TransactionedReceipt<R> = {
  transaction: SessionExecutable<R>;
  receipt: TransactionReceipt;
};

export const enum TypeOfExecutionReturn {
  Receipt = "Receipt",
  Record = "Record",
  Result = "Result",
}

export type AllowedExecutionReturnTypes<R> =
  | ContractFunctionResult
  | TransactionResponse
  | R;
export type ExecutionReturnTypes<
  T extends AllowedExecutionReturnTypes<R>,
  R = any
> = {
  [TypeOfExecutionReturn.Receipt]: TransactionReceipt;
  [TypeOfExecutionReturn.Record]: TransactionRecord;
  [TypeOfExecutionReturn.Result]: T;
};

export type PublicAccountInfo = {
  id: AccountId;
  publicKey: PublicKey;
};

export type SessionDefaults = {
  contractCreationGas: number;
  contractTransactionGas: number;
  emitConstructorLogs: boolean;
  emitLiveContractReceipts: boolean;
  onlyReceiptsFromContractRequests: boolean;
  paymentForContractQuery: number;
};

const SESSION_CONSTRUCTOR_GUARD = {};

// The inner-name for the receipt pub-sub event slot
const TRANSACTION_ON_RECEIPT_EVENT_NAME =
  "__TransactionOnReceiptAvailable_EventName__";

/**
 * The core class used for all business-logic, runtime network-interactions.
 *
 * Should only be instantiable through direct {@link ApiSession} factory methods such as {@link ApiSession.default} (to load from a .env-like file/runtime process.env)
 * or {@link ApiSession.buildFrom} to construct an {@link ApiSession} from a manually-built {@link StratoContext} instance.
 */
export class ApiSession implements SolidityAddressable {
  /**
   * Builds and retrieves the default {@link ApiSession} associated with this runtime. There are currently 2 ways of providing the parameters required for the api-session to be built:
   * - either pass them through the {@param source.env} parameter property (defaults to the `process.env` for node environments) or
   * - give the path to a [dotenv](https://www.npmjs.com/package/dotenv) like file (defaults to `.env`) from which they are loaded by the library (the {@link source.path} parameter)
   *   which can be auto-overwritten via the {@link process.env.HEDERAS_ENV_PATH} value
   *
   * `Note:` At least one source must be properly wired and if both these parameter sources are set, the environment/runtime values overwrite the file-loaded ones.
   *
   * In order for the default {@link ApiSession} to be generated, the resulting resolved parameters must have the following values present:
   * - `HEDERAS_NETWORK` : the targeted hedera-network cluster. Can be one of the following: `mainnet`, `testnet`, `previewnet` or {@link HederaNetwork.HEDERA_CUSTOM_NET_NAME | customnet}
   * - `HEDERAS_NODES` : (mandatory if `HEDERAS_NETWORK={@link HederaNetwork.HEDERA_CUSTOM_NET_NAME}`) a comma separated list of {@link HederaNodesAddressBook} nodes encoded in
   *                     the following format `<node_ip>:<node_port>#<account_number>`. Eg. `127.0.0.1:502111#3` would be parsed in an address book having a node with IP `127.0.0.1`
   *                     and port 502111 associated with {@link AccountId} `3`
   * - `HEDERAS_WALLET_TYPE` : the network {@link StratoWallet} to use. Possible Values are statically defined in the {@link WalletTypes} props. If not provided, it defaults to `Sdk` which
   *                           targets the native {@link Wallet} provided by the Hedera SDK.
   *
   * For other possible config values, please either see the `.env.sample` info file provided with the main repo code or, better yet, the {@link https://hsj-docs.buidlerlabs.com/markdown/configuration online configuration} docs.
   */
  public static async default(
    params: RecursivePartial<StratoParameters> | string = {},
    path = process.env.HEDERAS_ENV_PATH || ".env"
  ): Promise<ControlledSession> {
    const ctxArgs: StratoContextSource =
      typeof params === "string"
        ? { params: {}, path: params }
        : { params, path };
    const ctx = new StratoContext(ctxArgs);

    return ApiSession.buildFrom(ctx);
  }

  /**
   * Another, more parametrically, way to build an {@link ApiSession} besides the {@link ApiSession.default} variant.
   */
  public static async buildFrom(
    ctx: StratoContext
  ): Promise<ControlledSession> {
    const { wallet, controller } = await ctx.getWallet();

    return {
      controller,
      session: new ApiSession(SESSION_CONSTRUCTOR_GUARD, {
        client: wallet,
        ctx,
      }),
    };
  }

  private readonly events: EventEmitter;
  public readonly log: StratoLogger;
  public readonly network: HederaNetwork;
  private readonly client: StratoWallet;
  public readonly defaults: SessionDefaults;

  /**
   * @hidden
   */
  constructor(
    constructorGuard: any,
    { ctx, client }: ApiSessionConstructorArgs
  ) {
    if (constructorGuard !== SESSION_CONSTRUCTOR_GUARD) {
      throw new Error(
        "API sessions can only be constructed through a SessionBuilder instance!"
      );
    }

    this.log = ctx.log;
    this.network = ctx.network;
    this.client = client;
    this.defaults = ctx.params.session.defaults;
    this.events = new EventEmitter();
  }

  /**
   * Retrieves the wallet-info structure portraying both account and current signer info for this {@link ApiSession}.
   */
  public get wallet(): WalletInfo {
    return this.client;
  }

  /**
   * Creates a new {@link LiveEntity} such as an {@link LiveAccount} or a {@link LiveToken}.
   *
   * @param what {@link CreatableEntity} - the prototype of the entity of interest
   * @returns - an interactive {@link LiveEntity} instance which resides on the chain
   */
  public async create<
    T extends LiveEntity<R, I, P>,
    R extends HederaEntityId,
    I,
    P
  >(what: CreatableEntity<T>): Promise<T> {
    this.log.info(`Creating a new Hedera ${what.name}`);

    const createdLiveEntity = await what.createVia({ session: this });

    this.log.info(
      `Successfully created ${what.name} id ${createdLiveEntity.id}`
    );
    return createdLiveEntity;
  }

  /**
   * Queries/Executes a contract function, capable of returning the {@link ContractFunctionResult} if successful. This depends on the {@param returnType} of course.
   */
  public async execute<T extends TypeOfExecutionReturn>(
    transaction: ContractFunctionCall,
    returnType?: T,
    getReceipt?: boolean
  ): Promise<ExecutionReturnTypes<ContractFunctionResult>[T]>;

  /**
   * A catch-all/generic {@link Transaction} execution operation yielding, upon success, of a {@link TransactionResponse}.
   */
  public async execute<T extends TypeOfExecutionReturn>(
    transaction: Transaction,
    returnType?: T,
    getReceipt?: boolean
  ): Promise<ExecutionReturnTypes<TransactionResponse>[T]>;

  /**
   * A catch-all/generic {@link Query<R>} execution operation yielding, upon success, of the underlying generic-bounded response type, R.
   */
  public async execute<T extends TypeOfExecutionReturn, R>(
    transaction: Query<R>,
    returnType?: T,
    getReceipt?: boolean
  ): Promise<ExecutionReturnTypes<R>[T]>;

  // Overload implementation
  public async execute<T extends TypeOfExecutionReturn, R>(
    transaction: SessionExecutable<R>,
    returnType: T,
    getReceipt = false
  ): Promise<ExecutionReturnTypes<AllowedExecutionReturnTypes<R>>[T]> {
    const isContractTransaction =
      transaction instanceof ContractCallQuery ||
      transaction instanceof ContractExecuteTransaction;
    let executionResult: AllowedExecutionReturnTypes<R>;
    let txReceipt: TransactionReceipt;
    let txRecord: TransactionRecord;
    const txResponse = await this.client.execute(transaction);

    // start with the assumption that either the execution is not a contract-transaction or that the transaction-response is not a TransactionResponse
    executionResult = txResponse;

    // see if the above assumption holds and refine executionResult if case may be
    if (txResponse instanceof TransactionResponse) {
      // start out by generating the receipt for the original transaction
      txReceipt = await this.client.getReceipt(txResponse);

      if (
        returnType === TypeOfExecutionReturn.Record ||
        (isContractTransaction && returnType === TypeOfExecutionReturn.Result)
      ) {
        const txRecordQuery = new TransactionRecordQuery().setTransactionId(
          txResponse.transactionId
        );

        txRecord = await this.client.execute(txRecordQuery);

        // lock onto the contract-function-result of the record just in case a Result return-type is expected
        executionResult = txRecord.contractFunctionResult;
      }

      if (this.canReceiptBeEmitted(getReceipt)) {
        this.events.emit(TRANSACTION_ON_RECEIPT_EVENT_NAME, {
          receipt: txReceipt,
          transaction: transaction,
        });
      }
    } else {
      // Note: ContractFunctionResult-s cannot emit receipts!
    }

    // Depending on the return-type resolution, fetch the typed-result
    return {
      [TypeOfExecutionReturn.Record]: txRecord,
      [TypeOfExecutionReturn.Receipt]: txReceipt,
      [TypeOfExecutionReturn.Result]: executionResult,
    }[returnType];
  }

  /**
   * Retrieves the solidity-address of the underlying {@link AccountId} that's operating this session.
   */
  public getSolidityAddress(): string {
    return this.wallet.account.id.toSolidityAddress();
  }

  /**
   * Loads a pre-deployed {@link LiveContract} ready to be called into at runtime. The contract-interface is passed in raw-ly
   * through the {@link abi} param.
   *
   * @param {object} options
   * @param {ContractId|string} options.id - the {@link ContractId} to load being it string-serialized or already parsed
   * @param {Promised<Interface>|Promised<Array>} options.abi - either the [etherjs contract interface](https://docs.ethers.io/v5/api/utils/abi/interface/) or
   *                                                            the [etherjs Interface compatible ABI definitions](https://docs.ethers.io/v5/api/utils/abi/interface/#Interface--creating)
   *                                                            to use with the resulting live-contract. Promises that resolve to any of these 2 types are also accepted.
   */
  public async getLiveContract({
    id,
    abi = [],
  }: {
    id: ContractId | string;
    abi?: Promised<Interface> | Promised<any[]>;
  }): Promise<LiveContract> {
    let targetedContractId: ContractId;
    const resolutedAbi = await abi;

    try {
      targetedContractId =
        id instanceof ContractId ? id : ContractId.fromString(id);
    } catch (e) {
      throw new Error(
        "Please provide a valid Hedera contract id in order try to lock onto an already-deployed contract."
      );
    }
    return new LiveContract({
      cInterface:
        resolutedAbi instanceof Interface
          ? resolutedAbi
          : new Interface(resolutedAbi),
      id: targetedContractId,
      session: this,
    });
  }

  /**
   * Given a {@link FileId} (string-serialized or parsed) of a deployed {@link Json} instance, retrieves a {@link LiveJson} reference.
   *
   * @param {object} options
   * @param {FileId | string} options.id - the file-id to load parsed as a {@link FileId} or raw in a string-serialized
   */
  public async getLiveJson({ id }: { id: FileId | string }): Promise<LiveJson> {
    let targetedFileId: FileId;

    try {
      targetedFileId = id instanceof FileId ? id : FileId.fromString(id);
    } catch (e) {
      throw new Error(
        "Please provide a valid Hedera file id in order try to lock onto an already-deployed Json object."
      );
    }
    const fileContentsQuery = new FileContentsQuery().setFileId(targetedFileId);
    const fileContentsBuffer = await this.execute(
      fileContentsQuery,
      TypeOfExecutionReturn.Result,
      false
    );
    const fileContents = new TextDecoder("utf8").decode(fileContentsBuffer);

    // TODO: use file Memo to store hash of file-contents and only return LiveJson instance if the 2 values match
    return new LiveJson({
      data: JSON.parse(fileContents),
      id: targetedFileId,
      session: this,
    });
  }

  /**
   * Register a callback to be called when a receipt is required and available for a transaction.
   *
   * @param clb - Callback function to be called when a {@link TransactionedReceipt} is available. The `transactionedReceipt` contains
   *              a reference to both the actual transaction being executed and the resulting receipt.
   * @returns {ReceiptSubscription} - A subscription object that exposes a 'unsubscribe' method to cancel a subscription.
   */
  public subscribeToReceiptsWith(clb: {
    (receipt: TransactionedReceipt<any>): any;
  }): Subscription<TransactionedReceipt<any>> {
    return new Subscription(
      this.events,
      TRANSACTION_ON_RECEIPT_EVENT_NAME,
      clb
    );
  }

  /**
   * Given an {@link UploadableEntity}, it tries ot upload it using the currently configured {@link ApiSession} passing in-it any provided {@link args}.
   *
   * @param {Uploadable} what - The {@link UploadableEntity} to push through this {@link ApiSession}
   * @param {*} args - A list of arguments to pass through the upload operation itself.
   *                   Note: this list has, by convention, at various unpacking stages in the call hierarchy, the capabilities to specify SDK behavior through
   *                         eg. "_file" ({@link UploadableEntity}) or "_contract" ({@link Contract})
   * @returns - An instance of the {@link UploadableEntity} concrete result-type which is a subtype of {@link LiveEntity}.
   */
  public async upload<
    T extends LiveEntity<R, I, P>,
    R extends HederaEntityId,
    I,
    P
  >(what: BasicUploadableEntity<T, R, I>, ...args: any[]): Promise<T>;

  /**
   * Given a raw JSON {@link object}, it tries to upload it using the currently configured {@link StratoWallet} passing in-it any provided {@link args}.
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
   *                   Note: this list has, by convention, at various unpaking stages in the call hierarchy, the capabilities to specify SDK behavior through
   *                         eg. "_file" ({@link Uploadable}) or "_contract" ({@link Contract})
   * @returns - An instance of the associated {@link LiveJson} resulting {@link LiveEntity}.
   */
  public async upload(what: object, ...args: any[]): Promise<LiveJson>;

  /**
   * Given raw data {@link string|Uint8Array}, it tries to upload it using the currently configured {@link StratoWallet} passing in-it any provided {@link args}.
   *
   * `Note:` This is the same as calling the more verbose equivalent of `upload(new File(what))`.
   *
   * Example of usage:
   * ```js
   * await apiSession.upload("This is the file content")
   * ```
   *
   * @param {object} what - The {@link File}-acceptable payload to push through this {@link ApiSession}
   * @param {*} args - A list of arguments to pass through the content upload operation itself
   * @returns - An instance of the associated {@link LiveFile} resulting {@link LiveEntity}
   */
  public async upload(
    what: string | Uint8Array,
    ...args: any[]
  ): Promise<LiveFile>;

  // Overload implementation
  public async upload<
    T extends LiveEntity<R, I, P>,
    R extends HederaEntityId,
    I,
    P
  >(
    what: UploadableEntity<T, R> | object | string | Uint8Array,
    ...args: any[]
  ): Promise<T> {
    let uploadableWhat: BasicUploadableEntity<T, R, I>;

    if (what instanceof BasicUploadableEntity === false) {
      if (typeof what === "string" || what instanceof Uint8Array) {
        uploadableWhat = new File(what) as unknown as BasicUploadableEntity<
          T,
          R,
          I
        >;
      } else if (Json.isInfoAcceptable(what)) {
        uploadableWhat = new Json(what) as unknown as BasicUploadableEntity<
          T,
          R,
          I
        >;
      } else {
        throw new Error(
          "Can only upload UploadableFile-s or Json-file acceptable content."
        );
      }
    } else {
      // upload what was given as is since it's an UploadableEntity type already
      uploadableWhat = what as unknown as BasicUploadableEntity<T, R, I>;
    }

    this.log.info(
      `Uploading a new ${uploadableWhat.nameOfUpload} to Hedera File Service (HFS).`
    );

    const createdLiveEntity = await uploadableWhat.uploadTo({
      args,
      session: this,
    });

    this.log.info(
      `Successfully created a ${uploadableWhat.nameOfUpload} id ${createdLiveEntity.id}.`
    );
    return createdLiveEntity;
  }

  private canReceiptBeEmitted(isEmitReceiptRequested: boolean): boolean {
    return (
      isEmitReceiptRequested &&
      this.events.listenerCount(TRANSACTION_ON_RECEIPT_EVENT_NAME) !== 0
    );
  }
}
