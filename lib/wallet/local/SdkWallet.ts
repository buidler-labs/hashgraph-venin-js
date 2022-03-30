import { 
  AccountId, 
  PrivateKey,
} from "@hashgraph/sdk";

import { BasicStratoWallet } from "../BasicStratoWallet";
import { HederaNetwork } from "../../HederaNetwork";
import { LegacyLocalWallet } from "./LegacyLocalWallet";
import { StratoContext } from "../../StratoContext";
import { WalletControllerEvents } from "../../core/wallet/WalletController";
import { WalletProvider } from "../WalletProvider";

export type HederaClientColdStartData = { 
  accountId: string, 
  privateKey: string, 
};

export type HederaClientAccount = {
  operatorId: string,
  operatorKey: string,
};

export class HederaLocalWalletProvider extends WalletProvider<SdkWallet, HederaClientColdStartData> {

  public constructor(
      ctx: StratoContext,
      private readonly controller?: WalletControllerEvents<HederaClientAccount>) {
    super(ctx);
  }

  public buildOperatedBy(operatorId: AccountId, operatorKey: PrivateKey): Promise<SdkWallet>;
  public buildOperatedBy(operatorId: string, operatorKey: string): Promise<SdkWallet>;
  public async buildOperatedBy(operatorId: AccountId|string, operatorKey: PrivateKey|string): Promise<SdkWallet> {
    this.sanityCheck();

    return new SdkWallet(
      this.controller, this.ctx.network,
      typeof operatorId === 'string' ? AccountId.fromString(operatorId) : operatorId,
      typeof operatorKey === 'string' ? PrivateKey.fromString(operatorKey) : operatorKey
    );
  }

  protected override async _buildCold(data: HederaClientColdStartData): Promise<SdkWallet> {
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
    // Start out with what's provided
    // TODO: once hashgraph/hedera-sdk-js#991 gets resolved, remove and replace LegacyLocalWallet with LocalWallet
    super(new LegacyLocalWallet(network, operatorId, operatorKey));

    // Bind to controller events
    controller.onAccountChanged(account => {
      this.operatorKey = PrivateKey.fromString(account.operatorKey);
      this.wallet = new LegacyLocalWallet(network,
        AccountId.fromString(account.operatorId), PrivateKey.fromString(account.operatorKey)
      );
      this.operatorId = this.wallet.getAccountId();
    });
    controller.onNetworkChanged(network => {
      this.network = network;
      this.wallet = new LegacyLocalWallet(network, this.wallet.getAccountId(), operatorKey);
    });
  }
}
