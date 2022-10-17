import {
  ContractCreateTransaction,
  ContractExecuteTransaction,
  ContractFunctionResult,
  NetworkName,
  RequestType,
  TransactionId,
  TransactionRecordQuery,
} from "@hashgraph/sdk";
import { describe, expect, it } from "@jest/globals";

import { ApiSession, TransactionedReceipt } from "../../../lib/ApiSession";
import {
  FETCH_TIMEOUT,
  HederaRestMirror,
  StratoTransactionReceipt,
} from "../../../lib/hedera/HederaRestMirror";
import { Contract } from "../../../lib/static/upload/Contract";
import { Subscription } from "../../../lib/core/Subscription";
import { read } from "../../utils";

describe("Issue #76 > REST Mirror Network Support", () => {
  it("trying to instantiate a rest-mirror network entity with bad base urls should fail", () => {
    expect(() => new HederaRestMirror("something-not-cool")).toThrow();
    expect(
      () => new HederaRestMirror("http://simple.mirror.url.trailing.slash/")
    ).toThrow();
    expect(() => new HederaRestMirror("customnet")).toThrow();
  });

  it("trying to instantiate a rest-mirror network entity with valid base urls should succeed", () => {
    expect(
      () => new HederaRestMirror("http://simple.mirror.url")
    ).not.toThrow();
    expect(
      () => new HederaRestMirror("https://secure.mirror.url")
    ).not.toThrow();
    expect(() => new HederaRestMirror("http://127.0.0.1")).not.toThrow();
    expect(() => new HederaRestMirror("http://127.0.0.1:123")).not.toThrow();
    expect(() => new HederaRestMirror(NetworkName.Mainnet)).not.toThrow();
    expect(() => new HederaRestMirror(NetworkName.Testnet)).not.toThrow();
    expect(() => new HederaRestMirror(NetworkName.Previewnet)).not.toThrow();
  });

  it("trying to instantiate a rest-mirror network entity with valid base urls should succeed", () => {
    expect(
      () => new HederaRestMirror("http://simple.mirror.url")
    ).not.toThrow();
    expect(
      () => new HederaRestMirror("https://secure.mirror.url")
    ).not.toThrow();
    expect(() => new HederaRestMirror("http://127.0.0.1")).not.toThrow();
    expect(() => new HederaRestMirror("http://127.0.0.1:123")).not.toThrow();
  });

  it("querying the receipt of a known/existing transaction should return it as requested", async () => {
    const mirror = getTestNetMirror();
    const groundTruthTransaction = await doGroundTruthTransaction(
      RequestType.ContractCreate
    );
    const fetched = await mirror.getReceipt(
      groundTruthTransaction.transactionId
    );

    compareReceipts(groundTruthTransaction, fetched);
  });

  it("querying the receipt of a non-existing transaction should eventually timeout", async () => {
    const mirror = getTestNetMirror();

    await expect(
      mirror.getReceipt(TransactionId.fromString("0.0.1001@6.9"), 4000)
    ).rejects.toThrow();
  });

  it("polling for a contract function result following a contract creation should return it as requested", async () => {
    await doAndCompareResultsAgainstMirror(RequestType.ContractCreate);
  });

  it("polling for a contract function result following a contract function execution should return it as requested", async () => {
    await doAndCompareResultsAgainstMirror(RequestType.ContractCall);
  });

  it("polling for a contract function result that does not exist should timeout", async () => {
    const mirror = getTestNetMirror();

    await expect(
      mirror.getContractFunctionResult(
        TransactionId.fromString("0.0.1001@6.9"),
        4000
      )
    ).rejects.toThrow();
  });
});

async function doAndCompareResultsAgainstMirror(
  requestType: RequestType,
  timeout = FETCH_TIMEOUT
) {
  const mirror = getTestNetMirror();
  const { transactionId, contractFunctionResult: groundTruthResult } =
    await doGroundTruthTransaction(requestType);
  const fetchedResult = await mirror.getContractFunctionResult(
    transactionId,
    timeout
  );

  compareResults(groundTruthResult, fetchedResult);
}

