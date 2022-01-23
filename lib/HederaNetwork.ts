import * as dotenv from 'dotenv';
import * as process from "process";

import {
  AccountId,
  Client,
  PrivateKey,
} from "@hashgraph/sdk";
import { NetworkName } from '@hashgraph/sdk/lib/client/Client';

import { CredentialsInvalidError } from "./errors/CredentialsInvalidError";
import { EnvironmentInvalidError } from "./errors/EnvironmentInvalidError";
import { ApiSession, SessionDefaults } from "./ApiSession";

/**
 * The Hedera Network label value used in library configurations (such as the {@link HederaNetwork.defaultApiSession} method) to signify 
 * that the library is targeting a custom network implementation with its own nodes apart from [the official ones](https://docs.hedera.com/guides/mirrornet/hedera-mirror-node#mainnet). 
 * 
 * `Note:` When this type of network is selected, its node addressbook must also be provided and that is usually done through something like the
 *         `HEDERA_NODES` env-parameter (when using {@link HederaNetwork.defaultApiSession})
 * 
 * Example of a `.env` file that targets a `customnet`, [local hedera-services](https://github.com/buidler-labs/dockerized-hedera-services) deployment:
 * ```
 * HEDERA_NETWORK=customnet
 * HEDERA_NODES=127.0.0.1:50211#3
 * ```
 * 
 * `Note #2:` If you're planning to target a local `customnet` deployment, you might as well add the operator credentials to the mix:
 * ```
 * HEDERA_OPERATOR_ID=0.0.2
 * HEDERA_OPERATOR_KEY=91132178e72057a1d7528025956fe39b0b847f200ab59b2fdd367017f3087137
 * ```
 * Please see our [dockerized-hedera-services](https://github.com/buidler-labs/dockerized-hedera-services) for more info as to how to run a local, [dockerized](https://hub.docker.com/r/buidlerlabs/hedera-services), 
 * [hedera-services](https://github.com/hashgraph/hedera-services) network.
 */
export const HEDERA_CUSTOM_NET_NAME: string = "customnet";

// Note: This follows the @hashgraph/sdk/lib/transaction/Transaction > CHUNK_SIZE value
const DEFAULT_FILE_CHUNK_SIZE = 1024;

const AVAILABLE_NETWORK_NAMES = {
  CustomNet: HEDERA_CUSTOM_NET_NAME, 
  MainNet: "mainnet", 
  TestNet: "testnet", 
  PreviewNet: "previewnet" 
};

type HederaDefaultApiSessionParamsSource = {
  /**
   * A dictionary of key-value pairs that you'll mostly likely want it to be the `process.env` runtime reference.
   */
  env?: { [key: string]: string }, 
  /**
   * The file path where the `dotenv`-like file resides which is sourced for library params. If not provided, it usually is expected to default to `.env`.
   */
  path?: string 
};
type HederaNodesAddressBook = { [key: string]: string | AccountId };

type NetworkDefaults = { 
  file_chunk_size: number
};

const DefinedNetworkDefaults: { [k: string]: NetworkDefaults } = {
  [AVAILABLE_NETWORK_NAMES.CustomNet]: {
    file_chunk_size: DEFAULT_FILE_CHUNK_SIZE
  }, 
  [AVAILABLE_NETWORK_NAMES.MainNet]: {
    file_chunk_size: DEFAULT_FILE_CHUNK_SIZE
  }, 
  [AVAILABLE_NETWORK_NAMES.TestNet]: {
    file_chunk_size: DEFAULT_FILE_CHUNK_SIZE
  }, 
  [AVAILABLE_NETWORK_NAMES.PreviewNet]: {
    file_chunk_size: DEFAULT_FILE_CHUNK_SIZE
  }, 
};

/**
 * The main entry-class for the Hedera Strato library.
 * 
 * It starts out by referencing a Hedera Network (being it [official](https://docs.hedera.com/guides/mirrornet/hedera-mirror-node#mainnet) or {@link HEDERA_CUSTOM_NET_NAME | custom}) 
 * client before allowing to generate an {@link ApiSession} through the {@link HederaNetwork.login} method call.
 */
