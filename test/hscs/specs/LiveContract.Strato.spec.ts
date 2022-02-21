import {
  describe, expect, it
} from '@jest/globals';
import { Hbar } from "@hashgraph/sdk";

import { GasFees, defaultFungibleTokenFeatures, defaultNonFungibleTokenFeatures } from "../../constants";
import { ResourceReadOptions, read as readResource } from "../../utils";
import { Account } from '../../../lib/static/create/Account';
import { ApiSession } from '../../../lib/ApiSession';
import { Contract } from '../../../lib/static/upload/Contract';
import { Token } from '../../../lib/static/create/Token';

function read(what: ResourceReadOptions) {
  return readResource({ relativeTo: 'hscs', ...what })
}

describe('LiveContract.Strato', () => {

  it("given a fungible, live, token, burning over a precompiled contract-service bridge should be permitted", async () => {
    const contract = await Contract.newFrom({ code: read({ contract: 'HelloWorldBurn' }), ignoreWarnings: true });
    const token = new Token({ ...defaultFungibleTokenFeatures, initialSupply: 1000 });

    const { session } = await ApiSession.default();
    const liveToken = await session.create(token);
    const liveContract = await session.upload(contract, { _contract: { gas: 200_000 } }, liveToken);

    // When
    const newTotalSupply = parseInt(await liveContract.ultraSoundMoneyBurning(1));
    const tokenInfo = await liveToken.getLiveEntityInfo();

    // Then
    expect(newTotalSupply).toEqual(1000 - 1);
    expect(tokenInfo.totalSupply.toNumber()).toEqual(newTotalSupply);
  });

  it("given a fungible, live, token, associating it to a live-contract should allow the contract to control the supply and transfer to associated accounts", async () => {
    const token = new Token({ ...defaultFungibleTokenFeatures, initialSupply: 1000 });
    const account = new Account({ maxAutomaticTokenAssociations: 1 });
    const contract = await Contract.newFrom({ code: read({ contract: 'MintTransHTS' }), ignoreWarnings: true });

    // Make everything live
    const { session } = await ApiSession.default();
    const aliceLiveAccount = await session.create(account);
    const liveToken = await session.create(token);
    const liveContract = await session.upload(contract, { _contract: { gas: 200_000 } }, liveToken);

    // When
    await liveToken.assignSupplyControlTo(liveContract);
    await liveContract.mintFungibleToken({ gas: GasFees.mintToken }, 150);
    await liveContract.tokenTransfer({ gas: GasFees.transferToken }, session, aliceLiveAccount, 50);

    const aliceInfo = await aliceLiveAccount.getLiveEntityInfo();
    const tokenInfo = await liveToken.getLiveEntityInfo();

    // Then
    expect(aliceInfo.tokenRelationships._map.get(liveToken.id.toString()).balance.toNumber()).toEqual(50);
    expect(tokenInfo.totalSupply.toNumber()).toEqual(1000 + 150);
  });

  it("given a non-fungible, live, token, a contract would make use of the HTS to mint and make the NFT transfer to associated accounts", async () => {
    const account = new Account({ initialBalance: new Hbar(10), maxAutomaticTokenAssociations: 1 });
    const contract = await Contract.newFrom({ code: read({ contract: 'MintTransHTS' }), ignoreWarnings: true });

    // Make everything live
    const { session } = await ApiSession.default();
    const aliceLiveAccount = await session.create(account);
    const liveToken = await session.create(new Token(defaultNonFungibleTokenFeatures));
    const liveContract = await session.upload(contract, { _contract: { gas: 200_000 } }, liveToken);

    // When
    await liveToken.assignSupplyControlTo(liveContract);
    const serialNumbers = await liveContract.mintNonFungibleToken({ gas: GasFees.mintToken }, ["ipfs-hash"]);
    await liveContract.transferNFT({ gas: GasFees.transferToken }, aliceLiveAccount, serialNumbers[0].toNumber());

    const aliceInfo = await aliceLiveAccount.getLiveEntityInfo();
    const tokenInfo = await liveToken.getLiveEntityInfo();

    // Then
    expect(aliceInfo.ownedNfts.toNumber()).toEqual(1);
    expect(tokenInfo.totalSupply.toNumber()).toEqual(1);
  });

  it("given a non-fungible, live, token, a contract would make use of the HTS to mint multiple and make the NFT transfers to associated accounts", async () => {

    const account = new Account({ maxAutomaticTokenAssociations: 1 });
    const contract = await Contract.newFrom({ code: read({ contract: 'MintTransHTS' }), ignoreWarnings: true });

    // Make everything live
    const { session } = await ApiSession.default();
    const aliceLiveAccount = await session.create(account);
    const benLiveAccount = await session.create(account);
    const liveToken = await session.create(new Token(defaultNonFungibleTokenFeatures));
    const liveContract = await session.upload(contract, { _contract: { gas: 200_000 } }, liveToken);

    // When
    await liveToken.assignSupplyControlTo(liveContract);
    const serialNumbers = await liveContract.mintNonFungibleToken({ gas: GasFees.mintToken }, ["ipfs-hash", "another-ipfs-hash"]);
    await liveContract.transferNFTs({ gas: GasFees.transferToken }, [aliceLiveAccount, benLiveAccount], [serialNumbers[0].toNumber(), serialNumbers[1].toNumber()]);

    const aliceInfo = await aliceLiveAccount.getLiveEntityInfo();
    const benInfo = await benLiveAccount.getLiveEntityInfo();
    const tokenInfo = await liveToken.getLiveEntityInfo();

    // Then
    expect(aliceInfo.ownedNfts.toNumber()).toEqual(1);
    expect(benInfo.ownedNfts.toNumber()).toEqual(1);
    expect(tokenInfo.totalSupply.toNumber()).toEqual(2);
  });
});
