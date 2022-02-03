import { AccountId, PrivateKey } from "@hashgraph/sdk";
import { CredentialsInvalidError } from "../errors/CredentialsInvalidError";
import { HederaNetwork } from "../HederaNetwork";
import { StratoLogger } from "../StratoLogger";
import { ClientProvider } from "./ClientProvider";
import { HederaClientProvider } from "./HederaClient";
import { NotSupportedClientProvider } from "./NotSupportedClient";

const CLIENTTYPE_CONSTRUCTOR_GUARD = {};

export class ClientType {
    public constructor(
        constructorGuard: any,
        public readonly id: number,
        public readonly name: string,
        private readonly providerClass: new (log: StratoLogger, network?: HederaNetwork) => ClientProvider = NotSupportedClientProvider,
        public readonly parseColdStartOptions?: (env: any) => any
    ) {
        if (constructorGuard !== CLIENTTYPE_CONSTRUCTOR_GUARD) {
            throw new Error("Client types cannot be defined from outside this module!");
        }
    }

    public equals(other: any): boolean {
        return other instanceof ClientType && this.id === other.id;
    }

    public newProviderHaving(log: StratoLogger, network?: HederaNetwork): ClientProvider {
        return new this.providerClass(log, network);
    }
}

export class ClientTypes {
    public static readonly Unknown = new ClientType(CLIENTTYPE_CONSTRUCTOR_GUARD, -1, "Unknown");
    public static readonly Hedera = new ClientType(CLIENTTYPE_CONSTRUCTOR_GUARD, 0, "Hedera", HederaClientProvider, (env => {
        try {
            return {
                accountId: AccountId.fromString(env.HEDERAS_OPERATOR_ID),
                privateKey: PrivateKey.fromStringED25519(env.HEDERAS_OPERATOR_KEY)
            }
        } catch(e) {
            throw new CredentialsInvalidError(e.message);
        }
    }));

    public static find(predicate: (type: ClientType) => boolean): ClientType {
        const candidateClientTypes = Object.values(ClientTypes).filter(predicate);
    
        return candidateClientTypes.length === 0 ? ClientTypes.Unknown : candidateClientTypes[0];
    }
};