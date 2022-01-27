import { HederaNetwork } from "../HederaNetwork";
import { StratoLogger } from "../StratoLogger";
import { Restorer, Saver } from "../Persistance";
import { StratoClient } from "./StratoClient";

export interface StratoClientState extends Saver<string> {
    // no-op
}

export abstract class ClientProvider<T extends StratoClient = any, R extends StratoClientState = any, S = any> {
    protected network: HederaNetwork

    protected constructor(
        protected readonly log: StratoLogger,
        private readonly restorer: Restorer<string, R>,
        network?: HederaNetwork
    ) {
        this.setNetwork(network);    
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
