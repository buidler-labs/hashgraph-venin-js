import { 
    AccountCreateTransaction,
    AccountId, 
    Hbar, 
    Key,
    PrivateKey, 
} from "@hashgraph/sdk";
import Duration from "@hashgraph/sdk/lib/Duration";
import { BigNumber } from "@hashgraph/sdk/lib/Transfer";

import { ArgumentsForCreate } from "../../core/CreatableEntity";
import { ApiSession, TypeOfExecutionReturn } from "../../ApiSession";
import { LiveAccount, LiveAccountWithPrivateKey } from "../../live/LiveAccount";
import { BasicCreatableEntity } from "./BasicCreatableEntity";

export const enum KeyType {
  ECSDA,
  ED25519,
  Unknown
}

export type AccountFeatures = {
  key?: Key;
  initialBalance?: string | number | Long.Long | BigNumber | Hbar;
  receiverSignatureRequired?: boolean;
  proxyAccountId?: AccountId;
  autoRenewPeriod?: number | Long.Long | Duration;
  accountMemo?: string;
  maxAutomaticTokenAssociations?: number | Long.Long;
} & { generateKey: boolean, keyType: KeyType };

export class Account extends BasicCreatableEntity<LiveAccountWithPrivateKey> {
  private _key: PrivateKey;

  public constructor(private readonly info: AccountFeatures = { generateKey: true, keyType: KeyType.ED25519 }) {
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
      session, id: accountId, 
      publicKey: key.publicKey, 
      privateKey: key
    });
  }

  private async getKey(session: ApiSession): Promise<PrivateKey> {
    if (!this._key) {
      if (!this.info.key) {
        if (this.info.generateKey) {
          const { keyType } = this.info;
          const generatedKey = keyType === KeyType.ED25519 ? 
            await PrivateKey.generateED25519Async() : await PrivateKey.generateECDSAAsync();

          session.log.debug(`A new key-type '${keyType}' has been created: ${generatedKey.toStringDer()} . Copy it since this is only time you'll see it.`);
          this._key = generatedKey;
        } else {
          session.log.warn("No key provided for account creation. Aborting ...");
          throw new Error("A key must be provided or generateKey enabled in order to create an account.");
        }
      } else {
        this._key = this.info.key as PrivateKey;
      }
    }
    return this._key;
  }
}
