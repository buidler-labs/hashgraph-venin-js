import {
  AllowedExecutionReturnTypes,
  ApiSession,
  SessionExecutable,
  StratoContractCallResponse,
  StratoTransactionResponse,
} from "../ApiSession";
import {
  ContractCreateTransaction,
  ContractExecuteTransaction,
  Query,
  Status,
  Transaction,
} from "@hashgraph/sdk";
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
    const transaction = await this._getDeleteTransaction(args);
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
  protected async executeSanely(
    what: ContractExecuteTransaction | ContractCreateTransaction
  ): Promise<StratoContractCallResponse>;
  protected async executeSanely(
    what: Transaction
  ): Promise<StratoTransactionResponse>;
  protected async executeSanely<R>(what: Query<R>): Promise<R>;

  /**
   * Actual `sanity-execution`-able implementation. There should be only one `this.session.execute` call per {@link LiveEntity}.
   */
  protected async executeSanely<R>(
    what: SessionExecutable<R>
  ): Promise<AllowedExecutionReturnTypes<R>> {
    this.sanityCheck((what as any).constructor.name);

    return this.session.execute(what as any);
  }

  protected async sanelyExecuteAndGetStatus(
    transaction: Transaction
  ): Promise<Status> {
    const { receipt } = await this.executeSanely(transaction);

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

  protected abstract _getDeleteTransaction(args?: any): Promise<Transaction>;

  protected abstract _getUpdateTransaction(args?: P): Promise<Transaction>;
}
