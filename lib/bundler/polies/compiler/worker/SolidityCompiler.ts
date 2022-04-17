// @ts-ignore: Provided by bundler
// Note: keep this as a js extension. Babel doesn't map this to a js automatically.
//       That's ok since it's not meant to be executed directy anyway.
import CompilerWorker from "web-worker:./SolidityCompiler.worker.js";
// @ts-ignore: Provided by bundler
import ContractsInFileStorage from "ContractsInFileStorage";

/* eslint-disable no-undef */
export const VIRTUAL_SOURCE_CONTRACT_FILE_NAME = "__contract__.sol";

let compilerWorker = null;
let hasCompilerLoaded = false;

function triggerCompile(code) {
  const solInput = {
    language: "Solidity",
    settings: {
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
    sources: { [VIRTUAL_SOURCE_CONTRACT_FILE_NAME]: { content: code } },
  };

  if (!compilerWorker) {
    throw new Error("First initialize the compile web-worker.");
  }

  compilerWorker.postMessage({
    payload: JSON.stringify(solInput),
    type: "compile",
  });
}

export class SolidityCompiler {
  static compile({ code, path }) {
    if (!window.Worker) {
      throw new Error(
        "Your browser does not support WebWorkers therefore Contract compilation is not available."
      );
    }
    if (path !== undefined) {
      if (path.startsWith("..")) {
        throw new Error(
          "Cannot load contracts which are outside the bundled designated folder from which the 'ContractsInFileStorage' is constructed."
        );
      } else if (path.startsWith("./")) {
        path = path.substring(2);
      }
      if (ContractsInFileStorage[path] !== undefined) {
        code = ContractsInFileStorage[path];
      } else if (!code || path !== undefined) {
        throw new Error(
          "Only direct code compilation is fully supported by the browser at this point. Path loading is limited to the pre-bundled contracts stored in 'ContractsInFileStorage'."
        );
      }
    }
    if (!compilerWorker) {
      compilerWorker = new CompilerWorker();
    } else {
      triggerCompile(code);
    }

    return new Promise((accept, reject) => {
      compilerWorker.onmessage = function ({ data }) {
        if (data.type === "compile_result") {
          accept(data.payload);
        } else if (data.type === "loaded" || hasCompilerLoaded) {
          hasCompilerLoaded = true;
          triggerCompile(code);
          return;
        } else {
          console.log("Unhandled message received from web-worker:", data);
        }
      };
      compilerWorker.onerror = function (e) {
        reject(e);
      };
    });
  }
}
