import { AccountId, PrivateKey } from "@hashgraph/sdk";

import { NotSupportedWalletProvider, WalletProvider } from "./WalletProvider";
import { StratoContext, StratoParameters } from "../StratoContext";
import { WalletController, WalletControllerEvents } from "../core/wallet/WalletController";
import { CredentialsInvalidError } from "../errors/CredentialsInvalidError";
import { HederaLocalWalletProvider } from "./local/SdkWallet";
import { HederaWalletController } from "./controller/HederaWalletController";
import { ImpotentWalletController } from "./controller/ImpotentWalletController";
import { WindowWalletProvider } from './WindowWallet';

const WALLET_TYPE_CONSTRUCTOR_GUARD = {};

export class WalletType {
  public constructor(
      constructorGuard: any,
      public readonly name?: string,
      public readonly defaultController: new (ctx: StratoContext) => WalletController = ImpotentWalletController,
      public readonly providerHaving: new (ctx: StratoContext, controller: WalletControllerEvents) => WalletProvider = NotSupportedWalletProvider,
      public readonly computeColdStartOptionsFrom?: (params: StratoParameters) => any
  ) {
    if (constructorGuard !== WALLET_TYPE_CONSTRUCTOR_GUARD) {
      throw new Error("Wallet types cannot be defined from outside this module!");
    }
  }

  public equals(other: any): boolean {
    return other instanceof WalletType && this.name === other.name;
  }
}

export class WalletTypes {
  private readonly unknownWalletType = new WalletType(WALLET_TYPE_CONSTRUCTOR_GUARD, "Unknown");
  private readonly knownWalletTypes: WalletType[];

  public constructor() {
    this.knownWalletTypes = [
      new WalletType(WALLET_TYPE_CONSTRUCTOR_GUARD, 
        "Sdk",
        HederaWalletController,                 // Default WalletController
        HederaLocalWalletProvider,              // Associated WalletProvider
        params => {                             // ColdStart options parser for pre-configured runtime parameters
          try {
            return {
              accountId: AccountId.fromString(params.wallet.sdk.operatorId),
              privateKey: PrivateKey.fromString(params.wallet.sdk.operatorKey),
            }
          } catch(e) {
            throw new CredentialsInvalidError(e.message);
          }
        }
      ),
      new WalletType(WALLET_TYPE_CONSTRUCTOR_GUARD,
        "Window",
        ImpotentWalletController,               // No WalletController
        WindowWalletProvider,                   // Associated WalletProvider
        params => {                             // ColdStart options parser for pre-configured runtime parameters
          return {
            propName: params.wallet.window.propName,
          }
        }
      ),
    ];
  }

  public isKnown(walletType: WalletType) {
    return !this.Unknown.equals(walletType);
  }

  public get Unknown() {
    return this.unknownWalletType;
  }

  public getBy({ name }: { name: string }): WalletType {
    const candidateWalletTypes = this.knownWalletTypes.filter(type => type.name === name);
    
    return candidateWalletTypes.length === 0 ? this.Unknown : candidateWalletTypes[0];
  }
}
