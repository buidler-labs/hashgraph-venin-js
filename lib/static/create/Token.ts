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
  name?: string,
  symbol?: string,
  treasuryAccountId?: string | AccountId,
  keys?: TokenKeys,
  autoRenewAccountId?: string | AccountId,
  expirationTime?: Date | Timestamp,
  autoRenewPeriod?: number | Long.Long | Duration,
  tokenMemo?: string,
};

export type CreateTokenFeatures = TokenFeatures & {
  name: string,
  symbol: string,
  type: TokenType,
  maxSupply?: number | Long.Long,
  supplyType?: TokenSupplyType,
  initialSupply?: number | Long.Long,
  decimals?: number | Long.Long,
  customFees?: { feeCollectorAccountId?: string | AccountId | undefined }[],
  freezeDefault?: boolean,
}

type TokenKeys = {
  admin?: Key,
  feeSchedule?: Key,
  freeze?: Key,
  kyc?: Key,
  pause?: Key,
  supply?: Key,
  wipe?: Key
};

const _GUARD_OBJ = {};

export class TokenType {
  public constructor(gObj: any, readonly hTokenType: HederaTokenType) {
    if (gObj !== _GUARD_OBJ) {
      throw new Error("TokenType-s can only be created from within the static/Token module");
    }
  }

  public equals(what: any) {
    return what instanceof TokenType ? this.hTokenType._code === what.hTokenType._code :
      what instanceof HederaTokenType ? this.hTokenType._code === what._code : false;
  }
}

export const TokenTypes = {
  FungibleCommon: new TokenType(_GUARD_OBJ, HederaTokenType.FungibleCommon),
  NonFungibleUnique: new TokenType(_GUARD_OBJ, HederaTokenType.NonFungibleUnique),
}

export class Token extends BasicCreatableEntity<LiveToken> {

  public static mapTokenFeaturesToTokenUpgradeArguments(tokenFeatures: TokenFeatures) {
    const upgradeFeatures = {};
    tokenFeatures.keys?.admin && (upgradeFeatures['adminKey'] = tokenFeatures.keys?.admin);
    tokenFeatures.keys?.feeSchedule && (upgradeFeatures['feeScheduleKey'] = tokenFeatures.keys?.feeSchedule);
    tokenFeatures.keys?.freeze && (upgradeFeatures['freezeKey'] = tokenFeatures.keys?.freeze);
    tokenFeatures.keys?.kyc && (upgradeFeatures['kycKey'] = tokenFeatures.keys?.kyc);
    tokenFeatures.keys?.pause && (upgradeFeatures['pauseKey'] = tokenFeatures.keys?.pause);
    tokenFeatures.keys?.supply && (upgradeFeatures['supplyKey'] = tokenFeatures.keys?.supply);
    tokenFeatures.keys?.wipe && (upgradeFeatures['wipeKey'] = tokenFeatures.keys?.wipe);
    tokenFeatures.name && (upgradeFeatures['tokenName'] = tokenFeatures.name);
    tokenFeatures.symbol && (upgradeFeatures['tokenSymbol'] = tokenFeatures.symbol);
    tokenFeatures.treasuryAccountId && (upgradeFeatures['treasuryAccountId'] = tokenFeatures.treasuryAccountId);
    return {...upgradeFeatures, ...tokenFeatures};
  }

  public static mapTokenFeaturesToTokenArguments(tokenFeatures: CreateTokenFeatures, session: ApiSession) {
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
      treasuryAccountId: tokenFeatures.treasuryAccountId ?? session.accountId,
      wipeKey: tokenFeatures.keys?.wipe !== null ? tokenFeatures.keys?.wipe ?? session.publicKey : undefined,
  
      // Merge everything with what's provided
      ...tokenFeatures,
    };
  }

  public constructor(public readonly info: CreateTokenFeatures) {
    super("Token");
  }

  public async createVia({ session }: ArgumentsForCreate): Promise<LiveToken> {
    const constructorArgs = Token.mapTokenFeaturesToTokenArguments(this.info, session);
    const createTokenTransaction = new TokenCreateTransaction(constructorArgs as unknown);
    const creationReceipt = await session.execute(createTokenTransaction, TypeOfExecutionReturn.Receipt, true);

    return new LiveToken({ id: creationReceipt.tokenId, session });
  }
}
