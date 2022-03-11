import { 
  HashConnect,
  MessageTypes,
} from 'hashconnect';
import { AccountId } from "@hashgraph/sdk";

export class HashConnectSender {
  public constructor(
    private readonly hashConnect: HashConnect,
    private readonly topicId: string
  ) {}

  public send(accountId: AccountId, message: Uint8Array): Promise<MessageTypes.TransactionResponse> {
    const transaction = {
      byteArray: message,
      metadata: {
        accountToSign: accountId.toString(),
        returnTransaction: true,
      },
      topic: this.topicId,
    };
    
    return new Promise<MessageTypes.TransactionResponse>(accept => {
      this.hashConnect.transactionResponseEvent.once((response) => {
        accept(response);
      });
      this.hashConnect.sendTransaction(this.topicId, transaction);
    });
  }
}
