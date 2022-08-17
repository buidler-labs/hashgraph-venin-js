import {
  AccountDeleteTransaction,
  AccountId,
  AccountInfo,
  AccountInfoQuery,
  AccountUpdateTransaction,
  PrivateKey,
  Transaction,
  Wallet,
} from "@hashgraph/sdk";

import { Account, AccountFeatures } from "../static/create/Account";
import { ApiSession, TypeOfExecutionReturn } from "../ApiSession";
import { BaseLiveEntityWithBalance } from "./BaseLiveEntityWithBalance";

type LiveAccountConstructorArgs = {
  session: ApiSession;
  id: AccountId;
};

export class LiveAccount extends BaseLiveEntityWithBalance<
  AccountId,
  AccountInfo,
  AccountFeatures
> {
  constructor({ session, id }: LiveAccountConstructorArgs) {
    super(session, id);
  }

  public getSolidityAddress(): string {
    return this.id.toSolidityAddress();
  }

  public getLiveEntityInfo(): Promise<AccountInfo> {
    const accountInfoQuery = new AccountInfoQuery().setAccountId(this.id);
    return this.executeSanely(
      accountInfoQuery,
      TypeOfExecutionReturn.Result,
      false
    );
  }

  protected override newDeleteTransaction(args?: any): Transaction {
    return new AccountDeleteTransaction({ accountId: this.id, ...args });
  }

  protected async _getUpdateTransaction(
    args?: AccountFeatures
  ): Promise<Transaction> {
    const propsUsedForUpdate =
      await Account.mapAccountFeaturesToAccountArguments(this.session, args);

    return new AccountUpdateTransaction(propsUsedForUpdate);
  }

  protected _getBalancePayload(): object {
    return { accountId: this.id };
  }
}

/**
 * A wrapper class that contains both a {@link LiveAccount} and its associated private-key generated, most likely, at network-creation time.
 * Consequently, this is meant to be generated when first {@link ApiSession.create}-ing an {@link Account}.
 */
export class LiveAccountWithPrivateKey extends LiveAccount {
  public readonly privateKey: PrivateKey;

  constructor({
    session,
    id,
    privateKey,
  }: LiveAccountConstructorArgs & { privateKey: PrivateKey }) {
    super({ id, session });
    this.privateKey = privateKey;
  }

  public async sign(transaction: Transaction): Promise<Transaction> {
    return transaction.sign(this.privateKey);
  }

  protected async _getUpdateTransaction(
    args?: AccountFeatures
  ): Promise<Transaction> {
    const updateTransaction = await super._getUpdateTransaction(args);

    // TODO: freeze with signer before similar to the delete op?
    return this.sign(updateTransaction);
  }

  protected async _getDeleteTransaction(args?: any): Promise<Transaction> {
    let selfDeleteTransaction = await super._getDeleteTransaction(args);

    selfDeleteTransaction = await selfDeleteTransaction.freezeWithSigner(
      this.session.wallet.signer as Wallet
    );
    return this.sign(selfDeleteTransaction);
  }
}
