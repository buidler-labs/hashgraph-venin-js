import {
  AccountId,
  Hbar,
  PrivateKey,
  Status,
  TransactionId,
  TransferTransaction,
} from "@hashgraph/sdk";
import { describe, expect, it } from "@jest/globals";

import { Account, KeyType } from "../../../lib/static/create/Account";
import { ApiSession } from "../../../lib/ApiSession";
import { LiveAccountWithPrivateKey } from "../../../lib/live/LiveAccount";
import { getKeyTypeFor } from "../../utils";

describe("LiveAccount", () => {
  it("a session should allow for the creation of no-args Accounts which should default to an ED25519 private-key", async () => {
    const { session } = await ApiSession.default();
    const account = await session.create(new Account());

    expect(account).toBeInstanceOf(LiveAccountWithPrivateKey);
    expect(getKeyTypeFor(account.privateKey)).toEqual(KeyType.ED25519);
  });

  it("a session should allow for the creation of accounts with ECSDA key types if explicitly requested", async () => {
    const { session } = await ApiSession.default();
    const account = await session.create(
      new Account({
        keyType: KeyType.ECDSA,
      })
    );

    expect(account).toBeInstanceOf(LiveAccountWithPrivateKey);
    expect(getKeyTypeFor(account.privateKey)).toEqual(KeyType.ECDSA);
  });

  it("getting info about an account, correct information is being fetched", async () => {
    const { session } = await ApiSession.default();
    const privKey = PrivateKey.generateECDSA();
    const account = await session.create(
      new Account({
        key: privKey,
      })
    );

    const accountInfo = await account.getLiveEntityInfo();
    expect(accountInfo).not.toBeNull();
    expect(accountInfo.accountId).toBeInstanceOf(AccountId);
  });

  it("given a random transaction, signing it will attach the signature to the transaction", async () => {
    const { session } = await ApiSession.default();
    const account = await session.create(new Account());

    const transaction = new TransferTransaction()
      .setTransactionId(TransactionId.generate(session.wallet.account.id))
      .setNodeAccountIds([new AccountId(2)])
      .freeze();

    account.tryToSign(transaction);

    expect(transaction._signerPublicKeys).toContain(
      account.privateKey.publicKey.toStringRaw()
    );
  });

  it("given a new account with initial balance, querying the balance returns the right amounts yet deleting the account will make balance-query-ing insane", async () => {
    const { session } = await ApiSession.default();
    const account = await session.create(
      new Account({ initialBalance: new Hbar(10) })
    );

    const balance = await account.getBalanceOfLiveEntity();

    expect(balance.hbars.toBigNumber().toNumber()).toEqual(10);
    await expect(account.deleteEntity()).resolves.toBeInstanceOf(Status);
    await expect(account.getBalanceOfLiveEntity()).rejects.toThrow();
  });

  it.skip("given a new account, updating it works as expected even after a deletion ocurred which should not allow for further live-entity info extraction", async () => {
    const { session } = await ApiSession.default();
    const account = await session.create(new Account());
    const updateStatus = await account.updateEntity({
      maxAutomaticTokenAssociations: 10,
    });

    expect(updateStatus).toEqual(Status.Success);

    const info = await account.getLiveEntityInfo();

    expect(info.maxAutomaticTokenAssociations.toString()).toEqual("10");
    await expect(account.deleteEntity()).resolves.toEqual(Status.Success);
    await expect(account.getLiveEntityInfo()).rejects.toThrow();
  });

  it("given a new account, deleting it works as expected", async () => {
    const { session } = await ApiSession.default();
    const account = await session.create(new Account());
    const deleteStatus = await account.deleteEntity();

    expect(deleteStatus).toEqual(Status.Success);
    await expect(account.deleteEntity()).rejects.toThrow();
  });

  it("instantiating an account with an id, getting balance works as expected even following a self-deletion", async () => {
    const { session } = await ApiSession.default();
    const account = await session.create(
      new Account({ initialBalance: new Hbar(10) })
    );
    const balance = await account.getBalanceOfLiveEntity();

    expect(balance.hbars.toBigNumber().toNumber()).toEqual(10);
    await expect(account.deleteEntity()).resolves.toBeInstanceOf(Status);
    await expect(account.getBalanceOfLiveEntity()).rejects.toThrow();
  });
});
