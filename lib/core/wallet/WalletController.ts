import { AccountId } from "@hashgraph/sdk";
import { HederaNetwork } from "../../HederaNetwork";
import { Subscription } from "../Subscription";

export interface WalletController<A = any> extends WalletControllerEvents<A> {
  changeAccount(account: string|AccountId, ...args: any[]): void;
  changeNetwork(network: HederaNetwork): void;
}

export interface WalletControllerEvents<A = any> {
  onNetworkChanged(clb: (network: HederaNetwork) => void): Subscription<HederaNetwork>;
  onAccountChanged(clb: (account: A) => void): Subscription<A>;
}
