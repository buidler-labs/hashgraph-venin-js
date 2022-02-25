import { 
  AccountId, 
  Client, 
  PrivateKey, 
  Query, 
  Transaction, 
  TransactionReceipt, 
  TransactionResponse, 
} from "@hashgraph/sdk";
import Executable from "@hashgraph/sdk/lib/Executable";

import { ClientProvider, StratoClientState } from "./ClientProvider";
import { ClientControllerEvents } from "./controller/ClientController";
import { PublicAccountInfo } from "../ApiSession";
import { Restorer } from "../core/Persistance";
import { StatedStratoClient } from "./StatedStratoClient";
import { StratoContext } from "../StratoContext";

export type HederaClientColdStartData = { 
    accountId: string, privateKey: string 
};

export type HederaClientAccount = {
    operatorId: string,
    operatorKey: string
};

export class HederaClientProvider extends ClientProvider<HederaClient, HederaClientState, HederaClientColdStartData> {

  public constructor(
      ctx: StratoContext,
        private readonly controller?: ClientControllerEvents<HederaClientAccount>) {
    super(ctx, new HederaClientStateDeserializer());
  }

  public buildOperatedBy(operatorId: AccountId, operatorKey: PrivateKey): Promise<HederaClient>;
  public buildOperatedBy(operatorId: string, operatorKey: string): Promise<HederaClient>;
  public buildOperatedBy(operatorId: AccountId|string, operatorKey: PrivateKey|string): Promise<HederaClient> {
    const state = new HederaClientState(
      typeof operatorId === 'string' ? operatorId : operatorId.toString(),
      operatorKey.toString()
    );
    return this.buildRestoring(state);
  }

  protected override async _buildCold(data: HederaClientColdStartData): Promise<HederaClient> {
    return this.buildOperatedBy(data.accountId, data.privateKey);
  }

  protected override async _buildRestoring(state: HederaClientState): Promise<HederaClient> {
    const client = this.ctx.network.getClient();

    return new HederaClient(this.ctx, this.controller, client, state);
  }
}

class HederaClient extends StatedStratoClient<HederaClientState> {
  public account: PublicAccountInfo;

  public constructor(
      ctx: StratoContext,
      controller: ClientControllerEvents<HederaClientAccount>,
        private client: Client, 
        state: HederaClientState
  ) {
    super("Hedera", ctx.log, state);

    // Start out with what's provided
    this.changeOperator(state.operatorId, state.operatorKey);

    // Bind to controller events
    controller.onAccountChanged(account => {
      this.state = new HederaClientState(account.operatorId, account.operatorKey);
      this.changeOperator(this.state.operatorId, this.state.operatorKey);
    });
    controller.onNetworkChanged(network => {
      this.client = network.getClient();
      this.client.setOperator(this.state.operatorId, this.state.operatorKey);
    });
  }

  public async execute<T extends Transaction|Query<Q>, Q>(transaction: T): Promise<
        T extends Query<infer Q> ? Q : 
        T extends Executable<unknown, unknown, infer OUT> ? OUT : 
        never
    > {
    const transactionResponse = await transaction.execute(this.client);

    return transactionResponse as (
            T extends Query<infer Q> ? Q : 
            T extends Executable<unknown, unknown, infer OUT> ? OUT : 
            never
        );
  }

  public getReceipt(response: TransactionResponse): Promise<TransactionReceipt> {
    return response.getReceipt(this.client);
  }

  private changeOperator(operatorId: string, operatorKey: string) {
    this.client.setOperator(operatorId, operatorKey);
    this.account = {
      id: this.client.operatorAccountId,
      publicKey: this.client.operatorPublicKey,
    };
  }
}

class HederaClientState implements StratoClientState {
  public static FIELD_SERIALIZATION_SEPARATOR = "|";

  public constructor(
        public readonly operatorId: string, 
        public readonly operatorKey: string
  ) { }

  public async save(): Promise<string> {
    return `${this.operatorId}${HederaClientState.FIELD_SERIALIZATION_SEPARATOR}${this.operatorKey}`;
  }
}

class HederaClientStateDeserializer implements Restorer<string, HederaClientState> {
  public async restore(state: string): Promise<HederaClientState> {
    const [ operatorId, operatorKey ] = state.split(HederaClientState.FIELD_SERIALIZATION_SEPARATOR);

    return new HederaClientState(operatorId, operatorKey);
  }
}
