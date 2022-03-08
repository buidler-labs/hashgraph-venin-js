import {
  describe, expect, it,
  jest
} from '@jest/globals';
import { ContractCallQuery, ContractExecuteTransaction, Hbar, TransactionId } from "@hashgraph/sdk";

import { load as loadResource } from "../../utils";
import Long from "long";

function load(contractPath: string) {
  return loadResource(contractPath, 'solidity-by-example');
}

describe('LiveContract.Solidity-by-Example.meta-arguments', () => {
  it("when calling a non state-changing contract method (aka `a query`), passing in meta-arguments should get propagated to the actual transaction", async () => {
    const liveContract = await load('hello_world');
    const sessionExecuteSpy = jest.spyOn(liveContract.session, "execute");
    const metaArgs = {
      gas: 50_969,
      maxQueryPayment: new Hbar(1),
      paymentTransactionId: TransactionId.generate(liveContract.session.wallet.account.id),
      queryPayment: new Hbar(2),
    };

    // Do the actual live-contract query passing in the meta-arguments
    await expect(liveContract.greet(metaArgs)).resolves.toEqual("Hello World!");

    // Test to see that the meta-arguments got indeed unpacked into the end transaction
    expect(sessionExecuteSpy.mock.calls.length === 1).toBeTruthy();
    expect(sessionExecuteSpy.mock.calls[0][0]).toBeInstanceOf(ContractCallQuery);
    
    const queryTransaction = (sessionExecuteSpy.mock.calls[0][0] as any) as ContractCallQuery;

    expect(queryTransaction.gas).toEqual(Long.fromValue(metaArgs.gas));
    expect(queryTransaction._maxQueryPayment).toEqual(metaArgs.maxQueryPayment);
    expect(queryTransaction._paymentTransactionId).toEqual(metaArgs.paymentTransactionId);
    expect(queryTransaction._queryPayment).toEqual(metaArgs.queryPayment);
  });

  it("when calling a state-changing contract method, passing in meta-arguments should get propagated to the actual transaction", async () => {
    const liveContract = await load('payable');
    const sessionExecuteSpy = jest.spyOn(liveContract.session, "execute");
    const metaArgs = {
        amount: new Hbar(42),
        maxTransactionFee: new Hbar(2),
        transactionId: TransactionId.generate(liveContract.session.wallet.account.id),
        transactionMemo: "Custom memo",
        transactionValidDuration: 69,
    };

    // When
    await expect(liveContract.deposit(metaArgs)).resolves.toBeUndefined();

    // Test stuff
    expect(sessionExecuteSpy.mock.calls.length === 1).toBeTruthy();
    expect(sessionExecuteSpy.mock.calls[0][0]).toBeInstanceOf(ContractExecuteTransaction);
    
    const executeTransaction = (sessionExecuteSpy.mock.calls[0][0] as any) as ContractExecuteTransaction;

    expect(executeTransaction.payableAmount).toEqual(metaArgs.amount);
    expect(executeTransaction.maxTransactionFee).toEqual(metaArgs.maxTransactionFee);
    expect(executeTransaction.transactionId).toEqual(metaArgs.transactionId);
    expect(executeTransaction.transactionMemo).toEqual(metaArgs.transactionMemo);
    expect(executeTransaction.transactionValidDuration).toEqual(metaArgs.transactionValidDuration);
  });

  it.todo("test setting the nodeAccountIds meta-args on state-changing contract method calls");
});
