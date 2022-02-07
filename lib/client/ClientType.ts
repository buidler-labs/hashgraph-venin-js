import { AccountId, PrivateKey } from "@hashgraph/sdk";

import { CredentialsInvalidError } from "../errors/CredentialsInvalidError";
import { StratoContext } from "../StratoContext";
import { ClientController, ClientControllerEvents } from "./controller/ClientController";
import { ClientProvider, NotSupportedClientProvider } from "./ClientProvider";
import { HederaClientProvider } from "./HederaClient";
import { HederaClientController } from "./controller/HederaClientController";
import { ImpotentClientController } from "./controller/ImpotentClientController";

const CLIENT_TYPE_CONSTRUCTOR_GUARD = {};

export class ClientType {
    public constructor(
        constructorGuard: any,
        public readonly name?: string,
        public readonly defaultController: new (ctx: StratoContext) => ClientController = ImpotentClientController,
        public readonly providerHaving: new (ctx: StratoContext, controller: ClientControllerEvents) => ClientProvider = NotSupportedClientProvider,
        public readonly getColdStartOptionsFromEnvironment?: (env: { [k: string]: string }) => any
    ) {
        if (constructorGuard !== CLIENT_TYPE_CONSTRUCTOR_GUARD) {
            throw new Error("Client types cannot be defined from outside this module!");
        }
    }

    public equals(other: any): boolean {
        return other instanceof ClientType && this.name === other.name;
    }
}

export class ClientTypes {
    private readonly unknownClientType = new ClientType(CLIENT_TYPE_CONSTRUCTOR_GUARD, "Unknown");
    private readonly knownClientTypes: ClientType[];

    public constructor() {
        this.knownClientTypes = [
            new ClientType(CLIENT_TYPE_CONSTRUCTOR_GUARD, 
                "Hedera",
                HederaClientController,                 // Default ClientController
                HederaClientProvider,                   // Associated ClientProvider
                env => {                                // ColdStart options parser for Environment
                    try {
                        return {
                            accountId: AccountId.fromString(env.HEDERAS_OPERATOR_ID),
                            privateKey: PrivateKey.fromStringED25519(env.HEDERAS_OPERATOR_KEY)
                        }
                    } catch(e) {
                        throw new CredentialsInvalidError(e.message);
                    }
                }
            )
        ];
    }

    public isKnown(clientType: ClientType) {
        return !this.Unknown.equals(clientType);
    }

    public get Unknown() {
        return this.unknownClientType;
    }

    public getBy({ name }: { name: string }): ClientType {
        const candidateClientTypes = this.knownClientTypes.filter(type => type.name === name);
    
        return candidateClientTypes.length === 0 ? this.Unknown : candidateClientTypes[0];
    }
};