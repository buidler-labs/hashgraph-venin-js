import { 
    Key, 
    TokenId, 
    TokenUpdateTransaction 
} from "@hashgraph/sdk";

import { ApiSession, TypeOfExecutionReturn } from "../ApiSession";
import { SolidityAddressable } from "../core/SolidityAddressable";
import { LiveEntity } from "./LiveEntity";

type LiveTokenConstructorArgs = {
    session: ApiSession,
    id: TokenId
};

export class LiveToken extends LiveEntity<TokenId> implements SolidityAddressable {
    public constructor({ session, id }: LiveTokenConstructorArgs) {
        super(session, id);
    }

    public async getSolidityAddress(): Promise<string> {
        return this.id.toSolidityAddress();
    }

    public async assignSupplyControlTo<T extends Key>(key: Key|LiveEntity<T>): Promise<void> {
        const tokenUpdateTx = new TokenUpdateTransaction()
            .setTokenId(this.id)
            .setSupplyKey(key instanceof Key ? key : key.id);
        await this.session.execute(tokenUpdateTx, TypeOfExecutionReturn.Receipt, true);
    }
}