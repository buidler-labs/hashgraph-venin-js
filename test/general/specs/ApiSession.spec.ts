import {
  describe, expect, it,
} from '@jest/globals';

import { read } from '../../utils';
import { Contract } from '../../../lib/static/Contract';
import { HederaNetwork } from '../../../lib/HederaNetwork';
import { TokenType } from '@hashgraph/sdk';
import { LiveToken } from '../../../lib/live/LiveToken';

describe('ApiSession', () => {
  it('given enough hbar, uploading a simple solidity contract should succede', async () => {
    const session = await HederaNetwork.defaultApiSession();
    const helloWorldContract = await Contract.newFrom({ code: read({ contract: 'solidity-by-example/hello_world' }) });
    
    await expect(session.upload(helloWorldContract)).resolves.not.toThrow();
  });

  it('given sufficient, yet minimal, information, creating a fungible token should succede', async () => {
    const session = await HederaNetwork.defaultApiSession();

    await expect(session.createToken({ 
      name: "PLM", 
      symbol: "$",
      type: TokenType.FungibleCommon
    })).resolves.toBeInstanceOf(LiveToken);
  });
});
