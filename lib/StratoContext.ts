import * as dotenv from 'dotenv';

import { AccountId, PrivateKey } from '@hashgraph/sdk';

import { RecursivePartial } from './core/UsefulTypes';
import { SessionDefaults } from './ApiSession';
import { AVAILABLE_NETWORK_NAMES, NetworkDefaults } from './HederaNetwork';
import { HederaNetwork } from './HederaNetwork';
import { ClientType, ClientTypes } from './client/ClientType';
import { StratoLogger } from './StratoLogger';
import { ClientController } from './client/controller/ClientController';
import { StratoClient } from './client/StratoClient';
import { ClientControllers } from './client/controller/ClientControllers';

export type ControlledClient = {
    controller: ClientController,
    client: StratoClient
};
export type ClientColdStartData = { accountId: AccountId, privateKey: PrivateKey };
export type ClientControllersParameters = {
    type: string,
    default: {
        operatorKey: string
    }
};
type ClientRuntimeParameters = {
    coldStartData: ClientColdStartData,
    controllers: ClientControllersParameters,
    savedState: string,
    type: ClientType
};
export type HederaNodesAddressBook = { [key: string]: string | AccountId };
export type LoggerRuntimeParameters = { 
    level: string,
    enabled: boolean
};
export type SessionRuntimeParameters = {
    defaults: SessionDefaults
};
export type NetworkRuntimeParameters = {
    defaults: NetworkDefaults,
    name: string,
    nodes: string
};
type StratoParameters = {
    client: ClientRuntimeParameters,
    logger: LoggerRuntimeParameters,
    network: NetworkRuntimeParameters,
    session: SessionRuntimeParameters
};

export type StratoContextSource = {
    params?: RecursivePartial<StratoParameters>,
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

/**
 * Contains any parameters/objects that can be created with those parameters which are unpacked by other components in the library
 */
export class StratoContext {
    public readonly params: StratoParameters;

    public readonly clientControllers: ClientControllers;
    public readonly clientTypes: ClientTypes;
    public readonly log: StratoLogger;
    public readonly network: HederaNetwork;

    public constructor(source: StratoContextSource) {
        let dEnv = dotenv.config({ path: source.path }).parsed;
        const eParams: {[k: string]: string} = {};
        
        // Filter and get a hold of the raw parameters of interest
        if (!dEnv) {
            // Default to whatever lies in the process.env
            dEnv = process.env;
        }
        Object.keys(dEnv)
            .filter(rrParamKey => rrParamKey.startsWith('HEDERAS_'))
            .forEach(acceptedParamKey => { eParams[acceptedParamKey] = dEnv[acceptedParamKey]; });
        
        // Parse and extract the managed values
        const networkName = source?.params?.network?.name ?? eParams.HEDERAS_NETWORK ?? 'unspecified';

        this.clientTypes = new ClientTypes();
        this.params = {
            client: this.parseClientSpecsFrom(eParams),
            logger: {
                level: source?.params?.logger?.level ?? eParams.HEDERAS_LOGGER_LEVEL ?? 'info',
                enabled: (source?.params?.logger?.enabled ?? eParams.HEDERAS_LOGGER_ENABLED ?? 'false') === 'true'
            },
            network: {
                defaults: DefinedNetworkDefaults[ source?.params?.network?.name ?? eParams.HEDERAS_NETWORK ?? 'unspecified' ],
                name: networkName,
                nodes: source?.params?.network?.nodes ?? eParams.HEDERAS_NODES ?? ""
            },
            session: {
                defaults: this.parseSessionDefaultsFrom(networkName, eParams)
            }
        };
        this.clientControllers = new ClientControllers(this);
        this.log = new StratoLogger(this.params.logger);
        this.network = HederaNetwork.newFrom(this.params.network);
    }

    public async getClient(controller?: ClientController): Promise<ControlledClient> {
        let client: StratoClient;
        const resolvedController = controller ?? 
            this.clientControllers.getBy({ name: this.params.client.controllers.type }) ?? 
            new this.params.client.type.defaultController(this);
        const provider = new this.params.client.type.providerHaving(this, resolvedController);

        if(this.params.client.savedState) {
            client = await provider.buildRestoring(this.params.client.savedState);
        } else if (this.params.client.coldStartData) {
            client = await provider.buildColdFor(this.params.client.coldStartData);
        } else {
            throw new Error("Please provide either the cold-start data or a saved-state from where to create the bounded underlying Client with.");
        }

        return {
            client,
            controller: resolvedController
        }
    }

    private parseClientSpecsFrom(params: { [k: string]: string }): ClientRuntimeParameters {
        const clientControllerDefaultPrivateKey = params.HEDERAS_CLIENT_CONTROLLER_DEFAULT_PRIVATE_KEY;
        const clientControllerType = params.HEDERAS_CLIENT_CONTROLLER;
        const clientType =  this.clientTypes.getBy({ name : params.HEDERAS_CLIENT_TYPE ? params.HEDERAS_CLIENT_TYPE : "Hedera" });
        const savedState = params.HEDERAS_CLIENT_SAVED_STATE ?? null;

        if (!this.clientTypes.isKnown(clientType)) {
            throw new Error("Only 'hedera' client type is currently supported. This is also the default value if not specified.");
        }
        return { 
            savedState,
            controllers: {
                type: clientControllerType,
                default: {
                    operatorKey: clientControllerDefaultPrivateKey
                }
            },
            type: clientType,
            coldStartData: clientType.getColdStartOptionsFromEnvironment(params)
        };
    }

    private parseSessionDefaultsFrom(networkName: string, params: { [k: string]: string }): SessionDefaults {
        const resolveSessionDefaultValueFor = (particle: string) => 
            params[`HEDERAS_${networkName.toUpperCase()}_DEFAULT_${particle.toUpperCase()}`] || params[`HEDERAS_DEFAULT_${particle.toUpperCase()}`];
     
        return {
            contractCreationGas: parseInt(resolveSessionDefaultValueFor("contract_creation_gas") ?? "150000"),
            contractTransactionGas: parseInt(resolveSessionDefaultValueFor("contract_transaction_gas") ?? "169000"),
            emitConstructorLogs: (resolveSessionDefaultValueFor("emit_constructor_logs") ?? "true") === "true",
            emitLiveContractReceipts: (resolveSessionDefaultValueFor("emit_live_contracts_receipts") ?? "false") === "true",
            paymentForContractQuery: parseInt(resolveSessionDefaultValueFor("payment_for_contract_query") ?? "0")
        };
    }
}
