import { Client, TransactionReceipt, TransactionResponse } from "@hashgraph/sdk";

export class TransactionReceiptQuery {
    public static for(txResponse: TransactionResponse): TransactionReceiptQuery {
        return new TransactionReceiptQuery(txResponse);
    }
    
    private constructor(private readonly txResponse: TransactionResponse) {}

    public async execute(client: Client): Promise<TransactionReceipt> {
        return this.txResponse.getReceipt(client);
    }
}