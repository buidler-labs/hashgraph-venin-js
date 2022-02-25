// Jest Test Environment (JTE) for the hedera-api library, the WebBrowser variant
import { TextDecoder, TextEncoder } from 'util';

import JSDOMEnvironment from 'jest-environment-jsdom';

export default class JestTestEnvironment extends JSDOMEnvironment {
  async setup() {
    await super.setup();

    // Note: Unlike Note environments, we don't check if a default api-session can be constructed here due to the unedrlying 'window' dependency
    //       not being present until the test case is actually executed.

    // Required to solve https://github.com/facebook/jest/issues/4422
    //   see https://github.com/facebook/jest/issues/4422#issuecomment-770274099
    // Unfortunatelly, if we hard-map these values in the jest.config > globals object, nx is not able to load them.
    // That's why this looks to be the best working alternative so far.
    // Inspired from https://github.com/rafaelrpinto/jest-environment-uint8array/blob/master/index.js
    this.global.Uint8Array = Uint8Array;
    this.global.ArrayBuffer = ArrayBuffer;

    // The following fixes https://github.com/jsdom/jsdom/issues/2524
    this.global.TextEncoder = TextEncoder;
    this.global.TextDecoder = TextDecoder;
  }
}
