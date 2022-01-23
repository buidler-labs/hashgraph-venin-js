// Jest Test Environment (JTE) for the hedera-api library
import NodeEnvironment from 'jest-environment-node';
import { HederaNetwork } from '../lib/HederaNetwork';

export default class JestTestEnvironment extends NodeEnvironment {
    constructor(config) {
        super(config);
    }
    
    async setup() {
        await super.setup();

        try {
            await HederaNetwork.defaultApiSession();
        } catch (e) {
            throw new Error (
                "Could not retrieve a default-api-session instance! Make sure you have either a .env file present in top-level repo folder. " + 
                "Please have a look at the .env.sample file and generate one before running these tests. " +
                "Otherwise, prepare the runtime environment so that an api-session can be constructed." +
                "We use the default-api-session throughout the test-base."
            );
        }

        // Required to solve https://github.com/facebook/jest/issues/4422
        //   see https://github.com/facebook/jest/issues/4422#issuecomment-770274099
        // Unfortunatelly, if we hard-map these values in the jest.config > globals object, nx is not able to load them.
        // That's why this looks to be the best working alternative so far.
        // Inspired from https://github.com/rafaelrpinto/jest-environment-uint8array/blob/master/index.js
        this.global.Uint8Array = Uint8Array;
        this.global.ArrayBuffer = ArrayBuffer;
    }
}