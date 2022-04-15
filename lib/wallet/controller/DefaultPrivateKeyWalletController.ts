import { AccountId } from "@hashgraph/sdk";
import { StratoContext } from "../../StratoContext";

import { HederaClientAccount } from "../local/SdkWallet";
import { HederaWalletController } from "./HederaWalletController";

export class DefaultPrivateKeyWalletController extends HederaWalletController {
  public constructor(ctx: StratoContext) {
    super(ctx);
  }

  protected getAccountPayload(
    account: string | AccountId
  ): HederaClientAccount {
    return super.getAccountPayload(
      account,
      this.ctx.params.wallet.controller.default.operatorKey
    );
  }
}
