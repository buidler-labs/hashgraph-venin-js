/* eslint-disable no-undef */

import * as solc from 'solc/wrapper';

/**
 * @param {DedicatedWorkerGlobalScope} self 
 */
export default function (self) {
  self.importScripts("https://binaries.soliditylang.org/bin/soljson-v0.8.9+commit.e5eed63a.js");

  const compiler = solc(self.Module);
  
  self.addEventListener('message', ({ data, type })=> {
    if ('compile' === type) {
      self.postMessage({ 
        data: compiler.compile(code),
        type: 'compile_result' 
      });
    }
  });
  self.postMessage({ type: 'loaded' }); 
}
