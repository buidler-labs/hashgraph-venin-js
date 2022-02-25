import { AccountId } from "@hashgraph/sdk";
import { HederaNetwork } from "../../HederaNetwork";
import { Subscription } from "../../core/Subscription";

export interface ClientController<A = any> extends ClientControllerEvents<A> {
    changeAccount(account: string|AccountId, ...args: any[]): void;
    changeNetwork(network: HederaNetwork): void;
}

export interface ClientControllerEvents<A = any> {
    onNetworkChanged(clb: (network: HederaNetwork) => void): Subscription<HederaNetwork>;
    onAccountChanged(clb: (account: A) => void): Subscription<A>;
}
