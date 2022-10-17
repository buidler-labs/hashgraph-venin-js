import {
  ContractCreateTransaction,
  FileCreateTransaction,
} from "@hashgraph/sdk";
import { describe, expect, it, jest } from "@jest/globals";

import { ResourceReadOptions, read as readResource } from "../../utils";
import { ApiSession } from "../../../lib/ApiSession";
import { Contract } from "../../../lib/static/upload/Contract";

function read(what: ResourceReadOptions) {
  return readResource({ relativeTo: "solidity-by-example", ...what });
}

async function verifyContractUploadEventFiringsFor(
  contract: string,
  ...expectedTransactions: any[]
) {
  const { session } = await ApiSession.default();
  const solContract = await Contract.newFrom({ code: read({ contract }) });
  const spiedReceiptCallback = jest.fn();

  session.subscribeToReceiptsWith(spiedReceiptCallback);
  await session.upload(solContract);

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
      ...expectedTransactionSources
    );
  });
});
