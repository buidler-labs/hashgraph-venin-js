import { AccountId, PrivateKey } from "@hashgraph/sdk";
import {
  afterAll,
  afterEach,
  beforeAll,
  describe,
  expect,
  it,
  jest,
} from "@jest/globals";

import { ApiSession } from "../../../lib/ApiSession";

function bindBrowserWalletToTest(propName = "hedera") {
  window[propName] = {
    execute: jest.fn(),
    getAccountId: jest.fn(() => AccountId.fromString("0.0.69")),
    getAccountKey: jest.fn(() => PrivateKey.generate().publicKey),
    sendRequest: jest.fn(),
  };
}

describe("BrowserWallet", () => {
  afterAll(() => {
    delete window["hedera"];
    delete window["hedera2"];
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  beforeAll(() => {
    bindBrowserWalletToTest();
    bindBrowserWalletToTest("hedera2");
  });

  it("configuring an ApiSession to use a Browser wallet should do so", async () => {
    const { session } = await ApiSession.default({
      wallet: { type: "Browser" },
    });

    // check immediate preconditions
    expect(window["hedera"].getAccountId).not.toBeCalled();
    expect(window["hedera"].getAccountKey).not.toBeCalled();

    // do a execute action on the session and check results
    expect(window["hedera"].sendRequest).not.toBeCalled();
    try {
      await session.upload({ foo: "bazinga" });
    } catch (e) {
      // We discard this but keep in mind that the session.upload execution is bound to fail since we're not mocking the entire chain
      // just up until the transaction enters the sdk realm and becomes part of its responsibility.
    }
    expect(window["hedera"].sendRequest).toBeCalled();

    // reset mock call counts to test another aspect
    jest.resetAllMocks();

    // check wallet.account read preconditions, read the underlying wallet and check results
    session.wallet.account;
    expect(window["hedera"].getAccountId).toBeCalled();
    expect(window["hedera"].getAccountKey).toBeCalled();
  });

  it("configuring an ApiSession to use a Browser wallet with a non-default window-prop location should do so", async () => {
    const { session } = await ApiSession.default({
      wallet: {
        type: "Browser",
        window: {
          propName: "hedera2",
        },
      },
    });

    // check immediate preconditions
    expect(window["hedera"].getAccountId).not.toBeCalled();
    expect(window["hedera"].getAccountKey).not.toBeCalled();
    session.wallet.account;
    expect(window["hedera"].getAccountId).not.toBeCalled();
    expect(window["hedera"].getAccountKey).not.toBeCalled();
    expect(window["hedera2"].getAccountId).toBeCalled();
    expect(window["hedera2"].getAccountKey).toBeCalled();
  });
});
