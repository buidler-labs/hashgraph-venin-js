import { AccountId, PrivateKey } from "@hashgraph/sdk";
import { describe, expect, it } from "@jest/globals";

import { Account } from "../../../lib/static/create/Account";
import { ApiSession } from "../../../lib/ApiSession";
import { DefaultPrivateKeyWalletController } from "../../../lib/wallet/controller/DefaultPrivateKeyWalletController";
import { HederaWalletController } from "../../../lib/wallet/controller/HederaWalletController";
import { ImpotentWalletController } from "../../../lib/wallet/controller/ImpotentWalletController";

describe("ApiSession.WalletController", () => {
  it("the default session should always have valid controller assigned", async () => {
    const { controller } = await ApiSession.default();

    expect(controller).not.toBeInstanceOf(ImpotentWalletController);
  });

  it("a Hedera Wallet should allow full swapping of the underlying operator if a Hedera Wallet Controller is in charge of it", async () => {
    const { controller, session } = await ApiSession.default({
      wallet: {
        controller: {
          type: "Hedera",
        },
      },
    });
    const account = await session.create(new Account());

    expect(controller).toBeInstanceOf(HederaWalletController);
    controller.changeAccount(account.id, account.privateKey);
    expect(session.wallet.account.id.toString()).toEqual(account.id.toString());
    expect(session.wallet.account.publicKey.toStringDer()).toEqual(
      account.privateKey.publicKey.toStringDer()
    );
  });

  it("a Default PrivateKey Wallet should allow full swapping of the underlying operator if a Default PrivateKey Controller is being used", async () => {
    const privateKey = PrivateKey.generateED25519();
    const { controller, session } = await ApiSession.default({
      wallet: {
        controller: {
          default: {
            operatorKey: privateKey.toStringDer(),
          },
          type: "DefaultPrivateKey",
        },
      },
    });
    const accountId = AccountId.fromString("0.0.69");

    expect(controller).toBeInstanceOf(DefaultPrivateKeyWalletController);
    controller.changeAccount(accountId);
    expect(session.wallet.account.publicKey.toStringDer()).toEqual(
      privateKey.publicKey.toStringDer()
    );
  });
});
