import { join as pathJoin } from 'path';
import { readFileSync } from 'fs';

import babel from '@rollup/plugin-babel';
import resolve from '@rollup/plugin-node-resolve';
import replace from "@rollup/plugin-replace";
import { terser } from "rollup-plugin-terser";
import virtual from '@rollup/plugin-virtual';
import commonjs from '@rollup/plugin-commonjs';
import json from '@rollup/plugin-json';
import WebWorkerLoader from 'rollup-plugin-web-worker-loader';
import nodePolyfills from 'rollup-plugin-node-polyfills';

import dotenv from 'dotenv';
dotenv.config();

const extensions = ['.js', '.ts' ];

function getPathOf(file) {
  return pathJoin(__dirname, file);
}

function getWebSourceContent(file) {
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

export default async function getConfig() {
  const webWorkerLoaderConfig = { 
    pattern: /web-worker:(.+)/, 
    targetPlatform: 'browser'
  };
  const webWorkerLoader = WebWorkerLoader(webWorkerLoaderConfig);

  return {
    input: getPathOf('../../index.ts'),
    context: 'window',
    treeshake: true,
    output: [ {
      file: getPathOf('./lib.esm/hedera-strato.js'),
      format: 'esm',
      plugins: [terser()],
      sourcemap: true
    } ],
    plugins: [
      nodePolyfills({
        crypto: false
      }),
      {
        ...webWorkerLoader,
        resolveId(importee, importer) {
          const match = importee.match(webWorkerLoaderConfig.pattern);

          if (match && match.length) {
            const name = match[match.length - 1];

            importee = `web-worker:${getPathOf(name)}`;
          }
          return webWorkerLoader.resolveId(importee, importer);
        }
      },
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
        'dotenv': getWebSourceContent("./shims/dotenv.js"),
        'lib/SolidityCompiler': getWebSourceContent("./shims/SolidityCompiler.js"),
        'lib/StratoLogger': getWebSourceContent("./shims/StratoLogger.js"),
      }),
      replace({
        preventAssignment: true,
        values: {
        // don't take away the HEDERAS_ENV_PATH otherwise ApiSession.default definition will fail
          "process.env.HEDERAS_ENV_PATH": process.env.HEDERAS_ENV_PATH,
          'process.env.NODE_ENV': "'test'",
          "process.env": JSON.stringify(getHederasSettingsFrom(process.env))
        }
      }),
      json(),
      commonjs(),
      resolve({
        extensions,
        mainFields: ["browser", "module", "main"],
        preferBuiltins: false,
      })
    ]
  }
}
