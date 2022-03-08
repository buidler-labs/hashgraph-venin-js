import {
  beforeAll, beforeEach, describe, expect, it,
} from '@jest/globals';

import { read } from "../../utils";

import { Token, TokenFeatures, TokenTypes } from '../../../lib/static/create/Token';
import { Account } from '../../../lib/static/create/Account';
import { ApiSession } from '../../../lib/ApiSession';
import { Contract } from '../../../lib/static/upload/Contract';
import { LiveToken } from '../../../lib/live/LiveToken';

describe('LiveToken', () => {
  const defaultTokenFeatures: TokenFeatures = {
    decimals: 3,
    initialSupply: 1000,
    name: "Wrapped HBAR",
    symbol: "wHBAR",
    treasuryAccountId: process.env.HEDERAS_OPERATOR_ID,
    type: TokenTypes.FungibleCommon,
  };

  let session: ApiSession;
  let liveToken: LiveToken;

  beforeAll(async () => {
    ({ session: session } = await ApiSession.default());
  });

  beforeEach(async () => {
    liveToken = await session.create(new Token(defaultTokenFeatures));
  });

  it("given a token, solidity address is returned as expected", async () => {
    expect(liveToken.getSolidityAddress()).toEqual(liveToken.id.toSolidityAddress());
  });

  it("getting info of newly created token, info is correct", async () => {
    const info = await liveToken.getLiveEntityInfo();
    const sessionAccount = session.wallet.account;
    const accPubKey = sessionAccount.publicKey.toString();
    expect(info.adminKey.toString()).toEqual(accPubKey);
    expect(info.supplyKey.toString()).toEqual(accPubKey);
    expect(info.freezeKey.toString()).toEqual(accPubKey);
    expect(info.wipeKey.toString()).toEqual(accPubKey);
    expect(info.pauseKey.toString()).toEqual(accPubKey);
    expect(info.treasuryAccountId.toString()).toEqual(sessionAccount.id.toString());
    expect(info.name).toEqual(defaultTokenFeatures.name);
    expect(info.symbol).toEqual(defaultTokenFeatures.symbol);
    expect(defaultTokenFeatures.type.equals(info.tokenType)).toBeTruthy();
    expect(info.totalSupply.toNumber()).toEqual(defaultTokenFeatures.initialSupply);
    expect(info.decimals).toEqual(defaultTokenFeatures.decimals);
  });

  it("given a token, assigning the supply control to a new account should work as expected", async () => {
    const account = await session.create(new Account());

    await liveToken.assignSupplyControlTo(account.publicKey);
    const info = await liveToken.getLiveEntityInfo();

    expect(account.publicKey.toString()).toEqual(info.supplyKey.toString());
  });

  it("given a token, assigning the supply control to a new contract should work as expected", async () => {
    const { session } = await ApiSession.default();
    const bytesContract = await Contract.newFrom({ code: read({ contract: 'bytes' }) });
    const liveContract = await session.upload(bytesContract);

    await liveToken.assignSupplyControlTo(liveContract);
    const info = await liveToken.getLiveEntityInfo();

    expect(liveContract.id.toString()).toEqual(info.supplyKey.toString());
  });

});
