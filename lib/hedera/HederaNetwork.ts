import { AccountId, Client } from "@hashgraph/sdk";
import { NetworkName } from "@hashgraph/sdk/lib/client/Client";

import { EnvironmentInvalidError } from "../errors/EnvironmentInvalidError";
import { HederaRestMirror } from "./HederaRestMirror";
import { NetworkRuntimeParameters } from "../StratoContext";

export type HederaNodesAddressBook = { [key: string]: string | AccountId };
export type HederaNetworkConstructorArgs = NetworkRuntimeParameters;

/**
 * The Hedera Network label value used in library configurations (such as the {@link ApiSession.default} method) to signify
 * that the library is targeting a custom network implementation with its own nodes apart from [the official ones](https://docs.hedera.com/guides/mirrornet/hedera-mirror-node#mainnet).
 *
 * `Note:` When this type of network is selected, its node address book must also be provided and that is usually done through something like the
 *         `HEDERAS_NODES` env-parameter (when using {@link ApiSession.default})
 *
 * Example of a `.env` file that targets a `customnet`, [local hedera-services](https://github.com/buidler-labs/dockerized-hedera-services) deployment:
 * ```
 * HEDERAS_NETWORK=customnet
 * HEDERAS_NODES=127.0.0.1:50211#3
 * ```
 *
 * `Note #2:` If you're planning to target a local `customnet` deployment, you might as well add the operator credentials to the mix:
 * ```
 * HEDERAS_OPERATOR_ID=0.0.2
 * HEDERAS_OPERATOR_KEY=91132178e72057a1d7528025956fe39b0b847f200ab59b2fdd367017f3087137
 * ```
 * Please see our [dockerized-hedera-services](https://github.com/buidler-labs/dockerized-hedera-services) for more info as to how to run a local, [dockerized](https://hub.docker.com/r/buidlerlabs/hedera-services),
 * [hedera-services](https://github.com/hashgraph/hedera-services) network.
 */
export const StratoNetworkNames = [
  "mainnet",
  "testnet",
  "previewnet",
  "customnet",
] as const;
export type StratoNetworkName = typeof StratoNetworkNames[number];

export type NetworkDefaults = {
  fileChunkSize: number;
  restMirrorAddress: string;
};

/**
 * The main entry-class for the Hedera Venin library.
 *
 * It starts out by referencing a Hedera Network (being it [official](https://docs.hedera.com/guides/mirrornet/hedera-mirror-node#mainnet) or {@link HEDERA_CUSTOM_NET_NAME | custom})
 * client before allowing to generate an {@link ApiSession} through the {@link HederaNetwork.login} method call.
 */
export class HederaNetwork {
  /**
   * Parses the provided string and constructs the hedera-network nodes object required to initialize a custom Hedera Client.
   * The expected {@param string} format is in the following form: <ip>:<port>#<account-id>[,<ip2>:<port2>#<account-id2>...]
   * Example: 127.0.0.1:50211#2,127.0.0.1:50212:#5 would get mapped to the following object:
   * {
   *   "127.0.0.1:50211": new AccountId(2),
   *   "127.0.0.1:50212": new AccountId(5)
   * }
   */
  public static parseNetworkAddressBookFrom(
    val: string
  ): HederaNodesAddressBook {
    const networkInfo = {};

    if (val) {
      const nodeEntries = val.split(/\s*,\s*/);
      const nodeDefinitions = nodeEntries.map((entry) => {
        if (entry.indexOf("#") === -1) {
          throw new EnvironmentInvalidError(
            `Node definition entry '${entry}' is missing the account-id separator (#)`
          );
        }

        const [address, rawAccountNr] = entry.split("#");
        const accountNr = parseInt(rawAccountNr);

        return { [address]: new AccountId(accountNr) };
      });

      for (const rnEntry of nodeDefinitions) {
        const nodeAddress = Object.keys(rnEntry)[0];

        networkInfo[nodeAddress] = rnEntry[nodeAddress];
      }
    }
    return networkInfo;
  }

  public readonly nodes: HederaNodesAddressBook;
  public readonly client: Client;
  public readonly mirror: HederaRestMirror;

  public constructor(private readonly params: HederaNetworkConstructorArgs) {
    const acceptedNetworkNames = Object.values(StratoNetworkNames);

    if (typeof params.nodes === "string") {
      this.nodes = HederaNetwork.parseNetworkAddressBookFrom(params.nodes);
    } else {
      this.nodes = params.nodes;
    }
    if (!acceptedNetworkNames.includes(this.name)) {
      throw new EnvironmentInvalidError(
        `There is no such '${
          this.params.name
        }' network available. In order to continue, please choose a valid name from: ${acceptedNetworkNames.join(
          ", "
        )}`
      );
    }

    try {
      this.client = Client.forName(this.name as NetworkName);
    } catch (e) {
      // This is a non-standard client. Maybe it's a local-net one?
      if ("customnet" === this.name) {
        if (!this.nodes || Object.keys(this.nodes).length === 0) {
          throw new EnvironmentInvalidError(
            `Please provide a list of network nodes in order to use a ${this.name} network.`
          );
        }
        this.client = Client.forNetwork(this.nodes);
      } else {
        // Note: this should never happen, but still ... better play it safe
        throw new EnvironmentInvalidError(
          `There is no such ${
            this.name
          } network available in this library. Available network names to choose from are: ${acceptedNetworkNames.join(
            ", "
          )}`
        );
      }
    }

    this.mirror = new HederaRestMirror(
      params.name === "customnet"
        ? params.defaults.restMirrorAddress
        : params.name
    );
  }

  public get defaults() {
    return this.params.defaults;
  }
  public get name(): StratoNetworkName {
    return this.params.name;
  }
}
