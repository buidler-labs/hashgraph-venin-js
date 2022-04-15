/* eslint-env browser */

import {
  AccountBalanceQuery,
  AccountId,
  AccountInfoQuery,
  AccountRecordsQuery,
  Client,
  Provider,
  Query,
  Transaction,
  TransactionId,
  TransactionReceiptQuery,
  TransactionResponse,
} from "@hashgraph/sdk";
import Executable from "@hashgraph/sdk/lib/Executable";

import { HashConnectSender } from "./sender";

export class HashConnectProvider extends Provider {
  private readonly client: Client;

  public constructor(
    private readonly sender: HashConnectSender,
    networkName: string
  ) {
    super();
    this.client = Client.forName(networkName);
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

  getAccountBalance(accountId: AccountId) {
    return new AccountBalanceQuery()
      .setAccountId(accountId)
      .execute(this.client);
  }

  getAccountInfo(accountId: AccountId) {
    return new AccountInfoQuery().setAccountId(accountId).execute(this.client);
  }

  getAccountRecords(accountId: AccountId) {
    return new AccountRecordsQuery()
      .setAccountId(accountId)
      .execute(this.client);
  }

  getTransactionReceipt(transactionId: TransactionId) {
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

  async sendRequest<RequestT, ResponseT, OutputT>(
    request: Executable<RequestT, ResponseT, OutputT>
  ): Promise<OutputT> {
    const requestBytes = this.getBytesOf(request);
    const { signedTransaction, error } = await this.sender.send(
      request._operator.accountId,
      requestBytes
    );

    if (error) {
      throw new Error(`There was an issue while signing the request: ${error}`);
    } else if (request instanceof Transaction) {
      const sdkSignedTransaction = Transaction.fromBytes(
        signedTransaction as Uint8Array
      );

      return sdkSignedTransaction.execute(
        this.client
      ) as unknown as Promise<OutputT>;
    } else if (request instanceof Query) {
      // TODO: execute query somehow?
    } else {
      throw new Error(`We only know how to forward Transactions and Queries.`);
    }
  }

  private getBytesOf<RequestT, ResponseT, OutputT>(
    request: Executable<RequestT, ResponseT, OutputT>
  ): Uint8Array {
    if (request instanceof Transaction || request instanceof Query) {
      return request.toBytes();
    } else {
      throw new Error(
        "Only Transactions and Queries can be serialized to be sent for signing by the HashPack wallet."
      );
    }
  }
}
