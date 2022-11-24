import { Hbar, HbarUnit, TokenCreateTransaction } from "@hashgraph/sdk";
import { describe, expect, it } from "@jest/globals";

import { ApiSession } from "../../../lib/ApiSession";
import { LiveToken } from "../../../lib/live/LiveToken";
import { getTokenToTest } from "../../utils";

describe("Issue #126 > INSUFFICIENT_TX_FEE when creating tokens", () => {
  it("creating a token with no maxTransactionFee specified should revert to using the sessions's default tokenCreateTransactionFee and succeed", async () => {
    const session = await getApiSession();

    await createTokenAndCheckTransactionFeeUsed(
      session,
      undefined,
      Hbar.from(session.defaults.tokenCreateTransactionFee, HbarUnit.Tinybar)
    );
  });

  it("creating a token with a custom maxTransactionFee specified should use it instead of the the sessions's default tokenCreateTransactionFee one and succeed", async () => {
    const session = await getApiSession();
    const maxTxUsed = new Hbar(69);

    await createTokenAndCheckTransactionFeeUsed(session, maxTxUsed, maxTxUsed);
  });
});

async function createTokenAndCheckTransactionFeeUsed(
  session: ApiSession,
  usedMaxTxFee: Hbar | undefined,
  expectedMaxTxFee: Hbar
) {
  return new Promise<void>((accept, reject) => {
    session.subscribeToReceiptsWith(({ transaction }) => {
      expect(transaction).toBeInstanceOf(TokenCreateTransaction);

      const tokenCreateTransaction = transaction as TokenCreateTransaction;

      expect(tokenCreateTransaction.maxTransactionFee).toBeInstanceOf(Hbar);
      try {
        expect(tokenCreateTransaction.maxTransactionFee).toEqual(
          expectedMaxTxFee
        );
      } catch (e) {
        reject(e);
      } finally {
        accept();
      }
    });
    expect(
      session.create(
        getTokenToTest({
          maxTransactionFee: usedMaxTxFee,
        })
      )
    ).resolves.toBeInstanceOf(LiveToken);
  });
}

async function getApiSession() {
  const { session } = await ApiSession.default({
    session: {
      defaults: {
        emitLiveContractReceipts: true,
      },
    },
  });

  return session;
}
