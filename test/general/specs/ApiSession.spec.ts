import fs from "fs/promises";

import { afterEach, describe, expect, it, jest } from "@jest/globals";

import { AccountId, PrivateKey } from "@hashgraph/sdk";
import { Token, TokenTypes } from "../../../lib/static/create/Token";
import { ApiSession } from "../../../lib/ApiSession";
import { CredentialsInvalidError } from "../../../lib/errors/CredentialsInvalidError";
import { EnvironmentInvalidError } from "../../../lib/errors/EnvironmentInvalidError";
import { HEDERA_CUSTOM_NET_NAME } from "../../../lib/HederaNetwork";
import { LiveToken } from "../../../lib/live/LiveToken";
import { StratoContext } from "../../../lib/StratoContext";
import { WalletType } from "../../../lib/wallet/WalletType";

describe("ApiSession", () => {
  const ORIGINAL_ENV = process.env;

  afterEach(() => {
    process.env = ORIGINAL_ENV;
  });

  it("if environment is sane, it should properly instantiate the default api-instance", async () => {
    await expect(ApiSession.default()).resolves.not.toBeNull();
  });

  it("if environment is not sane, it should error out when trying to instantiate the default api-session instance", async () => {
    const validHederasNodes = "127.0.0.1:50211:#69";

    // HEDERAS_NETWORK part
    await expectDefaultApiSessionToThrowFor(
      undefined,
      ORIGINAL_ENV.HEDERAS_NODES,
      ORIGINAL_ENV.HEDERAS_OPERATOR_ID,
      ORIGINAL_ENV.HEDERAS_OPERATOR_KEY,
      EnvironmentInvalidError
    );
    await expectDefaultApiSessionToThrowFor(
      "some non-existing network",
      ORIGINAL_ENV.HEDERAS_NODES,
      ORIGINAL_ENV.HEDERAS_OPERATOR_ID,
      ORIGINAL_ENV.HEDERAS_OPERATOR_KEY,
      EnvironmentInvalidError
    );

    // HEDERAS_NODES part (if applicable)
    if (ORIGINAL_ENV.HEDERAS_NETWORK === HEDERA_CUSTOM_NET_NAME) {
      await expectDefaultApiSessionToThrowFor(
        ORIGINAL_ENV.HEDERAS_NETWORK,
        "some totally bad node def",
        ORIGINAL_ENV.HEDERAS_OPERATOR_ID,
        ORIGINAL_ENV.HEDERAS_OPERATOR_KEY,
        EnvironmentInvalidError
      );
      await expectDefaultApiSessionToThrowFor(
        ORIGINAL_ENV.HEDERAS_NETWORK,
        "127.0.0.1:50211",
        ORIGINAL_ENV.HEDERAS_OPERATOR_ID,
        ORIGINAL_ENV.HEDERAS_OPERATOR_KEY,
        EnvironmentInvalidError
      );
    }

    // OPERATOR_ID part
    await expectDefaultApiSessionToThrowFor(
      ORIGINAL_ENV.HEDERAS_NETWORK,
      validHederasNodes,
      undefined,
      ORIGINAL_ENV.HEDERAS_OPERATOR_KEY,
      CredentialsInvalidError
    );
    await expectDefaultApiSessionToThrowFor(
      ORIGINAL_ENV.HEDERAS_NETWORK,
      validHederasNodes,
      "some invalid id",
      ORIGINAL_ENV.HEDERAS_OPERATOR_KEY,
      CredentialsInvalidError
    );

    // OPERATOR_KEY part
    await expectDefaultApiSessionToThrowFor(
      ORIGINAL_ENV.HEDERAS_NETWORK,
      validHederasNodes,
      ORIGINAL_ENV.HEDERAS_OPERATOR_ID,
      undefined,
      CredentialsInvalidError
    );
    await expectDefaultApiSessionToThrowFor(
      ORIGINAL_ENV.HEDERAS_NETWORK,
      validHederasNodes,
      ORIGINAL_ENV.HEDERAS_OPERATOR_ID,
      "some invalid key",
      CredentialsInvalidError
    );
  });

  it("if environment params are not provided yet a dot-env file is present, dot-env properties should be used for default-session instantiation", async () => {
    const tmpDotEnvFileName = `.env_testTemp`;
    const tmpDotEnvFileContent = {
      HEDERAS_NETWORK: HEDERA_CUSTOM_NET_NAME,
      HEDERAS_NODES: "127.0.0.1:123#69",
      HEDERAS_OPERATOR_ID: "0.0.1001",
      HEDERAS_OPERATOR_KEY:
        "302e020100300506032b657004220420c344b07fa7bb3107116dea17de7a0f565ef68795b9d9f6c92f3094f1d98ed0ef",
    };
    const spyApiSessionBuildFrom = jest.spyOn(ApiSession, "buildFrom");

    await fs.writeFile(
      tmpDotEnvFileName,
      Object.keys(tmpDotEnvFileContent)
        .map((key) => `${key}=${tmpDotEnvFileContent[key]}`)
        .join("\n")
    );
    try {
      await ApiSession.default(tmpDotEnvFileName);

      expect(spyApiSessionBuildFrom.mock.calls.length === 1).toBeTruthy();
      expect(spyApiSessionBuildFrom.mock.calls[0][0]).toBeInstanceOf(
        StratoContext
      );

      const walletTypedInstance = spyApiSessionBuildFrom.mock.calls[0][0].params
        .wallet.type as WalletType;

      expect(spyApiSessionBuildFrom.mock.calls[0][0].network.name).toEqual(
        tmpDotEnvFileContent.HEDERAS_NETWORK
      );
      expect(
        spyApiSessionBuildFrom.mock.calls[0][0].network.nodes
      ).not.toBeUndefined();
      expect(
        spyApiSessionBuildFrom.mock.calls[0][0].network.nodes["127.0.0.1:123"]
      ).toEqual(new AccountId(69));
      expect(walletTypedInstance.name).toEqual("Sdk");
      expect(
        walletTypedInstance.computeColdStartOptionsFrom(
          spyApiSessionBuildFrom.mock.calls[0][0].params
        )
      ).toMatchObject({
        accountId: AccountId.fromString(
          tmpDotEnvFileContent.HEDERAS_OPERATOR_ID
        ),
        privateKey: PrivateKey.fromStringED25519(
          tmpDotEnvFileContent.HEDERAS_OPERATOR_KEY
        ),
      });
    } finally {
      await fs.rm(tmpDotEnvFileName);
    }
  });

  async function expectDefaultApiSessionToThrowFor(
    networkName,
    nodes,
    operatorId,
    operatorKey,
    expectedErrorType
  ) {
    try {
      jest.resetModules();
      process.env = {
        // We need to configure this so that the library does not pick some existing, pre-defined, .env variables that might
        // mess up with our setup
        HEDERAS_ENV_PATH: ".env-non-existing",

        // Configure the environment
        HEDERAS_NETWORK: networkName,
        HEDERAS_NODES: nodes,
        HEDERAS_OPERATOR_ID: operatorId,
        HEDERAS_OPERATOR_KEY: operatorKey,
      };
      // eslint-disable-next-line @typescript-eslint/no-var-requires
      const localisedApiSession = require("../../../lib/ApiSession");

      await localisedApiSession.ApiSession.default();
      return Promise.reject(
        "Test should have thrown an exception by now but it did not."
      );
    } catch (e) {
      expect(e.constructor.name).toEqual(expectedErrorType.name);
    }
  }

  it("given sufficient, yet minimal, information, creating a fungible token should succede", async () => {
    const { session } = await ApiSession.default();
    const token = new Token({
      name: "PLM",
      symbol: "$",
      type: TokenTypes.FungibleCommon,
    });

    await expect(session.create(token)).resolves.toBeInstanceOf(LiveToken);
  });
});
