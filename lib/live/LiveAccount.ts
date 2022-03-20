import { AccountId, AccountInfo, AccountInfoQuery, PrivateKey, PublicKey, Status, Status, Transaction } from "@hashgraph/sdk";

import { ApiSession, TypeOfExecutionReturn } from "../ApiSession";
import { LiveEntity } from "./LiveEntity";
import { SolidityAddressable } from "../core/SolidityAddressable";

type LiveAccountConstructorArgs = {
  session: ApiSession,
  id: AccountId,
  publicKey: PublicKey,
};

export class LiveAccount extends LiveEntity<AccountId, AccountInfo> implements SolidityAddressable {
  public deleteEntity<R>(args?: R): Promise<number | Status> {
    throw new Error("Method not implemented.");
  }
  public updateEntity<R>(args?: R): Promise<number> {
    throw new Error("Method not implemented.");
  }
  
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
}

/**
 * A wrapper class that contains both a {@link LiveAccount} and its associated private-key generated, most likely, at network-creation time.
 * Consequently, this is meant to be generated when first {@link ApiSession.create}-ing an {@link Account}.
 */
export class LiveAccountWithPrivateKey extends LiveAccount {
  public deleteEntity<R>(args?: R): Promise<number | Status> {
    throw new Error("Method not implemented.");
  }
  public updateEntity<R>(args?: R): Promise<number> {
    throw new Error("Method not implemented.");
  }
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
