import { 
  AccountBalance, 
  AccountBalanceQuery, 
  Hbar,
  Status, 
  TokenAssociateTransaction, 
  TokenId, 
  TransferTransaction,
} from "@hashgraph/sdk";

import { LiveEntity } from "./LiveEntity";
import { TypeOfExecutionReturn } from "../ApiSession";

export abstract class BaseLiveEntityWithBalance<T, I, P> extends LiveEntity<T, I, P> {

  public getBalanceOfLiveEntity(): Promise<AccountBalance> {
    const queryPayload = this._getBalancePayload();
    const balanceQuery = new AccountBalanceQuery(queryPayload);
    return this.session.execute(balanceQuery, TypeOfExecutionReturn.Result, false);
  }

  public transferHbarToLiveEntity(hbarAmount: Hbar|number): Promise<Status> {
    const amountToTransfer = hbarAmount instanceof Hbar ? hbarAmount : new Hbar(hbarAmount);

    const transferTransaction = new TransferTransaction()
      .addHbarTransfer(this.session.wallet.account.id, amountToTransfer.negated())
      .addHbarTransfer(this.id.toString(), amountToTransfer);
    return this.executeAndReturnStatus(transferTransaction);
  }

  public associateTokensWithLiveEntity(tokens: TokenId[]|string[]): Promise<Status> {
    const tokenAssociateTransaction = new TokenAssociateTransaction()
      .setAccountId(this.id.toString())
      .setTokenIds(tokens);
    return this.executeAndReturnStatus(tokenAssociateTransaction);
  }

  protected _getEntityWithBalanceDeleteArguments(args: any): any {
    if(!args || !args.has("transferAccountId") || !args.has("transferContractId")) {
      args = { "transferAccountId": this.session.wallet.account.id };
    }
    return args;
  }

  protected abstract _getBalancePayload(): object;
}
