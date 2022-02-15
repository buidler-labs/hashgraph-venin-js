import CompilerWorker from 'web-worker:./shims/SolidityCompiler.worker.js';

/* eslint-disable no-undef */
export const VIRTUAL_SOURCE_CONTRACT_FILE_NAME = '__contract__.sol';

let compilerWorker = null;
let hasCompilerLoaded = false;

export class SolidityCompiler {
  static compile({ code, path }) {
    if (!window.Worker) {
      throw new Error('Your browser does not support WebWorkers therefore Contract compilation is not available.');
    }
    if (!code || path !== undefined) {
      throw new Error('Only direct code compilation is supported by the browser at this poin. Providing a path to the top-level solidity code is not provided.');
    }
    if (!compilerWorker) {
      compilerWorker = new CompilerWorker();
    }

    const solInput = {
      language: 'Solidity',
      settings: {
        metadata: {
          // disabling metadata hash embedding to make the bytecode generation predictable at test-time
          // see https://docs.soliditylang.org/en/latest/metadata.html#encoding-of-the-metadata-hash-in-the-bytecode
          bytecodeHash: process.env.NODE_ENV === 'test' ? 'none' : 'ipfs'
        },
        outputSelection: {
          '*': {
            '*': ['*']
          }
        }
      },
      sources: { [VIRTUAL_SOURCE_CONTRACT_FILE_NAME]: { code }},
    };

    return new Promise((accept, reject) => {
      compilerWorker.onmessage = function({ type, data }) {
        if (type === 'loaded' || hasCompilerLoaded) {
          hasCompilerLoaded = true;
          compilerWorker.postMessage({ 
            data: JSON.stringify(solInput),
            type: 'compile'
          });
          return;
        }
        accept(data);
      };
      compilerWorker.onerror = function(e) {
        reject(e);
      };
    });
  }
} 