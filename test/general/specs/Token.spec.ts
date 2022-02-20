import { 
  PrivateKey, 
  PublicKey, 
  TokenCreateTransaction, 
  TokenId,
} from '@hashgraph/sdk';
import {
  describe, expect, it,
  jest,
} from '@jest/globals';

import { Token, TokenTypes } from '../../../lib/static/create/Token';
import { ApiSession } from '../../../lib/ApiSession';

describe('Token', () => {
  it("null key values should disable them altogether when creating a token", async () => {
    const { publicKey } = PrivateKey.generateED25519();
    const mockedSessionExecute = jest.fn().mockReturnValue({ tokenId: TokenId.fromString("0.0.69") });
    const session = { 
      execute: mockedSessionExecute,
      publicKey,
    } as unknown as ApiSession;
    const token = new Token({
      keys: {
        feeSchedule: null,
        kyc: null,
        pause: null,
      },
      name: "Part Loco Monetar",
      symbol: "PLM",
      type: TokenTypes.FungibleCommon, 
    });

    await token.createVia({ session });

    expect(mockedSessionExecute.mock.calls[0][0]).toBeInstanceOf(TokenCreateTransaction);

    const tokenCreateTransaction = mockedSessionExecute.mock.calls[0][0] as TokenCreateTransaction;

    expect((tokenCreateTransaction.adminKey as PublicKey).toStringDer()).toEqual(publicKey.toStringDer());
    expect(tokenCreateTransaction.kycKey).toBeNull();
    expect(tokenCreateTransaction.feeScheduleKey).toBeNull();
    expect(tokenCreateTransaction.pauseKey).toBeNull();
    expect((tokenCreateTransaction.supplyKey as PublicKey).toStringDer()).toEqual(publicKey.toStringDer());
    expect((tokenCreateTransaction.wipeKey as PublicKey).toStringDer()).toEqual(publicKey.toStringDer());
    expect((tokenCreateTransaction.freezeKey as PublicKey).toStringDer()).toEqual(publicKey.toStringDer());
  });
});
