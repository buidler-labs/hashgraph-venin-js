import {
  PublicKey,
  Query,
  Transaction,
  TransactionReceipt,
  TransactionResponse,
  Wallet,
} from "@hashgraph/sdk";
import Executable from "@hashgraph/sdk/lib/Executable";
import { PublicAccountInfo } from "../ApiSession";
import { SignerInfo } from "../core/wallet/SignerInfo";
import { StratoWallet } from "../core/wallet/StratoWallet";

export class BasicStratoWallet implements StratoWallet {
  public signer: SignerInfo;

  public constructor(protected wallet: Wallet) {
    this.signer = wallet;
  }

  /**
   * @override
   */
  get account(): PublicAccountInfo {
    return {
      id: this.wallet.getAccountId(),
      publicKey: this.wallet.getAccountKey() as PublicKey,
    } as PublicAccountInfo;
  }

  public async execute<T extends Transaction | Query<Q>, Q>(
    transaction: T
  ): Promise<
    T extends Query<infer Q>
      ? Q
      : T extends Executable<unknown, unknown, infer OUT>
      ? OUT
      : never
  > {
    let transactionToExecute: Transaction | Query<Q>;

    // Note: don't know if this is generic enough. Are web-browsers ok with this?
    if (transaction instanceof Transaction) {
      // We freeze only if it's not already frozen otherwise we lose all existing signatures
      if (!transaction.isFrozen()) {
        transactionToExecute = await transaction.freezeWithSigner(this.wallet);
      } else {
        transactionToExecute = transaction;
      }
      transactionToExecute = await transactionToExecute.signWithSigner(
        this.wallet
      );
    } else {
      transactionToExecute = transaction;
    }

    const transactionResponse = await transactionToExecute.executeWithSigner(
      this.wallet
    );

    return transactionResponse as T extends Query<infer Q>
      ? Q
      : T extends Executable<unknown, unknown, infer OUT>
      ? OUT
      : never;
  }

  public getReceipt(
    response: TransactionResponse
  ): Promise<TransactionReceipt> {
    return this.wallet
      .getProvider()
      .getTransactionReceipt(response.transactionId);
  }
}
