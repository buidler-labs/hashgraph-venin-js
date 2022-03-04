import * as fs from 'fs/promises';
import * as path from 'path';

// @ts-ignore: Must use self-referencing imports here otherwise we risk getting into strange cyclic-dependency issues
import { Contract } from '@buidlerlabs/hedera-strato-js';
import { SimpleReplacer } from './SimpleReplacer';
import { getSolidityCompilerCode } from './CompilerBundler';

type StratoRollupOptions = {
  contracts?: {
    path?: string,
    recurse?: boolean,
  },
  environment?: NodeJS.ProcessEnv,
  includeCompiler?: boolean,
  sourceMap?: boolean, 
};

const CONTRACT_REGISTRY_ID = '\0hedera-strato:ContractRegistry';
const CONTRACTS_IN_FILE_STORAGE_ID = '\0hedera-strato:ContractsInFileStorage';
const SOLIDITY_COMPILER_ID = '\0hedera-strato:SolidityCompiler';

export default function strato(options: StratoRollupOptions = {}) {
  const { 
    contracts: { 
      path: contractsPath = 'contracts', 
      recurse: recurseInContractsPath,
    },
    environment = process.env,
    includeCompiler = false, 
    sourceMap = false, 
  } = Object.assign({ contracts: {} }, options);
  const replacer = new SimpleReplacer({
    // don't take away the HEDERAS_ENV_PATH otherwise ApiSession.default definition will fail
    "process.env": JSON.stringify(getHederasSettingsFrom(environment)),
    "process.env.HEDERAS_ENV_PATH": environment.HEDERAS_ENV_PATH,
    'process.env.NODE_ENV': `'${environment.NODE_ENV ?? 'test'}'`,
  }, sourceMap);
  const resolvableIds: { [k:string]: { external: boolean, id: string } } = {
    // We need to dedupe the sdk itself to forcefully look in the current dir's node_modules to pick up that version of it otherwise, 
    // due to multiple issues in the SDK code base, the strato runtime might fail in all sorts of ways.
    // TODO: once sdk is stable, this won't be required.
    '@hashgraph/sdk': {external: false, id: '@hashgraph/sdk-web'},

    'ContractRegistry': {external: false, id: CONTRACT_REGISTRY_ID},
    'ContractsInFileStorage': {external: false, id: CONTRACTS_IN_FILE_STORAGE_ID},
    'SolidityCompiler': {external: false, id: SOLIDITY_COMPILER_ID},
    
    'StratoLogger': {external: false, id: getPoliePathOf('StratoLogger.js')},
    'bignumber.js': {external: true, id: 'https://unpkg.com/bignumber.js@9.0.2/bignumber.mjs'},
    'core/Hex': {external: false, id: getPoliePathOf("Hex.js")},
    'dotenv': {external: false, id: getPoliePathOf("dotenv.js")},
  };

  return {
    async load(id: string) {
      let source: string|null = null;

      if (CONTRACT_REGISTRY_ID === id || CONTRACTS_IN_FILE_STORAGE_ID === id) {
        const relativeSolFiles = await getSolFiles(contractsPath, recurseInContractsPath);
        const solFilePaths = relativeSolFiles.map(solFileName => `${solFileName.name}`);

        source = await (CONTRACT_REGISTRY_ID === id ? getRegistryCodeFor(solFilePaths) : getStorageCodeFor(contractsPath, relativeSolFiles));
      } else if (SOLIDITY_COMPILER_ID === id) {
        const solCompilerEntryPoint = getPoliePathOf(`compiler/${ includeCompiler ? 'worker' : 'none' }/SolidityCompiler.js`);

        source = await getSolidityCompilerCode(solCompilerEntryPoint, sourceMap);
      }
      return source;
    },
    name: 'hedera-strato',
    renderChunk(code:string, chunk) {
      const id = chunk.fileName;
      return replacer.tryReplacing(code, id);
    },
    async resolveId(importee: string, importer: string, options: any) {
      const resolvedImporteeKey = Object.keys(resolvableIds)
        .find(potentialResolvableId => importee.endsWith(potentialResolvableId));

      if (resolvedImporteeKey) {
        const resolvedImportee = resolvableIds[resolvedImporteeKey];

        if (resolvedImportee.id.startsWith('\0')) {
          return resolvedImportee;
        }
        return this.resolve(resolvedImportee.id, importer, { skipSelf: true, ...options });
      }
      return null;
    },
    transform(code:string, id) {
      return replacer.tryReplacing(code, id);
    },
  }
}

function getPoliePathOf(file) {
  return path.join(__dirname, `../polies/${file}`);
}

async function getRegistryCodeFor(solPaths: string[]) {
  const resolvedStaticContracts: Contract[] = await Promise.all(
    solPaths.map(
      solFilePath => Contract.allFrom({ 
        ignoreWarnings: true,
        path: solFilePath, 
      }),
    )
  );
  const staticContracts = resolvedStaticContracts.reduce((a, b) => a.concat(b), []);
  const contractsRegistryCode = `export default {
    ${ staticContracts.map(contract => `"${contract.name}": ${JSON.stringify(contract.interface.format())}`).join(",") }
  }`;

  return contractsRegistryCode;
}

async function getSolFiles(path: string, recurse = false) {
  let filesInPath = [];
  try {
    filesInPath = await fs.readdir(path, { withFileTypes: true });
  } catch(e) {
    console.warn(`Could not read contracts from '${path}': ${e.message} Skipping ...`);
  }

  const solFilesInPath = filesInPath.filter(potentialSolFile => potentialSolFile.isFile() && potentialSolFile.name.endsWith(".sol"));
  const directoriesInPath = recurse ? filesInPath.filter(potentialDirectory => potentialDirectory.isDirectory())
    .map(filteredEntry => filteredEntry.name) : [];
  const solRecurseInDirectory = await Promise.all(directoriesInPath.map(directory => getSolFiles(directory, recurse)));
  const solFilesRecurse = solRecurseInDirectory.reduce((a, b) => a.concat(b), []);

  return [
    ...solFilesInPath, 
    ...solFilesRecurse,
  ];
}

async function getStorageCodeFor(basePath: string, solFiles: FileSystemDirectoryEntry[]) {
  const contractSources = await Promise.all(solFiles.map(async (solFile) => ({
    code: await fs.readFile(`${basePath}/${solFile.name}`),
    name: solFile.name,
  })));
  const contractsRegistryCode = `export default {
    ${ contractSources.map(contract => `"${contract.name}": \`${contract.code.toString()}\``).join(",") }
  }`;

  return contractsRegistryCode;
}

function getHederasSettingsFrom(obj) {
  const toReturn = {};

  Object.keys(obj).forEach(oKey => {
    if (oKey.startsWith('HEDERAS_')) {
      toReturn[oKey] = obj[oKey];
    }
  });
  return toReturn;
}
