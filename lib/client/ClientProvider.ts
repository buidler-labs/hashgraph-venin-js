import { HederaNetwork } from "../HederaNetwork";
import { Restorer, Saver } from "../core/Persistance";
import { StratoClient } from "./StratoClient";
import { ClientControllerEvents } from "./controller/ClientController";
import { StratoContext } from "../StratoContext";

export type StratoClientState = Saver<string>;

export abstract class ClientProvider<T extends StratoClient = any, R extends StratoClientState = any, S = any> {
    protected network: HederaNetwork

    protected constructor(
        protected readonly ctx: StratoContext,
        private readonly restorer: Restorer<string, R>,
    ) {
        this.setNetwork(ctx.network);    
    }

    public setNetwork(network: HederaNetwork): this {
        this.network = network;
        return this;
    }

    public buildColdFor(data: S): Promise<T> {
        this.sanityCheck();

        return this._buildCold(data);
    }
    public async buildRestoring(state: string | R): Promise<T> {
        this.sanityCheck();
        
        let stateInstance: R;

        if (typeof state === 'string') {
            const decodedState = Buffer.from(state, 'base64').toString('ascii');
            
            stateInstance = await this.restorer.restore(decodedState);
        } else {
            stateInstance = state;
        }
        return this._buildRestoring(stateInstance);
    }

    private sanityCheck() {
        if (!this.network) {
            throw new Error("Please first provide a HederaNetwork to the ClientProvider in order to build a new Client.");
        }
    }

    protected abstract _buildRestoring(state: R): Promise<T>;
    protected abstract _buildCold(data: S): Promise<T>;
}

export class NotSupportedClientProvider extends ClientProvider {
    public constructor(ctx: StratoContext, controller?: ClientControllerEvents) {
        super(ctx, null);
        throw new Error("You're trying to create a client-provider for a not-supported client-type. Something went wrong since you most likely would not want to ever do that.");
    }

    protected _buildCold(data: any): Promise<any> {
        // No-op
        return Promise.resolve();
    }

    protected _buildRestoring(state: any): Promise<any> {
        // No-op
        return Promise.resolve();
    }
}