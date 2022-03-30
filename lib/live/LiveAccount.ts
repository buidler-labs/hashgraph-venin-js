import { AccountDeleteTransaction, AccountId, AccountInfo, AccountInfoQuery, PrivateKey, PublicKey, Transaction } from "@hashgraph/sdk";

import { ApiSession, TypeOfExecutionReturn } from "../ApiSession";
import { AccountFeatures } from "../static/create/Account";
import { LiveEntity } from "./LiveEntity";
import { SolidityAddressable } from "../core/SolidityAddressable";

type LiveAccountConstructorArgs = {
  session: ApiSession,
  id: AccountId,
  publicKey: PublicKey,
};

export class LiveAccount extends LiveEntity<AccountId, AccountInfo, AccountFeatures> implements SolidityAddressable {
  
  public readonly publicKey: PublicKey;

  constructor({ session, id, publicKey }: LiveAccountConstructorArgs) {
    super(session, id);
    this.publicKey = publicKey;
  }
  
  public getSolidityAddress(): string {
    return this.id.toSolidityAddress();
  }

  public getLiveEntityInfo(): Promise<AccountInfo> {
    const accountInfoQuery = new AccountInfoQuery().setAccountId(this.id);
    return this.session.execute(accountInfoQuery, TypeOfExecutionReturn.Result, false);
  }

  protected _mapFeaturesToArguments(args?: AccountFeatures) {
    throw new Error("Method not implemented.");
  }

  protected _getDeleteTransaction(args?: any): Transaction {
    return new AccountDeleteTransaction({accountId: this.id, ...args});
  }
  
  protected _getUpdateTransaction<R>(args?: R): Transaction {
    throw new Error("Method not implemented.");
  }
}

/**
 * A wrapper class that contains both a {@link LiveAccount} and its associated private-key generated, most likely, at network-creation time.
 * Consequently, this is meant to be generated when first {@link ApiSession.create}-ing an {@link Account}.
 */
export class LiveAccountWithPrivateKey extends LiveAccount {
  public readonly privateKey: PrivateKey;

  constructor({ session, id, publicKey, privateKey }: LiveAccountConstructorArgs & { privateKey: PrivateKey }) {
    super({ id, publicKey, session });
    this.privateKey = privateKey;
  }

  public tryToSign(transaction: Transaction): void {
    const signature = this.privateKey.signTransaction(transaction);

    transaction.addSignature(this.publicKey, signature);
  }
}
