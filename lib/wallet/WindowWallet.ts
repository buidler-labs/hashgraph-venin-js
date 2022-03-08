import { BasicStratoWallet } from "./BasicStratoWallet";
import { StratoContext } from "../StratoContext";
import { WalletControllerEvents } from "../core/wallet/WalletController";
import { WalletProvider } from "./WalletProvider";

export type WindowWalletColdStartData = { 
  propName: string
};

export class WindowWalletProvider extends WalletProvider<WindowWallet, WindowWalletColdStartData> {

  public constructor(
      ctx: StratoContext,
      private readonly controller?: WalletControllerEvents) {
    super(ctx);
  }

  protected override async _buildCold(data: WindowWalletColdStartData): Promise<WindowWallet> {
    return new WindowWallet(this.controller, data.propName);
  }
}

class WindowWallet extends BasicStratoWallet {
  public constructor(
      controller: WalletControllerEvents,
      windowPropName: string,
  ) {
    super(window[windowPropName]);

    // TODO: bind to controller events somehow?
  }
}
