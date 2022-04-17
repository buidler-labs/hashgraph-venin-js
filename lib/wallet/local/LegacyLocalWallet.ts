// TODO: once hashgraph/hedera-sdk-js#991 gets resolved, remove this class and replace all references to it
//       with LocalWallet. We currently need it so that our tests continue to be happy.
// NOTE: this wallet doesn't have a Provider on purpose. That's because we do expect it will go away really soon so there's no
//       need to define one.

import {
  AccountBalance,
  AccountBalanceQuery,
  AccountId,
  AccountInfo,
  AccountInfoQuery,
  AccountRecordsQuery,
  Client,
  PrivateKey,
  PublicKey,
  SignerSignature,
  Transaction,
  TransactionId,
  TransactionReceiptQuery,
  TransactionRecord,
  Wallet,
} from "@hashgraph/sdk";
import Executable from "@hashgraph/sdk/lib/Executable";

import { HederaNetwork } from "../../HederaNetwork";

export class LegacyLocalWallet extends Wallet {
  private readonly client: Client;
  private readonly publicKey: PublicKey;
  private readonly signer: (messasge: Uint8Array) => Promise<Uint8Array>;

  constructor(
    network: HederaNetwork,
    private readonly accountId: AccountId,
    operatorKey: PrivateKey
  ) {
    super();
    this.client = network.getClient();
    this.publicKey = operatorKey.publicKey;

    this.client.setOperator(accountId, operatorKey);
    this.signer = (message) => Promise.resolve(operatorKey.sign(message));
  }

  getProvider(): any {
    return {
      getTransactionReceipt: async (transactionId) =>
        new TransactionReceiptQuery()
          .setTransactionId(transactionId)
          .execute(this.client),
    };
  }

  getAccountKey() {
    return this.publicKey;
  }

  getLedgerId() {
    return this.client.ledgerId;
  }

  getAccountId() {
    return this.accountId;
  }

  getNetwork() {
    return this.client.network;
  }

  getMirrorNetwork() {
    return this.client.mirrorNetwork;
  }

  async sign(messages: Uint8Array[]): Promise<SignerSignature[]> {
    const signatures = [];

    for (const message of messages) {
      signatures.push(
        new SignerSignature({
          accountId: this.accountId,
          publicKey: this.publicKey,
          signature: await this.signer(message),
        })
      );
    }
    return signatures;
  }

  getAccountBalance(): Promise<AccountBalance> {
    return new AccountBalanceQuery()
      .setAccountId(this.accountId)
      .execute(this.client);
  }

  getAccountInfo(): Promise<AccountInfo> {
    return new AccountInfoQuery()
      .setAccountId(this.accountId)
      .execute(this.client);
  }

  getAccountRecords(): Promise<TransactionRecord[]> {
    return new AccountRecordsQuery()
      .setAccountId(this.accountId)
      .execute(this.client);
  }

  signTransaction(transaction: Transaction): Promise<Transaction> {
    return transaction.signWith(this.publicKey, this.signer);
  }

  checkTransaction(transaction: Transaction): Promise<Transaction> {
    const transactionId = transaction.transactionId;
    if (
      transactionId.accountId != null &&
      transactionId.accountId.compare(this.accountId) != 0
    ) {
      throw new Error(
        "transaction's ID constructed with a different account ID"
      );
    }

    const nodeAccountIds = (
      transaction.nodeAccountIds != null ? transaction.nodeAccountIds : []
    ).map((nodeAccountId) => nodeAccountId.toString());
    const network = Object.values(this.getNetwork()).map((nodeAccountId) =>
      nodeAccountId.toString()
    );

    if (
      !nodeAccountIds.reduce(
        (previous, current) => previous && network.includes(current),
        true
      )
    ) {
      throw new Error(
        "Transaction already set node account IDs to values not within the current network"
      );
    }

    return Promise.resolve(transaction);
  }

  populateTransaction(transaction: Transaction): Promise<Transaction> {
    transaction.setTransactionId(TransactionId.generate(this.accountId));
    transaction.setNodeAccountIds(
      this.client._network.getNodeAccountIdsForExecute()
    );

    return Promise.resolve(transaction.freeze());
  }

  sendRequest<RequestT, ResponseT, OutputT>(
    request: Executable<RequestT, ResponseT, OutputT>
  ): Promise<OutputT> {
    return request.execute(this.client);
  }
}
