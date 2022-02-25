/* eslint-disable @typescript-eslint/no-unused-vars */

import { AccountId } from "@hashgraph/sdk";

import { NeverFiringSubscription, Subscription } from "../../core/Subscription";
import { ClientController } from "./ClientController";
import { HederaNetwork } from "../../HederaNetwork";

export class ImpotentClientController implements ClientController {
  public changeAccount(_account: string | AccountId, ..._args:any[]): void {
    throw new Error("This ClientController cannot change the account of the underlying client.");
  }
  public changeNetwork(_network: HederaNetwork): void {
    throw new Error("This ClientController cannot change the network of the underlying client.");
  }

  public onAccountChanged(clb: (account: any) => void): Subscription<any, any> {
    return NeverFiringSubscription;
  }
  public onNetworkChanged(clb: (network: HederaNetwork) => void): Subscription<HederaNetwork, any> {
    return NeverFiringSubscription;
  }
}
