import { EventEmitter } from "events";
import Long from "long";

import {
  ContractCallQuery,
  ContractCreateTransaction,
  ContractDeleteTransaction,
  ContractExecuteTransaction,
  ContractFunctionResult,
  ContractId,
  ContractInfo,
  ContractInfoQuery,
  ContractLogInfo,
  Hbar,
  Transaction,
  TransactionId,
} from "@hashgraph/sdk";
import { FunctionFragment, Interface } from "@ethersproject/abi";
import BigNumber from "bignumber.js";
import { arrayify } from "@ethersproject/bytes";
import traverse from "traverse";

import { ApiSession, TypeOfExecutionReturn } from "../ApiSession";
import { Contract, ContractFeatures } from "../static/upload/Contract";
import {
  extractSolidityAddressFrom,
  isSolidityAddressable,
} from "../core/SolidityAddressable";

import { BaseLiveEntityWithBalance } from "./BaseLiveEntityWithBalance";
import { BigNumber as EthersBigNumber } from "@ethersproject/bignumber";
import { StratoAddress } from "../core/StratoAddress";
import { encodeToHex } from "../core/Hex";
import { transform } from "../core/UsefulOps";

const UNHANDLED_EVENT_NAME = "UnhandledEventName";

export type ContractFunctionCall =
  | ContractCallQuery
  | ContractExecuteTransaction;
export type ContractMethod<T = any> = (...args: Array<any>) => Promise<T>;
type CreateContractRequestMeta = {
  emitReceipt: boolean;
  onlyReceipt: boolean;
};
export type LiveContractConstructorArgs = {
  session: ApiSession;
  id: ContractId;
  cInterface: Interface;
};
type ParsedEvent = {
  name: string;
  payload: any;
};

function isContractQueryRequest(
  request: ContractFunctionCall
): request is ContractCallQuery {
  return request instanceof ContractCallQuery;
}

function parseLogs(
  cInterface: Interface,
  logs: ContractLogInfo[]
): ParsedEvent[] {
  return logs
    .map((recordLog) => {
      const data = encodeToHex(recordLog.data);
      const topics = recordLog.topics.map((topic) => encodeToHex(topic));

      try {
        const logDescription = cInterface.parseLog({ data, topics });
        const decodedEventObject = Object.keys(logDescription.args)
          .filter((evDataKey) => isNaN(Number(evDataKey)))
          .map((namedEvDataKey) => ({
            [namedEvDataKey]: logDescription.args[namedEvDataKey],
          }))
          .reduce((p, c) => ({ ...p, ...c }), {});

        return {
          name: logDescription.name,
          payload: decodedEventObject,
        };
      } catch (e) {
        // No-op, yet we need to filter this element out because something went wrong
        // TODO: log something here
        return null;
      }
    })
    .filter((parsedLogCandidate) => parsedLogCandidate !== null);
}

export class LiveContract extends BaseLiveEntityWithBalance<
  ContractId,
  ContractInfo,
  ContractFeatures
