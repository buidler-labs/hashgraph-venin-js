import { TransactionResponse, TransactionReceipt, Transaction, Query } from "@hashgraph/sdk";
import Executable from "@hashgraph/sdk/lib/Executable";
import { PublicAccountInfo } from "../ApiSession";
import { StratoLogger } from "../StratoLogger";
import { StratoClientState } from "./ClientProvider";
import { StratoClient } from "./StratoClient";

export abstract class StatedStratoClient<T extends StratoClientState> implements StratoClient {
    public constructor(
        public readonly name: string,
        protected readonly log: StratoLogger,
        protected readonly state: T
    ) {
        log.debug(`Created a new stated strato-client of type '${name}' serializable to: ${this.serialize()}`);
    }

    public abstract get account(): PublicAccountInfo;
    public abstract execute<T extends Transaction|Query<Q>, Q>(transaction: T): Promise<
        T extends Query<infer Q> ? Q : 
        T extends Executable<unknown, unknown, infer OUT> ? OUT : 
        never
    > ;
    public abstract getReceipt(response: TransactionResponse): Promise<TransactionReceipt>;

    public serialize(): string {
        return Buffer.from(this.state.serialize()).toString('base64');
    }
}