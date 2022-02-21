/* eslint-env node */

import { join as pathJoin } from 'path';

import alias from '@rollup/plugin-alias';
import babel from '@rollup/plugin-babel';
import commonjs from '@rollup/plugin-commonjs';
import json from '@rollup/plugin-json';
import nodePolyfills from 'rollup-plugin-node-polyfills';
import replace from "@rollup/plugin-replace";
import resolve from '@rollup/plugin-node-resolve';
import { terser } from "rollup-plugin-terser";
import webWorkerLoader from 'rollup-plugin-web-worker-loader';
import { rollupImportMapPlugin } from "rollup-plugin-import-map";

import dotenv from 'dotenv';
dotenv.config({ path: getPathOf('./.env') });

const extensions = ['.js', '.ts' ];

function getPathOf(file) {
  return pathJoin(__dirname, file);
}

function getHederasSettingsFrom(obj) {
  let toReturn = {};

  Object.keys(obj).forEach(oKey => {
    if (oKey.startsWith('HEDERAS_')) {
      toReturn[oKey] = obj[oKey];
    }
  });
  return toReturn;
}

export default async function getConfig() {
  return {
    context: 'window',
    input: './lib/index.ts',
    output: [ {
      file: getPathOf('./lib.esm/hedera-strato.js'),
      format: 'esm',
      plugins: [terser()],
      sourcemap: true,
    } ],
    plugins: [
      rollupImportMapPlugin({
        imports: {
          "bignumber.js": "https://unpkg.com/bignumber.js@9.0.2/bignumber.mjs"
        }
      }),
      webWorkerLoader({
        sourcemap: true,
      }),
      alias({
        entries: [
          { find: 'dotenv', replacement: getPathOf("./polyfills/dotenv.js") },
          { find: /.*SolidityCompiler.*/, replacement: getPathOf("./polyfills/SolidityCompiler.js") },
          { find: /.*StratoLogger.*/, replacement: getPathOf("./polyfills/StratoLogger.js") },

          // Alias-ing browser specific implementations
          { find: /(.*encoding\/Hex.*)/, replacement: '$1.native' }
        ],
      }),
      resolve({
        // We need to dedupe the sdk itself to forcefully look in the current dir's node_modules to pick up that version of it otherwise, 
        // due to multiple issues in the SDK code base, the strato runtime might fail in all sorts of ways.
        // TODO: once sdk is stable, this won't be required. Remove package.json from this directory as well.
        dedupe: [ '@hashgraph/sdk' ],
        extensions,
        mainFields: [ "browser", "module", "main" ],
        preferBuiltins: false,
        rootDir: getPathOf('.'),
      }),
      commonjs({
        esmExternals: true,
        requireReturnsDefault: "preferred",
      }),
      nodePolyfills({
        sourceMap: true,
      }),
      babel({ 
        babelHelpers: 'runtime', 
        exclude: './node_modules/**',
        extensions,
        include: ['lib/**/*.ts'], 
        plugins: [
          ["@babel/plugin-transform-runtime", { "regenerator": true }],
        ],
        presets: [
          ['@babel/env', { targets: "> 0.25%, not dead" }], 
          ['@babel/typescript'],
        ],
      }),
      replace({
        preventAssignment: true,
        values: {
          // don't take away the HEDERAS_ENV_PATH otherwise ApiSession.default definition will fail
          "process.env": JSON.stringify(getHederasSettingsFrom(process.env)),
          "process.env.HEDERAS_ENV_PATH": process.env.HEDERAS_ENV_PATH,
          'process.env.NODE_ENV': "'production'",
        },
      }),
      json(),
    ],
    treeshake: true,
  }
}
