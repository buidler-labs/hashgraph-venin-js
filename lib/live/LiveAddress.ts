import { Interface } from "@ethersproject/abi";
import { ContractId } from "@hashgraph/sdk";

import { ApiSession } from "../ApiSession";
import { LiveEntity } from "./LiveEntity";
import { extractSolidityAddressFrom, SolidityAddressable } from "../core/SolidityAddressable";
import { LiveContract } from "./LiveContract";

export class LiveAddress extends LiveEntity<string> implements SolidityAddressable {
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
    
    public async getSolidityAddress(): Promise<string> {
        return this.id;
    }

    public async toLiveContract(cInterface: Interface): Promise<LiveContract> {
        const id = ContractId.fromSolidityAddress(await this.getSolidityAddress());

        return new LiveContract({ session: this.session, id, cInterface });
    }

    protected override _equals<R>(other: R): boolean {
        return typeof other === 'string' ? extractSolidityAddressFrom(other) === this.id : false;
    }
}