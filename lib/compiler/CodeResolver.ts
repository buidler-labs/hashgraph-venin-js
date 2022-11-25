import * as fs from "fs";
import * as sdkPath from "path";

export interface SolidityRootCoordinate {
  /**
   * The initial path (if available) of the root solidity file to compile
   */
  code?: string;
  /**
   * The initial code (if available) of the root solidity file to compile
   */
  path?: string;
}

export type CodeResolverConstructorArgs = {
  /**
   * Root solidity coordinate for a new compilation. Either path or root must be provided.
   */
  root: SolidityRootCoordinate;

  /**
   * The absolute path of where all the contracts are stored
   */
  contractsBasePath: string;
  /**
   * Any other path prefixes to look after when resolving imports
   */
  includedPrefixes: string[];
};

export class CodeResolver {
  public static sanitize(rootCode: string): string {
    const dotDotRelativeImportRegex =
      /[ ]*import\s*[\\]?['"](\.\.\/[^\\'"]+)[\\]?['"];/g;

    if (dotDotRelativeImportRegex.test(rootCode)) {
      throw new Error(
        "Compiling root-code with double relative import component (..) is not yet supported and will be implemented in #117."
      );
    }
    return rootCode;
  }

  private readonly basePath: string;
  public readonly rootCode: string;
  private readonly importPrefixes: string[];

  constructor(args: CodeResolverConstructorArgs) {
    this.basePath = sdkPath.resolve(
      process.env.HEDERAS_CONTRACTS_RELATIVE_PATH || "contracts"
    );

    const absoluteInitialSolPath =
      args.root.path && sdkPath.isAbsolute(args.root.path)
        ? args.root.path
        : sdkPath.join(this.basePath, args.root.path || "");

    this.importPrefixes = [
      // prioritize the root contract folder followed by the base-path one
      // This is usually 'contracts' if HEDERAS_CONTRACTS_RELATIVE_PATH is not provided.
      ...(args.root.path
        ? [
            sdkPath.join(
              args.contractsBasePath,
              sdkPath.dirname(args.root.path)
            ),
            "",
          ]
        : [""]),
      // then look at the project's node_modules
      sdkPath.join(process.cwd(), "node_modules"),
      // then expand all the environment provided prefixes (if any)
      ...(process.env.HEDERAS_CONTRACTS_INCLUDED_PREFIXES || "").split(
        /\s*,\s*/
      ),
    ];
    this.rootCode = args.root.code
      ? CodeResolver.sanitize(args.root.code)
      : this.getSourceFrom(absoluteInitialSolPath);
  }

  public get solidityImportResolver() {
    return (importedIdentifier: string) => {
      try {
        const absImportedPath = this.getAbsolutePathFor(importedIdentifier);

        return {
          contents: this.getSourceFrom(absImportedPath),
        };
      } catch (e) {
        return {
          error: e.message,
        };
      }
    };
  }

  private getAbsolutePathFor(importedIdentifier: string): string {
    let importedAbsolutePath: string | undefined;

    for (const prefix of this.importPrefixes) {
      let resolvedSourcePath: string;

      // Narrow down on the absolute imported source-path to use
      if (sdkPath.isAbsolute(importedIdentifier)) {
        resolvedSourcePath = importedIdentifier;
      } else if (sdkPath.isAbsolute(prefix)) {
        resolvedSourcePath = sdkPath.join(prefix, importedIdentifier);
      } else {
        resolvedSourcePath = sdkPath.join(
          this.basePath,
          prefix,
          importedIdentifier
        );
      }

      if (fs.existsSync(resolvedSourcePath)) {
        importedAbsolutePath = resolvedSourcePath;
        break;
      }
    }
    if (!importedAbsolutePath) {
      throw new Error(
        `Absolute path could not be determined for '${importedIdentifier}'. Searched in:\n - ${this.importPrefixes.join(
          "\n - "
        )}`
      );
    }
    return importedAbsolutePath;
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
  private getSourceFrom(fullSolPath: string) {
    const solFolderPath = sdkPath.dirname(fullSolPath);
    let fSource = fs.readFileSync(fullSolPath, "utf-8");
    const importRegex = /[ ]*import\s*[\\]?['"](.+)[\\]?['"];/g;
    const importMatches = fSource.match(importRegex) || [];

    for (const match of importMatches) {
      const importedIdentifier = importRegex.exec(fSource);

      // We try to eagerly resolve the imported identifier here.
      // Maybe it's a relative import which would require the parent's base-path to aid with the path-resolution.
      let resolvedImportFilePath = sdkPath.join(
        solFolderPath,
        importedIdentifier[1]
      );
      resolvedImportFilePath = fs.existsSync(resolvedImportFilePath)
        ? resolvedImportFilePath
        : this.getAbsolutePathFor(importedIdentifier[1]);

      // TODO: log `[${fullSolPath}] Replacing '${importedEntity[1]}' with '${resolvedImportFilePath}'`
      fSource = fSource.replace(match, `import '${resolvedImportFilePath}';`);
    }
    return fSource;
  }
}
