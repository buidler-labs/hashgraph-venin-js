import resolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import json from '@rollup/plugin-json';
import typescript from '@rollup/plugin-typescript';

import { ModuleKind } from 'typescript';
import { terser } from 'rollup-plugin-terser';

const production = !process.env.ROLLUP_WATCH;

export default {
    input: 'index.ts',
    output: [{
        // for Node runtimes
        file: 'dist/hedera-strato.cjs.js',
        format: 'cjs'
    }],
    plugins: [
        commonjs(),
        typescript({
            module: ModuleKind.ESNext
        }),
        json(),
        production && terser(),
        resolve()
    ]
};