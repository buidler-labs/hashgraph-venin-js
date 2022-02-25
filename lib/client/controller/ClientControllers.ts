import { ClientController } from "./ClientController";
import { DefaultPrivateKeyClientController } from "./DefaultPrivateKeyClientController";
import { HederaClientController } from "./HederaClientController";
import { ImpotentClientController } from "./ImpotentClientController";
import { NamedValue } from "../../core/UsefulTypes";
import { StratoContext } from "../../StratoContext";

export class ClientControllers {
  private readonly impotentClientController: ImpotentClientController;
  private readonly knownControllers: NamedValue<ClientController>[];

  public constructor(ctx: StratoContext) {
    this.impotentClientController = new ImpotentClientController();

    this.knownControllers = [
      { name: "Hedera", value: new HederaClientController(ctx) },
      { name: "DefaultPrivateKey", value: new DefaultPrivateKeyClientController(ctx) },
    ];
  }

  public get Unknown(): ClientController {
    return this.impotentClientController;
  }

  public getBy({ name }: { name: string }): ClientController {
    const candidateClientControllers = this.knownControllers.filter(controller => controller.name === name);

    return candidateClientControllers.length === 0 ? this.Unknown : candidateClientControllers[0].value;
  }
}
