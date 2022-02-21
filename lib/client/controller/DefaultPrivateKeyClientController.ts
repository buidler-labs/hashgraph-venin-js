import { AccountId } from "@hashgraph/sdk";
import { StratoContext } from "../../StratoContext";

import { HederaClientAccount } from "../HederaClient";
import { HederaClientController } from './HederaClientController';

export class DefaultPrivateKeyClientController extends HederaClientController {

    public constructor (ctx: StratoContext) {
        super(ctx);
    }

    protected getAccountPayload(account: string | AccountId): HederaClientAccount {
        return super.getAccountPayload(account, this.ctx.params.client.controller.default.operatorKey);
    }
}
