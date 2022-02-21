import { AccountId } from "@hashgraph/sdk";
import { Subscription } from "../../core/Subscription";
import { HederaNetwork } from "../../HederaNetwork";

export interface ClientController<A = any> extends ClientControllerEvents<A> {
    changeAccount(account: string|AccountId, ...args: any[]): void;
    changeNetwork(network: HederaNetwork): void;
}

export interface ClientControllerEvents<A = any> {
    onNetworkChanged(clb: (network: HederaNetwork) => void): Subscription<HederaNetwork>;
    onAccountChanged(clb: (account: A) => void): Subscription<A>;
}
