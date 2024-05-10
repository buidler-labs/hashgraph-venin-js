import { AccountId, ContractId, Long } from "@hashgraph/sdk";
import { Interface } from "@ethersproject/abi";

import { HederaEntityId, LiveEntity } from "../live/LiveEntity";
import {
  SolidityAddressable,
  extractSolidityAddressFrom,
} from "../core/SolidityAddressable";
import { ApiSession } from "../ApiSession";
import { LiveAccount } from "../live/LiveAccount";
import { LiveContract } from "../live/LiveContract";

export class StratoAddress implements SolidityAddressable {
  public readonly id: string;

  private static getSolidityAddressMatchOrDieTryingFrom(addr: string): string {
    const matchedSolidityAddress = extractSolidityAddressFrom(addr);

    if (!matchedSolidityAddress) {
      throw new Error(
        `The provided address '${addr}' does not appear to be a valid Solidity address.`
      );
    }
    // We're lower-casein this to match Hedera's ".toSolidityAddress" behavior for consistency
    return matchedSolidityAddress.toLowerCase();
  }

  constructor(
    public readonly session: ApiSession,
    address: string,
    public readonly shard = Long.ZERO,
    public readonly realm = Long.ZERO
  ) {
    this.id = StratoAddress.getSolidityAddressMatchOrDieTryingFrom(address);
  }

  public getSolidityAddress(): string {
    return this.id;
  }

  public async toLiveAccount(): Promise<LiveAccount> {
    const id = AccountId.fromSolidityAddress(this.getSolidityAddress());

    return new LiveAccount({ id, session: this.session });
  }

  public async toLiveContract(cInterface: Interface): Promise<LiveContract> {
    const id = ContractId.fromEvmAddress(
      this.shard,
      this.realm,
      this.getSolidityAddress()
    );

    return new LiveContract({ cInterface, id, session: this.session });
  }

  public equals<T extends HederaEntityId, R>(
    what: R | LiveEntity<T, any, any>
  ): boolean {
    if (what instanceof LiveEntity) {
      return what.id.toSolidityAddress() === this.id;
    }
    return typeof what === "string"
      ? extractSolidityAddressFrom(what).toLocaleLowerCase() === this.id
      : what instanceof AccountId
      ? what.toSolidityAddress() === this.id
      : false;
  }
}
