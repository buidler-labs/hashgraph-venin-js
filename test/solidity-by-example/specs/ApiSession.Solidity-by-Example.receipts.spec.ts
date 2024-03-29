import {
  ContractCreateTransaction,
  ContractExecuteTransaction,
  FileCreateTransaction,
  TransactionReceipt,
} from "@hashgraph/sdk";
import { describe, expect, it, jest } from "@jest/globals";

import { ApiSession, TypeOfExecutionReturn } from "../../../lib/ApiSession";
import { ResourceReadOptions, read as readResource } from "../../utils";
import { Contract } from "../../../lib/static/upload/Contract";

function read(what: ResourceReadOptions) {
  return readResource({ relativeTo: "solidity-by-example", ...what });
}

async function verifyContractUploadEventFiringsFor(
  contract: string,
  emitConstructorLogs: boolean,
  ...expectedTransactions: any[]
) {
  const { session } = await ApiSession.default();
  const solContract = await Contract.newFrom({ code: read({ contract }) });
  const spiedReceiptCallback = jest.fn();

  session.subscribeToReceiptsWith(spiedReceiptCallback);
  await session.upload(solContract, { _contract: { emitConstructorLogs } });

  expect(spiedReceiptCallback).toHaveBeenCalledTimes(
    expectedTransactions.length
  );
  expectedTransactions.forEach((expectedTransaction, index) => {
    expect(spiedReceiptCallback.mock.calls[index][0]).toBeInstanceOf(Object);
    expect(
      (spiedReceiptCallback.mock.calls[index][0] as any).transaction
    ).toBeInstanceOf(expectedTransaction);
  });
}

describe("ApiSession.Solidity-by-Example.Receipts", () => {
  it("uploading a contract should generate appropriate receipts regardless if constructor-event logs are of interest or not", async () => {
    const expectedTransactionSources = [
      FileCreateTransaction,
      ContractCreateTransaction,
    ];

    await verifyContractUploadEventFiringsFor(
      "hello_world",
      true,
      ...expectedTransactionSources
    );
    await verifyContractUploadEventFiringsFor(
      "hello_world",
      false,
      ...expectedTransactionSources
    );
  });

  it("executing a live-contract function in a default-session environment that does not emit receipts when calling such functions, should emit a receipt if one is requested", async () => {
    const { session } = await ApiSession.default({
      session: {
        defaults: {
          emitLiveContractReceipts: false,
        },
      },
    });
    const solContract = await Contract.newFrom({
      code: read({ contract: "state_variables" }),
    });
    const liveContract = await session.upload(solContract);
    const spiedReceiptCallback = jest.fn();

    session.subscribeToReceiptsWith(spiedReceiptCallback);
    await liveContract.set({ emitReceipt: true }, 2);

    expect(spiedReceiptCallback).toHaveBeenCalled();
    expect(spiedReceiptCallback.mock.calls[0][0]).toBeInstanceOf(Object);
    expect(
      (spiedReceiptCallback.mock.calls[0][0] as any).transaction
    ).toBeInstanceOf(ContractExecuteTransaction);
  });

  it("executing a live-contract mutating function in a default-session environment that does not return only receipts when calling such functions should do so if runtime requests it", async () => {
    const { session } = await ApiSession.default({
      session: {
        defaults: {
          onlyReceiptsFromContractRequests: false,
        },
      },
    });
    const solContract = await Contract.newFrom({
      code: read({ contract: "state_variables" }),
    });
    const liveContract = await session.upload(solContract);
    const sessionExecutionSpy = jest.spyOn(session, "execute");
    const contractSetResult = await liveContract.set({ onlyReceipt: true }, 2);

    expect(contractSetResult).toBeInstanceOf(TransactionReceipt);
    expect(sessionExecutionSpy.mock.calls).toHaveLength(1);
    expect(sessionExecutionSpy.mock.calls[0][1]).toEqual(
      TypeOfExecutionReturn.Receipt
    );
  });

  it("executing a live-contract mutating function in a default-session environment that does return only receipts when calling such functions should behave accordingly and, by default, return that receipt", async () => {
    const { session } = await ApiSession.default({
      session: {
        defaults: {
          onlyReceiptsFromContractRequests: true,
        },
      },
    });
    const solContract = await Contract.newFrom({
      code: read({ contract: "state_variables" }),
    });
    const liveContract = await session.upload(solContract);
    const sessionExecutionSpy = jest.spyOn(session, "execute");
    const contractSetResult = await liveContract.set(2);

    expect(contractSetResult).toBeInstanceOf(TransactionReceipt);
    expect(sessionExecutionSpy.mock.calls).toHaveLength(1);
    expect(sessionExecutionSpy.mock.calls[0][1]).toEqual(
      TypeOfExecutionReturn.Receipt
    );
  });

  it("executing a live-contract non-mutating function in a default-session environment that does return only receipts when calling such a function should return that query result", async () => {
    const { session } = await ApiSession.default({
      session: {
        defaults: {
          onlyReceiptsFromContractRequests: true,
        },
      },
    });
    const solContract = await Contract.newFrom({
      code: read({ contract: "hello_world" }),
    });
    const liveContract = await session.upload(solContract);
    const sessionExecutionSpy = jest.spyOn(session, "execute");
    const queryResult = await liveContract.greet();

    expect(queryResult).toEqual("Hello World!");
    expect(sessionExecutionSpy.mock.calls).toHaveLength(1);
    expect(sessionExecutionSpy.mock.calls[0][1]).toEqual(
      TypeOfExecutionReturn.Result
    );
  });

  it("executing a live-contract non-mutating function in a default-session environment that does not return only receipts, yet only receipts is requested, when calling such a function should return that query result", async () => {
    const { session } = await ApiSession.default({
      session: {
        defaults: {
          onlyReceiptsFromContractRequests: false,
        },
      },
    });
    const solContract = await Contract.newFrom({
      code: read({ contract: "hello_world" }),
    });
    const liveContract = await session.upload(solContract);
    const sessionExecutionSpy = jest.spyOn(session, "execute");
    const queryResult = await liveContract.greet({ onlyReceipt: true });

    expect(queryResult).toEqual("Hello World!");
    expect(sessionExecutionSpy.mock.calls).toHaveLength(1);
    expect(sessionExecutionSpy.mock.calls[0][1]).toEqual(
      TypeOfExecutionReturn.Result
    );
  });
});
