import { HederaNetwork } from "../HederaNetwork";
import { StratoLogger } from "../StratoLogger";
import { ClientProvider } from "./ClientProvider";

export class NotSupportedClientProvider extends ClientProvider {
    public constructor(log: StratoLogger, network?: HederaNetwork) {
        super(log, null, network);
        throw new Error("You're trying to create a client-provider for a not-supported client-type. Something went wrong since you most likely would not want to ever do that.");
    }

    protected _buildCold(data: any): Promise<any> {
        // No-op
        return null;
    }

    protected _buildRestoring(state: any): Promise<any> {
        // No-op
        return null;
    }
}
