import { AccountId, ContractId } from "@hashgraph/sdk";
import { Interface } from "@ethersproject/abi";

import { SolidityAddressable, extractSolidityAddressFrom } from "../core/SolidityAddressable";
import { ApiSession } from "../ApiSession";
import { LiveContract } from "../live/LiveContract";
import { LiveEntity } from "../live/LiveEntity";

export class StratoAddress implements SolidityAddressable {

  public readonly id: string;

  private static getSolidityAddressMatchOrDieTryingFrom(addr: string): string {
    const matchedSolidityAddress = extractSolidityAddressFrom(addr);
    
    if (!matchedSolidityAddress) {
      throw new Error(`The provided address '${addr}' does not appear to be a valid Solidity address.`);
    }
    // We're lower-caseing this to match Hedera's ".toSolidityAddress" behaviour for consistency
    return matchedSolidityAddress.toLowerCase();
  }

  constructor(
    public readonly session: ApiSession,
    address: string
  ) { 
    this.id = StratoAddress.getSolidityAddressMatchOrDieTryingFrom(address);
  }
    
  public getSolidityAddress(): string {
    return this.id;
  }

  public async toLiveContract(cInterface: Interface): Promise<LiveContract> {
    const id = ContractId.fromSolidityAddress(await this.getSolidityAddress());

    return new LiveContract({ cInterface, id, session: this.session });
  }

  public equals<R>(what: R | LiveEntity<any, any, any>): boolean {
    if (what instanceof LiveEntity) {
      return what.id.toString() === this.id.toString();
    }
    return typeof what === 'string' ? extractSolidityAddressFrom(what).toLocaleLowerCase() === this.id : 
      what instanceof AccountId ? what.toSolidityAddress() === this.id : false;
  }
}
