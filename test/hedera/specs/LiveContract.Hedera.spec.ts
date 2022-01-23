import {
    describe, expect, it
} from '@jest/globals';
import { TokenType } from "@hashgraph/sdk";

import { read } from "../../utils";
import { HederaNetwork } from '../../../lib/HederaNetwork';
import { Contract } from '../../../lib/static/Contract';
  
describe('LiveContract.Hedera', () => {
  it("given a non-fungible, live, token, minting over a precompiled contract-service bridge should be permitted", async () => {
    const session = await HederaNetwork.defaultApiSession();
    const liveToken = await session.createToken({ name: "PLM", symbol: "$", type: TokenType.FungibleCommon, initialSupply: 1000 });
    const contract = await Contract.newFrom({ code: read({ contract: 'HelloWorldMint', relativeTo: 'hedera' }), ignoreWarnings: true });
    const liveContract = await session.upload(contract, { _contract: { gas: 200_000 } }, liveToken);

    await expect(liveContract.brrr(1)).resolves.toBeUndefined();
  });
});
