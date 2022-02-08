import { 
  PrivateKey, 
  PublicKey, 
  TokenCreateTransaction, 
  TokenId, 
  TokenType 
} from '@hashgraph/sdk';
import {
  expect, describe, it,
  jest
} from '@jest/globals';

import { ApiSession } from '../../../lib/ApiSession';
import { Token } from '../../../lib/static/create/Token';

describe('Token', () => {
  it("null key values should disable them altogether when creating a token", async () => {
    const { publicKey } = PrivateKey.generateED25519();
    const mockedSessionExecute = jest.fn().mockReturnValue({ tokenId: TokenId.fromString("0.0.69") });
    const session = { 
      execute: mockedSessionExecute,
      publicKey
    } as unknown as ApiSession;
    const token = new Token({
      name: "Part Loco Monetar",
      symbol: "PLM",
      type: TokenType.FungibleCommon, 
      keys: {
        kyc: null,
        feeSchedule: null,
        pause: null
      }
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