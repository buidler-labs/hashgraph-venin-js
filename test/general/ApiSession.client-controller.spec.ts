import {
    describe, expect, it,
    jest
} from '@jest/globals';
import { AccountId, PrivateKey } from '@hashgraph/sdk';

import { Account } from '../../lib/static/create/Account';
import { ApiSession } from '../../lib/ApiSession';
import { HederaClientController } from '../../lib/client/controller/HederaClientController';
import { DefaultPrivateKeyClientController } from '../../lib/client/controller/DefaultPrivateKeyClientController';

describe('ApiSession.ClientController', () => {
  it('a Hedera Client should allow full swapping of the underlying operator if a Hedera Client Controller is in charge of it', async () => {
    const { controller, session } = await ApiSession.default({
      client: {
        controller: {
          type: "Hedera"
        }
      }
    });
    const account = await session.create(new Account());

    expect(controller).toBeInstanceOf(HederaClientController);
    controller.changeAccount(account.id, account.privateKey);
    expect(session.accountId.toString()).toEqual(account.id.toString());
    expect(session.publicKey.toStringDer()).toEqual(account.privateKey.publicKey.toStringDer());
  });

  it('a Default PrivateKey Client should allow full swapping of the underlying operator if a Default PrivateKey Controller is being used', async () => {
    const privateKey = PrivateKey.generateED25519();
    const { controller, session } = await ApiSession.default({
      client: {
        controller: {
          type: "DefaultPrivateKey",
          default: {
            operatorKey: privateKey.toStringDer()
          }
        }
      }
    });
    const accountId = AccountId.fromString("0.0.69");

    expect(controller).toBeInstanceOf(DefaultPrivateKeyClientController);
    controller.changeAccount(accountId);
    expect(session.publicKey.toStringDer()).toEqual(privateKey.publicKey.toStringDer());
  });
});
