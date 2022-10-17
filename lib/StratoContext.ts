import * as dotenv from "dotenv";

import {
  HederaNodesAddressBook,
  NetworkDefaults,
  StratoNetworkName,
} from "./hedera/HederaNetwork";
import { WalletType, WalletTypes } from "./wallet/WalletType";
import { Client } from "@hashgraph/sdk";
import { EnvironmentInvalidError } from "./errors/EnvironmentInvalidError";
import { HederaNetwork } from "./hedera/HederaNetwork";
import { RecursivePartial } from "./core/UsefulTypes";
import { SessionDefaults } from "./ApiSession";
import { StratoLogger } from "./StratoLogger";
import { StratoWallet } from "./core/wallet/StratoWallet";
import { WalletController } from "./core/wallet/WalletController";
import { WalletControllers } from "./wallet/controller/WalletControllers";

export type ControlledWallet = {
  controller: WalletController;
  wallet: StratoWallet;
};
export type WalletControllerParameters = {
  type: string;
  default: {
    operatorKey: string;
  };
};
type WalletRuntimeParameters = {
  controller: WalletControllerParameters;
  type: string | WalletType;
  sdk: {
    operatorId: string;
    operatorKey: string;
  };
  window: {
    propName: string;
  };
};
export type LoggerRuntimeParameters = {
  level: string;
  enabled: boolean;
};
export type SessionRuntimeParameters = {
  defaults: SessionDefaults;
};
export type NetworkRuntimeParameters = {
  defaults: NetworkDefaults;
  name: StratoNetworkName;
  nodes: string | HederaNodesAddressBook;
};
export type StratoParameters = {
  wallet: WalletRuntimeParameters;
  logger: LoggerRuntimeParameters;
  network: NetworkRuntimeParameters;
  session: SessionRuntimeParameters;
};

export type StratoContextSource = {
  /**
   * Runtime parameters used to resolve a {@link StratoContext} configuration
   */
  params?: RecursivePartial<StratoParameters>;
  /**
   * The file path where the `dotenv`-like file resides which is sourced for library params. If not provided, it usually is expected to default to `.env`.
   */
  path?: string;
};

// Note: This follows the @hashgraph/sdk/lib/transaction/Transaction > CHUNK_SIZE value
//       v2.17.1 increased the size to 4096
const DEFAULT_FILE_CHUNK_SIZE = 4096;

export const DEFAULT_HEDERA_REST_MIRROR_URL = "http://127.0.0.1:5551";

/**
 * Contains any parameters/objects that can be created with those parameters which are unpacked by other components in the library
 */
export class StratoContext {
  public readonly params: StratoParameters;

  public readonly walletControllers: WalletControllers;
  public readonly walletTypes: WalletTypes;
  public readonly log: StratoLogger;
  public readonly network: HederaNetwork;

  public constructor(source: StratoContextSource) {
    let dEnv = dotenv.config({ path: source.path }).parsed;
    const eParams: { [k: string]: string } = {};
    const rParams = source?.params ?? {};

    // Filter and get a hold of the raw parameters of interest
    if (!dEnv) {
      // Default to whatever lies in the process.env
      dEnv = process.env;
    }
    Object.keys(dEnv)
      .filter((rrParamKey) => rrParamKey.startsWith("HEDERAS_"))
      .forEach((acceptedParamKey) => {
        eParams[acceptedParamKey] = dEnv[acceptedParamKey];
      });

    // Parse and extract the managed values
    const networkParams = this.getNetworkConfig(eParams, rParams.network);
    const loggerParams = {
      enabled:
        (rParams.logger?.enabled ??
          eParams.HEDERAS_LOGGER_ENABLED ??
          "false") === "true",
      level: rParams.logger?.level ?? eParams.HEDERAS_LOGGER_LEVEL ?? "info",
    };

    this.walletTypes = new WalletTypes();
    this.params = {
      logger: loggerParams,
      network: networkParams,
      session: {
        defaults: this.parseSessionDefaultsFrom(
          networkParams.name,
          rParams,
          eParams
        ),
      },
      wallet: this.computeWalletSpecsFrom(rParams, eParams),
    };
    this.walletControllers = new WalletControllers(this);
    this.log = new StratoLogger(loggerParams);
    this.network = new HederaNetwork(networkParams);
  }

  public async getWallet(
    controller?: WalletController
  ): Promise<ControlledWallet> {
    const walletType =
      typeof this.params.wallet.type === "string"
        ? this.walletTypes.getBy({ name: this.params.wallet.type })
        : this.params.wallet.type;
    const resolvedController =
      controller ??
      this.walletControllers.getBy({
        name: this.params.wallet.controller.type,
      }) ??
      new walletType.defaultController(this);
    const provider = new walletType.providerHaving(this, resolvedController);
    const coldStartData = walletType.computeColdStartOptionsFrom(this.params);

    if (coldStartData) {
      return {
        controller: resolvedController,
        wallet: await provider.buildFor(coldStartData),
      };
    } else {
      throw new Error(
        "Please provide either the cold-start data or a saved-state from where to create the bounded underlying Wallet with."
      );
    }
  }

