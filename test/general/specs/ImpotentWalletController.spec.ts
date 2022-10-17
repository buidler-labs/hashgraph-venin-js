import { describe, expect, it } from "@jest/globals";

import { HederaNetwork } from "../../../lib/hedera/HederaNetwork";
import { ImpotentWalletController } from "../../../lib/wallet/controller/ImpotentWalletController";

describe("ImpotentWalletController", () => {
  it("given a impotent-wallet-controller, it should error out when trying to change the network", () => {
    const walletController = new ImpotentWalletController();

    expect(() =>
      walletController.changeNetwork(
        new HederaNetwork({
          defaults: {
            fileChunkSize: 123,
            restMirrorAddress: "don't-care-url",
          },
          name: "testnet",
          nodes: "don't-care-list",
        })
      )
    ).toThrow();
  });

  it("given a impotent-wallet-controller, it should error out when trying to change the account", () => {
    const walletController = new ImpotentWalletController();

    expect(() => walletController.changeAccount("0.0.69")).toThrow();
  });
});
