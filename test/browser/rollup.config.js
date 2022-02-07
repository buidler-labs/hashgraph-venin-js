import { join as pathJoin } from 'path';
import { readFileSync } from 'fs';

import babel from '@rollup/plugin-babel';
import resolve from '@rollup/plugin-node-resolve';
import replace from "@rollup/plugin-replace";
import { terser } from "rollup-plugin-terser";
import virtual from '@rollup/plugin-virtual';
import commonjs from '@rollup/plugin-commonjs';
import json from '@rollup/plugin-json';

import dotenv from 'dotenv';
dotenv.config();

const extensions = ['.js', '.ts' ];

function getPathOf(file) {
  return pathJoin(__dirname, file);
}

function getShimContent(file) {
  const shimPath = getPathOf(file);

  return readFileSync(shimPath).toString('utf-8');
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

export default {
  input: getPathOf('../../index.ts'),
  context: 'window',
  treeshake: true,
  output: [
    {
      file: getPathOf('./lib.esm/hedera-strato.js'),
      format: 'esm',
      plugins: [terser()],
      sourcemap: true
    }
  ],
  plugins: [
    babel({ 
        babelHelpers: 'runtime', 
        include: ['lib/**/*.ts'], 
        exclude: './node_modules/**',
        extensions,
        plugins: [
          ["@babel/plugin-transform-runtime", { "regenerator": true }]
        ],
        presets: [
          ['@babel/env', { targets: "> 0.25%, not dead" }], 
          ['@babel/typescript']
        ]
    }),
    virtual({
        'dotenv': getShimContent("./shims/dotenv.js"),
        'lib/SolidityCompiler': getShimContent("./shims/SolidityCompiler.js"),
        'lib/StratoLogger': getShimContent("./shims/StratoLogger.js")
    }),
    replace({
        preventAssignment: true,
        values: {
          // don't take away the HEDERAS_ENV_PATH otherwise ApiSession.default definition will fail
          "process.env.HEDERAS_ENV_PATH": process.env.HEDERAS_ENV_PATH,
          "process.env": JSON.stringify(getHederasSettingsFrom(process.env))
        }
    }),
    json(),
    commonjs(),
    resolve({
        extensions,
        preferBuiltins: false,
        mainFields: ["browser", "module", "main"]
    })
  ]
}