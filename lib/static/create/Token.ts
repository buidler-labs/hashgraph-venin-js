import { 
  AccountId, 
  TokenType as HederaTokenType,
  Key, 
  Timestamp, 
  TokenCreateTransaction, 
  TokenSupplyType,
} from "@hashgraph/sdk";
import Duration from "@hashgraph/sdk/lib/Duration";

import { ApiSession, TypeOfExecutionReturn } from "../../ApiSession";
import { ArgumentsForCreate } from "../../core/CreatableEntity";
import { BasicCreatableEntity } from "./BasicCreatableEntity";
import { LiveToken } from "../../live/LiveToken";

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

  public static mapTokenFeaturesToTokenArguments(tokenFeatures: TokenFeatures, session: ApiSession) {
    return {
      // First map to expected properties
      adminKey: tokenFeatures.keys?.admin !== null ? tokenFeatures.keys?.admin ?? session.publicKey : undefined,
      feeScheduleKey: tokenFeatures.keys?.feeSchedule !== null ? tokenFeatures.keys?.feeSchedule ?? session.publicKey : undefined,
      freezeKey: tokenFeatures.keys?.freeze !== null ? tokenFeatures.keys?.freeze ?? session.publicKey : undefined,
      kycKey: tokenFeatures.keys?.kyc !== null ? tokenFeatures.keys?.kyc ?? session.publicKey : undefined,
      pauseKey: tokenFeatures.keys?.pause !== null ? tokenFeatures.keys?.pause ?? session.publicKey : undefined,
      supplyKey: tokenFeatures.keys?.supply !== null ? tokenFeatures.keys?.supply ?? session.publicKey : undefined,
      tokenName: tokenFeatures.name,
      tokenSymbol: tokenFeatures.symbol,
      tokenType: tokenFeatures.type.hTokenType ?? HederaTokenType.FungibleCommon,
      treasuryAccountId: session.accountId,
      wipeKey: tokenFeatures.keys?.wipe !== null ? tokenFeatures.keys?.wipe ?? session.publicKey : undefined,
  
      // Merge everything with what's provided
      ...tokenFeatures,
    };
  }

  public async createVia({ session }: ArgumentsForCreate): Promise<LiveToken> {
    const constructorArgs = Token.mapTokenFeaturesToTokenArguments(this.info, session);
    const createTokenTransaction = new TokenCreateTransaction(constructorArgs as unknown);
    const creationReceipt = await session.execute(createTokenTransaction, TypeOfExecutionReturn.Receipt, true);

    return new LiveToken({ id: creationReceipt.tokenId, session });
  }
}
