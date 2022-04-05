
import { 
  AccountBalance,
  AccountBalanceQuery,
  AccountId,
  AccountInfo,
  AccountInfoQuery,
  AccountRecordsQuery,
  PrivateKey,
  PublicKey,
  SignerSignature,
  Transaction,
  TransactionId,
  TransactionRecord,
  Wallet, 
} from "@hashgraph/sdk";
import Executable from "@hashgraph/sdk/lib/Executable";

import { HederaNetwork } from "../../HederaNetwork";
import LocalProvider from "./LocalProvider";

export class LocalWallet extends Wallet {
  private readonly provider: LocalProvider;
  private readonly publicKey: PublicKey;
  private readonly signer: (messasge: Uint8Array) => Promise<Uint8Array>;

  constructor(
      network: HederaNetwork, 
      private readonly accountId: AccountId, 
      operatorKey: PrivateKey) {
    super();
    this.provider = new LocalProvider(network);
    this.publicKey = operatorKey.publicKey;
    this.signer = (message) => Promise.resolve(operatorKey.sign(message));
  }

  getProvider() {
    return this.provider;
  }

  getAccountKey() {
    return this.publicKey;
  }

  getLedgerId() {
    return this.provider.getLedgerId();
  }

  getAccountId() {
    return this.accountId;
  }

  getNetwork() {
    return this.provider.getNetwork();
  }

  getMirrorNetwork() {
    return this.provider.getMirrorNetwork();
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
    return this.sendRequest(
      new AccountBalanceQuery().setAccountId(this.accountId)
    ) as Promise<AccountBalance>;
  }

  getAccountInfo(): Promise<AccountInfo> {
    return this.sendRequest(
      new AccountInfoQuery().setAccountId(this.accountId)
    ) as Promise<AccountInfo>;
  }

  getAccountRecords(): Promise<TransactionRecord[]> {
    return this.sendRequest(
      new AccountRecordsQuery().setAccountId(this.accountId)
    ) as Promise<TransactionRecord[]>;
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
    const network = Object.values(this.provider.getNetwork()).map(
      (nodeAccountId) => nodeAccountId.toString()
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
      this.provider.client._network.getNodeAccountIdsForExecute()
    );

    return Promise.resolve(transaction.freeze());
  }

  sendRequest<RequestT, ResponseT, OutputT>(request: Executable<RequestT, ResponseT, OutputT>): Promise<OutputT> {
    // Note: don't know if this is generic enough. Are web-browsers ok with this?
    if (request instanceof Transaction) {
      request.freezeWithSigner(this);
      request.signWithSigner(this); 
    }

    return this.provider.sendRequest(
      request._setOperatorWith(
        this.accountId,
        this.publicKey,
        this.signer
      )
    );
  }
}
