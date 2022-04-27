import {
  AllowedExecutionReturnTypes,
  ApiSession,
  ExecutionReturnTypes,
  TypeOfExecutionReturn,
} from "../ApiSession";
import {
  ContractFunctionResult,
  Query,
  Status,
  Transaction,
  TransactionResponse,
} from "@hashgraph/sdk";
import { ContractFunctionCall } from "./LiveContract";
import { SolidityAddressable } from "../core/SolidityAddressable";

export type HederaEntityId = {
  toSolidityAddress(): string;
};

/**
 * Common functionality exhibited by session-bounded, identifiable LiveEntity instances.
 */
export abstract class LiveEntity<T extends HederaEntityId, I, P>
  implements SolidityAddressable
{
  /**
   * Sanity flag which, when true, signifies that the live-entity is still operating on the hashgraph (default) while,
   * if false, the fact that no further network operations are possible on the underlying entity. This is usually the case
   * following a self-delete operation.
   */
  private isSane = true;

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

  public async deleteEntity(args?: any): Promise<Status> {
    const transaction = this._getDeleteTransaction(args);
    const deleteTransactionResponse = await this.sanelyExecuteAndGetStatus(
      transaction
    );

    this.isSane = false;
    return deleteTransactionResponse;
  }

  public async updateEntity(args?: P): Promise<Status> {
    const transaction = await this._getUpdateTransaction(args);
    return this.sanelyExecuteAndGetStatus(transaction);
  }

  protected _equals<R>(what: R): boolean {
    return false;
  }

  /**
   * Region of `executeSanely` overridable declarations. This should closely mimic the {@link ApiSession#execute} implementations.
   */
  protected async executeSanely<T extends TypeOfExecutionReturn>(
    transaction: ContractFunctionCall,
    returnType?: T,
    getReceipt?: boolean
  ): Promise<ExecutionReturnTypes<ContractFunctionResult>[T]>;
  protected async executeSanely<T extends TypeOfExecutionReturn>(
    transaction: Transaction,
    returnType?: T,
    getReceipt?: boolean
  ): Promise<ExecutionReturnTypes<TransactionResponse>[T]>;
  protected async executeSanely<T extends TypeOfExecutionReturn, R>(
    transaction: Query<R>,
    returnType?: T,
    getReceipt?: boolean
  ): Promise<ExecutionReturnTypes<R>[T]>;

  /**
   * Actual `sanity-execution`-able implementation. There should be only one `this.session.execute` call per {@link LiveEntity}.
   */
  protected async executeSanely<T extends TypeOfExecutionReturn, R>(
    what: Query<R> | Transaction,
    returnType: T,
    getReceipt = false
  ): Promise<ExecutionReturnTypes<AllowedExecutionReturnTypes<R>>[T]> {
    this.sanityCheck((what as any).constructor.name);

    return this.session.execute(what as any, returnType, getReceipt);
  }

  protected async sanelyExecuteAndGetStatus(
    transaction: Transaction
  ): Promise<Status> {
    const receipt = await this.executeSanely(
      transaction,
      TypeOfExecutionReturn.Receipt,
      true
    );

    return receipt.status;
  }

  protected sanityCheck(opName = "") {
    if (!this.isSane) {
      throw new Error(
        `Cannot perform this${
          opName ? ` "${opName}"` : ""
        } operation on an entity which is no longer sane (is no longer live on the network)`
      );
    }
  }

  public abstract getSolidityAddress(): string;

  public abstract getLiveEntityInfo(): Promise<I>;

  protected abstract _getDeleteTransaction(args?: any): Transaction;

  protected abstract _getUpdateTransaction(args?: P): Promise<Transaction>;
}
