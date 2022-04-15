import { describe, expect, it } from "@jest/globals";
import { ApiSession } from "../../../lib/ApiSession";

import { LegacyLocalWallet } from "../../../lib/wallet/local/LegacyLocalWallet";

describe("LegacyLocalWallet", () => {
  it("a default-ApiSession should use a LegacyLocalWallet until hashgraph/hedera-sdk-js#991 gets resolved", async () => {
    const { session } = await ApiSession.default();

    expect(session.wallet.signer).toBeInstanceOf(LegacyLocalWallet);
  });
});
