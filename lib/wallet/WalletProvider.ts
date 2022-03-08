/* eslint-disable @typescript-eslint/no-unused-vars */

import { HederaNetwork } from "../HederaNetwork";
import { StratoContext } from "../StratoContext";
import { StratoWallet } from "../core/wallet/StratoWallet";
import { WalletControllerEvents } from "../core/wallet/WalletController";

export abstract class WalletProvider<T extends StratoWallet = any, S = any> {
  protected network: HederaNetwork

  protected constructor(
    protected readonly ctx: StratoContext,
  ) {
    this.setNetwork(ctx.network);    
  }

  public setNetwork(network: HederaNetwork): this {
    this.network = network;
    return this;
  }

  public buildFor(data: S): Promise<T> {
    this.sanityCheck();

    return this._buildCold(data);
  }

  protected sanityCheck() {
    if (!this.network) {
      throw new Error("Please first provide a HederaNetwork to the WalletProvider in order to build a new Wallet.");
    }
  }

  protected abstract _buildCold(data: S): Promise<T>;
}

export class NotSupportedWalletProvider extends WalletProvider {
  public constructor(ctx: StratoContext, controller?: WalletControllerEvents) {
    super(ctx);
    throw new Error("You're trying to create a wallet-provider for a not-supported wallet-type. Something went wrong since you most likely would not want to ever do that.");
  }

  protected _buildCold(data: any): Promise<any> {
    // No-op
    return Promise.resolve();
  }
}
