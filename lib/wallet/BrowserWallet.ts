import { BasicStratoWallet } from "./BasicStratoWallet";
import { StratoContext } from "../StratoContext";
import { WalletControllerEvents } from "../core/wallet/WalletController";
import { WalletProvider } from "./WalletProvider";

export type BrowserWalletColdStartData = {
  propName: string;
};

export class BrowserWalletProvider extends WalletProvider<
  BrowserWallet,
  BrowserWalletColdStartData
> {
  public constructor(
    ctx: StratoContext,
    private readonly controller?: WalletControllerEvents
  ) {
    super(ctx);
  }

  protected override async _buildCold(
    data: BrowserWalletColdStartData
  ): Promise<BrowserWallet> {
    return new BrowserWallet(this.controller, data.propName);
  }
}

class BrowserWallet extends BasicStratoWallet {
  public constructor(
    controller: WalletControllerEvents,
    windowPropName: string
  ) {
    super(window[windowPropName]);

    // TODO: bind to controller events somehow?
  }
}
