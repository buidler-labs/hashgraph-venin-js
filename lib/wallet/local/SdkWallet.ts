import { AccountId, PrivateKey, Wallet } from "@hashgraph/sdk";

import { BasicStratoWallet } from "../BasicStratoWallet";
import { HederaNetwork } from "../../hedera/HederaNetwork";
import LocalProvider from "./LocalProvider";
import { StratoContext } from "../../StratoContext";
import { WalletControllerEvents } from "../../core/wallet/WalletController";
import { WalletProvider } from "../WalletProvider";

export type HederaClientColdStartData = {
  accountId: string;
  privateKey: string;
};

export type HederaClientAccount = {
  operatorId: string;
  operatorKey: string;
};

export class HederaLocalWalletProvider extends WalletProvider<
  SdkWallet,
  HederaClientColdStartData
> {
  public constructor(
    ctx: StratoContext,
    private readonly controller?: WalletControllerEvents<HederaClientAccount>
  ) {
    super(ctx);
  }

  public buildOperatedBy(
    operatorId: AccountId,
    operatorKey: PrivateKey
  ): Promise<SdkWallet>;
  public buildOperatedBy(
    operatorId: string,
    operatorKey: string
  ): Promise<SdkWallet>;
  public async buildOperatedBy(
    operatorId: AccountId | string,
    operatorKey: PrivateKey | string
  ): Promise<SdkWallet> {
    this.sanityCheck();

    return new SdkWallet(
      this.controller,
      this.ctx.network,
      typeof operatorId === "string"
        ? AccountId.fromString(operatorId)
        : operatorId,
      typeof operatorKey === "string"
        ? PrivateKey.fromString(operatorKey)
        : operatorKey
    );
  }

  protected override async _buildCold(
    data: HederaClientColdStartData
  ): Promise<SdkWallet> {
    return this.buildOperatedBy(data.accountId, data.privateKey);
  }
}

class SdkWallet extends BasicStratoWallet {
  public constructor(
    controller: WalletControllerEvents<HederaClientAccount>,
    private network: HederaNetwork,
    private operatorId: AccountId,
    private operatorKey: PrivateKey
  ) {
    super(new Wallet(operatorId, operatorKey, new LocalProvider(network)));

    // Bind to controller events
    controller.onAccountChanged((account) => {
      this.operatorKey = PrivateKey.fromString(account.operatorKey);
      this.wallet = new Wallet(
        AccountId.fromString(account.operatorId),
        PrivateKey.fromString(account.operatorKey),
        new LocalProvider(network)
      );
      this.operatorId = this.wallet.getAccountId();
    });
    controller.onNetworkChanged((network) => {
      this.network = network;
      this.wallet = new Wallet(
        this.wallet.getAccountId(),
        operatorKey,
        new LocalProvider(network)
      );
    });
  }
}
