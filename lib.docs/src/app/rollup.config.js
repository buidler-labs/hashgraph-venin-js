/* eslint-env node */

import { join as pathJoin } from 'path';

import babel from '@rollup/plugin-babel';
import resolve from '@rollup/plugin-node-resolve';

function getPathOf(file) {
  return pathJoin(__dirname, file);
}

export default async function getConfig() {
  return {
    context: 'window',
    external: [ 
      '@buidlerlabs/hedera-strato-js',
      'hashconnect-hip-338',
      'lodash-es/merge',
    ],
    input: './main.ts',
    output: [ {
      file: getPathOf('../../static/js/app.js'),
      format: 'esm',
      paths: {
        '@buidlerlabs/hedera-strato-js': '/js/hedera-strato.js',
        'hashconnect-hip-338': '/js/hashconnect-hip-338.js',
        'lodash-es/merge': 'https://unpkg.com/lodash-es@4.17.21/merge.js',
      },
      sourcemap: true,
    } ],
    plugins: [
      resolve({
        extensions: [ '.ts' ],
        mainFields: [ "browser", "module", "main" ],
        preferBuiltins: false,
        rootDir: getPathOf('.'),
      }),
      babel({ 
        babelHelpers: 'runtime', 
        exclude: './node_modules/**',
        extensions: [ '.ts' ],
        include: ['lib/**/*.ts'], 
        plugins: [
          ["@babel/plugin-transform-runtime", { "regenerator": true }],
        ],
        presets: [
          ['@babel/env', { targets: "> 0.25%, not dead" }], 
          ['@babel/typescript'],
        ],
      }),
    ],
    treeshake: true,
  }
}
