import { 
  Query,
  Transaction,
  TransactionReceipt, 
  TransactionResponse,  
} from "@hashgraph/sdk";
import Executable from "@hashgraph/sdk/lib/Executable";
import { PublicAccountInfo } from "../ApiSession";
import { StratoClient } from "./StratoClient";
import { StratoClientState } from "./ClientProvider";
import { StratoLogger } from "../StratoLogger";

export abstract class StatedStratoClient<T extends StratoClientState> implements StratoClient {
  public constructor(
        public readonly name: string,
        protected readonly log: StratoLogger,
        protected state: T
  ) {
    log.debug(`Created a new stated strato-client of type '${name}'`);
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
