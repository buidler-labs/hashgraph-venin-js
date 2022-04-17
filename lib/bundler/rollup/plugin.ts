import * as fs from "fs/promises";
import * as legacyFs from "fs";
import * as path from "path";

// @ts-ignore: Must use self-referencing imports here otherwise we risk getting into strange cyclic-dependency issues
import { Contract } from "@buidlerlabs/hedera-strato-js";
import { SimpleReplacer } from "./SimpleReplacer";
import { getSolidityCompilerCode } from "./CompilerBundler";

type StratoRollupOptions = {
  contracts?: {
    path?: string;
    recurse?: boolean;
  };
  environment?: NodeJS.ProcessEnv;
  includeCompiler?: boolean;
  sourceMap?: boolean;
};

const CONTRACT_REGISTRY_ID = "\0hedera-strato:ContractRegistry";
const CONTRACTS_IN_FILE_STORAGE_ID = "\0hedera-strato:ContractsInFileStorage";
const SOLIDITY_COMPILER_ID = "\0hedera-strato:SolidityCompiler";

export default function strato(options: StratoRollupOptions = {}) {
  const {
    contracts: {
      path: contractsPath = "contracts",
      recurse: recurseInContractsPath,
    },
    environment = process.env,
    includeCompiler = false,
    sourceMap = false,
  } = Object.assign({ contracts: {} }, options);
  const replacer = new SimpleReplacer(
    {
      // don't take away the HEDERAS_ENV_PATH otherwise ApiSession.default definition will fail
      "process.env": JSON.stringify(getHederasSettingsFrom(environment)),
      "process.env.HEDERAS_ENV_PATH": environment.HEDERAS_ENV_PATH,
      "process.env.NODE_ENV": `'${environment.NODE_ENV ?? "test"}'`,
    },
    sourceMap
  );
  const resolvableIds: {
    [k: string]: { external: boolean; id: string; excludeImporter?: RegExp };
  } = {
    ContractRegistry: { external: false, id: CONTRACT_REGISTRY_ID },
    ContractsInFileStorage: {
      external: false,
      id: CONTRACTS_IN_FILE_STORAGE_ID,
    },
    SolidityCompiler: { external: false, id: SOLIDITY_COMPILER_ID },

    StratoLogger: { external: false, id: getPoliePathOf("StratoLogger.js") },
    "bignumber.js": {
      // Strato is using both @ethersproject/bignumber and bignumber.js. They don't play well together
      // There is a tendency to mess up @ethersproject inner-dependencies
      // We try to leave it alone to bundle its own thing
      excludeImporter: /@ethersproject/g,
      external: true,
      id: "https://unpkg.com/bignumber.js@9.0.2/bignumber.mjs",
    },
    "core/Hex": { external: false, id: getPoliePathOf("Hex.js") },
    dotenv: { external: false, id: getPoliePathOf("dotenv.js") },
  };

  return {
    async load(id: string) {
      let source: string | null = null;

      if (CONTRACT_REGISTRY_ID === id || CONTRACTS_IN_FILE_STORAGE_ID === id) {
        const relativeSolFiles = await getSolFiles(
          contractsPath,
          recurseInContractsPath
        );
        const solFilePaths = relativeSolFiles.map(
          (solFileName) => `${solFileName.name}`
        );

        source = await (CONTRACT_REGISTRY_ID === id
          ? getRegistryCodeFor(solFilePaths)
          : getStorageCodeFor(contractsPath, relativeSolFiles));
      } else if (SOLIDITY_COMPILER_ID === id) {
        const solCompilerEntryPoint = getPoliePathOf(
          `compiler/${includeCompiler ? "worker" : "none"}/SolidityCompiler.js`
        );

        source = await getSolidityCompilerCode(
          solCompilerEntryPoint,
          sourceMap
        );
      }
      return source;
    },
    name: "hedera-strato",
    renderChunk(code: string, chunk) {
      const id = chunk.fileName;
      return replacer.tryReplacing(code, id);
    },
    async resolveId(importee: string, importer: string, options: any) {
      const resolvedImporteeKey = Object.keys(resolvableIds).find(
        (potentialResolvableId) => {
          const excludeImporterRegex =
            resolvableIds[potentialResolvableId].excludeImporter;
          const isImporterAcceptable =
            importer && excludeImporterRegex
              ? !(importer.search(excludeImporterRegex) != -1)
              : true;

          return (
            isImporterAcceptable && importee.endsWith(potentialResolvableId)
          );
        }
      );

      if (resolvedImporteeKey) {
        const resolvedImportee = resolvableIds[resolvedImporteeKey];

        if (resolvedImportee.id.startsWith("\0") || resolvedImportee.external) {
          return resolvedImportee;
        }
        return this.resolve(resolvedImportee.id, importer, {
          skipSelf: true,
          ...options,
        });
      }
      return null;
    },
    transform(code: string, id) {
      return replacer.tryReplacing(code, id);
    },
  };
}

function getPoliePathOf(file) {
  return path.join(__dirname, `../polies/${file}`);
}

