import { 
  AccountId, 
  TokenType as HederaTokenType,
  Key, 
  Timestamp, 
  TokenCreateTransaction, 
  TokenSupplyType,
} from "@hashgraph/sdk";
import Duration from "@hashgraph/sdk/lib/Duration";

import { ArgumentsForCreate } from "../../core/CreatableEntity";
import { BasicCreatableEntity } from "./BasicCreatableEntity";
import { LiveToken } from "../../live/LiveToken";
import { TypeOfExecutionReturn } from "../../ApiSession";

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

class TokenType {
  public constructor(readonly hTokenType: HederaTokenType) {}

  public equals(what: any) {
    return what instanceof TokenType ? this.hTokenType._code === what.hTokenType._code :
      what instanceof HederaTokenType ? this.hTokenType._code === what._code : false;
  }
}

export const TokenTypes = {
  FungibleCommon: new TokenType(HederaTokenType.FungibleCommon),
  NonFungibleUnique: new TokenType(HederaTokenType.NonFungibleUnique),
}

export class Token extends BasicCreatableEntity<LiveToken> {

  public constructor(private readonly info: TokenFeatures) {
    super("Token");
  }

  public async createVia({ session }: ArgumentsForCreate): Promise<LiveToken> {
    const constructorArgs = {
      // First map to expected properties
      adminKey: this.info.keys?.admin !== null ? this.info.keys?.admin ?? session.publicKey : undefined,
      feeScheduleKey: this.info.keys?.feeSchedule !== null ? this.info.keys?.feeSchedule ?? session.publicKey : undefined,
      freezeKey: this.info.keys?.freeze !== null ? this.info.keys?.freeze ?? session.publicKey : undefined,
      kycKey: this.info.keys?.kyc !== null ? this.info.keys?.kyc ?? session.publicKey : undefined,
      pauseKey: this.info.keys?.pause !== null ? this.info.keys?.pause ?? session.publicKey : undefined,
      supplyKey: this.info.keys?.supply !== null ? this.info.keys?.supply ?? session.publicKey : undefined,
      tokenName: this.info.name,
      tokenSymbol: this.info.symbol,
      tokenType: this.info.type.hTokenType ?? HederaTokenType.FungibleCommon,
      treasuryAccountId: session.accountId,
      wipeKey: this.info.keys?.wipe !== null ? this.info.keys?.wipe ?? session.publicKey : undefined,

      // Merge everything with what's provided
      ...this.info,
    };
    const createTokenTransaction = new TokenCreateTransaction(constructorArgs as unknown);
    const creationReceipt = await session.execute(createTokenTransaction, TypeOfExecutionReturn.Receipt, true);

    return new LiveToken({ id: creationReceipt.tokenId, session });
  }
}
