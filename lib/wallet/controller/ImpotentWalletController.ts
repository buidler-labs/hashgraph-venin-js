/* eslint-disable @typescript-eslint/no-unused-vars */

import { AccountId } from "@hashgraph/sdk";

import { NeverFiringSubscription, Subscription } from "../../core/Subscription";
import { HederaNetwork } from "../../HederaNetwork";
import { WalletController } from "../../core/wallet/WalletController";

export class ImpotentWalletController implements WalletController {
  public changeAccount(_account: string | AccountId, ..._args:any[]): void {
    throw new Error("This WalletController cannot change the account of the underlying wallet.");
  }
  public changeNetwork(_network: HederaNetwork): void {
    throw new Error("This WalletController cannot change the network of the underlying wallet.");
  }

  public onAccountChanged(clb: (account: any) => void): Subscription<any, any> {
    return NeverFiringSubscription;
  }
  public onNetworkChanged(clb: (network: HederaNetwork) => void): Subscription<HederaNetwork, any> {
    return NeverFiringSubscription;
  }
}
