import {
  Key,
  TokenId,
  TokenInfo,
  TokenInfoQuery,
  TokenUpdateTransaction
} from "@hashgraph/sdk";

import { ApiSession, TypeOfExecutionReturn } from "../ApiSession";
import { LiveEntity } from "./LiveEntity";
import { SolidityAddressable } from "../core/SolidityAddressable";

type LiveTokenConstructorArgs = {
    session: ApiSession,
    id: TokenId
};

export class LiveToken extends LiveEntity<TokenId, TokenInfo> implements SolidityAddressable {

  public constructor({ session, id }: LiveTokenConstructorArgs) {
    super(session, id);
  }

  public getSolidityAddress(): string {
    return this.id.toSolidityAddress();
  }

  public async assignSupplyControlTo<T extends Key, I>(key: Key | LiveEntity<T, I>): Promise<void> {
    const tokenUpdateTx = new TokenUpdateTransaction()
      .setTokenId(this.id)
      .setSupplyKey(key instanceof Key ? key : key.id);
    await this.session.execute(tokenUpdateTx, TypeOfExecutionReturn.Receipt, true);
  }

  public async getInfo(): Promise<TokenInfo> {
    const tokenInfoQuery = new TokenInfoQuery().setTokenId(this.id);
    return this.session.execute(tokenInfoQuery, TypeOfExecutionReturn.Result, false);
  }
}