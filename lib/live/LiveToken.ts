import {
  Key,
  TokenDeleteTransaction,
  TokenId,
  TokenInfo,
  TokenInfoQuery,
  TokenUpdateTransaction,
  Transaction,
} from "@hashgraph/sdk";

import { ApiSession, TypeOfExecutionReturn } from "../ApiSession";
import { Token, TokenFeatures } from "../static/create/Token";
import { HederaEntityId, LiveEntity } from "./LiveEntity";

type LiveTokenConstructorArgs = {
  session: ApiSession;
  id: TokenId;
};

/**
 * Represents a native Token on the Hedera Token Service
 */
export class LiveToken extends LiveEntity<TokenId, TokenInfo, TokenFeatures> {
  public constructor({ session, id }: LiveTokenConstructorArgs) {
    super(session, id);
  }

  public getSolidityAddress(): string {
    return this.id.toSolidityAddress();
  }

  public async assignSupplyControlTo<T extends Key & HederaEntityId, I, P>(
    key: Key | LiveEntity<T, I, P>
  ): Promise<void> {
    const tokenUpdateTx = new TokenUpdateTransaction()
      .setTokenId(this.id)
      .setSupplyKey(key instanceof Key ? key : key.id);
    await this.executeSanely(
      tokenUpdateTx,
      TypeOfExecutionReturn.Receipt,
      true
    );
  }

  public async getLiveEntityInfo(): Promise<TokenInfo> {
    const tokenInfoQuery = new TokenInfoQuery().setTokenId(this.id);
    return this.executeSanely(
      tokenInfoQuery,
      TypeOfExecutionReturn.Result,
      false
    );
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  protected async _getDeleteTransaction<R>(args?: R): Promise<Transaction> {
    return new TokenDeleteTransaction({ tokenId: this.id });
  }

  protected async _getUpdateTransaction(
    args?: TokenFeatures
  ): Promise<Transaction> {
    const featuresUsedInTransaction =
      Token.mapTokenFeaturesToTokenUpgradeArguments(args);

    return new TokenUpdateTransaction({
      ...featuresUsedInTransaction,
      tokenId: this.id,
    });
  }
}
