import { TransactionResponse, TransactionReceipt, Transaction, Query } from "@hashgraph/sdk";
import Executable from "@hashgraph/sdk/lib/Executable";
import { PublicAccountInfo } from "../ApiSession";
import { StratoLogger } from "../StratoLogger";
import { StratoClientState } from "./ClientProvider";
import { ClientType } from "./ClientType";
import { StratoClient } from "./StratoClient";

export abstract class StatedStratoClient<T extends StratoClientState> implements StratoClient {
    public constructor(
        public readonly type: ClientType,
        protected readonly log: StratoLogger,
        protected readonly state: T
    ) {
        log.debug(`Created a new stated strato-client of type '${type}' serializable to: ${this.save()}`);
    }

    public async save(): Promise<string> {
        const simpleState = await this.state.save();
        const encodedState = Buffer.from(simpleState).toString('base64');

        return encodedState;
    }

    public abstract get account(): PublicAccountInfo;
    public abstract execute<T extends Transaction|Query<Q>, Q>(transaction: T): Promise<
        T extends Query<infer Q> ? Q : 
        T extends Executable<unknown, unknown, infer OUT> ? OUT : 
        never
    > ;
    public abstract getReceipt(response: TransactionResponse): Promise<TransactionReceipt>;
}