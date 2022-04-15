/* eslint-env node */

import { join as pathJoin } from "path";

import babel from "@rollup/plugin-babel";
import commonjs from "@rollup/plugin-commonjs";
import resolve from "@rollup/plugin-node-resolve";

function getPathOf(file) {
  return pathJoin(__dirname, file);
}

export default async function getConfig() {
  return {
    context: "window",
    external: ["@hashgraph/sdk"],
    input: "./src/wallet.ts",
    output: [
      {
        file: getPathOf("../../static/js/hashconnect-hip-338.js"),
        format: "esm",
        paths: {
          "@hashgraph/sdk": "/js/hashgraph-sdk.js",
        },
        sourcemap: true,
      },
    ],
    plugins: [
      resolve({
        extensions: [".ts"],
        mainFields: ["browser", "module", "main"],
        preferBuiltins: false,
        rootDir: getPathOf("."),
      }),
      commonjs({
        esmExternals: true,
        requireReturnsDefault: "preferred",
      }),
      babel({
        babelHelpers: "runtime",
        extensions: [".ts"],
        plugins: [["@babel/plugin-transform-runtime", { regenerator: true }]],
        presets: [
          ["@babel/env", { targets: "> 0.25%, not dead" }],
          ["@babel/typescript"],
        ],
      }),
    ],
    treeshake: true,
  };
}
