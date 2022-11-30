import fetch from "cross-fetch";
import { proto } from "@hashgraph/proto";

import {
  ContractFunctionResult,
  ContractId,
  ContractLogInfo,
  FileId,
  ReceiptStatusError,
  Status,
  TransactionId,
  TransactionReceipt,
} from "@hashgraph/sdk";
import { decodeFromHex } from "../core/Hex";

export type StratoTransactionReceipt = {
  transactionId: TransactionId;
  receipt: TransactionReceipt;
};

/**
 * Wait this long before starting to poll the Mirror network for a response.
 */
export const FETCH_INITIAL_DELAY = 500;
/**
 * Time to wait in-between mirror network polls.
 * This should be a value slightly above the network's record generating period which currently sits at around 2 seconds.
 */
export const FETCH_RETRY_DELAY = 2500;
/**
 * How much time (in ms) should we wait for a REST Mirror fetch to resolve to an accepted response?
 *
 * Note: this should trail the network transaction "valid duration" value.
 *       See {@link https://github.com/hashgraph/hedera-sdk-js/blob/2df2b4ed66d1be6dd2c0a71e90b4628929301cbb/src/transaction/Transaction.js#L61}
 */
export const FETCH_TIMEOUT = 120000;

export class HederaRestMirror {
  private readonly baseUrl: string;

