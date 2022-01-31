import {
    describe, expect, it
} from '@jest/globals';
import { TokenType } from "@hashgraph/sdk";

import { read } from "../../utils";
import { Contract } from '../../../lib/static/upload/Contract';
import { ApiSession } from '../../../lib/ApiSession';
import { Account } from '../../../lib/static/create/Account';
import { Token } from '../../../lib/static/create/Token';

describe('LiveContract.Hedera', () => {
  it("given a non-fungible, live, token, minting over a precompiled contract-service bridge should be permitted", async () => {
    const contract = await Contract.newFrom({ code: read({ contract: 'HelloWorldMint', relativeTo: 'hedera' }), ignoreWarnings: true });
    const token = new Token({ name: "PLM", symbol: "$", type: TokenType.FungibleCommon, initialSupply: 1000 });

    const session = await ApiSession.default();
    const liveToken = await session.create(token);
    const liveContract = await session.upload(contract, { _contract: { gas: 200_000 } }, liveToken);

    await expect(liveContract.brrr(1)).resolves.toBeUndefined();
  });

  // TODO: enable this once LiveAccount-s can sign Contract Call Transactions in which they are referenced
  it.skip("given a non-fungible, live, token, associating it to a live-contract should allow the contract to control the supply and transfer to associated accounts", async () => {
    const token = new Token({
      decimals: 0,
      initialSupply: 1000,
      name: "hbarRocks", 
      symbol: "HROK", 
      type: TokenType.FungibleCommon
    });
    const contract = await Contract.newFrom({ code: read({ contract: 'HederaTokenService', relativeTo: 'hedera' }), ignoreWarnings: true });

    // Make everything live
    const session = await ApiSession.default();
    const aliceLiveAccount = await session.create(new Account());
    const liveToken = await session.create(token);
    const liveContract = await session.upload(contract, { _contract: { gas: 200_000 } }, liveToken);

    // When
    await liveToken.assignSupplyControlTo(liveContract);
    await liveContract.mintFungibleToken(150);
    await liveContract.tokenAssociate(aliceLiveAccount);
    await liveContract.tokenTransfer(session, aliceLiveAccount, 50);

    // TODO: then ...
  });
});
