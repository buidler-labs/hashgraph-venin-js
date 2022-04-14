/* eslint-env browser */
/* globals describe, expect, it */

import {
  ApiSession,
  Contract,
  ContractRegistry,
} from './lib.esm/hedera-strato.js';
import BigNumber from 'https://unpkg.com/bignumber.js@9.0.2/bignumber.mjs';

describe('BrowserSmoke', function () {
  it('a simple contract given by path can be compiled, uploaded and executed with the result returned', async () => {
    const { session } = await ApiSession.default();
    const contract = await Contract.newFrom({ path: 'hello_world.sol' });
    const liveContract = await session.upload(contract);
    const greetResponse = await liveContract.greet();

    expect(greetResponse).toEqual('Hello World!');
  }, 30000);

  it('a simple contract given by code can be compiled, uploaded and executed with the result returned', async () => {
    const code = `
    // SPDX-License-Identifier: MIT
    pragma solidity ^0.8.9;

    contract HelloWorld {
      string public greet = "Hello World from code!";
    }`;
    const { session } = await ApiSession.default();
    const contract = await Contract.newFrom({ code });
    const liveContract = await session.upload(contract);
    const greetResponse = await liveContract.greet();

    expect(greetResponse).toEqual('Hello World from code!');
  }, 30000);

  it('given a solidity file with a simple contract, its ABI should be generated allowing for, in browser, session live-contract retrievals', async () => {
    const { session } = await ApiSession.default();
    // Note: this contract has been deployed on testnet only
    const liveContract = await session.getLiveContract({
      abi: ContractRegistry.HelloWorld,
      id: '0.0.30840469',
    });
    const greetResponse = await liveContract.greet();

    expect(greetResponse).toEqual('Hello ABI World!');
  });

  it('a dapp should allow bignumbers to work both as arguments and as returned values', async () => {
    const { session } = await ApiSession.default();
    const contract = await Contract.newFrom({ path: 'bignumbers.sol' });
    const liveContract = await session.upload(contract);
    const plainNumberResponse = await liveContract.grr(42);
    const bigNumberResponse = await liveContract.grr(new BigNumber(82));
    const queryResponse = await liveContract.mrr();

    expect(plainNumberResponse).toBeInstanceOf(BigNumber);
    expect(bigNumberResponse).toBeInstanceOf(BigNumber);
    expect(queryResponse).toBeInstanceOf(BigNumber);
  }, 60000);
});
