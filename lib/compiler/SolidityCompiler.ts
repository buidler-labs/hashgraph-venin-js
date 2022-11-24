// Wrapper around the Solidity solc-js compiler meant for Node runtime consumption
// Browser variants do not use this and instead polyfill it
// Please see the rollup-venin plugin implementation for more info.
//
// NOTE: We have to keep this module as light as possible (least dependencies as possible) so that
//       we can polyfill this easily (eg. venin-rollup-plugin).
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

// Fix for https://github.com/buidler-labs/hashgraph-venin-js/issues/81
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
    const absoluteSourcePath =
      path && sdkPath.isAbsolute(path)
        ? path
        : sdkPath.join(basePath, path || "");
    const content = code
      ? SolidityCompiler.sanitize(code)
      : SolidityCompiler.getSource(absoluteSourcePath);
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
    const importsResolver = (sourcePath: string) => {
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
              contents: SolidityCompiler.getSource(resolvedSourcePath),
            };
          } catch (e) {
            return { error: `Error reading '${resolvedSourcePath}: ${e}` };
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

  /**
   * Given the path of a solidity file, reads and returns its source code following any necessary preprocessing.
   *
   * Note: This provides fix for #114 (https://github.com/buidler-labs/hashgraph-venin-js/issues/114)
   *       We need to replace all relative imports (. and .. alike) otherwise the VFS could load the same identifier into multiple references which would end up
   *       erroring out with "Identifier already declared." error messages.
   *
   * @param fullSolPath - The absolute .sol path to be resolved
   * @returns the loaded source content following any preprocessing
   */
  private static getSource(fullSolPath: string): string {
    const solFolderPath = sdkPath.dirname(fullSolPath);
    let fSource = fs.readFileSync(fullSolPath, "utf-8");
    const importRegex = /[ ]*import\s*[\\]?['"]([\\.]?\.\/[^\\'"]+)[\\]?['"];/g;
    const importMatches = fSource.match(importRegex) || [];

    for (const match of importMatches) {
      const importedEntity = importRegex.exec(fSource);
      const resolvedImportFilePath = sdkPath.join(
        solFolderPath,
        importedEntity[1]
      );

      // TODO: log `[${fullSolPath}] Replacing '${importedEntity[1]}' with '${resolvedImportFilePath}'`
      fSource = fSource.replace(match, `import '${resolvedImportFilePath}';`);
    }
    return fSource;
  }

  private static sanitize(rootCode: string): string {
    const dotDotRelativeImportRegex =
      /[ ]*import\s*[\\]?['"](\.\.\/[^\\'"]+)[\\]?['"];/g;

    if (dotDotRelativeImportRegex.test(rootCode)) {
      throw new Error(
        "Compiling root-code with double relative import component (..) is not yet supported and will be implemented in #117."
      );
    }
    return rootCode;
  }
}
