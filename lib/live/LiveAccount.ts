import { AccountDeleteTransaction, AccountId, AccountInfo, AccountInfoQuery, AccountUpdateTransaction, PrivateKey, Transaction } from "@hashgraph/sdk";

import { Account, AccountFeatures } from "../static/create/Account";
import { ApiSession, TypeOfExecutionReturn } from "../ApiSession";
import { BaseLiveEntityWithBalance } from "./BaseLiveEntityWithBalance";
import { SolidityAddressable } from "../core/SolidityAddressable";

type LiveAccountConstructorArgs = {
  session: ApiSession,
  id: AccountId,
};

export class LiveAccount extends BaseLiveEntityWithBalance<AccountId, AccountInfo, AccountFeatures> implements SolidityAddressable {

  constructor({ session, id }: LiveAccountConstructorArgs) {
    super(session, id);
  }
  
  public getSolidityAddress(): string {
    return this.id.toSolidityAddress();
  }

  public getLiveEntityInfo(): Promise<AccountInfo> {
    const accountInfoQuery = new AccountInfoQuery().setAccountId(this.id);
    return this.session.execute(accountInfoQuery, TypeOfExecutionReturn.Result, false);
  }

  protected _mapFeaturesToArguments(args?: AccountFeatures): Promise<any> {
    return Account.considerGenerateKeyFromAccountFeatures(this.session.log, args);
  }

  protected _getDeleteTransaction(args?: any): Transaction {
    args = this._getEntityWithBalanceDeleteArguments(args);
    return new AccountDeleteTransaction({ accountId: this.id, ...args });
  }
  
  protected _getUpdateTransaction<R>(args?: R): Transaction {
    return new AccountUpdateTransaction(args);
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

  constructor({ session, id, privateKey }: LiveAccountConstructorArgs & { privateKey: PrivateKey }) {
    super({ id, session });
    this.privateKey = privateKey;
  }

  public tryToSign(transaction: Transaction): void {
    const signature = this.privateKey.signTransaction(transaction);

    transaction.addSignature(this.privateKey.publicKey, signature);
  }

  protected _getUpdateTransaction<R>(args?: R): Transaction {
    const updateTransaction = super._getUpdateTransaction(args);
    this.tryToSign(updateTransaction);
    return updateTransaction;
  }

  protected _getDeleteTransaction(args?: any): Transaction {
    const deleteTransaction = super._getDeleteTransaction(args);
    //TODO: freeze with signer once HIP-338 branch is merged
    this.tryToSign(deleteTransaction);
    return deleteTransaction;
  }
}
