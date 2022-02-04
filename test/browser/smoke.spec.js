import { ApiSession } from './lib.esm/index.js';

describe('BrowserSmoke', function () {
  it("a default session can be constructed", async () => {
    await ApiSession.default();
  });
})