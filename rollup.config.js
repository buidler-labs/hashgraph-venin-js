import resolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import json from '@rollup/plugin-json';

import sourcemaps from 'rollup-plugin-sourcemaps';
import { terser } from 'rollup-plugin-terser';

const production = !process.env.ROLLUP_WATCH;

export default {
    input: 'build/index.js',
    output: [{
        file: 'dist/hedera-strato.umd.js',
        format: 'umd',
        name: 'hedera-strato',
        sourcemap: true
    }],
    plugins: [
        commonjs(),
        json(),
        production && terser(),
        resolve(),
        sourcemaps()
    ]
};