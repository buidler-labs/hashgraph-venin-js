import { Client, TransactionReceipt, TransactionResponse } from "@hashgraph/sdk";
import { QueryForSomething } from "./QueryForSomething";

export class QueryForTransactionReceipt extends QueryForSomething<TransactionReceipt> {
    public static of(txResponse: TransactionResponse): QueryForTransactionReceipt {
        return new QueryForTransactionReceipt(txResponse);
    }
    
    private constructor(private readonly txResponse: TransactionResponse) {
        super();
    }

    public override async queryOn(client: Client): Promise<TransactionReceipt> {
        return this.txResponse.getReceipt(client);
    }
}