function getTestNetMirror() {
  return new HederaRestMirror(NetworkName.Testnet);
}

const TX_INFOS = {};

async function doGroundTruthTransaction(requestType: RequestType) {
  const { session } = await ApiSession.default();
  const helloWorldContract = await Contract.newFrom({
    code: read({ contract: "/hello_world", relativeTo: "issues" }),
  });
  const stateVariablesContract = await Contract.newFrom({
    code: read({ contract: "/state_variables", relativeTo: "issues" }),
  });

  const transactionId = await new Promise<TransactionId>((accept, reject) => {
    let receiptSubscription: Subscription<TransactionedReceipt<any>>;

    switch (requestType) {
      case RequestType.ContractCreate:
        receiptSubscription = session.subscribeToReceiptsWith(
          ({ transaction, transactionId }) => {
            if (transaction instanceof ContractCreateTransaction) {
              receiptSubscription.unsubscribe();
              accept(transactionId);
            }
          }
        );
        session.upload(helloWorldContract);
        break;
      case RequestType.ContractCall:
        receiptSubscription = session.subscribeToReceiptsWith(
          ({ transaction, transactionId }) => {
            if (transaction instanceof ContractExecuteTransaction) {
              receiptSubscription.unsubscribe();
              accept(transactionId);
            }
          }
        );
        session
          .upload(stateVariablesContract)
          .then((lContract) => lContract.set(42));
        break;
      default:
        reject(
          `I don't know what transaction example to give you of type ${requestType.toString()}`
        );
    }
  });
  const txId = transactionId.toString();

  if (TX_INFOS[txId] === undefined) {
    const txRecord = await session.execute(
      new TransactionRecordQuery({
        includeDuplicates: true,
        transactionId,
      })
    );

    TX_INFOS[txId] = {
      contractFunctionResult: txRecord.contractFunctionResult,
      receipt: txRecord.receipt,
      transactionId,
    };
  }

  return TX_INFOS[txId];
}

function compareReceipts(
  groundTruth: StratoTransactionReceipt,
  fetched: StratoTransactionReceipt
) {
  expect(fetched.transactionId.toString()).toEqual(
    groundTruth.transactionId.toString()
  );
  expect(fetched.receipt.status).toEqual(groundTruth.receipt.status);
  expect(fetched.receipt.contractId).toEqual(groundTruth.receipt.contractId);
  expect(fetched.receipt.fileId).toEqual(groundTruth.receipt.fileId);
  expect(fetched.receipt.tokenId).toEqual(groundTruth.receipt.tokenId);
  expect(fetched.receipt.accountId).toEqual(groundTruth.receipt.accountId);
  expect(fetched.receipt.topicId).toEqual(groundTruth.receipt.topicId);
  // TODO: check more fields
}

function compareResults(
  groundTruth: ContractFunctionResult,
  fetched: ContractFunctionResult
) {
  expect(fetched.contractId).toEqual(groundTruth.contractId);
  expect(fetched.gasUsed.toNumber()).toEqual(groundTruth.gasUsed.toNumber());
  expect(fetched.bloom).toEqual(groundTruth.bloom);
  expect(fetched.errorMessage).toEqual(groundTruth.errorMessage);
  expect(fetched.contractId?.toSolidityAddress()).toEqual(
    groundTruth.contractId?.toSolidityAddress()
  );
  // TODO: check more fields

  // Note: don't check the gasLimit (.gas). For some reason, the groundTruth value is always zero
  //       nor the amount. The groundTruth is -1.
  // expect(fetched.gas.toNumber()).toEqual(groundTruth.gas.toNumber());
  // expect(fetched.amount.toNumber()).toEqual(groundTruth.amount.toNumber());
}
