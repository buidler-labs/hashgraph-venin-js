import { AccountId, PrivateKey, PublicKey, Transaction } from "@hashgraph/sdk";

import { ApiSession } from "../ApiSession";
import { SolidityAddressable } from "../core/SolidityAddressable";
import { LiveEntity } from "./LiveEntity";

type LiveAccountConstructorArgs = {
    session: ApiSession,
    id: AccountId,
    publicKey: PublicKey,
    privateKey?: PrivateKey
};

export class LiveAccount extends LiveEntity<AccountId> implements SolidityAddressable {
    public readonly publicKey: PublicKey;
    private readonly privateKey: PrivateKey;

    constructor({ session, id, publicKey, privateKey }: LiveAccountConstructorArgs) {
        super(session, id);
        this.publicKey = publicKey;
        this.privateKey = privateKey;
    }
    
    public async getSolidityAddress(): Promise<string> {
        return this.id.toSolidityAddress();
    }

    public tryToSign(transaction: Transaction): void {
        if (this.privateKey !== undefined) {
            const signature = this.privateKey.signTransaction(transaction);

            transaction.addSignature(this.publicKey, signature);
        }
    }
}
