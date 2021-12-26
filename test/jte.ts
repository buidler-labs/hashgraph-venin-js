// Jest Test Environment (JTE) for the hedera-api library
import fs from 'fs';

import NodeEnvironment from 'jest-environment-node';
import { HederaNetwork } from '../lib/HederaNetwork';
import { Contract } from '../lib/static/Contract.mjs';
import { read } from './utils';

export default class JestTestEnvironment extends NodeEnvironment {
    constructor(config) {
        super(config);

        if (!fs.existsSync("./.env")) {
            throw new Error(
                "Could not find any .env file present in top-level repo folder. " + 
                "Please have a look at the .env.sample file and generate one before running these tests. " +
                "We need it to load the HederaNetwork.defaultApiSession instance which is the session used throughout the test-base."
            );
        }
    }
    
    async setup() {
        await super.setup();

        // Required to solve https://github.com/facebook/jest/issues/4422
        //   see https://github.com/facebook/jest/issues/4422#issuecomment-770274099
        // Unfortunatelly, if we hard-map these values in the jest.config > globals object, nx is not able to load them.
        // That's why this looks to be the best working alternative so far.
        // Inspired from https://github.com/rafaelrpinto/jest-environment-uint8array/blob/master/index.js
        this.global.Uint8Array = Uint8Array;
        this.global.ArrayBuffer = ArrayBuffer;
    }

    async handleTestEvent(ev) {
        if (ev.name === 'setup') {
            const originalIt = ev.runtimeGlobals.it;

            // Try to reduce LiveContract boiler-plate when testing against Solidity-by-Example contracts by looking at the test-name, figguring out the
            // targeted contract file-name, uploading it and passing the live-contract instance directly to the test-function. 
            ev.runtimeGlobals.it = (testName, fn, timeout) => {
                let fnToExecute = fn;
                const solidityByExampleTestNameReferenceRegex = new RegExp(/given the.*solidity-by-example\s*>\s*([a-zA-Z ]+) +code/gm);
                const referecendSolidityByExampleCodeName = solidityByExampleTestNameReferenceRegex.exec(testName);

                if (referecendSolidityByExampleCodeName) {
                    // We do have a "Solidity-by-Example" (SBE) code reference. Upload and make available the live-contract to the test
                    fnToExecute = async () => {
                        const sbeFileName = referecendSolidityByExampleCodeName[1].toLowerCase().split(' ').join('_');
                        const hapiSession = await HederaNetwork.defaultApiSession(this.global.process.env);
                        const sbeContract = await Contract.newFrom({ code: read({ contract: `solidity-by-example/${sbeFileName}` }) });
                        const liveContract = await hapiSession.upload(sbeContract);

                        return fn(liveContract);
                    }
                }
                return originalIt(testName, fnToExecute, timeout);
            };

            // Tie the inner it-related methods
            Object.keys(originalIt).forEach(itMethod => ev.runtimeGlobals.it[itMethod] = originalIt[itMethod]);
        }
    }
}