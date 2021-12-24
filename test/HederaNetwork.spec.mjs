import {
  HEDERA_CUSTOM_NET_NAME,
  HederaNetwork,
} from '../lib/HederaNetwork.mjs';
import {
  afterAll, beforeAll,
  describe, expect, it,
  jest,
} from '@jest/globals';

import { CredentialsInvalidError } from '../lib/errors/CredentialsInvalidError.mjs';
import { EnvironmentInvalidError } from '../lib/errors/EnvironmentInvalidError.mjs';
import { AccountId } from '@hashgraph/sdk';

describe('HederaNetwork', () => {
  const ORIGINAL_ENV = process.env;

  beforeAll(() => {
    try {
      HederaNetwork.validateOperator({
        id: ORIGINAL_ENV.HEDERA_OPERATOR_ID,
        key: ORIGINAL_ENV.HEDERA_OPERATOR_KEY
      });
    } catch (e) {
      throw new Error(`Please make sure to provide both a HEDERA_OPERATOR_ID and a HEDERA_OPERATOR_KEY in order to run the tests: ${e.message}`);
    }
  });

  afterAll(() => {
    process.env = ORIGINAL_ENV;
  });

  it('if environment is sane, it should properly instantiate the default api-instance', async () => {
    await expect(HederaNetwork.defaultApiSession()).resolves.not.toBeNull();
  });

  it('if environment is not sane, it should error out when trying to instantiate the default api-session instance', async () => {
    // HEDERA_NETWORK part
    await expectDefaultApiSessionToThrowFor(undefined, ORIGINAL_ENV.HEDERA_NODES, ORIGINAL_ENV.HEDERA_OPERATOR_ID, ORIGINAL_ENV.HEDERA_OPERATOR_KEY, EnvironmentInvalidError);
    await expectDefaultApiSessionToThrowFor("some non-existing network", ORIGINAL_ENV.HEDERA_NODES, ORIGINAL_ENV.HEDERA_OPERATOR_ID, ORIGINAL_ENV.HEDERA_OPERATOR_KEY, EnvironmentInvalidError);

    // HEDERA_NODES part (if applicable)
    if (ORIGINAL_ENV.HEDERA_NETWORK === HEDERA_CUSTOM_NET_NAME) {
      await expectDefaultApiSessionToThrowFor(ORIGINAL_ENV.HEDERA_NETWORK, "some totally bad node def", ORIGINAL_ENV.HEDERA_OPERATOR_ID, ORIGINAL_ENV.HEDERA_OPERATOR_KEY, EnvironmentInvalidError);
      await expectDefaultApiSessionToThrowFor(ORIGINAL_ENV.HEDERA_NETWORK, "127.0.0.1:50211", ORIGINAL_ENV.HEDERA_OPERATOR_ID, ORIGINAL_ENV.HEDERA_OPERATOR_KEY, EnvironmentInvalidError);
    }

    // OPERATOR_ID part
    await expectDefaultApiSessionToThrowFor(ORIGINAL_ENV.HEDERA_NETWORK, ORIGINAL_ENV.HEDERA_NODES, undefined, ORIGINAL_ENV.HEDERA_OPERATOR_KEY, CredentialsInvalidError);
    await expectDefaultApiSessionToThrowFor(ORIGINAL_ENV.HEDERA_NETWORK, ORIGINAL_ENV.HEDERA_NODES, "some invalid id", ORIGINAL_ENV.HEDERA_OPERATOR_KEY, CredentialsInvalidError);

    // OPERATOR_KEY part
    await expectDefaultApiSessionToThrowFor(ORIGINAL_ENV.HEDERA_NETWORK, ORIGINAL_ENV.HEDERA_NODES, ORIGINAL_ENV.HEDERA_OPERATOR_ID, undefined, CredentialsInvalidError);
    await expectDefaultApiSessionToThrowFor(ORIGINAL_ENV.HEDERA_NETWORK, ORIGINAL_ENV.HEDERA_NODES, ORIGINAL_ENV.HEDERA_OPERATOR_ID, "some invalid key", CredentialsInvalidError);
  });

  it('if environment targets a local-net, it should permit instantiating a HederaNetwork provided that a valid address-book can be parsed', async () => {
    const node0Account = new AccountId(2);
    const node1Account = new AccountId(5);
    const hederaNet = HederaNetwork.for({ 
      name: HEDERA_CUSTOM_NET_NAME, 
      nodes: {
        "node_0": node0Account,
        "node_1": node1Account
      }
    });
    const clientNetwork = hederaNet.client.network;

    expect(clientNetwork["node_0"]).toEqual(node0Account);
    expect(clientNetwork["node_1"]).toEqual(node1Account);
  });

  async function expectDefaultApiSessionToThrowFor(networkName, nodes, operatorId, operatorKey, expectedErrorType) {
    try {
      jest.resetModules();
      process.env = { 
        HEDERA_NETWORK: networkName,
        HEDERA_NODES: nodes,
        HEDERA_OPERATOR_ID: operatorId,
        HEDERA_OPERATOR_KEY: operatorKey
      };
      const localisedHederaNetwork = require('../lib/HederaNetwork');

      await localisedHederaNetwork.HederaNetwork.defaultApiSession();
      return Promise.reject('Test should have thrown an exception by now but it did not.');
    } catch(e) {
      expect(e.constructor.name).toEqual(expectedErrorType.name);
    }
  }
});
