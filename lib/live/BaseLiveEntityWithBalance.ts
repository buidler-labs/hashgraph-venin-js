import {
  AccountBalance,
  AccountBalanceQuery,
  Hbar,
  Status,
  TokenAssociateTransaction,
  TokenId,
  Transaction,
  TransferTransaction,
} from "@hashgraph/sdk";

import { HederaEntityId, LiveEntity } from "./LiveEntity";

export abstract class BaseLiveEntityWithBalance<
  T extends HederaEntityId,
  I,
  P
> extends LiveEntity<T, I, P> {
  public async getBalanceOfLiveEntity(): Promise<AccountBalance> {
    const queryPayload = this._getBalancePayload();
    const balanceQuery = new AccountBalanceQuery(queryPayload);
    return this.executeSanely(balanceQuery);
  }

  public transferHbarToLiveEntity(hbarAmount: Hbar | number): Promise<Status> {
    const amountToTransfer =
      hbarAmount instanceof Hbar ? hbarAmount : new Hbar(hbarAmount);

    const transferTransaction = new TransferTransaction()
      .addHbarTransfer(
        this.session.wallet.account.id,
        amountToTransfer.negated()
      )
      .addHbarTransfer(this.id.toString(), amountToTransfer);
    return this.sanelyExecuteAndGetStatus(transferTransaction);
  }

  public associateTokensWithLiveEntity(
    tokens: TokenId[] | string[]
  ): Promise<Status> {
    const tokenAssociateTransaction = new TokenAssociateTransaction()
      .setAccountId(this.id.toString())
      .setTokenIds(tokens);
    return this.sanelyExecuteAndGetStatus(tokenAssociateTransaction);
  }

  protected override async _getDeleteTransaction(
    args?: any
  ): Promise<Transaction> {
    return this.newDeleteTransaction(this._getDeleteArguments(args));
  }

  private _getDeleteArguments(args: any): any {
    let argsToReturn = args;

    if (
      !args ||
      !args.has("transferAccountId") ||
      !args.has("transferContractId")
    ) {
      argsToReturn = {
        ...args,
        transferAccountId: this.session.wallet.account.id,
      };
    }
    return argsToReturn;
  }

  protected abstract _getBalancePayload(): object;
  protected abstract newDeleteTransaction(args?: any): Transaction;
}
