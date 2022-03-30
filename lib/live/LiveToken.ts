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
import { LiveEntity } from "./LiveEntity";
import { SolidityAddressable } from "../core/SolidityAddressable";
import { Token, TokenFeatures } from "../static/create/Token";

type LiveTokenConstructorArgs = {
    session: ApiSession,
    id: TokenId
};

export class LiveToken extends LiveEntity<TokenId, TokenInfo, TokenFeatures> implements SolidityAddressable {

  public constructor({ session, id }: LiveTokenConstructorArgs) {
    super(session, id);
  }

  public getSolidityAddress(): string {
    return this.id.toSolidityAddress();
  }

  public async assignSupplyControlTo<T extends Key, I, P>(key: Key | LiveEntity<T, I, P>): Promise<void> {
    const tokenUpdateTx = new TokenUpdateTransaction()
      .setTokenId(this.id)
      .setSupplyKey(key instanceof Key ? key : key.id);
    await this.session.execute(tokenUpdateTx, TypeOfExecutionReturn.Receipt, true);
  }

  public async getLiveEntityInfo(): Promise<TokenInfo> {
    const tokenInfoQuery = new TokenInfoQuery().setTokenId(this.id);
    return this.session.execute(tokenInfoQuery, TypeOfExecutionReturn.Result, false);
  }

  protected _mapFeaturesToArguments(args?: TokenFeatures): any {
    return Token.mapTokenFeaturesToTokenArguments(args, this.session);
  }

  protected _getDeleteTransaction<R>(args?: R): Transaction {
    return new TokenDeleteTransaction({tokenId: this.id})
  }

  protected _getUpdateTransaction<R>(args?: R): Transaction {
    return new TokenUpdateTransaction({
      ...args,
      tokenId: this.id,
    });
  }
}
