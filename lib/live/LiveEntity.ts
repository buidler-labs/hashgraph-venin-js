
import { ApiSession, TypeOfExecutionReturn } from "../ApiSession";
import { Status, Transaction } from "@hashgraph/sdk";
/**
 * Common functionality exhibited by session-bounded, id-entifiable LiveEntity instances.
 */
export abstract class LiveEntity<T, I, P> {
  constructor(
    public readonly session: ApiSession,
    public readonly id: T
  ) { }

  protected get log() {
    return this.session.log;
  }

  public equals<R>(what: R | LiveEntity<T, I, P>): boolean {
    if (what instanceof LiveEntity) {
      return what.id.toString() === this.id.toString();
    }
    return this._equals(what);
  }

  protected _equals<R>(what: R): boolean {
    return false;
  }

  private executeAndReturnStatus(transaction: Transaction): Promise<Status> {
    return this.session.execute(transaction, TypeOfExecutionReturn.Receipt, false)
      .then(receipt => receipt.status);
  }

  public abstract getSolidityAddress(): string;

  public abstract getLiveEntityInfo(): Promise<I>;

  protected abstract _mapFeaturesToArguments(args?: P): any;

  protected abstract _getDeleteTransaction(args?: any): Transaction;

  public deleteEntity(): Promise<Status> {
    const transaction = this._getDeleteTransaction();
    return this.executeAndReturnStatus(transaction);
  }

  protected abstract _getUpdateTransaction(args?: any): Transaction;

  public updateEntity(args?: P): Promise<Status> {
    const entityArgs = this._mapFeaturesToArguments(args);
    const transaction = this._getUpdateTransaction(entityArgs);
    return this.executeAndReturnStatus(transaction);
  }
}
