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
    const transactionResponse = await transaction.executeWithSigner(
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
