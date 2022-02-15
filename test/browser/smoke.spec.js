import { ApiSession, Contract } from './lib.esm/hedera-strato.js';

describe('BrowserSmoke', function () {
  it("a default session can be constructed", async () => {
    await Contract.newFrom({ code: 'contract A {}' });
  });
})