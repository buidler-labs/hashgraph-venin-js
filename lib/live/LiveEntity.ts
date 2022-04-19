import { ApiSession, TypeOfExecutionReturn } from "../ApiSession";
import { Status, Transaction } from "@hashgraph/sdk";
import { SolidityAddressable } from "../core/SolidityAddressable";

export type HederaEntityId = {
  toSolidityAddress(): string;
};

/**
 * Common functionality exhibited by session-bounded, id-entifiable LiveEntity instances.
 */
export abstract class LiveEntity<T extends HederaEntityId, I, P>
  implements SolidityAddressable
{
  constructor(public readonly session: ApiSession, public readonly id: T) {}

  protected get log() {
    return this.session.log;
  }

  public equals<R>(what: R | LiveEntity<T, I, P>): boolean {
    if (what instanceof LiveEntity) {
      return what.id.toSolidityAddress() === this.id.toSolidityAddress();
    }
    return this._equals(what);
  }

  public deleteEntity(args?: any): Promise<Status> {
    const transaction = this._getDeleteTransaction(args);
    return this.executeAndReturnStatus(transaction);
  }

  public async updateEntity(args?: P): Promise<Status> {
    const transaction = await this._getUpdateTransaction(args);
    return this.executeAndReturnStatus(transaction);
  }

  protected _equals<R>(what: R): boolean {
    return false;
  }

  protected async executeAndReturnStatus(
    transaction: Transaction
  ): Promise<Status> {
    return this.session
      .execute(transaction, TypeOfExecutionReturn.Receipt, false)
      .then((receipt) => receipt.status);
  }

  public abstract getSolidityAddress(): string;

  public abstract getLiveEntityInfo(): Promise<I>;

  protected abstract _getDeleteTransaction(args?: any): Transaction;

  protected abstract _getUpdateTransaction(args?: P): Promise<Transaction>;
}
