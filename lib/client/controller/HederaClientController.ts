import { PrivateKey } from "@hashgraph/sdk";
import { AccountId } from "@hashgraph/sdk";
import { StratoContext } from "../../StratoContext";
import { HederaClientAccount } from "../HederaClient";

import { BasicClientController } from "./BasicClientController";

export class HederaClientController extends BasicClientController<HederaClientAccount> {

    public constructor (ctx: StratoContext) {
        super(ctx);
    }

    protected override getAccountPayload(account: string | AccountId, ...args: any[]): HederaClientAccount {
        if (args.length === 0) {
            throw new Error("The private-key must also be provided in order to switch the account.");
        }
        try {
            const privateKey = args[0] instanceof PrivateKey ? args[0]: PrivateKey.fromString(args[0]);

            return {
                operatorId: account instanceof AccountId ? account.toString() : account,
                operatorKey: privateKey.toStringDer()
            };
        } catch (e) {
            throw new Error(`The provided key is not in a valid format. Cannot change account.`);
        }
    }
}
