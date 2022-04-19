import { describe, expect, it } from "@jest/globals";
import { AccountId, Signer } from "@hashgraph/sdk";
import BigNumber from "bignumber.js";

import {
  ResourceReadOptions,
  loadContractRegistry as loadContractRegistryResource,
  load as loadResource,
  read as readResource,
} from "../../utils";
import { ApiSession } from "../../../lib/ApiSession";
import { Contract } from "../../../lib/static/upload/Contract";
import { ContractRegistry } from "../../../lib/ContractRegistry";
import { StratoAddress } from "../../../lib/core/StratoAddress";

function load(contractPath: string) {
  return loadResource(contractPath, "solidity-by-example");
}

function read(what: ResourceReadOptions) {
  return readResource({ relativeTo: "solidity-by-example", ...what });
}

function loadContractRegistry(): ContractRegistry {
  return loadContractRegistryResource("solidity-by-example");
}

describe("LiveContract.Solidity-by-Example", () => {
  // Requires: https://github.com/buidler-labs/hedera-strato-js/issues/11
  it.skip("not setting a query-payment should default to using the upper limit given by the maximum-query-payment available on the client which should allow the query to successfully resolve", async () => {
    const { session } = await ApiSession.default({
      session: {
        defaults: {
          paymentForContractQuery: 0,
        },
      },
    });
    const contract = await Contract.newFrom({
      code: read({ contract: "hello_world" }),
    });
    const liveContract = await session.upload(contract);

    await liveContract.greet();
  });

  it("trying to create2 twice using the same salt should fail", async () => {
    const { session } = await ApiSession.default();
    const carFactoryContract = await Contract.newFrom({
      code: read({ contract: "new_contract" }),
      ignoreWarnings: true,
      name: "CarFactory",
    });
    const liveCarFactoryContract = await session.upload(carFactoryContract);
    const newCarOwner = AccountId.fromString("0.0.123").toSolidityAddress();
    const salt =
      "0xb7d7c82f47757be5f8f931c8ac65ab700ca1245ea02fff2c03fcd679e7f4bba9";

    await expect(
      liveCarFactoryContract.create2(
        { gas: 200_000 },
        newCarOwner,
        "Honda Civic",
        salt
      )
    ).resolves.toBeUndefined();

    await expect(() =>
      liveCarFactoryContract.create2(
        { gas: 200_000 },
        newCarOwner,
        "Honda Civic",
        salt
      )
    ).rejects.toThrow();
  });

  it("creating a contract should allow its live-address to be convertible to the underlying model", async () => {
    const { session } = await ApiSession.default();
    const hapiSessionOwnerAddress = session.getSolidityAddress();
    const carContract = await Contract.newFrom({
      code: read({ contract: "new_contract" }),
      ignoreWarnings: true,
      name: "Car",
    });
    const carFactoryContract = await Contract.newFrom({
      code: read({ contract: "new_contract" }),
      ignoreWarnings: true,
      name: "CarFactory",
    });
    const liveCarFactoryContract = await session.upload(carFactoryContract);

    await expect(
      liveCarFactoryContract.create(
        { gas: 200_000 },
        hapiSessionOwnerAddress,
        "Logan"
      )
    ).resolves.toBeUndefined();

    const { carAddr } = await liveCarFactoryContract.getCar(0);

    expect(carAddr).toBeInstanceOf(StratoAddress);

    const liveCar = await carAddr.toLiveContract(carContract.interface);

    await expect(liveCar.model()).resolves.toEqual("Logan");
  });

  it("deploying a contract with constructor arguments should work", async () => {
    const uintArgForConstructor = new BigNumber(42);
    const { session } = await ApiSession.default();
    const immutableContract = await Contract.newFrom({
      code: read({ contract: "immutable" }),
    });
    const liveContract = await session.upload(
      immutableContract,
      uintArgForConstructor
    );
    const returnedMyAddress = await liveContract.MY_ADDRESS();

    expect(returnedMyAddress).toBeInstanceOf(StratoAddress);
    expect(returnedMyAddress.equals(session.getSolidityAddress())).toBeTruthy();
    await expect(liveContract.MY_UINT()).resolves.toEqual(
      uintArgForConstructor
    );
  });

  it("uploading a contract should allow interacting with its live instance", async () => {
    const liveContract = await load("/hello_world");

    await expect(liveContract.greet()).resolves.toEqual("Hello World!");
  });

  it("uploading a contract followed by a cold retrieval should be permitted through the deployed contract-Id and its original ABI", async () => {
    // prepare the session and the solidity contract
    const { session } = await ApiSession.default();
    const helloWorldContract = await Contract.newFrom({
      code: read({ contract: "hello_world" }),
    });

    // upload it but don't get a hold on the actual resulting live contract instance. We only take note of its deployed id and,
    const { id } = await session.upload(helloWorldContract);

    // instead, retrieve it through an api session call
    const simpleLiveContract = await session.getLiveContract({
      abi: helloWorldContract.interface,
      id,
    });

    await expect(simpleLiveContract.greet()).resolves.toEqual("Hello World!");
  });

  it("uploading a contract followed by a cold retrieval should be permitted through the deployed contract-Id and its contract-registry stored ABI", async () => {
    // prepare the session and the solidity contract
    const { session } = await ApiSession.default();
    const helloWorldContract = await Contract.newFrom({
      code: read({ contract: "hello_world" }),
    });
    const contractRegistry = loadContractRegistry();

    // upload it but don't get a hold on the actual resulting live contract instance. We only take note of its deployed id and,
    const { id } = await session.upload(helloWorldContract);

    // instead, retrieve it through an api session call
    const registryLiveContract = await session.getLiveContract({
      abi: contractRegistry.hello_world,
      id,
    });

    await expect(registryLiveContract.greet()).resolves.toEqual("Hello World!");
  });

  it("querying functions should succeed giving back the expected answers", async () => {
    const liveContract = await load("function");

    await expect(liveContract.returnMany()).resolves.toEqual([
      new BigNumber(1),
      true,
      new BigNumber(2),
    ]);
    await expect(liveContract.named()).resolves.toEqual({
      x: new BigNumber(1),
      b: true,
      y: new BigNumber(2),
    });
    await expect(liveContract.assigned()).resolves.toEqual({
      x: new BigNumber(1),
      b: true,
      y: new BigNumber(2),
    });
    await expect(liveContract.destructingAssigments()).resolves.toEqual([
      new BigNumber(1),
      true,
      new BigNumber(2),
      new BigNumber(4),
      new BigNumber(6),
    ]);
    await expect(liveContract.arrayOutput()).resolves.toEqual([]);
  });

  it("executing functions with arguments should succeed giving back the expected values", async () => {
    const liveContract = await load("view_and_pure_functions");

    await expect(liveContract.addToX(69)).resolves.toEqual(new BigNumber(70));
    await expect(liveContract.add(2, 5)).resolves.toEqual(new BigNumber(7));
  });

  it("interacting with a mutable contract should change its state as expected", async () => {
    const liveContract = await load("first_app");

    await expect(liveContract.get()).resolves.toEqual(new BigNumber(0));
    await expect(liveContract.inc()).resolves.toBeUndefined();
    await expect(liveContract.get()).resolves.toEqual(new BigNumber(1));
    await expect(liveContract.inc()).resolves.toBeUndefined();
    await expect(liveContract.get()).resolves.toEqual(new BigNumber(2));
    await expect(liveContract.dec()).resolves.toBeUndefined();
    await expect(liveContract.get()).resolves.toEqual(new BigNumber(1));
  });

  it("interacting with a contract should error out as expected when appropriate", async () => {
    const liveContract = await load("error");

    await expect(liveContract.testRequire(9)).rejects.toThrow();
    await expect(liveContract.testRequire(11)).resolves.toBeUndefined();
    await expect(liveContract.testRevert(10)).rejects.toThrow();
    await expect(liveContract.testRevert(11)).resolves.toBeUndefined();
    await expect(liveContract.testAssert()).resolves.toBeUndefined();
    await expect(
      liveContract.testCustomError(new BigNumber("5032485723458348569331745"))
    ).rejects.toThrow();
    await expect(liveContract.testCustomError(0)).resolves.toBeUndefined();
  });

  it("interacting with a contract's methods should set state variables appropriately", async () => {
    const liveContract = await load("state_variables");

    await expect(liveContract.get()).resolves.toEqual(new BigNumber(0));
    await expect(liveContract.set(69)).resolves.toBeUndefined();
    await expect(liveContract.get()).resolves.toEqual(new BigNumber(69));
    await expect(liveContract.set(420)).resolves.toBeUndefined();
    await expect(liveContract.get()).resolves.toEqual(new BigNumber(420));
    await expect(liveContract.num()).resolves.toEqual(new BigNumber(420));
  });

  it("interacting with a contract's methods should be governed by their internal, conditional logic", async () => {
    const liveContract = await load("if_else");

    await expect(liveContract.foo(0)).resolves.toEqual(new BigNumber(0));
    await expect(liveContract.foo(11)).resolves.toEqual(new BigNumber(1));
    await expect(liveContract.foo(20)).resolves.toEqual(new BigNumber(2));
    await expect(liveContract.ternary(5)).resolves.toEqual(new BigNumber(1));
    await expect(liveContract.ternary(10)).resolves.toEqual(new BigNumber(2));
  });

  // Requires: https://github.com/hashgraph/hedera-sdk-js/issues/1084
  it.skip("doing the signature verification flow should work", async () => {
    const liveContract = await load("signature");
    const { session } = await ApiSession.default();
    const signer = session.wallet.signer as Signer;
    const to = AccountId.fromString("0.0.3").toSolidityAddress();
    const amount = 123;
    const message = "coffee and donuts";
    const nonce = 1;
    const messageHash = await liveContract.getMessageHash(
      to,
      amount,
      message,
      nonce
    );

    const [{ signature: signedMessageHash }] = await signer.sign(messageHash); //??? -- see solidity-by-example > signature.sol comments
    const isSameSigner = await liveContract.verify(
      signer.getAccountId().toSolidityAddress(),
      to,
      amount,
      message,
      nonce,
      signedMessageHash
    );

    expect(isSameSigner).toBeTruthy();
  });

  // Requires: https://github.com/buidler-labs/hedera-strato-js/issues/38
  it.skip("uploading a public library-dependent contract should succeed", async () => {
    const { session } = await ApiSession.default();
    const testArrayContract = await Contract.newFrom({
      code: read({ contract: "library" }),
      name: "TestArray",
    });

    await expect(session.upload(testArrayContract)).resolves.not.toThrow();
  });

  it("trying to register a non-existing event should error out", async () => {
    const liveContract = await load("events");

    // eslint-disable-next-line @typescript-eslint/no-empty-function
    expect(() =>
      liveContract.onEvent("non-existing-event", () => {})
    ).toThrow();
  });

  it("interacting with a contract's single method should trigger the expected events", async () => {
    const liveContract = await load("events");

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

  it("registering a catch-all-if-none-defined handler should get called if one is provided and an unhandled event gets triggered", async () => {
    const liveContract = await load("events");

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

  it("de-registering an event should not call it any further when triggered from the contract", async () => {
    const liveContract = await load("events");

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
});
