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
import { LiveAccount } from "../../live/LiveAccount";
import { BasicCreatableEntity } from "./BasicCreatableEntity";

export type AccountFeatures = {
    key?: Key;
    initialBalance?: string | number | Long.Long | BigNumber | Hbar;
    receiverSignatureRequired?: boolean;
    proxyAccountId?: AccountId;
    autoRenewPeriod?: number | Long.Long | Duration;
    accountMemo?: string;
    maxAutomaticTokenAssociations?: number | Long.Long;
} & { generateKey: boolean };

export class Account extends BasicCreatableEntity<LiveAccount> {
    private _key: PrivateKey;

    public constructor(private readonly info: AccountFeatures = { generateKey: true }) {
        super("Account");
    }

    public async createVia({ session }: ArgumentsForCreate): Promise<LiveAccount> {
        const key = await this.getKey(session);
        const resolutedInfo = Object.assign({}, this.info, {
            key
        });
        const createAccountTransaction = new AccountCreateTransaction(resolutedInfo);
        const { accountId } = await session.execute(createAccountTransaction, TypeOfExecutionReturn.Receipt, true);
    
        return new LiveAccount({ 
            session, id: accountId, 
            publicKey: key.publicKey, privateKey: key
        });
    }

    private async getKey(session: ApiSession): Promise<PrivateKey> {
        if (!this._key) {
            if (!this.info.key) {
                if (this.info.generateKey) {
                    const generatedKey = await PrivateKey.generateED25519Async();
                    
                    session.log.debug(`A new ED25519 key has been created: ${generatedKey.toStringDer()} . Copy it since this is only time you'll see it.`);
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