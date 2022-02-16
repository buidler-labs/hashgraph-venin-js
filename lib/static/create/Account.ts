import { 
  AccountCreateTransaction,
  AccountId, 
  Hbar, 
  Key,
  PrivateKey, 
} from "@hashgraph/sdk";
import { BigNumber } from "@hashgraph/sdk/lib/Transfer";
import Duration from "@hashgraph/sdk/lib/Duration";

import { ApiSession, TypeOfExecutionReturn } from "../../ApiSession";
import { ArgumentsForCreate } from "../../core/CreatableEntity";
import { BasicCreatableEntity } from "./BasicCreatableEntity";
import { LiveAccountWithPrivateKey } from "../../live/LiveAccount";

export enum KeyType {
  ECDSA,
  ED25519,
  Unknown
}

export type AccountFeatures = {
  keyType?: KeyType;
  key?: Key;
  initialBalance?: string | number | Long.Long | BigNumber | Hbar;
  receiverSignatureRequired?: boolean;
  proxyAccountId?: AccountId;
  autoRenewPeriod?: number | Long.Long | Duration;
  accountMemo?: string;
  maxAutomaticTokenAssociations?: number | Long.Long;
};

export class Account extends BasicCreatableEntity<LiveAccountWithPrivateKey> {
  private _key: PrivateKey;

  public constructor(private readonly info: AccountFeatures = { keyType: KeyType.ED25519 }) {
    super("Account");
  }

  public async createVia({ session }: ArgumentsForCreate): Promise<LiveAccountWithPrivateKey> {
    const key = await this.getKey(session);
    const resolutedInfo = Object.assign({}, this.info, {
      key
    });
    const createAccountTransaction = new AccountCreateTransaction(resolutedInfo);
    const { accountId } = await session.execute(createAccountTransaction, TypeOfExecutionReturn.Receipt, true);

    return new LiveAccountWithPrivateKey({ 
      id: accountId,  
      privateKey: key,
      publicKey: key.publicKey, 
      session
    });
  }

  private async getKey(session: ApiSession): Promise<PrivateKey> {
    if (!this._key) {
      if (!this.info.key) {
        const { keyType } = this.info;
        const keyTypeString = keyType === KeyType.ED25519 ? KeyType[KeyType.ED25519] : KeyType[KeyType.ECDSA];
        const generatedKey = keyType === KeyType.ED25519 ? 
          await PrivateKey.generateED25519Async() : await PrivateKey.generateECDSAAsync();
        
        session.log.debug(`A new '${keyTypeString}' key has been created: ${generatedKey.toStringDer()} . Copy it since this is only time you'll see it.`);
        this._key = generatedKey;
      } else {
        this._key = this.info.key as PrivateKey;
      }
    }
    return this._key;
  }
}
