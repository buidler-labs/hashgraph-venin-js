/*
 * This module is responsible for linking solidity-contract abi code against already deployed libraries
 *
 * Be very mindful when editing it to not include to many external module dependencies which
 * could burden the bundler plugins that reference it (eg. @buidlerlabs/rollup-plugin-hashgraph-venin).
 *
 * Note: This is also exported via package.json but is done so for internal use only and, as such,
 *       does not guarantee module api stability.
 */

import linker from "solc/linker.js";

export interface LibraryAddresses {
  [qualifiedNameOrSourceUnit: string]: string;
}

// Source: https://github.com/ethereum/solc-js/blob/99eafc2ad13d5bfba7886de659a6638814d95078/common/types.ts#L24
interface LinkReferences {
  [libraryLabel: string]: Array<{ start: number; length: number }>;
}

interface ByteCode {
  object: string;
  linkReferences: {
    [solFile: string]: LinkReferences;
  };
}

export class ContractCompileResult {
  public static getResultsFor(contractKey: string, jCompileResult: any) {
    const contracts =
      jCompileResult.contracts !== undefined
        ? Object.entries(jCompileResult.contracts[contractKey]).map(
            ([contractName, description]) =>
              new ContractCompileResult(
                contractName,
                (description as any).abi,
                (description as any).evm.bytecode
              )
          )
        : [];

    return {
      contracts,
      errors: jCompileResult.errors,
    };
  }

  public readonly bytecode: string;

  constructor(
    public readonly contractName: string,
    public readonly abi: any,
    private readonly unlinkedByteCode: ByteCode
  ) {
    this.bytecode = this.unlinkedByteCode.object;
  }

  public getLinkedByteCode(libraries: LibraryAddresses): string {
    if (Object.keys(this.unlinkedByteCode.linkReferences).length === 0) {
      // No linking expected on the contract's behalf
      // Final bytecode is the one provided at construction time (default)
      return this.bytecode;
    }

    if (!libraries || Object.keys(libraries).length === 0) {
      throw Error(
        "Expected library addresses to be provided yet none was given."
      );
    }

    const linkedBytecode = linker.linkBytecode(
      this.unlinkedByteCode.object,
      libraries
    );

    if (/.*__\$.*\$__.*/.test(linkedBytecode)) {
      const expectedLibraryNames = Object.entries(
        this.unlinkedByteCode.linkReferences
      ).map(([_, libraryRef]) => Object.keys(libraryRef));

      throw new Error(
        `Please provide all required library addresses (${expectedLibraryNames.join(
          ", "
        )}) for linking through contract '${this.contractName}'`
      );
    }
    return linkedBytecode;
  }
}
