// Wrapper around the Solidity solc-js compiler meant for Node runtime consumption
// Browser variants do not use this and instead polyfill it
// Please see the rollup-venin plugin implementation for more info.
//
// NOTE: We have to keep this module as light as possible (least dependencies as possible) so that
//       we can polyfill this easily (eg. venin-rollup-plugin).
//       This means no @hashgraph/sdk here.
import * as sdkPath from "path";

import solc from "solc";

import { CodeResolver, SolidityRootCoordinate } from "./CodeResolver";
import { ContractCompileResult } from "./ContractCompileResult";

export interface CompilationResult {
  // TODO: make this more specific according to what solc outputs
  errors?: any;
  contracts: ContractCompileResult[];
}

export const VIRTUAL_SOURCE_CONTRACT_FILE_NAME = "__contract__.sol";

// Fix for https://github.com/buidler-labs/hashgraph-venin-js/issues/81
//   as initially reported by https://github.com/ethereum/solidity/issues/12228
const listeners = process.listeners("unhandledRejection");
if (undefined !== listeners[listeners.length - 1]) {
  process.removeListener("unhandledRejection", listeners[listeners.length - 1]);
}
export class SolidityCompiler {
  public static async compile(
    src: SolidityRootCoordinate
  ): Promise<CompilationResult> {
    const codeResolver = new CodeResolver({
      contractsBasePath: sdkPath.resolve(
        process.env.HEDERAS_CONTRACTS_RELATIVE_PATH || "contracts"
      ),
      includedPrefixes: (
        process.env.HEDERAS_CONTRACTS_INCLUDED_PREFIXES || ""
      ).split(/\s*,\s*/),
      root: src,
    });

    // Note: Further options and info is available
    //       here https://docs.soliditylang.org/en/v0.8.10/using-the-compiler.html#input-description and
    //       here https://docs.soliditylang.org/en/v0.8.10/using-the-compiler.html#compiler-input-and-output-json-description
    const solInput = {
      language: "Solidity",
      settings: {
        metadata: {
          // disabling metadata hash embedding to make the bytecode generation predictable at test-time
          // see https://docs.soliditylang.org/en/latest/metadata.html#encoding-of-the-metadata-hash-in-the-bytecode
          bytecodeHash: process.env.NODE_ENV === "test" ? "none" : "ipfs",
        },
        // FIXME: Issue #91: Make SolidityCompiler execution configurable
        optimizer: {
          enabled: true,
          runs: 200,
        },
        outputSelection: {
          "*": {
            "*": ["*"],
          },
        },
      },
      sources: {
        [VIRTUAL_SOURCE_CONTRACT_FILE_NAME]: { content: codeResolver.rootCode },
      },
    };
    const stringifiedSolInput = JSON.stringify(solInput);
    const jCompileResult = JSON.parse(
      solc.compile(stringifiedSolInput, {
        import: codeResolver.solidityImportResolver,
      })
    );

    return ContractCompileResult.getResultsFor(
      VIRTUAL_SOURCE_CONTRACT_FILE_NAME,
      jCompileResult
    );
  }
}
