import { 
    TransactionResponse, 
    TransactionReceipt, 
    AccountId,
    Transaction,
    Query,
    TransactionId,
    PublicKey
} from "@hashgraph/sdk";
import { 
    HashConnect,
    HashConnectTypes, 
    MessageTypes
} from 'hashconnect';
import Executable from "@hashgraph/sdk/lib/Executable";

import { HederaNetwork } from "../HederaNetwork";
import { StratoLogger } from "../StratoLogger";
import { ClientProvider, StratoClientState } from "./ClientProvider";
import { StringDeserializer } from "../StringDeserializer";
import { StatedStratoClient } from "./StatedStratoClient";
import { PublicAccountInfo } from "../ApiSession";

export type HederaClientColdStartData = HashConnectTypes.AppMetadata;

export class HashConnectClientProvider extends ClientProvider<HashConnectClient, HashConnectState, HederaClientColdStartData> {
    public constructor(
        log: StratoLogger,
        network?: HederaNetwork
    ) {
        super(log, new HashConnectClientStateDeserializer(), network);
    }

    protected override async _buildCold(appMetaData: HashConnectTypes.AppMetadata): Promise<HashConnectClient> {
        const hc = new HashConnect(this.log.isSillyLoggingEnabled);
        const initData = await hc.init(appMetaData);
        const connectedHc = await hc.connect();
        const pairingString = hc.generatePairingString(connectedHc, this.network.name, false);
        const promisedNewHashConnectClient = new Promise<HashConnectClient>((accept, reject) => {
            hc.pairingEvent.on((data) => {
                if (data.accountIds.length === 0) {
                    this.log.error("HashConnect pairing-event did not return any accounts. Cannot continue creating the Client.");
                    reject("Cannot continue creating a hashconnect client since no account has been paired.");
                }

                const pairedAccount = AccountId.fromString(data.accountIds[0]);

                return this.network.getInfoFor(pairedAccount)
                    .then(accountInfo => {
                        const state = new HashConnectState(
                            appMetaData,
                            connectedHc.topic,
                            pairingString,
                            accountInfo.asSessionAccountInfo,
                            initData.privKey,
                            data.metadata
                        );
                        accept(new HashConnectClient(this.log, hc, state)); 
                    });
            });
        });

        this.log.info(`New HashConnect pairing string has been generated: ${pairingString}`);

        hc.findLocalWallets();
        return promisedNewHashConnectClient;
    }

    protected override async _buildRestoring(state: HashConnectState): Promise<HashConnectClient> {
        const hc = new HashConnect(this.log.isSillyLoggingEnabled);

        await hc.init(state.appMetaData, state.privateKey);
        await hc.connect(state.topic, state.pairedWalletData);
        return new HashConnectClient(this.log, hc, state);
    }
}

class HashConnectClient extends StatedStratoClient<HashConnectState> {
    public readonly account: PublicAccountInfo;

    public constructor(
        log: StratoLogger,
        private readonly hc: HashConnect,
        state: HashConnectState
    ) { 
        super('HashConnect', log, state);
        this.account = state.pairedAccount;
    }

    public override async execute<T extends Transaction|Query<Q>, Q>(transaction: T): Promise<
        T extends Query<infer Q> ? Q : 
        T extends Executable<unknown, unknown, infer OUT> ? OUT : 
        never
    > {
        if (transaction instanceof Transaction) {
            const transId = TransactionId.generate(this.account.id);

            transaction
                .setNodeAccountIds([ new AccountId(3) ])
                .setTransactionId(transId)
                .freeze();
        }

        const hcTransaction: MessageTypes.Transaction = {
            topic: this.state.topic,
            byteArray: transaction.toBytes(),
            metadata: {
                accountToSign: this.account.id.toString(),
                returnTransaction: false
            }
        }

        await this.hc.sendTransaction(this.state.topic, hcTransaction);
        return new Promise((accept, reject) => {
            this.hc.transactionResponseEvent.once((data) => {
                this.log.debug("Transaction response received:", data);

                // TODO: accept
                // accept(null);
                reject("To be implemented once hashconnect is stable enough");
            })
        });
    }

    public override getReceipt(response: TransactionResponse): Promise<TransactionReceipt> {
        throw new Error("To be implemented once hashconnect is stable enough");
    }
}

class HashConnectState implements StratoClientState {
    public static FIELD_SERIALIZATION_SEPARATOR = "<*>";

    public constructor(
        public readonly appMetaData: HashConnectTypes.AppMetadata,
        public readonly topic: string,
        public readonly pairingString: string,
        public readonly pairedAccount: PublicAccountInfo,
        public readonly privateKey?: string,
        public readonly pairedWalletData?: HashConnectTypes.WalletMetadata
    ) { }

    public serialize(): string {
        return `${JSON.stringify(this.appMetaData)}${HashConnectState.FIELD_SERIALIZATION_SEPARATOR}` +
            `${this.topic}${HashConnectState.FIELD_SERIALIZATION_SEPARATOR}` +
            `${this.pairingString}${HashConnectState.FIELD_SERIALIZATION_SEPARATOR}` +
            `${this.pairedAccount.id.toString()}${HashConnectState.FIELD_SERIALIZATION_SEPARATOR}` +
            `${this.pairedAccount.publicKey.toString()}${HashConnectState.FIELD_SERIALIZATION_SEPARATOR}` +
            `${this.privateKey ?? ""}${HashConnectState.FIELD_SERIALIZATION_SEPARATOR}` +
            `${JSON.stringify(this.pairedWalletData ?? "")}`;
    }
}

class HashConnectClientStateDeserializer implements StringDeserializer<HashConnectState> {
    public deserialize(state: string): HashConnectState {
        const [ 
            rawAppMetaData,
            topic, pairingString,
            pairedAccountId,
            pairedAccountPublicKey, 
            optionalPrivateKey, optionalPairedWalletData 
        ] = state.split(HashConnectState.FIELD_SERIALIZATION_SEPARATOR);
        const pairedAccount: PublicAccountInfo = {
            id: AccountId.fromString(pairedAccountId),
            publicKey: PublicKey.fromString(pairedAccountPublicKey)
        };
        return new HashConnectState(
            JSON.parse(rawAppMetaData),
            topic, pairingString, 
            pairedAccount, 
            optionalPrivateKey !== "" ? optionalPrivateKey : undefined,
            optionalPairedWalletData !== "" ? (JSON.parse(optionalPairedWalletData) as unknown) as HashConnectTypes.AppMetadata : undefined
        );
    }
}
