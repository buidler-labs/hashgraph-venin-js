// Jest Test Environment (JTE) for the hedera-api library
import fs from 'fs';

import NodeEnvironment from 'jest-environment-node';

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
}