export class HederaNetwork {
  /**
   * Builds and retrieves the default {@link ApiSession} associated with this runtime. There are currently 2 ways of providing the parameters requried for the api-session to be built:
   * - either pass them through the {@param source.env} parameter property (defaults to the `process.env` for node environments) or 
   * - give the path to a [dotenv](https://www.npmjs.com/package/dotenv) like file (defaults to `.env`) from which they are loaded by the library (the {@link source.path} parameter)
   * 
   * `Note:` At least one source must be properly wired and if both these parameter sources are set, the environment/runtime values overwrite the file-loaded ones.
   * 
   * In order for the default {@link ApiSession} to be generated, the resulting resolved parameters must have the following values present:
   * - `HEDERA_NETWORK` : the targeted hedera-network cluster. Can be one of the following: `mainnet`, `testnet`, `previewnet` or {@link HEDERA_CUSTOM_NET_NAME | customnet}
   * - `HEDERA_NODES` : (mandatory if `HEDERA_NETWORK={$link HEDERA_CUSTOM_NET_NAME}`) a comma separated list of addressbook nodes encoded in the following format
   *                    `<node_ip>#<account_number>`. Eg. `127.0.0.1#3` would be parsed in an address book having a node with IP `127.0.0.1` associated with {@link AccountId} `3`                                                            
   * - `HEDERA_OPERATOR_ID` : the string representation of the {@link AccountId} operating the resulting session (eg. `0.0.2`)
   * - `HEDERA_OPERATOR_KEY` : the string representation of the private key of the `HEDERA_OPERATOR_ID` operator paying for the session 
   * 
   * @param {HederaDefaultApiSessionParamsSource} source
   */
  public static defaultApiSession({ env = process.env, path = '.env' }: HederaDefaultApiSessionParamsSource = {}): Promise<ApiSession> {
    const eParams = HederaNetwork.resolveDefaultSessionParamsFrom({ env, path });

    return HederaNetwork.for({
      name: eParams.HEDERA_NETWORK,
      nodes: HederaNetwork.parseNetworkNodeFrom(eParams.HEDERA_NODES)
    }).login({
      operatorId: eParams.HEDERA_OPERATOR_ID,
      operatorKey: eParams.HEDERA_OPERATOR_KEY,
      defaults: HederaNetwork.parseSessionDefaultsFrom(eParams.HEDERA_NETWORK, eParams)
    });
  }

  /**
   * Builds a HederaNetwork link which can be later used to create api-sessions.
   * 
   * @param {object} options
   * @param {string} options.name - The name of the network to target. Can be any of the following: mainnet, testnet, previewnet or customnet
   * @param {object} options.nodes - The 'Client.forNetwork' compatible method argument which consists of properties that are node lacations mapped to account Ids.
   *                                 Ex. { '127.0.0.1:50211': new AccountId(3), '127.0.0.1:50212': new AccountId(4) }
   *                                 Required if {@param options.name} is customnet otherwise it's optional. 
   * @returns a {@link HederaNetwork} instance
   */
  public static for({ name, nodes = {} }: { 
    name: string, 
    nodes: HederaNodesAddressBook
  }): HederaNetwork {
    let chosenClient = null;
    const acceptedNetworkNames = Object.values(AVAILABLE_NETWORK_NAMES);

    if (!acceptedNetworkNames.includes(name)) {
      throw new EnvironmentInvalidError(`There is no such '${name}' network available. In order to continue, please choose a valid name from: ${acceptedNetworkNames.join(', ')}`);
    }

    try {
      chosenClient = Client.forName(name as NetworkName);
    } catch(e) {
      // This is a non-standard client. Maybe it's a local-net one?
      if (HEDERA_CUSTOM_NET_NAME === name) {
        if (!nodes || Object.keys(nodes).length === 0) {
          throw new EnvironmentInvalidError(`Please provide a list of network nodes in order to use a ${name} network.`);
        }
        chosenClient = Client.forNetwork(nodes);
      } else {
        // Note: this should never happen, but still ... better play it safe
        throw new EnvironmentInvalidError(`There is no such ${name} network available in this library. Available network names to choose from are: ${acceptedNetworkNames.join(', ')}`);
      }
    }
    return new HederaNetwork(chosenClient, DefinedNetworkDefaults[name]);
  }

  private static resolveDefaultSessionParamsFrom(source: HederaDefaultApiSessionParamsSource): { [key: string]: string } {
    const dEnv = dotenv.config({ path: source.path }).parsed;
    const pEnv = source.env;

    return Object.assign({}, dEnv, pEnv);
  }

