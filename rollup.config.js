import resolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import json from '@rollup/plugin-json';

import { terser } from 'rollup-plugin-terser';

const production = !process.env.ROLLUP_WATCH;

export default {
    input: 'index.mjs',
    output: [{
        // for Node runtimes
        file: 'dist/hedera-strato.cjs.js',
        format: 'cjs'
    }],
    plugins: [
        commonjs(),
        json(),
        production && terser(),
        resolve()
    ]
};