import { 
    AccountId, 
    Key, 
    Timestamp, 
    TokenCreateTransaction, 
    TokenSupplyType,
    TokenType 
} from "@hashgraph/sdk";
import Duration from "@hashgraph/sdk/lib/Duration";

import { LiveToken } from "../../live/LiveToken";
import { ArgumentsForCreate } from "../../core/CreatableEntity";
import { TypeOfExecutionReturn } from "../../ApiSession";
import { BasicCreatableEntity } from "./BasicCreatableEntity";

export type TokenFeatures = {
    name: string,
    symbol: string,
    decimals?: number | Long.Long,
    initialSupply?: number | Long.Long,
    treasuryAccountId?: string | AccountId,
    keys?: TokenKeys,
    freezeDefault?: boolean,
    autoRenewAccountId?: string | AccountId,
    expirationTime?: Date | Timestamp,
    autoRenewPeriod?: number | Long.Long | Duration,
    tokenMemo?: string,
    customFees?: { feeCollectorAccountId?: string | AccountId | undefined }[],
    type: TokenType,
    supplyType?: TokenSupplyType,
    maxSupply?: number | Long.Long
};

type TokenKeys = {
    admin?: Key,
    feeSchedule?: Key,
    freeze?: Key,
    kyc?: Key,
    pause?: Key,
    supply?: Key,
    wipe?: Key
};

export class Token extends BasicCreatableEntity<LiveToken> {

    public constructor(private readonly info: TokenFeatures) {
        super("Token");
    }

    public async createVia({ session }: ArgumentsForCreate): Promise<LiveToken> {
        const constructorArgs = {
            // First map to expected properties
            adminKey: this.info.keys?.admin ?? session.publicKey,
            feeScheduleKey: this.info.keys?.feeSchedule ?? session.publicKey,
            freezeKey: this.info.keys?.freeze ?? session.publicKey,
            pauseKey: this.info.keys?.pause ?? session.publicKey,
            supplyKey: this.info.keys?.supply ?? session.publicKey,
            tokenName: this.info.name,
            tokenType: this.info.type,
            tokenSymbol: this.info.symbol,
            treasuryAccountId: session.accountId,
            wipeKey: session.publicKey,
      
            // Merge everything with what's provided
            ...this.info
        };
        const createTokenTransaction = new TokenCreateTransaction(constructorArgs as any);
        const creationReceipt = await session.execute(createTokenTransaction, TypeOfExecutionReturn.Receipt, true);
    
        return new LiveToken({ session, id: creationReceipt.tokenId });
    }
}