async function getRegistryCodeFor(solPaths: string[]) {
  const resolvedStaticContracts: Contract[] = await Promise.all(
    solPaths.map((solFilePath) =>
      getAllVirtuallyLocalizedContracts(solFilePath)
    )
  );
  const staticContracts = resolvedStaticContracts.reduce(
    (a, b) => a.concat(b),
    []
  );
  const contractsRegistryCode = `export default {
    ${staticContracts
      .map(
        ({ contract, vLocation }) =>
          `"${vLocation}": ${JSON.stringify(contract.interface.format())}`
      )
      .join(",")}
  }`;

  return contractsRegistryCode;
}

/**
 * Given a {@param solPath} relative file location, it compiles and retrieves all the inner {@link Contract}s along with their virtual-path locations
 * primarily used for the generation of the ContractRegistry in folder-nested solidity scenarios.
 *
 * Eg #1: solPath = 'a.sol' => vLocation = name of the inner contract(s)
 * Eg #2: solPath = 'b/a.sol' => vLocation = "b/<name of the inner contract(s)>"
 * Eg #3: solPath = 'c.d e/b/a.sol' => vLocation = "c_d_e/b/<name of the inner contract(s)>"
 *
 * Note: Eg #3 depicts a more complicated use case with sanitization taking place.
 *
 * @param solPath - The solidity-file path to load the contracts from.
 *                  Note: Only relative locations are supported.
 * @returns {[{ contract: Contract, vLocation: string }]}
 */
async function getAllVirtuallyLocalizedContracts(solPath: string) {
  if (path.isAbsolute(solPath)) {
    throw new Error(
      "Only relative solidity paths can be virtually localisable"
    );
  }

  const contracts = await Contract.allFrom({
    ignoreWarnings: true,
    path: solPath,
  });
  const solDirName = path.dirname(solPath);
  const normalizedPathSegments =
    solDirName === "."
      ? []
      : solDirName
          .split(path.sep)
          .map((pathSegment) => pathSegment.replace(/[ \\."']+/g, "_"));

  return contracts.map((contract) => ({
    contract,
    vLocation: [...normalizedPathSegments, contract.name].join("/"),
  }));
}

/**
 * Given a {@link basePath}, it looks for and retrieves a list of all .sol file directory-entries ({@link legacyFs.Dirent}). If {@link recurse} is set to true, it descends into the lower, inner, directories
 * and tries to load all .sol files from all inner levels.
 *
 * @param basePath - The absolute base-folder to start the .sol files loading from
 * @param recurse - true to recurse into inner sub-folders and false otherwise.
 *                  If set to false, it just takes the top-level folder and sees what solidity files can be retrieved from there.
 *                  It defaults to false.
 * @param relativePath - a {@link basePath} relative subfolder structure path to look for .sol files
 * @returns - a list of directory-entries of all .sol files found in {@param basePath}
 */
async function getSolFiles(
  basePath: string,
  recurse = false,
  relativePath = ""
): Promise<legacyFs.Dirent[]> {
  const finalPath = `${basePath}/${relativePath}`;
  let filesInPath: legacyFs.Dirent[] = [];

  try {
    filesInPath = await fs.readdir(finalPath, { withFileTypes: true });
  } catch (e) {
    console.warn(
      `StratoRollup - Could not read contracts from '${finalPath}': ${e.message} Skipping ...`
    );
  }

  const solFilesInPath = filesInPath
    .filter(
      (potentialSolFile) =>
        potentialSolFile.isFile() && potentialSolFile.name.endsWith(".sol")
    )
    .map((solFile) => {
      solFile.name =
        relativePath !== "" ? `${relativePath}/${solFile.name}` : solFile.name;

      return solFile;
    });
  const directoriesInPath = recurse
    ? filesInPath
        .filter((potentialDirectory) => potentialDirectory.isDirectory())
        .map((filteredEntry) => filteredEntry.name)
    : [];
  const solRecurseInDirectory = await Promise.all(
    directoriesInPath.map((directory) =>
      getSolFiles(
        basePath,
        recurse,
        relativePath !== "" ? `${relativePath}/${directory}` : directory
      )
    )
  );
  const solFilesRecurse = solRecurseInDirectory.reduce(
    (a, b) => a.concat(b),
    []
  );

  return [...solFilesInPath, ...solFilesRecurse];
}

async function getStorageCodeFor(
  basePath: string,
  solFiles: legacyFs.Dirent[]
) {
  const contractSources = await Promise.all(
    solFiles.map(async (solFile) => ({
      code: await fs.readFile(`${basePath}/${solFile.name}`),
      name: solFile.name,
    }))
  );
  const contractsRegistryCode = `export default {
    ${contractSources
      .map((contract) => `"${contract.name}": \`${contract.code.toString()}\``)
      .join(",")}
  }`;

  return contractsRegistryCode;
}

function getHederasSettingsFrom(obj) {
  const toReturn = {};

  Object.keys(obj).forEach((oKey) => {
    if (oKey.startsWith("HEDERAS_")) {
      toReturn[oKey] = obj[oKey];
    }
  });
  return toReturn;
}
