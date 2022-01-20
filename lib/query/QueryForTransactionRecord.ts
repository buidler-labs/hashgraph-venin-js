import { Client, TransactionRecord, TransactionResponse } from "@hashgraph/sdk";
import { QueryForSomething } from "./QueryForSomething";

export class QueryForTransactionRecord extends QueryForSomething<TransactionRecord> {
    public static of(txResponse: TransactionResponse): QueryForTransactionRecord {
        return new QueryForTransactionRecord(txResponse);
    }

    private constructor(private readonly txResponse: TransactionResponse) { 
        super(); 
    }

    public override async queryOn(client: Client): Promise<TransactionRecord> {
        return this.txResponse.getRecord(client);
    }
}