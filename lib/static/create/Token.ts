import {
  AccountId,
  Hbar,
  TokenType as HederaTokenType,
  Key,
  Timestamp,
  TokenCreateTransaction,
  TokenSupplyType,
} from "@hashgraph/sdk";
import Duration from "@hashgraph/sdk/lib/Duration";

import { ApiSession } from "../../ApiSession";
import { ArgumentsForCreate } from "../../core/CreatableEntity";
import { BasicCreatableEntity } from "./BasicCreatableEntity";
import { LiveToken } from "../../live/LiveToken";

export type TokenFeatures = {
  name?: string;
  symbol?: string;
  treasuryAccountId?: string | AccountId;
  keys?: TokenKeys;
  autoRenewAccountId?: string | AccountId;
  expirationTime?: Date | Timestamp;
  autoRenewPeriod?: number | Long.Long | Duration;
  tokenMemo?: string;
  freezeDefault?: boolean;
};

export type CreateTokenFeatures = TokenFeatures & {
  name: string;
  symbol: string;
  type: TokenType;
  maxSupply?: number | Long.Long;
  supplyType?: TokenSupplyType;
  initialSupply?: number | Long.Long;
  decimals?: number | Long.Long;
  customFees?: { feeCollectorAccountId?: string | AccountId | undefined }[];
  freezeDefault?: boolean;
  maxTransactionFee?: number | Long.Long | Hbar;
};

type TokenKeys = {
  admin?: Key;
  feeSchedule?: Key;
  freeze?: Key;
  kyc?: Key;
  pause?: Key;
  supply?: Key;
  wipe?: Key;
};

const _GUARD_OBJ = {};

export class TokenType {
  public constructor(gObj: any, readonly hTokenType: HederaTokenType) {
    if (gObj !== _GUARD_OBJ) {
      throw new Error(
        "TokenType-s can only be created from within the static/Token module"
      );
    }
  }

  public equals(what: any) {
    return what instanceof TokenType
      ? this.hTokenType._code === what.hTokenType._code
      : what instanceof HederaTokenType
      ? this.hTokenType._code === what._code
      : false;
  }
}

export const TokenTypes = {
  FungibleCommon: new TokenType(_GUARD_OBJ, HederaTokenType.FungibleCommon),
  NonFungibleUnique: new TokenType(
    _GUARD_OBJ,
    HederaTokenType.NonFungibleUnique
  ),
};

export class Token extends BasicCreatableEntity<LiveToken> {
  public static mapTokenFeaturesToTokenUpgradeArguments(
    tokenFeatures: TokenFeatures
  ) {
    const upgradeFeatures = {};
    tokenFeatures.keys?.admin &&
      (upgradeFeatures["adminKey"] = tokenFeatures.keys?.admin);
    tokenFeatures.keys?.feeSchedule &&
      (upgradeFeatures["feeScheduleKey"] = tokenFeatures.keys?.feeSchedule);
    tokenFeatures.keys?.freeze &&
      (upgradeFeatures["freezeKey"] = tokenFeatures.keys?.freeze);
    tokenFeatures.keys?.kyc &&
      (upgradeFeatures["kycKey"] = tokenFeatures.keys?.kyc);
    tokenFeatures.keys?.pause &&
      (upgradeFeatures["pauseKey"] = tokenFeatures.keys?.pause);
    tokenFeatures.keys?.supply &&
      (upgradeFeatures["supplyKey"] = tokenFeatures.keys?.supply);
    tokenFeatures.keys?.wipe &&
      (upgradeFeatures["wipeKey"] = tokenFeatures.keys?.wipe);
    tokenFeatures.name && (upgradeFeatures["tokenName"] = tokenFeatures.name);
    tokenFeatures.symbol &&
      (upgradeFeatures["tokenSymbol"] = tokenFeatures.symbol);
    tokenFeatures.treasuryAccountId &&
      (upgradeFeatures["treasuryAccountId"] = tokenFeatures.treasuryAccountId);
    return { ...upgradeFeatures, ...tokenFeatures };
  }

  public static mapTokenFeaturesToTokenArguments(
    tokenFeatures: CreateTokenFeatures,
    session: ApiSession
  ) {
    const sessionPublicKey = session.wallet.account.publicKey;
    const sessionAccountId = session.wallet.account.id;

    return {
      // First map to expected properties
      adminKey:
        tokenFeatures.keys?.admin !== null
          ? tokenFeatures.keys?.admin ?? sessionPublicKey
          : undefined,
      feeScheduleKey:
        tokenFeatures.keys?.feeSchedule !== null
          ? tokenFeatures.keys?.feeSchedule ?? sessionPublicKey
          : undefined,
      freezeKey:
        tokenFeatures.keys?.freeze !== null
          ? tokenFeatures.keys?.freeze ?? sessionPublicKey
          : undefined,
      kycKey:
        tokenFeatures.keys?.kyc !== null
          ? tokenFeatures.keys?.kyc ?? sessionPublicKey
          : undefined,
      pauseKey:
        tokenFeatures.keys?.pause !== null
          ? tokenFeatures.keys?.pause ?? sessionPublicKey
          : undefined,
      supplyKey:
        tokenFeatures.keys?.supply !== null
          ? tokenFeatures.keys?.supply ?? sessionPublicKey
          : undefined,
      tokenName: tokenFeatures.name,
      tokenSymbol: tokenFeatures.symbol,
      tokenType:
        tokenFeatures.type.hTokenType ?? HederaTokenType.FungibleCommon,
      treasuryAccountId: tokenFeatures.treasuryAccountId ?? sessionAccountId,
      wipeKey:
        tokenFeatures.keys?.wipe !== null
          ? tokenFeatures.keys?.wipe ?? sessionPublicKey
          : undefined,

      // Merge everything with what's provided
      ...tokenFeatures,
    };
  }

  public constructor(public readonly info: CreateTokenFeatures) {
    super("Token");
  }

  public async createVia({ session }: ArgumentsForCreate): Promise<LiveToken> {
    const constructorArgs = Token.mapTokenFeaturesToTokenArguments(
      this.info,
      session
    );
    const createTokenTransaction = new TokenCreateTransaction(
      constructorArgs as unknown
    );

    let transactionFee: Hbar;
    if (this.info.maxTransactionFee) {
      transactionFee =
        this.info.maxTransactionFee instanceof Hbar
          ? this.info.maxTransactionFee
          : new Hbar(this.info.maxTransactionFee);
    } else if (session.defaults.tokenCreateTransactionFee > 0) {
      transactionFee = Hbar.fromTinybars(
        session.defaults.tokenCreateTransactionFee
      );
    }
    if (transactionFee) {
      createTokenTransaction.setMaxTransactionFee(transactionFee);
    }
    const {
      receipt: { tokenId },
    } = await session.execute(createTokenTransaction);

    return new LiveToken({ id: tokenId, session });
  }
}
