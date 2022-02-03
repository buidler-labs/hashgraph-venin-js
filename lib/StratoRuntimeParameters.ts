import * as dotenv from 'dotenv';

import { AccountId, PrivateKey } from '@hashgraph/sdk';
import { SessionDefaults } from './ApiSession';
import { AVAILABLE_NETWORK_NAMES, NetworkDefaults } from './HederaNetwork';
import { HederaNetwork } from '..';
import { ClientType, ClientTypes } from './client/ClientType';

export type ClientColdStartData = { accountId: AccountId, privateKey: PrivateKey };
type ClientRuntimeParameters = {
    coldStartData: ClientColdStartData,
    savedState: string,
    type: ClientType
};
export type HederaNodesAddressBook = { [key: string]: string | AccountId };
export type LoggerRuntimeParameters = { 
    level: string,
    enabled: boolean
};

export type StratoParametersSource = {
    /**
     * A dictionary of key-value pairs that you'll mostly likely want it to be the `process.env` runtime reference.
     */
    env?: { [key: string]: string }, 
    /**
     * The file path where the `dotenv`-like file resides which is sourced for library params. If not provided, it usually is expected to default to `.env`.
     */
    path?: string 
};

// Note: This follows the @hashgraph/sdk/lib/transaction/Transaction > CHUNK_SIZE value
const DEFAULT_FILE_CHUNK_SIZE = 1024;

const DefinedNetworkDefaults: { [k: string]: NetworkDefaults } = {
    [AVAILABLE_NETWORK_NAMES.CustomNet]: {
      fileChunkSize: DEFAULT_FILE_CHUNK_SIZE
    }, 
    [AVAILABLE_NETWORK_NAMES.MainNet]: {
      fileChunkSize: DEFAULT_FILE_CHUNK_SIZE
    }, 
    [AVAILABLE_NETWORK_NAMES.TestNet]: {
      fileChunkSize: DEFAULT_FILE_CHUNK_SIZE
    }, 
    [AVAILABLE_NETWORK_NAMES.PreviewNet]: {
      fileChunkSize: DEFAULT_FILE_CHUNK_SIZE
    }, 
};

export class StratoRuntimeParameters {
    public readonly client: ClientRuntimeParameters;
    public readonly logger: LoggerRuntimeParameters;
    public readonly network: HederaNetwork;
    public readonly session: {
        defaults: SessionDefaults
    };
    public readonly params: { [key: string]: string };

    public constructor(source: StratoParametersSource) {
        const dEnv = dotenv.config({ path: source.path }).parsed;
        const pEnv = source.env;
        const rawResolutedParams = Object.assign({}, dEnv, pEnv);

        // Filter and get a hold of the raw parameters of interest
        this.params = {};
        Object.keys(rawResolutedParams)
          .filter(rrParamKey => rrParamKey.startsWith('HEDERAS_'))
          .forEach(acceptedParamKey => { this.params[acceptedParamKey] = rawResolutedParams[acceptedParamKey]; });
        
        // Parse and extract the managed values
        this.client = this.parseClientSpecsFrom(this.params);
        this.logger = {
            level: this.params.HEDERAS_LOGGER_LEVEL ?? 'info',
            enabled: (this.params.HEDERAS_LOGGER_ENABLED ?? 'false') === 'true'
        };
        this.network = new HederaNetwork(
            DefinedNetworkDefaults[this.params.HEDERAS_NETWORK ?? 'unspecified'],
            this.params.HEDERAS_NETWORK ?? 'unspecified',
            this.params.HEDERAS_NODES
        );
        this.session = {
            defaults: this.parseSessionDefaultsFrom(this.network.name, this.params)
        };
    }

    private parseClientSpecsFrom(params: { [k: string]: string }): ClientRuntimeParameters {
        const clientType = ClientTypes.find(cType => cType.name === (this.params.HEDERAS_CLIENT_TYPE ?? ClientTypes.Hedera.name));
        const savedState = this.params.HEDERAS_CLIENT_SAVED_STATE ?? null;

        if (ClientTypes.Unknown.equals(clientType)) {
            throw new Error("Only 'hedera' client types is currently supported.");
        }
        return { 
            savedState,
            type: clientType,
            coldStartData: clientType.parseColdStartOptions(params)
        };
    }

    private parseSessionDefaultsFrom(networkName: string, params: { [k: string]: string }): SessionDefaults {
        const resolveSessionDefaultValueFor = (particle: string) => 
            params[`HEDERAS_${networkName.toUpperCase()}_DEFAULT_${particle.toUpperCase()}`] || params[`HEDERAS_DEFAULT_${particle.toUpperCase()}`];
    
        return {
            contractCreationGas: parseInt(resolveSessionDefaultValueFor("contract_creation_gas")),
            contractTransactionGas: parseInt(resolveSessionDefaultValueFor("contract_transaction_gas")),
            emitConstructorLogs: (resolveSessionDefaultValueFor("emit_constructor_logs") ?? "true") === "true",
            emitLiveContractReceipts: (resolveSessionDefaultValueFor("emit_live_contracts_receipts") ?? "false") === "true",
            paymentForContractQuery: parseInt(resolveSessionDefaultValueFor("payment_for_contract_query"))
        };
    }
}