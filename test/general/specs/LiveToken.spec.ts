import {
    expect, describe, it, beforeEach, beforeAll
} from '@jest/globals';

import { read } from "../../utils";

import { ApiSession } from '../../../lib/ApiSession';
import { LiveToken } from '../../../lib/live/LiveToken';
import { Contract } from '../../../lib/static/upload/Contract';
import { Token, TokenFeatures } from '../../../lib/static/create/Token';
import { Account } from '../../../lib/static/create/Account';
import { TokenType } from '@hashgraph/sdk';

describe('LiveToken', () => {
    const defaultTokenFeatures: TokenFeatures = {
        name: "Wrapped HBAR",
        symbol: "wHBAR",
        initialSupply: 1000,
        decimals: 3,
        treasuryAccountId: process.env.HEDERAS_OPERATOR_ID,
        type: TokenType.FungibleCommon
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
        const info = await liveToken.getInfo();
        const accPubKey = session.publicKey.toString();
        expect(info.adminKey.toString()).toEqual(accPubKey);
        expect(info.supplyKey.toString()).toEqual(accPubKey);
        expect(info.freezeKey.toString()).toEqual(accPubKey);
        expect(info.wipeKey.toString()).toEqual(accPubKey);
        expect(info.pauseKey.toString()).toEqual(accPubKey);
        expect(info.treasuryAccountId.toString()).toEqual(session.accountId.toString());
        expect(info.name).toEqual(defaultTokenFeatures.name);
        expect(info.symbol).toEqual(defaultTokenFeatures.symbol);
        expect(info.tokenType).toEqual(defaultTokenFeatures.type);
        expect(info.totalSupply.toNumber()).toEqual(defaultTokenFeatures.initialSupply);
        expect(info.decimals).toEqual(defaultTokenFeatures.decimals);
    });

    it("given a token, assigning the supply control to a new account should work as expected", async () => {
        const account = await session.create(new Account());

        await liveToken.assignSupplyControlTo(account.publicKey);
        const info = await liveToken.getInfo();

        expect(account.publicKey.toString()).toEqual(info.supplyKey.toString());
    });

    it("given a token, assigning the supply control to a new contract should work as expected", async () => {
        const { session } = await ApiSession.default();
        const bytesContract = await Contract.newFrom({ code: read({ contract: 'bytes' }) });
        const liveContract = await session.upload(bytesContract);

        await liveToken.assignSupplyControlTo(liveContract);
        const info = await liveToken.getInfo();

        expect(liveContract.id.toString()).toEqual(info.supplyKey.toString());
    });

});
