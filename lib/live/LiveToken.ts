import { TokenId } from "@hashgraph/sdk";
import { ApiSession } from "../ApiSession";
import { SolidityAddressable } from "../SolidityAddressable";
import { LiveEntity } from "./LiveEntity";

type LiveTokenConstructorArgs = {
    session: ApiSession,
    id: TokenId
};

export class LiveToken extends LiveEntity<TokenId> implements SolidityAddressable {
    constructor({ session, id }: LiveTokenConstructorArgs) {
        super(session, id);
    }

    public async getSolidityAddress(): Promise<string> {
        return this.id.toSolidityAddress();
    }
}