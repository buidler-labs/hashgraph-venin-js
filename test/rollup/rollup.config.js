/* eslint-env node */

import { join as pathJoin } from 'path';

import babel from '@rollup/plugin-babel';
import commonjs from '@rollup/plugin-commonjs';
import json from '@rollup/plugin-json';
import nodePolyfills from 'rollup-plugin-node-polyfills';
import resolve from '@rollup/plugin-node-resolve';
import strato from '@buidlerlabs/hedera-strato-js/rollup-plugin';
import { terser } from "rollup-plugin-terser";

import dotenv from 'dotenv';
dotenv.config();

const extensions = ['.js', '.ts' ];

function getPathOf(file) {
  return pathJoin(__dirname, file);
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
      strato({ 
        contracts: {
          path: pathJoin(__dirname, 'contracts'),
        },
        includeCompiler: true,
        sourceMap: true, 
      }),
      resolve({
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
      json(),
    ],
    treeshake: true,
  }
}
