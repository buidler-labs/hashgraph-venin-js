import { ApiSession } from './lib.esm/hedera-strato.js';

describe('BrowserSmoke', function () {
  it("a default session can be constructed", async () => {
    await ApiSession.default();
  });
})