  public constructor(network: string | undefined) {
    let baseAddress: string;

    switch (network) {
      case "mainnet":
        baseAddress = "https://mainnet-public.mirrornode.hedera.com";
        break;
      case "testnet":
        baseAddress = "https://testnet.mirrornode.hedera.com";
        break;
      case "previewnet":
        baseAddress = "https://previewnet.mirrornode.hedera.com";
        break;
      default:
        if (!network) {
          // Default to local-node deployment address
          baseAddress = "http://localhost:5551";
        } else if (
          /^http[s]?:\/\/([0-9A-Za-z-\\.@:%_+~#=]+)+$/g.test(
            network as string
          ) == false
        ) {
          throw new Error(
            `Invalid custom REST Mirror base URL address provided '${network}'. The accepted format should be: 'http[s]://<domain|ip>[:<port>]'`
          );
        } else {
          // The provided network is a valid url. We use that as the base-address
          baseAddress = network;
        }
        break;
    }
    this.baseUrl = `${baseAddress}/api/v1`;
  }

  /**
   * Given a transaction-id, try and lock-onto its associated receipt (if any).
   *
   * @param {TransactionId} tId - The {@link TransactionId} for which to fetch the {@link TransactionReceipt}
   * @param {number} timeout - How much milliseconds to try and poll for a response
   * @returns {Promise<StratoTransactionReceipt>}
   */
  public async getReceipt(
    tId: TransactionId,
    timeout: number = FETCH_TIMEOUT
  ): Promise<StratoTransactionReceipt> {
    const jMirrorTransactions = await this.jFetch(
      `transactions/${this.formatForHederaUrl(tId)}`,
      timeout
    );

    // TODO: is it correct to always pick the first one?
    //       a create2 call creates 2 entries. see https://testnet.mirrornode.hedera.com/api/v1/transactions/0.0.2908307-1665827508-529766019
    const jTransaction = jMirrorTransactions.transactions[0];

    const jTxResultingEntityId = !jTransaction.entity_id
      ? new Uint8Array()
      : FileId.fromString(jTransaction.entity_id).toBytes();
    const entityCreationInfo = {
      accountID:
        jTransaction.name === "CRYPTOCREATEACCOUNT"
          ? proto.AccountID.decode(jTxResultingEntityId)
          : undefined,
      contractID:
        jTransaction.name === "CONTRACTCREATEINSTANCE"
          ? proto.ContractID.decode(jTxResultingEntityId)
          : undefined,
      fileID:
        jTransaction.name === "FILECREATE"
          ? proto.FileID.decode(jTxResultingEntityId)
          : undefined,
      tokenID:
        jTransaction.name === "TOKENCREATION"
          ? proto.TokenID.decode(jTxResultingEntityId)
          : undefined,
      topicID:
        jTransaction.name === "CONSENSUSCREATETOPIC"
          ? proto.TopicID.decode(jTxResultingEntityId)
          : undefined,
      // TODO: load other parameters from proto.ITransactionReceipt
    };
    const protoTxReceiptArgs = Object.assign(
      {
        status: proto.ResponseCodeEnum[
          jTransaction.result
        ] as unknown as proto.ResponseCodeEnum,
      },
      entityCreationInfo
    );
    const txReceiptBytes = proto.TransactionGetReceiptResponse.encode({
      receipt: protoTxReceiptArgs,
    }).finish();
    const receipt = TransactionReceipt.fromBytes(txReceiptBytes);

    // Note: taken from TransactionResponse.getReceipt to mimic its behavior
    //       see https://github.com/hashgraph/hedera-sdk-js/blob/5ddac683fefa3cce599e45d4685d6dcf77621ef6/src/transaction/TransactionResponse.js#L80
    if (receipt.status !== Status.Success) {
      throw new ReceiptStatusError({
        status: receipt.status,
        transactionId: tId,
        transactionReceipt: receipt,
      });
    }

    return {
      receipt,
      transactionId: tId,
    };
  }

  /**
   * Given a {@link StratoTransactionReceipt} (a normal {@link TransactionReceipt} augmented by its underlying {@link TransactionId}),
   * try and lock-onto its associated {@link ContractFunctionResult}.
   *
   * @param forWhat - Either the {@link StratoTransactionReceipt} for which to fetch the {@link ContractFunctionResult} or, if a {@link TransactionId} is provided,
   *                  it first does a {@see getReceipt} and basically does the same thing with the result.
   * @param timeout - How much milliseconds to try and poll for a response
   */
  public async getContractFunctionResult(
    forWhat: StratoTransactionReceipt | TransactionId,
    timeout: number = FETCH_TIMEOUT
  ): Promise<ContractFunctionResult> {
    const { transactionId, receipt } =
      forWhat instanceof TransactionId
        ? await this.getReceipt(forWhat, timeout)
        : forWhat;
    const isContractCreateTransaction = receipt.contractId !== null;
    const jContractTransaction = await this.jFetch(
      `contracts/results/${this.formatForHederaUrl(transactionId)}`,
      timeout
    );
    const contractId = ContractId.fromString(jContractTransaction.contract_id);
    const rawContractCallResult = decodeFromHex(
      jContractTransaction.call_result
    );
    const cfResultProto = proto.ContractFunctionResult.create({
      amount: jContractTransaction.amount,
      bloom: decodeFromHex(jContractTransaction.bloom),
      contractCallResult: rawContractCallResult,
      contractID: contractId._toProtobuf(),
      createdContractIDs: [
        jContractTransaction.created_contract_ids.map((cContractId: string) =>
          ContractId.fromString(cContractId)
        ),
      ],
      errorMessage: jContractTransaction.error_message,
      evmAddress: null, // TODO:
      functionParameters: decodeFromHex(
        jContractTransaction.function_parameters
      ),
      gas: jContractTransaction.gas_limit,
      gasUsed: jContractTransaction.gas_used,
      logInfo: jContractTransaction.logs.map((jLog) =>
        new ContractLogInfo({
          bloom: decodeFromHex(jLog.bloom),
          contractId: ContractId.fromString(jLog.contract_id),
          data: decodeFromHex(jLog.data),
          topics: jLog.topics.map((jTopic) => decodeFromHex(jTopic)),
        })._toProtobuf()
      ),
      senderId: transactionId.accountId._toProtobuf(),
    });
    return ContractFunctionResult._fromProtobuf(
      cfResultProto,
      isContractCreateTransaction
    );
  }

  private async jFetch(uPath: string, timeout: number): Promise<any> {
    const reqStartDate = new Date().getTime();

    // Before searching for the response, give the operation some initial time to settle
    await new Promise((resolve) => setTimeout(resolve, FETCH_INITIAL_DELAY));

    try {
      do {
        const rawResponse = await fetch(`${this.baseUrl}/${uPath}`);

        if (rawResponse.status === 404) {
          if (new Date().getTime() - timeout > reqStartDate) {
            throw new Error(
              `Could not fetch meaningful mirror-data from '${uPath}' in the designated time of ${timeout} ms.`
            );
          }
        } else {
          // We got what we came here for
          return await rawResponse.json();
        }

        // Not available yet, but we can still retry
        // Wait a bit before trying to fetch the mirror-node resource. This gives the transaction more time to settle
        await new Promise((resolve) => setTimeout(resolve, FETCH_RETRY_DELAY));
        // eslint-disable-next-line no-constant-condition
      } while (true);
    } catch (e) {
      if (e.code === "ECONNREFUSED") {
        throw new Error(
          `Could not connect to mirror-data endpoint at ${this.baseUrl}. This should never happen, that's why no retrial will be carried out.`
        );
      }
      // If we didn't expect this error, we propagate it upwards
      throw e;
    }
  }

  private formatForHederaUrl(tId: TransactionId) {
    return `${tId.accountId.toString()}-${tId.validStart.seconds}-${
      tId.validStart.nanos
    }`;
  }
}
