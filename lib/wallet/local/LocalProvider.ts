import {
  AccountBalanceQuery,
  AccountId,
  AccountInfoQuery,
  AccountRecordsQuery,
  Client,
  Provider,
  TransactionId,
  TransactionReceiptQuery,
  TransactionResponse,
} from "@hashgraph/sdk";
import Executable from "@hashgraph/sdk/lib/Executable";
import { HederaNetwork } from "../../hedera/HederaNetwork";

export default class LocalProvider implements Provider {
  public readonly client: Client;

  constructor(network: HederaNetwork) {
    this.client = network.getClient();
  }

  getLedgerId() {
    return this.client.ledgerId;
  }

  getNetwork() {
    return this.client.network;
  }

  getMirrorNetwork() {
    return this.client.mirrorNetwork;
  }

  getAccountBalance(accountId: AccountId | string) {
    return new AccountBalanceQuery()
      .setAccountId(accountId)
      .execute(this.client);
  }

  getAccountInfo(accountId: AccountId | string) {
    return new AccountInfoQuery().setAccountId(accountId).execute(this.client);
  }

  getAccountRecords(accountId: AccountId | string) {
    return new AccountRecordsQuery()
      .setAccountId(accountId)
      .execute(this.client);
  }

  getTransactionReceipt(transactionId: TransactionId | string) {
    return new TransactionReceiptQuery()
      .setTransactionId(transactionId)
      .execute(this.client);
  }

  waitForReceipt(response: TransactionResponse) {
    return new TransactionReceiptQuery()
      .setNodeAccountIds([response.nodeId])
      .setTransactionId(response.transactionId)
      .execute(this.client);
  }

  call<RequestT, ResponseT, OutputT>(
    request: Executable<RequestT, ResponseT, OutputT>
  ): Promise<OutputT> {
    return request.execute(this.client);
  }
}
