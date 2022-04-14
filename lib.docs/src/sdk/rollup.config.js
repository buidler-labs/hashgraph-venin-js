/* eslint-env node */

import { join as pathJoin } from 'path';

import commonjs from '@rollup/plugin-commonjs';
import dotenv from 'dotenv';
import json from '@rollup/plugin-json';
import nodePolyfills from 'rollup-plugin-node-polyfills';
import resolve from '@rollup/plugin-node-resolve';
import { terser } from 'rollup-plugin-terser';

dotenv.config({ path: getPathOf('./.env') });

// Make sure we use the contracts defined for this bundle
process.env.HEDERAS_CONTRACTS_RELATIVE_PATH = './lib.docs/src/strato/contracts';

const extensions = ['.js'];

function getPathOf(file) {
  return pathJoin(__dirname, file);
}

export default async function getConfig() {
  return {
    context: 'window',
    input: './node_modules/@hashgraph/sdk/src/index.js',
    output: [
      {
        file: getPathOf('../../static/js/hashgraph-sdk.js'),
        format: 'esm',
        plugins: [terser()],
        sourcemap: true,
      },
    ],
    plugins: [
      resolve({
        extensions,
        mainFields: ['browser', 'module', 'main'],
        preferBuiltins: false,
      }),
      commonjs({
        esmExternals: true,
        requireReturnsDefault: 'preferred',
      }),
      nodePolyfills({
        sourceMap: true,
      }),
      json(),
    ],
    treeshake: true,
  };
}
