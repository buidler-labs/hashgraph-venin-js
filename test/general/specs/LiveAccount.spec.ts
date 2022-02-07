import {
    expect, describe, it,
} from '@jest/globals';

import { ApiSession } from '../../../lib/ApiSession';
import { LiveAccountWithPrivateKey } from '../../../lib/live/LiveAccount';
import { Account, KeyType } from '../../../lib/static/create/Account';
import { getKeyTypeFor } from '../../utils';

describe('LiveAccount', () => {
  it("a session should allow for the creation of no-args Accounts which should default to an ED25519 private-key", async () => {
    const { session } = await ApiSession.default();
    const account = await session.create(new Account());

    expect(account).toBeInstanceOf(LiveAccountWithPrivateKey);
    expect(getKeyTypeFor(account.privateKey)).toEqual(KeyType.ED25519);
  });

  it("a session should allow for the creation of accounts with ECSDA key types if explicitly requested", async () => {
    const { session } = await ApiSession.default();
    const account = await session.create(new Account({ 
      generateKey: true,
      keyType: KeyType.ECSDA 
    }));

    expect(account).toBeInstanceOf(LiveAccountWithPrivateKey);
    expect(getKeyTypeFor(account.privateKey)).toEqual(KeyType.ECSDA);
  });
});
