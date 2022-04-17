/* eslint-env browser */
/* globals importScripts */

import { default as solc } from "solc/wrapper";

importScripts(
  "https://binaries.soliditylang.org/bin/soljson-v0.8.9+commit.e5eed63a.js"
);

const compiler = solc((self as any).Module);

self.addEventListener("message", ({ data }) => {
  if ("compile" === data.type) {
    self.postMessage({
      payload: compiler.compile(data.payload),
      type: "compile_result",
    });
  }
});
self.postMessage({ type: "loaded" });
