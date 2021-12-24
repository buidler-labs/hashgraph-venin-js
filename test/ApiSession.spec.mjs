import {
  describe, expect, it,
} from '@jest/globals';

import { read } from './utils.mjs';
import { Contract } from '../lib/static/Contract.mjs';
import { HederaNetwork } from '../lib/HederaNetwork.mjs';

describe('ApiSession', () => {
  it('given enough hbar, uploading a simple solidity contract should succede', async () => {
    const session = await HederaNetwork.defaultApiSession();
    const helloWorldContract = await Contract.newFrom({ code: read({ contract: 'solidity-by-example/hello_world' }) });
    
    await expect(session.upload(helloWorldContract)).resolves.not.toThrow();
  });
});
