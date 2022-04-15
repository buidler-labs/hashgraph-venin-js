import { EventEmitter } from "events";

import { AccountId } from "@hashgraph/sdk";

import { HederaNetwork } from "../../HederaNetwork";
import { StratoContext } from "../../StratoContext";
import { Subscription } from "../../core/Subscription";
import { WalletController } from "../../core/wallet/WalletController";

export abstract class BasicWalletController<T> implements WalletController<T> {
  protected static NETWORK_CHANGE_REQUESTED = "NETWORK_CHANGE_REQUESTED";
  protected static ACCOUNT_CHANGE_REQUESTED = "ACCOUNT_CHANGE_REQUESTED";

  private readonly pubSub: EventEmitter;

  public constructor(protected readonly ctx: StratoContext) {
    this.pubSub = new EventEmitter();
  }

  public changeAccount(account: string | AccountId, ...args: any[]): void {
    const accountPayload = this.getAccountPayload(account, ...args);

    this.pubSub.emit(
      BasicWalletController.ACCOUNT_CHANGE_REQUESTED,
      accountPayload
    );
  }

  public changeNetwork(network: HederaNetwork) {
    this.pubSub.emit(BasicWalletController.NETWORK_CHANGE_REQUESTED, network);
  }

  public onAccountChanged(clb: (account: T) => void): Subscription<T> {
    return new Subscription(
      this.pubSub,
      BasicWalletController.ACCOUNT_CHANGE_REQUESTED,
      clb
    );
  }

  public onNetworkChanged(
    clb: (network: HederaNetwork) => void
  ): Subscription<HederaNetwork> {
    return new Subscription(
      this.pubSub,
      BasicWalletController.NETWORK_CHANGE_REQUESTED,
      clb
    );
  }

  protected abstract getAccountPayload(
    account: string | AccountId,
    ...args: any[]
  ): T;
}
