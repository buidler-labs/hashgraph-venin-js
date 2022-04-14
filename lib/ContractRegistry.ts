import * as sdkPath from 'path';
import fs from 'fs';

import { Contract } from './static/upload/Contract';
import { Interface } from '@ethersproject/abi';

export class ContractRegistry {
  readonly [k: string]: Promise<Interface> | any;

  public constructor(path: string, recurse: boolean) {
    getSolFiles(path, recurse)
      .map((solFileLocation) => solFileLocation.replace(`${path}/`, ''))
      .forEach((baseStrippedSolFileLocation) => {
        Object.defineProperty(this, baseStrippedSolFileLocation, {
          enumerable: true,
          value: Contract.newFrom({
            ignoreWarnings: true,
            path: sdkPath.isAbsolute(path)
              ? `${path}/${baseStrippedSolFileLocation}.sol`
              : `${baseStrippedSolFileLocation}.sol`,
          })
            .then((contract) => contract.interface)
            .catch((err) => {
              if (
                err.message.indexOf(
                  'Library linking is not currently supported'
                ) !== -1
              ) {
                // No-op
                console.error(
                  'ContractRegistry could not load a Contract due to library linking not currently being supported. This will be supported once https://github.com/buidler-labs/hedera-strato-js/issues/38 is resolved.'
                );
              } else {
                // no mercy
                throw err;
              }
            }),
        });
      });
  }
}

function getSolFiles(path: string, recurse: boolean): string[] {
  let filesInPath = [];
  try {
    filesInPath = fs.readdirSync(path, { withFileTypes: true });
  } catch (e) {
    // TODO: log this once logger is available: `ContractRegistry - Could not read contracts from '${path}': ${e.message} Skipping ...`
  }

  const basePathAppender = (dirEntry: fs.Dirent) => `${path}/${dirEntry.name}`;
  const solFilesInPath = filesInPath
    .filter(
      (potentialSolFile) =>
        potentialSolFile.isFile() && potentialSolFile.name.endsWith('.sol')
    )
    .map(basePathAppender)
    .map((solSuffixedPath) =>
      solSuffixedPath.substring(0, solSuffixedPath.length - 4)
    );
  const directoriesInPath = recurse
    ? filesInPath
        .filter((potentialDirectory) => potentialDirectory.isDirectory())
        .map(basePathAppender)
    : [];
  const solRecurseInDirectory = directoriesInPath.map((directory) =>
    getSolFiles(directory, recurse)
  );
  const solFilesRecurse = solRecurseInDirectory.reduce(
    (a, b) => a.concat(b),
    []
  );

  return [...solFilesInPath, ...solFilesRecurse];
}

export default new ContractRegistry(
  process.env.HEDERAS_CONTRACTS_RELATIVE_PATH || 'contracts',
  process.env.HEDERAS_CONTRACT_REGISTRY_RECURSE === 'true'
);
