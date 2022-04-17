import { AccountId, Transaction } from "@hashgraph/sdk";

import { HashConnectSender } from "./sender";

export class HashPackSigner {
  public constructor(
    private readonly accountId: AccountId,
    private readonly sender: HashConnectSender
  ) {}

  public async sign(message: Uint8Array): Promise<Uint8Array> {
    const { signedTransaction, error } = await this.sender.send(
      this.accountId,
      message
    );

    if (error) {
      throw new Error(
        `There was an issue reported while signing the message: ${error}`
      );
    } else if (signedTransaction) {
      const hSignedTransaction = Transaction.fromBytes(
        signedTransaction as Uint8Array
      );
      const signedTransactions = hSignedTransaction._signedTransactions;

      if (signedTransactions.isEmpty) {
        throw new Error("No transaction has been signed.");
      }

      const fTransactionSignaturePairs =
        signedTransactions.get(0).sigMap.sigPair;
      const signature = fTransactionSignaturePairs.find(
        (pair) => pair.ed25519 !== undefined
      );

      return signature.ed25519;
    }
    return Uint8Array.of();
  }
}
