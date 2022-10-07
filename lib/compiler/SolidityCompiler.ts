// Wrapper around the Solidity solc-js compiler meant for Node runtime consumption
// Browser variants do not use this and instead polyfill it
// Please see the rollup-strato plugin implementation for more info.
//
// NOTE: We have to keep this module as light as possible (least dependencies as possible) so that
//       we can polyfill this easily (eg. strato-rollup-plugin).
//       This means no @hashgraph/sdk here.
import * as fs from "fs";
import * as sdkPath from "path";

import solc from "solc";

import { ContractCompileResult } from "./ContractCompileResult";

export interface CompilerOptions {
  code?: string;
  path?: string;
}

export interface CompilationResult {
  // TODO: make this more specific according to what solc outputs
  errors?: any;
  contracts: ContractCompileResult[];
}

export const VIRTUAL_SOURCE_CONTRACT_FILE_NAME = "__contract__.sol";

// Fix for https://github.com/buidler-labs/hedera-strato-js/issues/81
//   as initially reported by https://github.com/ethereum/solidity/issues/12228
const listeners = process.listeners("unhandledRejection");
if (undefined !== listeners[listeners.length - 1]) {
  process.removeListener("unhandledRejection", listeners[listeners.length - 1]);
}
export class SolidityCompiler {
  public static async compile({
    code,
    path,
  }: CompilerOptions): Promise<CompilationResult> {
    const basePath = sdkPath.resolve(
      process.env.HEDERAS_CONTRACTS_RELATIVE_PATH || "contracts"
    );
    const content = code
      ? code
      : fs.readFileSync(
          sdkPath.isAbsolute(path) ? path : sdkPath.join(basePath, path),
          "utf8"
        );
    // Note: Further options and info is available
    //       here https://docs.soliditylang.org/en/v0.8.10/using-the-compiler.html#input-description and
    //       here https://docs.soliditylang.org/en/v0.8.10/using-the-compiler.html#compiler-input-and-output-json-description
    const solInput = {
      language: "Solidity",
      settings: {
        // FIXME: Issue #91: Make SolidityCompiler execution configurable
        optimizer: {
          enabled: true,
          runs: 200,
        },
        metadata: {
          // disabling metadata hash embedding to make the bytecode generation predictable at test-time
          // see https://docs.soliditylang.org/en/latest/metadata.html#encoding-of-the-metadata-hash-in-the-bytecode
          bytecodeHash: process.env.NODE_ENV === "test" ? "none" : "ipfs",
        },
        outputSelection: {
          "*": {
            "*": ["*"],
          },
        },
      },
      sources: { [VIRTUAL_SOURCE_CONTRACT_FILE_NAME]: { content } },
    };
    const stringifiedSolInput = JSON.stringify(solInput);
    const importPrefixes = [
      // prioritize the root contract folder followed by the base-path one (usually 'contracts' if HEDERAS_CONTRACTS_RELATIVE_PATH is not provided)
      ...(path ? [sdkPath.join(basePath, sdkPath.dirname(path)), ""] : [""]),
      // then look at the project's node_modules
      sdkPath.join(process.cwd(), "node_modules"),
      // then expand all the environment provided prefixes (if any)
      ...(process.env.HEDERAS_CONTRACTS_INCLUDED_PREFIXES
        ? process.env.HEDERAS_CONTRACTS_INCLUDED_PREFIXES.split(/\s*,\s*/)
        : []),
    ];
    const importsResolver = (sourcePath) => {
      for (const prefix of importPrefixes) {
        let resolvedSourcePath;

        // Narrow down on the absolute imported source-path to use
        if (sdkPath.isAbsolute(sourcePath)) {
          resolvedSourcePath = sourcePath;
        } else if (sdkPath.isAbsolute(prefix)) {
          resolvedSourcePath = sdkPath.join(prefix, sourcePath);
        } else {
          resolvedSourcePath = sdkPath.join(basePath, prefix, sourcePath);
        }

        if (fs.existsSync(resolvedSourcePath)) {
          try {
            return {
              contents: fs.readFileSync(resolvedSourcePath).toString("utf8"),
            };
          } catch (e) {
            return { error: "Error reading " + resolvedSourcePath + ": " + e };
          }
        }
      }
      return {
        error:
          "File not found inside the base path or any of the include paths.",
      };
    };
    const jCompileResult = JSON.parse(
      solc.compile(stringifiedSolInput, {
        import: importsResolver,
      })
    );

    return ContractCompileResult.getResultsFor(
      VIRTUAL_SOURCE_CONTRACT_FILE_NAME,
      jCompileResult
    );
  }
}