> {
  /**
   * Constructs a new LiveContract to be interacted with on the Hashgraph.
   */
  public static async newFollowingUpload({
    session,
    contract,
    emitConstructorLogs,
    transaction,
  }: {
    session: ApiSession;
    contract: Contract;
    emitConstructorLogs: boolean;
    transaction: ContractCreateTransaction;
  }): Promise<LiveContractWithLogs> {
    let id: ContractId;
    let logs: ParsedEvent[];

    if (emitConstructorLogs) {
      const createdContractRecord = await session.execute(
        transaction,
        TypeOfExecutionReturn.Record,
        true
      );

      id = createdContractRecord.receipt.contractId;
      logs = parseLogs(
        contract.interface,
        createdContractRecord.contractFunctionResult.logs
      );
    } else {
      const transactionReceipt = await session.execute(
        transaction,
        TypeOfExecutionReturn.Receipt,
        true
      );

      id = transactionReceipt.contractId;
      logs = [];
    }
    return new LiveContractWithLogs({
      cInterface: contract.interface,
      id,
      logs,
      session,
    });
  }

  private readonly events: EventEmitter;
  private readonly interface: Interface;

  // TODO: REFACTOR THIS AWAY! yet, there's no other way of making this quickly work right now!
  readonly [k: string]: ContractMethod | any;

  public constructor({ session, id, cInterface }: LiveContractConstructorArgs) {
    super(session, id);
    this.events = new EventEmitter();
    this.interface = cInterface;

    // Dynamically inject ABI function handling
    Object.values(this.interface.functions).forEach((fDescription) =>
      Object.defineProperty(this, fDescription.name, {
        enumerable: true,
        value: async function (
          this: LiveContract,
          fDescription: FunctionFragment,
          ...args: any[]
        ) {
          const { request, meta } = await this.createContractRequestFor({
            args,
            fDescription,
          });
          const isNonQuery = !(request instanceof ContractCallQuery);
          const executionResultType =
            isNonQuery && meta.onlyReceipt
              ? TypeOfExecutionReturn.Receipt
              : TypeOfExecutionReturn.Result;
          const callResponse = await this.executeSanely(
            request,
            executionResultType,
            meta.emitReceipt
          );

          if (executionResultType == TypeOfExecutionReturn.Result) {
            this.tryToProcessForEvents(callResponse as ContractFunctionResult);
            return await this.tryExtractingResponse(
              callResponse as ContractFunctionResult,
              fDescription
            );
          }

          // Reaching this point means that only the receipt was requested. We have it so we pass it through
          return callResponse;
        }.bind(this, fDescription),
        writable: false,
      })
    );
  }

  /**
   * Retrieves the Solidity address representation of the underlying, deployed, contract.
   */
  public getSolidityAddress(): string {
    return this.id.toSolidityAddress();
  }

  /**
   * Registers/De-registers code to be executed when a particular contract event gets triggered.
   *
   * @param name - the name of the event of interest
   * @param clb - if {@link undefined}, it removes all registered callbacks for the provided event-name else,
   *              if a function callback is provided, registers it to be executed when the event gets fired
   * @throws - if there is no such event-name defined, an error gets thrown
   */
  public onEvent(name: string, clb: undefined | { (...args: any[]): void }) {
    const eventExists =
      Object.values(this.interface.events).find((ev) => ev.name === name) !==
      undefined;

    if (!eventExists && UNHANDLED_EVENT_NAME !== name) {
      throw new Error(
        `There is no such event named '${name}' defined in this contract.`
      );
    }
    if (!clb) {
      // remove all handlers for this event
      this.events.removeAllListeners(name);
    } else {
      // register the event handler
      this.events.on(name, clb);
    }
  }

  /**
   * Registers/De-registers code to be executed when a particular contract event gets triggered yet there are no event-handlers registered to handle it.
   *
   * @param clb - the callback to get executed, if defined, otherwise remove all callbacks for this special event
   */
  public onUnhandledEvents(clb: undefined | { (...args: any[]): void }) {
    this.onEvent(UNHANDLED_EVENT_NAME, clb);
  }

  /**
   * Creates a contract query/call request based for the given function-description and the desired arguments (args).
   * The first argument is checked to see if it matches the constructor arguments schema and, if it does, it's used to construct the
   * actual request instance, discarding it in the process so that the remaining arguments can all be used as the actual values sent to
   * the targeted function.
   */
  private async createContractRequestFor({
    fDescription,
    args,
  }: {
    fDescription: FunctionFragment;
    args: any[];
  }): Promise<{
    meta: CreateContractRequestMeta;
    request: ContractFunctionCall;
  }> {
    let requestOptionsPresentInArgs = false;
    const constructorArgs: any = {
      contractId: this.id,
      gas: this.session.defaults.contractTransactionGas,
    };
    const meta: CreateContractRequestMeta = {
      emitReceipt: this.session.defaults.emitLiveContractReceipts,
      onlyReceipt: this.session.defaults.onlyReceiptsFromContractRequests,
    };

    // Try to unpack common meta-args that can be passed in at query/transaction construction time
    if (args && args.length > 0) {
      if (args[0].gas instanceof Hbar) {
        args[0].gas = args[0].gas.toTinybars();
      }
      if (Number.isInteger(args[0].gas) || args[0].gas instanceof Long) {
        constructorArgs.gas = args[0].gas;
        requestOptionsPresentInArgs = true;
      }
    }

    // Initialize the Hedera request-object itself passing in any additional constructor args (if provided)
    const request = fDescription.constant
      ? new ContractCallQuery(constructorArgs)
      : new ContractExecuteTransaction(constructorArgs);

    // Inject session-configurable defaults
    if (
      isContractQueryRequest(request) &&
      this.session.defaults.paymentForContractQuery > 0
    ) {
      const queryPaymentInHbar = Hbar.fromTinybars(
        this.session.defaults.paymentForContractQuery
      );

      request.setQueryPayment(queryPaymentInHbar);
    }

    // Try to inject setter-only options
    if (args && args.length > 0) {
      if (isContractQueryRequest(request)) {
        // Try setting additional Query properties
        if (args[0].maxQueryPayment instanceof Hbar) {
          request.setMaxQueryPayment(args[0].maxQueryPayment);
          requestOptionsPresentInArgs = true;
        }
        if (args[0].paymentTransactionId instanceof TransactionId) {
          request.setPaymentTransactionId(args[0].paymentTransactionId);
          requestOptionsPresentInArgs = true;
        }
        if (args[0].queryPayment instanceof Hbar) {
          request.setQueryPayment(args[0].queryPayment);
          requestOptionsPresentInArgs = true;
        }
      } else {
        // This is a state-changing Transaction. Try setting additional properties as well
        if (args[0].amount) {
          // number | string | Long | BigNumber | Hbar
          request.setPayableAmount(args[0].amount);
          requestOptionsPresentInArgs = true;
        }
        if (args[0].maxTransactionFee) {
          // number | string | Long | BigNumber | Hbar
          request.setMaxTransactionFee(args[0].maxTransactionFee);
          requestOptionsPresentInArgs = true;
        }
        if (Array.isArray(args[0].nodeAccountIds)) {
          request.setNodeAccountIds(args[0].nodeAccountIds);
          requestOptionsPresentInArgs = true;
        }
        if (args[0].transactionId instanceof TransactionId) {
          request.setTransactionId(args[0].transactionId);
          requestOptionsPresentInArgs = true;
        }
        if (args[0].transactionMemo) {
          // string
          request.setTransactionMemo(args[0].transactionMemo);
          requestOptionsPresentInArgs = true;
        }
        if (Number.isInteger(args[0].transactionValidDuration)) {
          request.setTransactionValidDuration(args[0].transactionValidDuration);
          requestOptionsPresentInArgs = true;
        }
      }
    }

    // Try extracting meta-arguments (if any)
    if (args && args.length > 0) {
      if (args[0].emitReceipt === false || args[0].emitReceipt === true) {
        meta.emitReceipt = args[0].emitReceipt;
        requestOptionsPresentInArgs = true;
      }
      if (args[0].onlyReceipt === false || args[0].onlyReceipt === true) {
        meta.onlyReceipt = args[0].onlyReceipt;
        requestOptionsPresentInArgs = true;
      }
    }

    // Try cleaning up arguments list if config object was provide
    if (requestOptionsPresentInArgs) {
      args = args.slice(1);
    }

    traverse(args).forEach(function (potentialArg) {
      const solArgDescription = this.path.reduce((state, propName) => {
        if (!isNaN(parseInt(propName))) {
          // property name is numeric
          if (state.baseType === "array") {
            // Bypass instance references
            return state;
          }
        } else {
          // property name is NOT numeric. It might be referencing a solidity struct prop
          if (state.type.startsWith("tuple")) {
            return state.components.find(
              (component) => component.name === propName
            );
          }
        }
        return state[propName];
      }, fDescription.inputs);
      const requireBytesYetStringProvided =
        this.isLeaf &&
        solArgDescription !== undefined &&
        solArgDescription.type !== undefined &&
        solArgDescription.type.startsWith("bytes") &&
        typeof potentialArg === "string";

      // Do primitive leaf processing
      if (requireBytesYetStringProvided) {
        const considerMappingStringToUint8Array = (arg: string): Uint8Array =>
          arg.startsWith("0x") ? arrayify(arg) : new TextEncoder().encode(arg);
        this.update(
          transform(potentialArg, considerMappingStringToUint8Array),
          true
        );
      }

      if (
        this.isLeaf ||
        (!(potentialArg instanceof Uint8Array) &&
          !(potentialArg instanceof Hbar) &&
          !isSolidityAddressable(potentialArg) &&
          !BigNumber.isBigNumber(potentialArg))
      ) {
        // We're only processing mostly leafs or higher objects of interest
        return;
      }

      if (solArgDescription.type.startsWith("address")) {
        const considerMappingSolidityAddressableToAddress = (
          arg: any
        ): string =>
          isSolidityAddressable(arg) ? arg.getSolidityAddress() : arg;
        this.update(
          transform(potentialArg, considerMappingSolidityAddressableToAddress),
          true
        );
      } else if(potentialArg instanceof Hbar) {
        this.update(EthersBigNumber.from(potentialArg._valueInTinybar.toString()), true);
      } else if (BigNumber.isBigNumber(potentialArg)) {
        this.update(EthersBigNumber.from(potentialArg.toString()), true);
      }
    });

    const encodedFuncParams = this.interface
      .encodeFunctionData(fDescription.name, args)
      .slice(2);
    const funcParamsBuffer = Buffer.from(encodedFuncParams, "hex");

    request.setFunctionParameters(funcParamsBuffer);

    return {
      meta,
      request,
    };
  }

  /**
   * Given a contract-request response (txResponse) and a targeted function-description, it tries to extract and prepare the caller response based on
   * the contract's output function ABI specs.
   */
  private tryExtractingResponse(
    txResponse: ContractFunctionResult,
    fDescription: FunctionFragment
  ) {
    let fResponse;
    const fResult = this.interface.decodeFunctionResult(
      fDescription,
      txResponse.asBytes()
    );
    const fResultKeys = Object.keys(fResult).filter((evDataKey) =>
      isNaN(Number(evDataKey))
    );

    if (fDescription.outputs && fDescription.outputs.length !== 0) {
      if (fResultKeys.length === fDescription.outputs.length) {
        // A named object can be returned since all the outputs are named
        const isBytesTypeExpectedFor = (propKey: string) =>
          fDescription.outputs
            .find((o) => o.name === propKey)
            .type.startsWith("bytes");
        const tryMappingToHederaBytes = (propKey: string) =>
          isBytesTypeExpectedFor(propKey)
            ? arrayify(fResult[propKey])
            : fResult[propKey];

        fResponse = fResultKeys
          .map((namedfDataKey) => ({
            [namedfDataKey]: tryMappingToHederaBytes(namedfDataKey),
          }))
          .reduce((p, c) => ({ ...p, ...c }), {});
      } else {
        fResponse = [...fResult];

        // Map all Ethers HexString representations of bytes-type responses to their UInt8Array forms (same used by Hedera)
        fResponse = fDescription.outputs.map((dType, id) =>
          dType.type.startsWith("bytes")
            ? arrayify(fResponse[id])
            : fResponse[id]
        );

        // If there is only one result returned, we unpack it and return it as it is, ditching the hosting array
        if (fResponse.length === 1) {
          fResponse = fResponse[0];
        }
      }

      // Do various type re-mappings such as:
      //    - Ethers' BigNumber to the Hedera-used, bignumber.js equivalent
      //    - solidity-address compatible values to LiveAddress-es
      const tryRemapingValue = (what: any, f: { (...args: any[]): any }) => {
        let wasMapped = false;

        if (
          typeof what === "string" &&
          extractSolidityAddressFrom(what) !== undefined
        ) {
          // most likely, this is a solidity-address
          f(
            new StratoAddress(this.session, what, this.id.shard, this.id.realm),
            true
          );
          wasMapped = true;
        } else if (EthersBigNumber.isBigNumber(what)) {
          f(new BigNumber(what.toString()), false);
          wasMapped = true;
        }
        return wasMapped;
      };

      if (
        !tryRemapingValue(fResponse, (newVal) => {
          fResponse = newVal;
        })
      ) {
        traverse(fResponse).forEach(function (x) {
          tryRemapingValue(x, this.update);
        });
      }
    }
    return fResponse;
  }

  /**
   * Given the call-response of a contract-method call/query, we try to see if there have been any events emitted and, if so, we re-emit them on the live-contract events pub-sub channel.
   *
   * Note: even if there is an event triggered, if there are no handlers registered, the first thing we do is try to dump it on the {@link UNHANDLED_EVENT_NAME} channel.
   *       if there are no handlers registered there either, we skip the event all-together.
   */
  private tryToProcessForEvents(callResponse: ContractFunctionResult): void {
    const loggedEvents = parseLogs(this.interface, callResponse.logs);

    loggedEvents.forEach(({ name, payload }) => {
      let evNameToSendTo: string;

      if (this.events.listenerCount(name) === 0) {
        // No one is interested in this event
        // Try to dump it to the "catch-all-if-none-defined" event handler
        if (this.events.listenerCount(UNHANDLED_EVENT_NAME) === 0) {
          // No default, catch-all event handler defined. Skip event entirely
          return;
        }
        evNameToSendTo = UNHANDLED_EVENT_NAME;
      } else {
        // We have listeners for this event. Business as usual
        evNameToSendTo = name;
      }

      try {
        this.events.emit(evNameToSendTo, payload);
      } catch (e) {
        if (process.env.NODE_ENV === "test") {
          // We re-interpret and throw it so that any tests running will be aware of it
          throw new Error(
            `The event-emitter handle '${name}' failed to execute with the following reason: ${e.message}`
          );
        }
        // otherwise, it's a No-op
      }
    });
  }

  public getLiveEntityInfo(): Promise<ContractInfo> {
    const contractInfoQuery = new ContractInfoQuery().setContractId(this.id);
    return this.executeSanely(
      contractInfoQuery,
      TypeOfExecutionReturn.Result,
      false
    );
  }

  protected override newDeleteTransaction<R>(args?: R): Transaction {
    return new ContractDeleteTransaction({ contractId: this.id, ...args });
  }

  protected _getUpdateTransaction(
    args?: ContractFeatures
  ): Promise<Transaction> {
    throw new Error("Method not implemented.");
  }

  protected _getBalancePayload(): object {
    return { contractId: this.id };
  }
}

/**
 * A wrapper class that contains both a {@link LiveContract} and its associated logs generated at construction time.
 * Consequently, this is meant to be generated when first {@link ApiSession.upload}-ing a {@link Contract}.
 */
export class LiveContractWithLogs extends LiveContract {
  public readonly logs: ParsedEvent[];
  public readonly liveContract: LiveContract;

  constructor({
    session,
    id,
    cInterface,
    logs,
  }: LiveContractConstructorArgs & { logs: ParsedEvent[] }) {
    super({ cInterface, id, session });
    this.liveContract = this;
    this.logs = logs;
  }
}
