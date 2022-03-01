/* eslint-env browser */
/* globals describe, expect, it */ 

import { ApiSession, Contract } from './lib.esm/hedera-strato.js';

describe('BrowserSmoke', function () {
  it("a simple contract given by path can be compiled, uploaded and executed with the result returned", async () => {
    const { session } = await ApiSession.default();
    const contract = await Contract.newFrom({ path: 'hello_world.sol' });
    const liveContract = await session.upload(contract);
    const greetReponse = await liveContract.greet();

    expect(greetReponse).toEqual("Hello World!");
  }, 30000);

  it("a simple contract given by code can be compiled, uploaded and executed with the result returned", async () => {
    const code = `
    // SPDX-License-Identifier: MIT
    pragma solidity ^0.8.9;

    contract HelloWorld {
      string public greet = "Hello World from code!";
    }`;
    const { session } = await ApiSession.default();
    const contract = await Contract.newFrom({ code });
    const liveContract = await session.upload(contract);
    const greetReponse = await liveContract.greet();

    expect(greetReponse).toEqual("Hello World from code!");
  }, 30000);
});