  private static parseSessionDefaultsFrom(networkName: string, params: { [k: string]: string }): SessionDefaults {
    const resolveSessionDefaultValueFor = (particle: string) => 
      params[`HEDERA_${networkName.toUpperCase()}_DEFAULT_${particle.toUpperCase()}`] || params[`HEDERA_DEFAULT_${particle.toUpperCase()}`];

    return {
      contract_creation_gas: parseInt(resolveSessionDefaultValueFor("contract_creation_gas")),
      contract_transaction_gas: parseInt(resolveSessionDefaultValueFor("contract_transaction_gas")),
      emit_constructor_logs: (resolveSessionDefaultValueFor("emit_constructor_logs") ?? "true") === "true",
      emit_live_contract_receipts: (resolveSessionDefaultValueFor("emit_live_contracts_receipts") ?? "false") === "true",
      payment_for_contract_query: parseInt(resolveSessionDefaultValueFor("payment_for_contract_query"))
    };
  }

  /**
   * Parses the provided string and constructs the hedera-network nodes object required to initialize a custom Hedera Client.
   * The expected {@param string} format is in the following form: <ip>:<port>#<account-id>[,<ip2>:<port2>#<account-id2>...]
   * Example: 127.0.0.1:50211#2,127.0.0.1:50212:#5 would get mapped to the following object: 
   * {
   *   "127.0.0.1:50211": new AccountId(2),
   *   "127.0.0.1:50212": new AccountId(5)
   * }
   */
  private static parseNetworkNodeFrom(string: string): HederaNodesAddressBook {
    let networkInfo = {};

    if (string) {
      const nodeEntries = string.split(/\s*,\s*/);
      const nodeDefinitions = nodeEntries.map(entry => {
        if (entry.indexOf("#") === -1) {
          throw new EnvironmentInvalidError(`Node definition entry '${entry}' is missing the account-id separator (#)`);
        }

        const [address, rawAccountNr] = entry.split("#");
        const accountNr = parseInt(rawAccountNr);

        return {[address]: new AccountId(accountNr)};
      });

      for (const rnEntry of nodeDefinitions) {
        const nodeAddress = Object.keys(rnEntry)[0];
        networkInfo[nodeAddress] = rnEntry[nodeAddress];
      }
    }
    return networkInfo;
  }

  /**
   * Validates a string serialized account id-private key pair and returns their parsed counter-parts ready to be consumed by inner, Hedera SDK layers.
   * 
   * @param {object} options
   * @param {string} options.id - the string serialized form of the {@link AccountId}
   * @param {string} options.key - the string serialized form of the {@link PrivateKey} of that account-id
   * @returns {{ accountId: AccountId, privateKey: PrivateKey }} - Hedera SDK parsed form of the provided arguments
   * @throws {CredentialsInvalidError} - if any of the arguments fails checkup
   */
  public static validateOperator({ id, key }: { id: string, key: string }): { accountId: AccountId, privateKey: PrivateKey } {
    let accountId: AccountId;
    let privateKey: PrivateKey;

    try {
      accountId = AccountId.fromString(id);
    } catch {
      throw new CredentialsInvalidError("The provided operatorId is either invalid or missing.");
    }
    try {
      privateKey = PrivateKey.fromString(key);
    } catch {
      throw new CredentialsInvalidError("The provided operatorKey is either invalid or missing.");
    }

    return { accountId, privateKey };
  }

  private constructor(
    public readonly client: Client,
    public readonly defaults: NetworkDefaults
  ) { }

  /**
   * Creates a new {@link ApiSession} by 'logging in' with an `operator` credentials pair.
   * 
   * @param {object} options
   * @param {AccountId} options.operatorId - the {@link AccountId} of the entity operating the resulting {@link ApiSession} 
   * @param {PrivateKey} options.operatorKey - the {@link PrivateKey} of the resulting {@link ApiSession} operator that will pay for all 
   *                                           the resulting subsequent API transaction operations 
   * @params {SessionDefaults} options.defaults - the {@link SessionDefaults} instance that preloads the resulting session with
   *                                              sensible defaults (eg. for creating contracts or executing methods)
   */
  public async login({ operatorId, operatorKey, defaults = {} }: { operatorId: string, operatorKey: string, defaults: SessionDefaults }): Promise<ApiSession> {
    const { accountId, privateKey } = HederaNetwork.validateOperator({
      id: operatorId,
      key: operatorKey
    });
    const client = this.client.setOperator(accountId, privateKey);

    return new ApiSession({ network: this, client, defaults });
  }
}
