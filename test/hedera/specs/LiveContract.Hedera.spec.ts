import {
  describe, expect, it,
} from '@jest/globals';
import { Hbar } from "@hashgraph/sdk";

import { getTokenToTest, read } from "../../utils";
import { Account } from '../../../lib/static/create/Account';
import { ApiSession } from '../../../lib/ApiSession';
import { Contract } from '../../../lib/static/upload/Contract';
import { GasFees } from "../../constants";

describe('LiveContract.Hedera', () => {

  it("given a fungible, live, token, minting over a precompiled contract-service bridge should be permitted", async () => {
    const contract = await Contract.newFrom({ code: read({ contract: 'HelloWorldMint', relativeTo: 'hedera' }), ignoreWarnings: true });

    const { session } = await ApiSession.default();
    const liveToken = await session.create(getTokenToTest());
    const liveContract = await session.upload(contract, { _contract: { gas: 200_000 } }, liveToken);

    // When
    const newTotalSupply = parseInt(await liveContract.brrr(1));
    const liveTokenInfo = await liveToken.getLiveEntityInfo();

    // Then
    expect(newTotalSupply).toEqual(1000 + 1);
    expect(liveTokenInfo.totalSupply.toNumber()).toEqual(newTotalSupply);
  });

  it("given a fungible, live, token, associating it to the client account using the hedera token service precompiled contract works as expected", async () => {
    const token = getTokenToTest();
    const account = new Account({ initialBalance: new Hbar(10) });
    const contract = await Contract.newFrom({ code: read({ contract: 'AssociateDissociateTokens', relativeTo: 'hedera' }), ignoreWarnings: true });

    // Make everything live
    const { controller, session } = await ApiSession.default();
    const aliceLiveAccount = await session.create(account);
    const liveToken = await session.create(token);
    const liveContract = await session.upload(contract, { _contract: { gas: 200_000 } });

    controller.changeAccount(aliceLiveAccount.id, aliceLiveAccount.privateKey)

    // When
    await liveContract.tokenAssociate({ gas: GasFees.associateToken }, aliceLiveAccount, liveToken);
    const aliceInfo = await aliceLiveAccount.getLiveEntityInfo();

    // Then
    expect(aliceInfo.tokenRelationships._map.has(liveToken.id.toString())).toBeTruthy();
  });

  it("given a fungible, live, token, associating and dissociating it to the client account using the hedera token service precompiled works as expected", async () => {
    const token = getTokenToTest();
    const account = new Account({ initialBalance: new Hbar(10) });
    const contract = await Contract.newFrom({ code: read({ contract: 'AssociateDissociateTokens', relativeTo: 'hedera' }), ignoreWarnings: true });

    // Make everything live
    const { controller, session } = await ApiSession.default();
    const aliceLiveAccount = await session.create(account);
    const liveToken = await session.create(token);
    const liveContract = await session.upload(contract, { _contract: { gas: 200_000 } });

    controller.changeAccount(aliceLiveAccount.id, aliceLiveAccount.privateKey)

    // When
    await liveContract.tokenAssociate({ gas: GasFees.associateToken }, aliceLiveAccount, liveToken);
    await liveContract.tokenDissociate({ gas: GasFees.dissociateToken }, aliceLiveAccount, liveToken);
    const aliceInfo = await aliceLiveAccount.getLiveEntityInfo();

    // Then
    expect(aliceInfo.tokenRelationships._map.has(liveToken.id.toString())).toBeFalsy();
  });

  it("given 2 fungible, live, tokens, associating them to the client account using the hedera token service precompiled contract works as expected", async () => {
    const token = getTokenToTest();
    const token2 = getTokenToTest({ name: "Token2", symbol: "T2" });

    const account = new Account({ initialBalance: new Hbar(10) });

    const contract = await Contract.newFrom({ code: read({ contract: 'AssociateDissociateTokens', relativeTo: 'hedera' }), ignoreWarnings: true });

    // Make everything live
    const { controller, session } = await ApiSession.default();
    const aliceLiveAccount = await session.create(account);
    const liveToken = await session.create(token);
    const liveToken2 = await session.create(token2);
    const liveContract = await session.upload(contract, { _contract: { gas: 200_000 } });

    controller.changeAccount(aliceLiveAccount.id, aliceLiveAccount.privateKey);

    // When
    await liveContract.tokensAssociate({ gas: GasFees.associateToken }, aliceLiveAccount, [liveToken, liveToken2]);
    const aliceInfo = await aliceLiveAccount.getLiveEntityInfo();

    // Then
    expect(aliceInfo.tokenRelationships._map.has(liveToken.id.toString())).toBeTruthy();
    expect(aliceInfo.tokenRelationships._map.has(liveToken2.id.toString())).toBeTruthy();
  });

  it("given 2 fungible, live, tokens, associating and dissociating them to the client account using the hedera token service precompiled contract works as expected", async () => {
    const token = getTokenToTest();
    const token2 = getTokenToTest({ name: "Token2", symbol: "T2" });
    const account = new Account({ initialBalance: new Hbar(10) });
    const contract = await Contract.newFrom({ code: read({ contract: 'AssociateDissociateTokens', relativeTo: 'hedera' }), ignoreWarnings: true });

    // Make everything live
    const { controller, session } = await ApiSession.default();
    const aliceLiveAccount = await session.create(account);
    const liveToken = await session.create(token);
    const liveToken2 = await session.create(token2);
    const liveContract = await session.upload(contract, { _contract: { gas: 200_000 } });

    controller.changeAccount(aliceLiveAccount.id, aliceLiveAccount.privateKey)

    // When
    await liveContract.tokensAssociate({ gas: GasFees.associateToken }, aliceLiveAccount, [liveToken, liveToken2]);
    await liveContract.tokensDissociate({ gas: GasFees.dissociateToken }, aliceLiveAccount, [liveToken, liveToken2]);
    const aliceInfo = await aliceLiveAccount.getLiveEntityInfo();

    // Then
    expect(aliceInfo.tokenRelationships._map.has(liveToken.id.toString())).toBeFalsy();
    expect(aliceInfo.tokenRelationships._map.has(liveToken2.id.toString())).toBeFalsy();
  });
});
