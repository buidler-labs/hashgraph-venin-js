import BigNumber from "bignumber.js";
import {
  describe, expect, it,
} from '@jest/globals';
import { AccountId } from "@hashgraph/sdk";

import { load, read } from "../../utils";
import { Contract } from "../../../lib/static/Contract";
import { HederaNetwork } from "../../../lib/HederaNetwork";
import { LiveEntity } from "../../../lib/live/LiveEntity";
import { LiveAddress } from "../../../lib/live/LiveAddress";

describe('LiveContract', () => {
  it("using the solidity-by-example > Contract that Creates other Contracts example, creating a contract should allow its live-address to be convertable to the underlying model", async () => {
    const hapiSession = await HederaNetwork.defaultApiSession();
    const hapiSessionOwnerAddress = await hapiSession.getSolidityAddress();
    const carContract = await Contract.newFrom({ code: read({ contract: 'solidity-by-example/new_contract' }), name: 'Car', ignoreWarnings: true });
    const carFactoryContract = await Contract.newFrom({ code: read({ contract: 'solidity-by-example/new_contract' }), name: 'CarFactory', ignoreWarnings: true });
    const liveCarFactoryContract = await hapiSession.upload(carFactoryContract);

    await expect(liveCarFactoryContract.create({ gas: 200_000 }, 
      hapiSessionOwnerAddress, 
      "Logan"
    )).resolves.toBeUndefined();

    const { carAddr } = await liveCarFactoryContract.getCar(0);

    expect(carAddr).toBeInstanceOf(LiveAddress);

    const liveCar = await carAddr.toLiveContract(carContract.interface);

    await expect(liveCar.model()).resolves.toEqual("Logan");
  });

  it("using the solidity-by-example > Immutable example, deploying a contract with constructor arguments should work", async () => {
    const uintArgForConstructor = new BigNumber(42);
    const hapiSession = await HederaNetwork.defaultApiSession();
    const immutableContract = await Contract.newFrom({ code: read({ contract: 'solidity-by-example/immutable' }) });
    const liveContract = await hapiSession.upload(immutableContract, uintArgForConstructor);
    const returnedMyAddress = await liveContract.MY_ADDRESS();

    expect(returnedMyAddress).toBeInstanceOf(LiveEntity);
    expect(returnedMyAddress.equals(await hapiSession.getSolidityAddress())).toBeTruthy();
    await expect(liveContract.MY_UINT()).resolves.toEqual(uintArgForConstructor);
  });

  it("given the solidity-by-example > Hello World code, uploading it should allow interacting with its live instance", async () => {
    const liveContract = await load('solidity-by-example/hello_world');

    await expect(liveContract.greet()).resolves.toEqual("Hello World!");
  });

  it("using the solidity-by-example > Hello World code, uploading it followed by a cold retrieval should be permitted provided it is deployed ID and ABI interface are available", async () => {
    // prepare the session and the solidity contract
    const hapiSession = await HederaNetwork.defaultApiSession();
    const helloWorldContract = await Contract.newFrom({ code: read({ contract: 'solidity-by-example/hello_world' }) });
    
    // upload it but don't get a hold on the actual resulting live contract instance. We only take note of its deployed id and,
    const { id } = await hapiSession.upload(helloWorldContract);
    
    // instead, retrieve it through an api session call
    const liveContract = await hapiSession.getLiveContract({ id, abi: helloWorldContract.interface });

    await expect(liveContract.greet()).resolves.toEqual("Hello World!");
  });

  it("given a contract which has methods that make use of the Hedera supported bytes type, calling them should work as expected", async () => {
    const hapiSession = await HederaNetwork.defaultApiSession();
    const bytesContract = await Contract.newFrom({ code: read({ contract: 'bytes' }) });
    const liveContract = await hapiSession.upload(bytesContract);
    const sentBytes = Buffer.from('Hello World!', 'utf8');
    const sentBytes32 = Buffer.from('0123456789ABCDEFFEDCBA9876543210', 'utf8');

    await expect(liveContract.set(sentBytes, sentBytes32)).resolves.not.toThrow();

    const [ recvBytes, recvBytes32 ] = await liveContract.get();

    expect(Buffer.compare(recvBytes, sentBytes)).toEqual(0);
    expect(Buffer.compare(recvBytes32, sentBytes32)).toEqual(0);
  });

  it("given a contract which has methods that allow both a state change and return something, when called, the expected value is returned", async () => {
    const liveContract = await load('change_state_with_return');

    await expect(liveContract.num()).resolves.toEqual(new BigNumber(0));
    await expect(liveContract.setAndRetrieve(42)).resolves.toEqual(new BigNumber(42));
    await expect(liveContract.num()).resolves.toEqual(new BigNumber(42));
  });

  it("given the solidity-by-example > Function code, quering them should succede giving back the expected answers", async () => {
    const liveContract = await load('solidity-by-example/function');

    await expect(liveContract.returnMany()).resolves.toEqual([new BigNumber(1), true, new BigNumber(2)]);
    await expect(liveContract.named()).resolves.toEqual({x: new BigNumber(1), b: true, y: new BigNumber(2)});
    await expect(liveContract.assigned()).resolves.toEqual({x: new BigNumber(1), b: true, y: new BigNumber(2)});
    await expect(liveContract.destructingAssigments()).resolves.toEqual([new BigNumber(1), true, new BigNumber(2), new BigNumber(4), new BigNumber(6)]);
    await expect(liveContract.arrayOutput()).resolves.toEqual([]);
  });

  it("given the solidity-by-example > View and Pure Functions code, executing them with arguments should succede giving back the expected values", async () => {
    const liveContract = await load('solidity-by-example/view_and_pure_functions');

    await expect(liveContract.addToX(69)).resolves.toEqual(new BigNumber(70));
    await expect(liveContract.add(2, 5)).resolves.toEqual(new BigNumber(7));
  });

  it("given the solidity-by-example > First App code, interacting with the contract example should change its state as expected", async () => {
    const liveContract = await load('solidity-by-example/first_app');

    await expect(liveContract.get()).resolves.toEqual(new BigNumber(0));
    await expect(liveContract.inc()).resolves.toBeUndefined();
    await expect(liveContract.get()).resolves.toEqual(new BigNumber(1));
    await expect(liveContract.inc()).resolves.toBeUndefined();
    await expect(liveContract.get()).resolves.toEqual(new BigNumber(2));
    await expect(liveContract.dec()).resolves.toBeUndefined();
    await expect(liveContract.get()).resolves.toEqual(new BigNumber(1));
  });

  it("given the solidity-by-example > Error code, interacting with the contract example should error out as expected when appropriate", async () => {
    const liveContract = await load('solidity-by-example/error');

    await expect(liveContract.testRequire(9)).rejects.toThrow();
    await expect(liveContract.testRequire(11)).resolves.toBeUndefined();
    await expect(liveContract.testRevert(10)).rejects.toThrow();
    await expect(liveContract.testRevert(11)).resolves.toBeUndefined();
    await expect(liveContract.testAssert()).resolves.toBeUndefined();
    await expect(liveContract.testCustomError(new BigNumber('5032485723458348569331745'))).rejects.toThrow();
    await expect(liveContract.testCustomError(0)).resolves.toBeUndefined();
  });

  it("given the solidity-by-example > State Variables code, interacting with its methods should set state variables approprietly", async () => {
    const liveContract = await load('solidity-by-example/state_variables');

    await expect(liveContract.get()).resolves.toEqual(new BigNumber(0));
    await expect(liveContract.set(69)).resolves.toBeUndefined();
    await expect(liveContract.get()).resolves.toEqual(new BigNumber(69));
    await expect(liveContract.set(420)).resolves.toBeUndefined();
    await expect(liveContract.get()).resolves.toEqual(new BigNumber(420));
    await expect(liveContract.num()).resolves.toEqual(new BigNumber(420));
  });

  it("given the solidity-by-example > If Else code, interacting with its methods should be governed by their internel, conditional logic", async () => {
    const liveContract = await load('solidity-by-example/if_else');

    await expect(liveContract.foo(0)).resolves.toEqual(new BigNumber(0));
    await expect(liveContract.foo(11)).resolves.toEqual(new BigNumber(1));
    await expect(liveContract.foo(20)).resolves.toEqual(new BigNumber(2));
    await expect(liveContract.ternary(5)).resolves.toEqual(new BigNumber(1));
    await expect(liveContract.ternary(10)).resolves.toEqual(new BigNumber(2));
  });

  it.skip("given the solidity-by-example > Signature code, interacting doing the signature verification flow should work", async () => {
    // TODO: activate this once secp is working on Hedera (and available through SDK ?)
    const liveContract = await load('solidity-by-example/signature');
    const hapiSession = await HederaNetwork.defaultApiSession();
    const signer = hapiSession.accountId.toSolidityAddress();
    const to = AccountId.fromString('0.0.3').toSolidityAddress();
    const amount = 123;
    const message = "coffee and donuts";
    const nonce = 1;
    const messageHash = await liveContract.getMessageHash(to, amount, message, nonce);

    /* TODO: uncoment this and adjust
    const signedMessageHash = web3.personal.sign(messageHash, web3.eth.defaultAccount, console.log) ??? -- see solidity-by-example > signature.sol comments
    const isSameSigner = await liveContract.verify(signer, to, amount, message, nonce, signedMessageHash);

    expect(isSameSigner).toBeTruthy();
    */
  });

  it.skip("using the solidity-by-example > Library code, uploading a public library-dependent contract should succede", async () => {
    const hapiSession = await HederaNetwork.defaultApiSession();
    const testArrayContract = await Contract.newFrom({ code: read({ contract: 'solidity-by-example/library' }), name: 'TestArray' });

    await expect(hapiSession.upload(testArrayContract)).resolves.not.toThrow();
  });

  it("given the solidity-by-example > Events code, trying to register a non-existing event should error out", async () => {
    const liveContract = await load('solidity-by-example/events');

    expect(() => liveContract.onEvent("non-existing-event", () => {})).toThrow();
  });

  it("given the solidity-by-example > Events code, interacting with its single method should trigger the expected events", async () => {
    const liveContract = await load('solidity-by-example/events');

    return new Promise<void>((accept) => {
      const receivedMessages = [];

      // Register all events of interest
      liveContract.onEvent("Log", ({ sender, message }) => {
        expect(sender).not.toBeNull();
        expect(receivedMessages).not.toContain(message);
        receivedMessages.push(message);
      });
      liveContract.onEvent("AnotherLog", () => {
        expect(receivedMessages).toHaveLength(2);
        expect(receivedMessages[0]).toEqual("Hello World!");
        expect(receivedMessages[1]).toEqual("Hello EVM!");
        accept();
      });

      // Fire up the test by calling into the triggering method on the contract
      expect(liveContract.test()).resolves.toBeUndefined();
    });
  });

  it("given the solidity-by-example > Events code, registering a catch-all-if-none-defined handler should get called if one is provided and an unhandled event gets triggered", async () => {
    const liveContract = await load('solidity-by-example/events');

    return new Promise<void>((accept) => {
      const receivedMessages = [];

      liveContract.onEvent("Log", ({ sender, message }) => {
        expect(sender).not.toBeNull();
        expect(receivedMessages).not.toContain(message);
        receivedMessages.push(message);
      });
      liveContract.onUnhandledEvents(() => {
        expect(receivedMessages).toHaveLength(2);
        expect(receivedMessages[0]).toEqual("Hello World!");
        expect(receivedMessages[1]).toEqual("Hello EVM!");
        accept();
      });

      expect(liveContract.test()).resolves.toBeUndefined();
    });
  });

  it("given the solidity-by-example > Events code, de-registering an event should not call it any further when triggered from the contract", async () => {
    const liveContract = await load('solidity-by-example/events');

    return new Promise<void>((accept, reject) => {
      const receivedMessages = [];

      liveContract.onEvent("Log", ({ sender, message }) => {
        expect(sender).not.toBeNull();
        expect(receivedMessages).not.toContain(message);
        receivedMessages.push(message);
      });
      liveContract.onEvent("AnotherLog", () => {
        reject();
      });
      liveContract.onEvent("AnotherLog", undefined);
      liveContract.onUnhandledEvents(() => {
        expect(receivedMessages).toHaveLength(2);
        expect(receivedMessages[0]).toEqual("Hello World!");
        expect(receivedMessages[1]).toEqual("Hello EVM!");
        accept();
      });

      expect(liveContract.test()).resolves.toBeUndefined();
    });
  });

  it ("given a method that requires an address, passing it a solidity-addressable instance should resolve to the expected address type", async() => {
    const hapiSession = await HederaNetwork.defaultApiSession();
    const naiveOwnerCheckContract = await Contract.newFrom({ code: read({ contract: 'naive_owner_check' }) });
    const liveContract = await hapiSession.upload(naiveOwnerCheckContract);

    await expect(liveContract.isOwnedBy(hapiSession)).resolves.toBeTruthy();
  });
});
