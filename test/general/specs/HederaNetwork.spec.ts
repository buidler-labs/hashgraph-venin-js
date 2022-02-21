import {
  describe, expect, it,
} from '@jest/globals';
import { 
  AccountId 
} from '@hashgraph/sdk';

import { 
  HEDERA_CUSTOM_NET_NAME,
  HederaNetwork 
} from '../../../lib/HederaNetwork';

describe('HederaNetwork', () => {
  it('if environment targets a local-net, it should permit instantiating a HederaNetwork provided that a valid address-book can be parsed', async () => {
    const node0Account = new AccountId(2);
    const node1Account = new AccountId(5);
    
    expect(() => new HederaNetwork( 
      { fileChunkSize: 1024 },
      HEDERA_CUSTOM_NET_NAME, {
        "node_0:52111": node0Account,
        "node_1:52111": node1Account
      }
    )).not.toThrowError();
  });
});

