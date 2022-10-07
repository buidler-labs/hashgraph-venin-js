// Jest Test Environment (JTE) for the hedera-api library
import { ApiSession } from "../lib/ApiSession";
import NodeEnvironment from "jest-environment-node";

export default class JestTestEnvironment extends NodeEnvironment {
  async setup() {
    await super.setup();

    try {
      // Test out if we can create a default api-session required to run the tests with
      // Also make sure to turn off logging so as to not over-pollute the console
      await ApiSession.default({
        logger: {
          enabled: false,
        },
      });
    } catch (e) {
      throw new Error(
        "Could not retrieve a default-api-session instance! Make sure you have either a .env file present in top-level repo folder. " +
          "Please have a look at the .env.sample file and generate one before running these tests. " +
          "Otherwise, prepare the runtime environment so that an api-session can be constructed." +
          "We use the default-api-session throughout the test-base." +
          `Full error message: ${e.message}`
      );
    }

    // Required to solve https://github.com/facebook/jest/issues/4422
    //   see https://github.com/facebook/jest/issues/4422#issuecomment-770274099
    // Unfortunately, if we hard-map these values in the jest.config > globals object, nx is not able to load them.
    // That's why this looks to be the best working alternative so far.
    // Inspired from https://github.com/rafaelrpinto/jest-environment-uint8array/blob/master/index.js
    this.global.Uint8Array = Uint8Array;
    this.global.ArrayBuffer = ArrayBuffer;
  }
}
