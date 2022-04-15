import { DefaultPrivateKeyWalletController } from "./DefaultPrivateKeyWalletController";
import { HederaWalletController } from "./HederaWalletController";
import { ImpotentWalletController } from "./ImpotentWalletController";
import { NamedValue } from "../../core/UsefulTypes";
import { StratoContext } from "../../StratoContext";
import { WalletController } from "../../core/wallet/WalletController";

export class WalletControllers {
  private readonly impotentController: ImpotentWalletController;
  private readonly knownControllers: NamedValue<WalletController>[];

  public constructor(ctx: StratoContext) {
    this.impotentController = new ImpotentWalletController();

    this.knownControllers = [
      { name: "Hedera", value: new HederaWalletController(ctx) },
      {
        name: "DefaultPrivateKey",
        value: new DefaultPrivateKeyWalletController(ctx),
      },
    ];
  }

  public get Unknown(): WalletController {
    return this.impotentController;
  }

  public getBy({ name }: { name: string }): WalletController {
    const candidateWalletControllers = this.knownControllers.filter(
      (controller) => controller.name === name
    );

    return candidateWalletControllers.length === 0
      ? this.Unknown
      : candidateWalletControllers[0].value;
  }
}