  private computeWalletSpecsFrom(
    rParams: RecursivePartial<StratoParameters>,
    eParams: { [k: string]: string }
  ): WalletRuntimeParameters {
    const walletControllerDefaultPrivateKey =
      rParams.wallet?.controller?.default?.operatorKey ??
      eParams.HEDERAS_WALLET_CONTROLLER_DEFAULT_PRIVATE_KEY;
    const walletControllerType =
      rParams.wallet?.controller?.type ??
      eParams.HEDERAS_WALLET_CONTROLLER ??
      "Hedera";
    const walletType = this.walletTypes.getBy({
      name:
        typeof rParams.wallet?.type === "string"
          ? rParams.wallet?.type
          : eParams.HEDERAS_WALLET_TYPE
          ? eParams.HEDERAS_WALLET_TYPE
          : "Sdk",
    });
    const walletWindowPropName =
      rParams.wallet?.window?.propName ??
      eParams.HEDERAS_WALLET_WINDOW_PROPERTY_NAME ??
      "hedera";

    if (!this.walletTypes.isKnown(walletType)) {
      throw new Error(
        "Only 'Sdk' and 'Browser' wallet types are currently supported. If you don't specify one, it will default to 'Sdk'."
      );
    }
    return {
      controller: {
        default: {
          operatorKey: walletControllerDefaultPrivateKey,
        },
        type: walletControllerType,
      },
      sdk: {
        operatorId:
          rParams.wallet?.sdk?.operatorId ?? eParams.HEDERAS_OPERATOR_ID,
        operatorKey:
          rParams.wallet?.sdk?.operatorKey ?? eParams.HEDERAS_OPERATOR_KEY,
      },
      type: walletType,
      window: {
        propName: walletWindowPropName,
      },
    };
  }

  private parseSessionDefaultsFrom(
    network: StratoNetworkName,
    rParams: RecursivePartial<StratoParameters>,
    eParams: { [k: string]: string }
  ): SessionDefaults {
    const resolveSessionDefaultValueFor = (particle: string) =>
      eParams[
        `HEDERAS_${network.toUpperCase()}_DEFAULT_${particle.toUpperCase()}`
      ] || eParams[`HEDERAS_DEFAULT_${particle.toUpperCase()}`];

    return {
      contractCreationGas:
        rParams.session?.defaults?.contractCreationGas ??
        parseInt(
          resolveSessionDefaultValueFor("contract_creation_gas") ?? "150000"
        ),
      contractTransactionGas:
        rParams.session?.defaults?.contractTransactionGas ??
        parseInt(
          resolveSessionDefaultValueFor("contract_transaction_gas") ?? "169000"
        ),
      paymentForContractQuery:
        rParams.session?.defaults?.paymentForContractQuery ??
        parseInt(
          resolveSessionDefaultValueFor("payment_for_contract_query") ??
            "20000000"
        ),
    };
  }

  private getNetworkConfig(
    eParams: { [k: string]: string },
    rNetworkParams: RecursivePartial<NetworkRuntimeParameters>
  ): NetworkRuntimeParameters {
    const networkName: StratoNetworkName =
      rNetworkParams?.name ??
      (eParams.HEDERAS_NETWORK as StratoNetworkName) ??
      undefined;
    let nodes: HederaNodesAddressBook;
    let restMirrorUrl: string;

    if (
      networkName === undefined ||
      (networkName !== "customnet" &&
        networkName !== "mainnet" &&
        networkName !== "previewnet" &&
        networkName !== "testnet")
    ) {
      throw new EnvironmentInvalidError(
        "Please provide a valid network name to operate on. Currently accepted values are: customnet, mainnet, previewnet or testnet."
      );
    } else {
      if (networkName !== "customnet") {
        const networkClient = Client.forName(networkName);

        nodes = networkClient.network;
      } else {
        const customNodesList =
          rNetworkParams?.nodes ?? eParams.HEDERAS_NODES ?? "";

        if (typeof customNodesList === "string") {
          nodes = HederaNetwork.parseNetworkAddressBookFrom(customNodesList);
        } else {
          nodes = customNodesList;
        }
      }

      restMirrorUrl =
        rNetworkParams?.defaults?.restMirrorAddress ??
        eParams.HEDERAS_REST_MIRROR_URL ??
        DEFAULT_HEDERA_REST_MIRROR_URL;
    }

    return {
      defaults: {
        fileChunkSize: DEFAULT_FILE_CHUNK_SIZE,
        restMirrorAddress: restMirrorUrl,
      },
      name: networkName,
      nodes,
    };
  }
}
