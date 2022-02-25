import { EventEmitter } from "events";

import { AccountId } from "@hashgraph/sdk";

import { ClientController } from "./ClientController";
import { HederaNetwork } from "../../HederaNetwork";
import { StratoContext } from "../../StratoContext";
import { Subscription } from "../../core/Subscription";

export abstract class BasicClientController<T> implements ClientController<T> {
  protected static NETWORK_CHANGE_REQUESTED = "NETWORK_CHANGE_REQUESTED";
  protected static ACCOUNT_CHANGE_REQUESTED = "ACCOUNT_CHANGE_REQUESTED";

  private readonly pubSub: EventEmitter;

  public constructor (
        protected readonly ctx: StratoContext
  ) {
    this.pubSub = new EventEmitter();
  }

  public changeAccount(account: string | AccountId, ...args: any[]): void {
    const accountPayload = this.getAccountPayload(account, ...args);

    this.pubSub.emit(BasicClientController.ACCOUNT_CHANGE_REQUESTED, accountPayload);
  }

  public changeNetwork(network: HederaNetwork) {
    this.pubSub.emit(BasicClientController.NETWORK_CHANGE_REQUESTED, network);
  }

  public onAccountChanged(clb: (account: T) => void): Subscription<T> {
    return new Subscription(this.pubSub, BasicClientController.ACCOUNT_CHANGE_REQUESTED, clb);
  }

  public onNetworkChanged(clb: (network: HederaNetwork) => void): Subscription<HederaNetwork> {
    return new Subscription(this.pubSub, BasicClientController.NETWORK_CHANGE_REQUESTED, clb);
  }

    protected abstract getAccountPayload(account: string | AccountId, ...args: any[]): T;
}
