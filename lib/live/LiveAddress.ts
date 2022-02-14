import { ContractId } from "@hashgraph/sdk";
import { Interface } from "@ethersproject/abi";

import { SolidityAddressable, extractSolidityAddressFrom } from "../core/SolidityAddressable";
import { ApiSession } from "../ApiSession";
import { LiveContract } from "./LiveContract";
import { LiveEntity } from "./LiveEntity";

export class LiveAddress extends LiveEntity<string, void> implements SolidityAddressable {
  private static getSolidityAddressMatchOrDieTryingFrom(addr: string): string {
    const matchedSolidityAddress = extractSolidityAddressFrom(addr);
    
    if (!matchedSolidityAddress) {
      throw new Error(`The provided address '${addr}' does not appear to be a valid Solidity address.`);
    }
    return matchedSolidityAddress;
  }

  public constructor({ session, address }: { session: ApiSession, address: string }) {
    super(session, LiveAddress.getSolidityAddressMatchOrDieTryingFrom(address));
  }
    
  public getSolidityAddress(): string {
    return this.id;
  }

  public async toLiveContract(cInterface: Interface): Promise<LiveContract> {
    const id = ContractId.fromSolidityAddress(await this.getSolidityAddress());

    return new LiveContract({ cInterface, id, session: this.session });
  }

  protected override _equals<R>(other: R): boolean {
    return typeof other === 'string' ? extractSolidityAddressFrom(other) === this.id : false;
  }

  public getLiveEntityInfo(): Promise<void> {
    throw new Error("Method does not exist for type LiveAddress");
  }
}