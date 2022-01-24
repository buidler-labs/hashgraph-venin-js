import * as fs from 'fs/promises';

import {
  afterAll, beforeAll,
  describe, expect, it,
  jest,
} from '@jest/globals';
import { AccountId } from '@hashgraph/sdk';

import {
  HEDERA_CUSTOM_NET_NAME,
  HederaNetwork,
} from '../../../lib/HederaNetwork';

import { CredentialsInvalidError } from '../../../lib/errors/CredentialsInvalidError';
import { EnvironmentInvalidError } from '../../../lib/errors/EnvironmentInvalidError';

describe('HederaNetwork', () => {
  const ORIGINAL_ENV = process.env;

  beforeAll(() => {
    try {
      HederaNetwork.validateOperator({
        id: ORIGINAL_ENV.HEDERAS_OPERATOR_ID,
        key: ORIGINAL_ENV.HEDERAS_OPERATOR_KEY
      });
    } catch (e) {
      throw new Error(`Please make sure to provide both a HEDERAS_OPERATOR_ID and a HEDERAS_OPERATOR_KEY in order to run the tests: ${e.message}`);
    }
  });

  afterAll(() => {
    process.env = ORIGINAL_ENV;
  });

  it('if environment is sane, it should properly instantiate the default api-instance', async () => {
    await expect(HederaNetwork.defaultApiSession()).resolves.not.toBeNull();
  });

  it('if environment is not sane, it should error out when trying to instantiate the default api-session instance', async () => {
    // HEDERAS_NETWORK part
    await expectDefaultApiSessionToThrowFor(undefined, ORIGINAL_ENV.HEDERAS_NODES, ORIGINAL_ENV.HEDERAS_OPERATOR_ID, ORIGINAL_ENV.HEDERAS_OPERATOR_KEY, EnvironmentInvalidError);
    await expectDefaultApiSessionToThrowFor("some non-existing network", ORIGINAL_ENV.HEDERAS_NODES, ORIGINAL_ENV.HEDERAS_OPERATOR_ID, ORIGINAL_ENV.HEDERAS_OPERATOR_KEY, EnvironmentInvalidError);

    // HEDERAS_NODES part (if applicable)
    if (ORIGINAL_ENV.HEDERAS_NETWORK === HEDERA_CUSTOM_NET_NAME) {
      await expectDefaultApiSessionToThrowFor(ORIGINAL_ENV.HEDERAS_NETWORK, "some totally bad node def", ORIGINAL_ENV.HEDERAS_OPERATOR_ID, ORIGINAL_ENV.HEDERAS_OPERATOR_KEY, EnvironmentInvalidError);
      await expectDefaultApiSessionToThrowFor(ORIGINAL_ENV.HEDERAS_NETWORK, "127.0.0.1:50211", ORIGINAL_ENV.HEDERAS_OPERATOR_ID, ORIGINAL_ENV.HEDERAS_OPERATOR_KEY, EnvironmentInvalidError);
    }

    // OPERATOR_ID part
    await expectDefaultApiSessionToThrowFor(ORIGINAL_ENV.HEDERAS_NETWORK, ORIGINAL_ENV.HEDERAS_NODES, undefined, ORIGINAL_ENV.HEDERAS_OPERATOR_KEY, CredentialsInvalidError);
    await expectDefaultApiSessionToThrowFor(ORIGINAL_ENV.HEDERAS_NETWORK, ORIGINAL_ENV.HEDERAS_NODES, "some invalid id", ORIGINAL_ENV.HEDERAS_OPERATOR_KEY, CredentialsInvalidError);

    // OPERATOR_KEY part
    await expectDefaultApiSessionToThrowFor(ORIGINAL_ENV.HEDERAS_NETWORK, ORIGINAL_ENV.HEDERAS_NODES, ORIGINAL_ENV.HEDERAS_OPERATOR_ID, undefined, CredentialsInvalidError);
    await expectDefaultApiSessionToThrowFor(ORIGINAL_ENV.HEDERAS_NETWORK, ORIGINAL_ENV.HEDERAS_NODES, ORIGINAL_ENV.HEDERAS_OPERATOR_ID, "some invalid key", CredentialsInvalidError);
  });

  it('if environment targets a local-net, it should permit instantiating a HederaNetwork provided that a valid address-book can be parsed', async () => {
    const node0Account = new AccountId(2);
    const node1Account = new AccountId(5);
    
    expect(() => HederaNetwork.for({ 
      name: HEDERA_CUSTOM_NET_NAME, 
      nodes: {
        "node_0:52111": node0Account,
        "node_1:52111": node1Account
      }
    })).not.toThrowError();
  });

  it('if environment params are not provided yet a dot-env file is present, dot-env properties should be used for default-session instantiation', async () => {
    const tmpDotEnvFileName = `.env_testTemp`;
    const tmpDotEnvFileContent = {
      HEDERAS_NETWORK: HEDERA_CUSTOM_NET_NAME,
      HEDERAS_NODES: "A#69",
      HEDERAS_OPERATOR_ID: "B",
      HEDERAS_OPERATOR_KEY: "C"
    };
    const spyHederaNetworkLogin = jest.fn();
    const spyHederaNetworkFor = jest.spyOn(HederaNetwork, "for").mockReturnValue(<any>{ login: spyHederaNetworkLogin });

    await fs.writeFile(tmpDotEnvFileName, Object.keys(tmpDotEnvFileContent).map(key => `${key}=${tmpDotEnvFileContent[key]}`).join('\n'));
    try {
      await HederaNetwork.defaultApiSession({ env: {}, path: tmpDotEnvFileName });

      expect(spyHederaNetworkFor.mock.calls.length === 1).toBeTruthy();
      expect(spyHederaNetworkFor.mock.calls[0][0]).toMatchObject({
        name: tmpDotEnvFileContent.HEDERAS_NETWORK,
        nodes: { "A": new AccountId(69) }
      });
      expect(spyHederaNetworkLogin.mock.calls.length === 1).toBeTruthy();
      expect(spyHederaNetworkLogin.mock.calls[0][0]).toMatchObject({
        operatorId: tmpDotEnvFileContent.HEDERAS_OPERATOR_ID,
        operatorKey: tmpDotEnvFileContent.HEDERAS_OPERATOR_KEY
      });
    } finally {
      await fs.rm(tmpDotEnvFileName);
    }
  });

  async function expectDefaultApiSessionToThrowFor(networkName, nodes, operatorId, operatorKey, expectedErrorType) {
    try {
      jest.resetModules();
      process.env = { 
        HEDERAS_NETWORK: networkName,
        HEDERAS_NODES: nodes,
        HEDERAS_OPERATOR_ID: operatorId,
        HEDERAS_OPERATOR_KEY: operatorKey
      };
      const localisedHederaNetwork = require('../../../lib/HederaNetwork');

      await localisedHederaNetwork.HederaNetwork.defaultApiSession();
      return Promise.reject('Test should have thrown an exception by now but it did not.');
    } catch(e) {
      expect(e.constructor.name).toEqual(expectedErrorType.name);
    }
  }
});
