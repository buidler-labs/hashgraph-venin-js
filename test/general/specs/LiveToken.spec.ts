import { PublicKey, Status } from '@hashgraph/sdk';
import {
  beforeAll, beforeEach, describe, expect, it,
} from '@jest/globals';

import { getTokenToTest, read } from "../../utils";
import { Account } from '../../../lib/static/create/Account';
import { ApiSession } from '../../../lib/ApiSession';
import { Contract } from '../../../lib/static/upload/Contract';
import { LiveToken } from '../../../lib/live/LiveToken';

describe('LiveToken', () => {
  let session: ApiSession;
  let liveToken: LiveToken;

  beforeAll(async () => {
    ({ session: session } = await ApiSession.default());
  });

  beforeEach(async () => {
    liveToken = await session.create(getTokenToTest());
  });

  it("given a token, solidity address is returned as expected", async () => {
    expect(liveToken.getSolidityAddress()).toEqual(liveToken.id.toSolidityAddress());
  });

  it("getting info of newly created token, info is correct", async () => {
    const info = await liveToken.getLiveEntityInfo();
    const accPubKey = session.wallet.account.publicKey.toString();
    const testedTokenInfo = getTokenToTest().info;

    expect(info.adminKey.toString()).toEqual(accPubKey);
    expect(info.supplyKey.toString()).toEqual(accPubKey);
    expect(info.freezeKey.toString()).toEqual(accPubKey);
    expect(info.wipeKey.toString()).toEqual(accPubKey);
    expect(info.pauseKey.toString()).toEqual(accPubKey);
    expect(info.treasuryAccountId.toString()).toEqual(session.wallet.account.id.toString());
    expect(info.name).toEqual(testedTokenInfo.name);
    expect(info.symbol).toEqual(testedTokenInfo.symbol);
    expect(testedTokenInfo.type.equals(info.tokenType)).toBeTruthy();
    expect(info.totalSupply.toNumber()).toEqual(testedTokenInfo.initialSupply);
    expect(info.decimals).toEqual(testedTokenInfo.decimals);
  });

  it("given a token, assigning the supply control to a new account should work as expected", async () => {
    const account = await session.create(new Account());

    await liveToken.assignSupplyControlTo(account.privateKey.publicKey);
    const info = await liveToken.getLiveEntityInfo();

    expect(account.privateKey.publicKey.toString()).toEqual(info.supplyKey.toString());
  });

  it("given a token, assigning the supply control to a new contract should work as expected", async () => {
    const { session } = await ApiSession.default();
    const bytesContract = await Contract.newFrom({ code: read({ contract: 'bytes' }) });
    const liveContract = await session.upload(bytesContract);

    await liveToken.assignSupplyControlTo(liveContract);
    const info = await liveToken.getLiveEntityInfo();

    expect(liveContract.id.toString()).toEqual(info.supplyKey.toString());
  });

  it("given a token, deleting it should return status success", async () => {
    const status = await liveToken.deleteEntity();

    expect(status).toEqual(Status.Success);
  });

  it("given a token, updating it should return status success", async () => {
    const liveAccount = await session.create(new Account());
    const newName = "newName";
    const status = await liveToken.updateEntity({
      keys: {
        freeze: liveAccount.privateKey.publicKey,
      },
      name: newName,
    });

    expect(status).toEqual(Status.Success);

    const info = await liveToken.getLiveEntityInfo();

    expect(info.name).toEqual(newName);
    expect((info.freezeKey as PublicKey).toStringDer()).toEqual(liveAccount.privateKey.publicKey.toStringDer());
  });
});
