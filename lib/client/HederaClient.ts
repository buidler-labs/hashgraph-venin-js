import { 
    TransactionResponse, 
    TransactionReceipt, 
    Client, 
    PrivateKey, 
    AccountId, 
    Transaction, 
    Query 
} from "@hashgraph/sdk";
import { NetworkName } from "@hashgraph/sdk/lib/client/Client";
import Executable from "@hashgraph/sdk/lib/Executable";

import { PublicAccountInfo } from "../ApiSession";
import { HederaNetwork, HEDERA_CUSTOM_NET_NAME } from "../HederaNetwork";

import { StratoLogger } from "../StratoLogger";
import { Restorer } from "../core/Persistance";
import { ClientProvider, StratoClientState } from "./ClientProvider";
import { StatedStratoClient } from "./StatedStratoClient";
import { ClientTypes } from "./ClientType";

export type HederaClientColdStartData = { 
    accountId: string, privateKey: string 
};

export class HederaClientProvider extends ClientProvider<HederaClient, HederaClientState, HederaClientColdStartData> {

    public constructor(
        log: StratoLogger,
        network?: HederaNetwork) {
        super(log, new HederaClientStateDeserializer(), network);
    }

    public buildOperatedBy(operatorId: AccountId, operatorKey: PrivateKey): Promise<HederaClient>;
    public buildOperatedBy(operatorId: string, operatorKey: string): Promise<HederaClient>;
    public buildOperatedBy(operatorId: AccountId|string, operatorKey: PrivateKey|string): Promise<HederaClient> {
        const state = new HederaClientState(
            typeof operatorId === 'string' ? operatorId : operatorId.toString(),
            operatorKey.toString()
        );
        return this.buildRestoring(state);
    }

    protected override async _buildCold(data: HederaClientColdStartData): Promise<HederaClient> {
        return this.buildOperatedBy(data.accountId, data.privateKey);
    }

    protected override async _buildRestoring(state: HederaClientState): Promise<HederaClient> {
        let client: Client;

        if (HEDERA_CUSTOM_NET_NAME === this.network.name) {
            client = Client.forNetwork(this.network.nodes);
        } else {
            client = Client.forName(this.network.name as NetworkName);
        }
        return new HederaClient(this.log, client, state);
    }
}

class HederaClient extends StatedStratoClient<HederaClientState> {
    public readonly account: PublicAccountInfo;

    public constructor(
        log: StratoLogger,
        private readonly client: Client, 
        state: HederaClientState
    ) {
        super(ClientTypes.Hedera, log, state);
        this.client.setOperator(state.operatorId, state.operatorKey);
        this.account = {
            id: client.operatorAccountId,
            publicKey: client.operatorPublicKey
        };
    }

    public async execute<T extends Transaction|Query<Q>, Q>(transaction: T): Promise<
        T extends Query<infer Q> ? Q : 
        T extends Executable<unknown, unknown, infer OUT> ? OUT : 
        never
    > {
        const transactionResponse = await transaction.execute(this.client);

        return transactionResponse as (
            T extends Query<infer Q> ? Q : 
            T extends Executable<unknown, unknown, infer OUT> ? OUT : 
            never
        );
    }

    public getReceipt(response: TransactionResponse): Promise<TransactionReceipt> {
        return response.getReceipt(this.client);
    }
}

class HederaClientState implements StratoClientState {
    public static FIELD_SERIALIZATION_SEPARATOR = "|";

    public constructor(
        public readonly operatorId: string, 
        public readonly operatorKey: string
    ) { }

    public async save(): Promise<string> {
        return `${this.operatorId}${HederaClientState.FIELD_SERIALIZATION_SEPARATOR}${this.operatorKey}`;
    };
}

class HederaClientStateDeserializer implements Restorer<string, HederaClientState> {
    public async restore(state: string): Promise<HederaClientState> {
        const [ operatorId, operatorKey ] = state.split(HederaClientState.FIELD_SERIALIZATION_SEPARATOR);

        return new HederaClientState(operatorId, operatorKey);
    }
}
