import * as dotenv from "dotenv";

import { AVAILABLE_NETWORK_NAMES, NetworkDefaults } from "./HederaNetwork";
import { WalletType, WalletTypes } from "./wallet/WalletType";
import { HederaNetwork } from "./HederaNetwork";
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
  name: string;
  nodes: string;
};
export type StratoParameters = {
  wallet: WalletRuntimeParameters;
  logger: LoggerRuntimeParameters;
  network: NetworkRuntimeParameters;
  session: SessionRuntimeParameters;
};

export type StratoContextSource = {
  params?: RecursivePartial<StratoParameters>;
  /**
   * The file path where the `dotenv`-like file resides which is sourced for library params. If not provided, it usually is expected to default to `.env`.
   */
  path?: string;
};

// Note: This follows the @hashgraph/sdk/lib/transaction/Transaction > CHUNK_SIZE value
const DEFAULT_FILE_CHUNK_SIZE = 2048;

export const DefinedNetworkDefaults: { [k: string]: NetworkDefaults } = {
  [AVAILABLE_NETWORK_NAMES.CustomNet]: {
    fileChunkSize: DEFAULT_FILE_CHUNK_SIZE,
  },
  [AVAILABLE_NETWORK_NAMES.MainNet]: {
    fileChunkSize: DEFAULT_FILE_CHUNK_SIZE,
  },
  [AVAILABLE_NETWORK_NAMES.TestNet]: {
    fileChunkSize: DEFAULT_FILE_CHUNK_SIZE,
  },
  [AVAILABLE_NETWORK_NAMES.PreviewNet]: {
    fileChunkSize: DEFAULT_FILE_CHUNK_SIZE,
  },
};

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
    const networkName =
      rParams.network?.name ?? eParams.HEDERAS_NETWORK ?? "unspecified";

    this.walletTypes = new WalletTypes();
    this.params = {
      logger: {
        enabled:
          (rParams.logger?.enabled ??
            eParams.HEDERAS_LOGGER_ENABLED ??
            "false") === "true",
        level: rParams.logger?.level ?? eParams.HEDERAS_LOGGER_LEVEL ?? "info",
      },
      network: {
        defaults:
          DefinedNetworkDefaults[
            rParams.network?.name ?? eParams.HEDERAS_NETWORK ?? "unspecified"
          ],
        name: networkName,
        nodes: rParams.network?.nodes ?? eParams.HEDERAS_NODES ?? "",
      },
      session: {
        defaults: this.parseSessionDefaultsFrom(networkName, rParams, eParams),
      },
      wallet: this.computeWalletSpecsFrom(rParams, eParams),
    };
    this.walletControllers = new WalletControllers(this);
    this.log = new StratoLogger(this.params.logger);
    this.network = HederaNetwork.newFrom(this.params.network);
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
        "Only 'Sdk' and 'Browser' wallet types are currently supported. If not specified, it defaults to 'Sdk'."
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
    networkName: string,
    rParams: RecursivePartial<StratoParameters>,
    eParams: { [k: string]: string }
  ): SessionDefaults {
    const resolveSessionDefaultValueFor = (particle: string) =>
      eParams[
        `HEDERAS_${networkName.toUpperCase()}_DEFAULT_${particle.toUpperCase()}`
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
      emitConstructorLogs:
        rParams.session?.defaults?.emitConstructorLogs ??
        (resolveSessionDefaultValueFor("emit_constructor_logs") ?? "true") ===
          "true",
      emitLiveContractReceipts:
        rParams.session?.defaults?.emitLiveContractReceipts ??
        (resolveSessionDefaultValueFor("emit_live_contracts_receipts") ??
          "false") === "true",
      onlyReceiptsFromContractRequests:
        rParams.session?.defaults?.onlyReceiptsFromContractRequests ??
        (resolveSessionDefaultValueFor(
          "contract_requests_return_only_receipts"
        ) ?? "true") === "true",
      paymentForContractQuery:
        rParams.session?.defaults?.paymentForContractQuery ??
        parseInt(
          resolveSessionDefaultValueFor("payment_for_contract_query") ??
            "20000000"
        ),
    };
  }
}
