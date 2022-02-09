import { PrivateKey, AccountId, TransferTransaction, TransactionId } from '@hashgraph/sdk';
import {
  expect, describe, it,
} from '@jest/globals';

import { ApiSession } from '../../../lib/ApiSession';
import { LiveAccountWithPrivateKey } from '../../../lib/live/LiveAccount';
import { Account, KeyType } from '../../../lib/static/create/Account';
import { getKeyTypeFor } from '../../utils';

describe('LiveAccount', () => {
  it("a session should allow for the creation of no-args Accounts which should default to an ED25519 private-key", async () => {
    const { session } = await ApiSession.default();
    const account = await session.create(new Account());

    expect(account).toBeInstanceOf(LiveAccountWithPrivateKey);
    expect(getKeyTypeFor(account.privateKey)).toEqual(KeyType.ED25519);
  });

  it("a session should allow for the creation of accounts with ECSDA key types if explicitly requested", async () => {
    const { session } = await ApiSession.default();
    const account = await session.create(new Account({
      generateKey: true,
      keyType: KeyType.ECSDA
    }));

    expect(account).toBeInstanceOf(LiveAccountWithPrivateKey);
    expect(getKeyTypeFor(account.privateKey)).toEqual(KeyType.ECSDA);
  });

  it("getting info about an account, correct information is being fetched", async () => {
    const { session } = await ApiSession.default();
    const privKey = PrivateKey.generateECDSA();
    const account = await session.create(new Account({
      key: privKey,
      keyType: KeyType.ECSDA,
      generateKey: false
    }));

    const accountInfo = await account.getInfo();
    expect(accountInfo).not.toBeNull();
    expect(accountInfo.accountId).toBeInstanceOf(AccountId);
  });

  it("given a random transaction, signing it will attach the signature to the transaction", async () => {
    const { session } = await ApiSession.default();
    const account = await session.create(new Account());

    let transaction = new TransferTransaction()
      .setTransactionId(TransactionId.generate(session.accountId))
      .setNodeAccountIds([new AccountId(2)])
      .freeze();

    account.tryToSign(transaction);

    expect(transaction._signerPublicKeys).toContain(account.publicKey.toStringRaw());

  });
});
