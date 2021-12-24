import BigNumber from "bignumber.js";
import {
  describe, expect, it,
} from '@jest/globals';
import { read } from "./utils";
import { Contract } from "../lib/static/Contract";
import { HederaNetwork } from "../lib/HederaNetwork";
import { AccountId, Hbar } from "@hashgraph/sdk";

describe('LiveContract', () => {
  it("using the solidity-by-example > Immutable example, deploying a contract with constructor arguments should work", async () => {
    const uintArgForConstructor = new BigNumber(42);
    const hapiSession = await HederaNetwork.defaultApiSession();
    const immutableContract = await Contract.newFrom({ code: read({ contract: 'solidity-by-example/immutable' }) });
    const liveContract = await hapiSession.upload(immutableContract, uintArgForConstructor);

    await liveContract.MY_ADDRESS().then(contractInnerAddress => {
      expect(hapiSession.isOperatedBy( { solidityAddress: contractInnerAddress })).toBeTruthy();
    });
    await expect(liveContract.MY_UINT()).resolves.toEqual(uintArgForConstructor);
  });

  it("given the solidity-by-example > Hello World code, uploading it should allow interacting with its live instance", async (liveContract) => {
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

    expect(recvBytes).toEqual("0x" + sentBytes.toString('hex'));
    expect(recvBytes32).toEqual("0x" + sentBytes32.toString('hex'));
  });

  it("given a contract which has methods that allow both a state change and return something, when called, the expected value is returned", async () => {
    const hapiSession = await HederaNetwork.defaultApiSession();
    const solidityContract = await Contract.newFrom({ code: read({ contract: 'change_state_with_return' }) });
    const liveContract = await hapiSession.upload(solidityContract);

    await expect(liveContract.num()).resolves.toEqual(new BigNumber(0));
    await expect(liveContract.setAndRetrieve(42)).resolves.toEqual(new BigNumber(42));
    await expect(liveContract.num()).resolves.toEqual(new BigNumber(42));
  });

  it("given the solidity-by-example > Function code, quering them should succede giving back the expected answers", async (liveContract) => {
    await expect(liveContract.returnMany()).resolves.toEqual([new BigNumber(1), true, new BigNumber(2)]);
    await expect(liveContract.named()).resolves.toEqual({x: new BigNumber(1), b: true, y: new BigNumber(2)});
    await expect(liveContract.assigned()).resolves.toEqual({x: new BigNumber(1), b: true, y: new BigNumber(2)});
    await expect(liveContract.destructingAssigments()).resolves.toEqual([new BigNumber(1), true, new BigNumber(2), new BigNumber(4), new BigNumber(6)]);
    await expect(liveContract.arrayOutput()).resolves.toEqual([]);
  });

  it("given the solidity-by-example > View and Pure Functions code, executing them with arguments should succede giving back the expected values", async (liveContract) => {
    await expect(liveContract.addToX(69)).resolves.toEqual(new BigNumber(70));
    await expect(liveContract.add(2, 5)).resolves.toEqual(new BigNumber(7));
  });

  it("given the solidity-by-example > First App code, interacting with the contract example should change its state as expected", async (liveContract) => {
    await expect(liveContract.get()).resolves.toEqual(new BigNumber(0));
    await expect(liveContract.inc()).resolves.toBeUndefined();
    await expect(liveContract.get()).resolves.toEqual(new BigNumber(1));
    await expect(liveContract.inc()).resolves.toBeUndefined();
    await expect(liveContract.get()).resolves.toEqual(new BigNumber(2));
    await expect(liveContract.dec()).resolves.toBeUndefined();
    await expect(liveContract.get()).resolves.toEqual(new BigNumber(1));
  });

  it("given the solidity-by-example > Error code, interacting with the contract example should error out as expected when appropriate", async (liveContract) => {
    await expect(liveContract.testRequire(9)).rejects.toThrow();
    await expect(liveContract.testRequire(11)).resolves.toBeUndefined();
    await expect(liveContract.testRevert(10)).rejects.toThrow();
    await expect(liveContract.testRevert(11)).resolves.toBeUndefined();
    await expect(liveContract.testAssert()).resolves.toBeUndefined();
    await expect(liveContract.testCustomError(new BigNumber('5032485723458348569331745'))).rejects.toThrow();
    await expect(liveContract.testCustomError(0)).resolves.toBeUndefined();
  });

  it("given the solidity-by-example > State Variables code, interacting with its methods should set state variables approprietly", async (liveContract) => {
    await expect(liveContract.get()).resolves.toEqual(new BigNumber(0));
    await expect(liveContract.set(69)).resolves.toBeUndefined();
    await expect(liveContract.get()).resolves.toEqual(new BigNumber(69));
    await expect(liveContract.set(420)).resolves.toBeUndefined();
    await expect(liveContract.get()).resolves.toEqual(new BigNumber(420));
    await expect(liveContract.num()).resolves.toEqual(new BigNumber(420));
  });

  it("given the solidity-by-example > If Else code, interacting with its methods should be governed by their internel, conditional logic", async (liveContract) => {
    await expect(liveContract.foo(0)).resolves.toEqual(new BigNumber(0));
    await expect(liveContract.foo(11)).resolves.toEqual(new BigNumber(1));
    await expect(liveContract.foo(20)).resolves.toEqual(new BigNumber(2));
    await expect(liveContract.ternary(5)).resolves.toEqual(new BigNumber(1));
    await expect(liveContract.ternary(10)).resolves.toEqual(new BigNumber(2));
  });

  it.skip("given the solidity-by-example > Signature code, interacting doing the signature verification flow should work", async (liveContract) => {
    // TODO: activate this once secp is working on Hedera (and available through SDK ?)
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

  it("given the solidity-by-example > Events code, interacting with its single method should trigger the expected events", (liveContract) => {
    return new Promise((accept) => {
      const receivedMessages = [];

      // Register all events of interest
      liveContract.on("Log", ({ sender, message }) => {
        expect(sender).not.toBeNull();
        expect(receivedMessages).not.toContain(message);
        receivedMessages.push(message);
      });
      liveContract.on("AnotherLog", () => {
        expect(receivedMessages).toHaveLength(2);
        expect(receivedMessages[0]).toEqual("Hello World!");
        expect(receivedMessages[1]).toEqual("Hello EVM!");
        accept();
      });

      // Fire up the test by calling into the triggering method on the contract
      expect(liveContract.test()).resolves.toBeUndefined();
    });
  });

  it ("given the taskbar use-case contracts, initializing a task should allow for getting it back later on", async() => {
    const maxNrOfTasksPerRegistry = new BigNumber(2);
    const taskId = new BigNumber(1);

    const hapiSession = await HederaNetwork.defaultApiSession();
    const taskRegistryContract = await Contract.newFrom({ code: read({ contract: 'taskbar/TaskRegistry' }), ignoreWarnings: true });
    const cappedRegistryHelperContract = await Contract.newFrom({ code: read({ contract: 'taskbar/CappedRegistryHelper' }) });
    const cappedRegistryLiveContract = await hapiSession.upload(cappedRegistryHelperContract, maxNrOfTasksPerRegistry);
    const taskRegistryLiveContract = await hapiSession.upload(taskRegistryContract);

    await expect(taskRegistryLiveContract.initialize({ gas: 100000 }, 
      hapiSession.accountId.toSolidityAddress(),
      cappedRegistryLiveContract.id.toSolidityAddress()
    )).resolves.toBeUndefined();
    await expect(taskRegistryLiveContract.initializeTask({ gas: 200000 },
      taskId,
      100,
      new TextEncoder().encode('67347465687435726877747265676572'),
      600,
      1,
      2
    )).resolves.toBeUndefined();

    const gottenTask = await taskRegistryLiveContract.getTask({ queryPayment: new Hbar(10) }, 
      taskId
    );
    expect(gottenTask.disputionTime).not.toBeUndefined();
    expect(gottenTask).toMatchObject({
      disputed: [ false, false ],
      disputionTime: new BigNumber(0),
      dloc: "0x0000000000000000000000000000000000000000000000000000000000000000",
      needer: "0x0000000000000000000000000000000000000002",
      nploc: "0x0000000000000000000000000000000000000000000000000000000000000000",
      ploc: "0x3637333437343635363837343335373236383737373437323635363736353732",
      price: new BigNumber(200),
      taskType: 1,
      tasker: "0x0000000000000000000000000000000000000000",
      tploc: "0x0000000000000000000000000000000000000000000000000000000000000000"
    });
  });

  it.skip("given the taskbar contracts, do stuff", async () => {
    const maxNrOfTasksPerRegistry = new BigNumber(2);
    const hapiSession = await HederaNetwork.defaultApiSession();

    // Contracts
    const taskRegistryContract = await Contract.newFrom({ code: read({ contract: 'taskbar/TaskRegistry' }), ignoreWarnings: true });
    const cappedRegistryHelperContract = await Contract.newFrom({ code: read({ contract: 'taskbar/CappedRegistryHelper' }) });
    const taskRegistryManagerContract = await Contract.newFrom({ code: read({ contract: 'taskbar/RegistryManager' }) });

    // Live Contracts
    const cappedRegistryLiveContract = await hapiSession.upload(cappedRegistryHelperContract, maxNrOfTasksPerRegistry);
    const taskRegistryLiveContract = await hapiSession.upload(taskRegistryContract);
    const taskRegistryManagerLiveContract = await hapiSession.upload(
      taskRegistryManagerContract, 
      taskRegistryLiveContract.id.toSolidityAddress(), 
      cappedRegistryLiveContract.id.toSolidityAddress()
    );

    // Register events of interest
    taskRegistryLiveContract.on("OwnershipTransferred", ({ previousOwner, newOwner }) => {
      expect(previousOwner).toEqual('0x0000000000000000000000000000000000000000');
      expect(hapiSession.isOperatedBy( { solidityAddress: newOwner })).toBeTruthy();
    });
    taskRegistryManagerLiveContract.on("NewRegistryCreated", ({ registry }) => {
      expect(registry).not.toBeNull();
    });

    // Play around with the live-contracts testing ocasionally
    await expect(cappedRegistryLiveContract.getRegistrySize()).resolves.toEqual(maxNrOfTasksPerRegistry);
    await expect(taskRegistryLiveContract.initialize({ gas: 100000 }, 
      hapiSession.accountId.toSolidityAddress(),
      cappedRegistryLiveContract.id.toSolidityAddress())
    ).resolves.toBeUndefined();
    await expect(taskRegistryLiveContract.initialize({ gas: 100000 }, 
      hapiSession.accountId.toSolidityAddress(),
      cappedRegistryLiveContract.id.toSolidityAddress())
    ).rejects.toThrow();

    const taskRegistry = await taskRegistryManagerLiveContract.registryWithSlot({ gas: 250000 });

    expect(taskRegistry).not.toBeNull();

    // TODO: expect various task-registry methods to work from this point forward
  });

  it.todo("Write test for Query (non state-changing/constant contract method call) > maxQueryPayment/paymentTransactionId/queryPayment");

  it.todo("Write test for Transaction (state-changing contract method calls) > maxTransactionFee/nodeAccountIds/transactionId/transactionMemo/transactionValidDuration");
});
