import {
  describe, expect, it
} from '@jest/globals';

import { Hbar, TokenType } from "@hashgraph/sdk";

import { Account, KeyType } from '../../../lib/static/create/Account';
import { ApiSession } from '../../../lib/ApiSession';
import { Contract } from '../../../lib/static/upload/Contract';
import { Token } from '../../../lib/static/create/Token';
import { defaultNonFungibleTokenSpecs } from "../../constants";
import { read } from "../../utils";

describe('LiveContract.Hedera', () => {
  it("given a fungible, live, token, minting over a precompiled contract-service bridge should be permitted", async () => {
    const contract = await Contract.newFrom({ code: read({ contract: 'HelloWorldMint', relativeTo: 'hedera' }), ignoreWarnings: true });
    const token = new Token({ name: "PLM", symbol: "$", type: TokenType.FungibleCommon, initialSupply: 1000 });

    const { session } = await ApiSession.default();
    const liveToken = await session.create(token);
    const liveContract = await session.upload(contract, { _contract: { gas: 200_000 } }, liveToken);

    const newTotalSupply = parseInt(await liveContract.brrr(1));

    await expect(newTotalSupply).toEqual(1000 + 1);
    
    const tokenInfo = await liveToken.getLiveEntityInfo();
    expect(tokenInfo.totalSupply.toNumber()).toEqual(newTotalSupply);
  });

  it("given a fungible, live, token, burning over a precompiled contract-service bridge should be permitted", async () => {
    const contract = await Contract.newFrom({ code: read({ contract: 'HelloWorldBurn', relativeTo: 'hedera' }), ignoreWarnings: true });
    const token = new Token({ name: "Hedera", symbol: "HBAR", type: TokenType.FungibleCommon, initialSupply: 1000 });

    const { session } = await ApiSession.default();
    const liveToken = await session.create(token);
    const liveContract = await session.upload(contract, { _contract: { gas: 200_000 } }, liveToken);

    const newTotalSupply = parseInt(await liveContract.ultraSoundMoneyBurning(1));

    await expect(newTotalSupply).toEqual(1000 - 1);
    
    const tokenInfo = await liveToken.getLiveEntityInfo();
    expect(tokenInfo.totalSupply.toNumber()).toEqual(newTotalSupply);
  });

  it("given a fungible, live, token, associating it to a live-contract should allow the contract to control the supply and transfer to associated accounts", async () => {
    const token = new Token({
      decimals: 0,
      initialSupply: 1000,
      keys: {
        kyc: null
      },
      name: "hbarRocks",
      symbol: "HROK",
      type: TokenType.FungibleCommon
    });

    const account = new Account({
      generateKey: true,
      keyType: KeyType.ED25519,
      maxAutomaticTokenAssociations: 1
    });

    const contract = await Contract.newFrom({ code: read({ contract: 'MintTransHTS', relativeTo: 'hedera' }), ignoreWarnings: true });

    // Make everything live
    const { session } = await ApiSession.default();
    const aliceLiveAccount = await session.create(account);
    const liveToken = await session.create(token);
    const liveContract = await session.upload(contract, { _contract: { gas: 200_000 } }, liveToken);

    // When
    await liveToken.assignSupplyControlTo(liveContract);
    await liveContract.mintFungibleToken(150);
    await liveContract.tokenTransfer(session, aliceLiveAccount, 50);

    const aliceInfo = await aliceLiveAccount.getLiveEntityInfo();
    const tokenInfo = await liveToken.getLiveEntityInfo();
    
    expect(aliceInfo.tokenRelationships._map.get(liveToken.id.toString()).balance.toNumber())
      .toEqual(50);
    expect(tokenInfo.totalSupply.toNumber()).toEqual(1000 + 150);
  });

  it("given a fungible, live, token, associating it to the client account using the hedera token service precompiled contract works as expected", async () => {
    const token = new Token({ initialSupply: 1000, name: "wHBAR", symbol: "wHBAR", type: TokenType.FungibleCommon });
  
    const account = new Account({
      generateKey: true,
      initialBalance: new Hbar(10),
      keyType: KeyType.ED25519
    });

    const contract = await Contract.newFrom({ code: read({ contract: 'AssociateDissociateTokens', relativeTo: 'hedera' }), ignoreWarnings: true });
  
    // Make everything live
    const { controller, session } = await ApiSession.default();
    const aliceLiveAccount = await session.create(account);
    const liveToken = await session.create(token);
    const liveContract = await session.upload(contract, { _contract: { gas: 200_000 } });
  
    controller.changeAccount(aliceLiveAccount.id, aliceLiveAccount.privateKey)

    // When
    await liveContract.tokenAssociate(aliceLiveAccount, liveToken);
  
    const aliceInfo = await aliceLiveAccount.getLiveEntityInfo();
    
    expect(aliceInfo.tokenRelationships._map.has(liveToken.id.toString())).toBeTruthy();
  
  });

  it("given a fungible, live, token, associating and dissociating it to the client account using the hedera token service precompiled works as expected", async () => {
    const token = new Token({ initialSupply: 1000, name: "wHBAR", symbol: "wHBAR", type: TokenType.FungibleCommon });
  
    const account = new Account({
      generateKey: true,
      initialBalance: new Hbar(10),
      keyType: KeyType.ED25519
    });

    const contract = await Contract.newFrom({ code: read({ contract: 'AssociateDissociateTokens', relativeTo: 'hedera' }), ignoreWarnings: true });
  
    // Make everything live
    const { controller, session } = await ApiSession.default();
    const aliceLiveAccount = await session.create(account);
    const liveToken = await session.create(token);
    const liveContract = await session.upload(contract, { _contract: { gas: 200_000 } });
  
    controller.changeAccount(aliceLiveAccount.id, aliceLiveAccount.privateKey)

    // When
    await liveContract.tokenAssociate(aliceLiveAccount, liveToken);
    await liveContract.tokenDissociate(aliceLiveAccount, liveToken);
    const aliceInfo = await aliceLiveAccount.getLiveEntityInfo();
    
    // Then
    expect(aliceInfo.tokenRelationships._map.has(liveToken.id.toString())).toBeFalsy();
  
  });

  it("given 2 fungible, live, tokens, associating them to the client account using the hedera token service precompiled contract works as expected", async () => {
    const token = new Token({ initialSupply: 1000, name: "wHBAR", symbol: "wHBAR", type: TokenType.FungibleCommon });
    const token2 = new Token({ initialSupply: 1000, name: "wHBAR2", symbol: "wHBAR2", type: TokenType.FungibleCommon });

    const account = new Account({
      generateKey: true,
      initialBalance: new Hbar(10),
      keyType: KeyType.ED25519
    });

    const contract = await Contract.newFrom({ code: read({ contract: 'AssociateDissociateTokens', relativeTo: 'hedera' }), ignoreWarnings: true });
  
    // Make everything live
    const { controller, session } = await ApiSession.default();
    const aliceLiveAccount = await session.create(account);
    const liveToken = await session.create(token);
    const liveToken2 = await session.create(token2);
    const liveContract = await session.upload(contract, { _contract: { gas: 200_000 } });
  
    controller.changeAccount(aliceLiveAccount.id, aliceLiveAccount.privateKey);

    // When
    await liveContract.tokensAssociate(aliceLiveAccount, [liveToken, liveToken2]);
  
    const aliceInfo = await aliceLiveAccount.getLiveEntityInfo();
    
    expect(aliceInfo.tokenRelationships._map.has(liveToken.id.toString())).toBeTruthy();
    expect(aliceInfo.tokenRelationships._map.has(liveToken2.id.toString())).toBeTruthy();
  
  });

  it("given 2 fungible, live, tokens, associating and dissociating them to the client account using the hedera token service precompiled contract works as expected", async () => {
    const token = new Token({ initialSupply: 1000, name: "wHBAR", symbol: "wHBAR", type: TokenType.FungibleCommon });
    const token2 = new Token({ initialSupply: 1000, name: "wHBAR2", symbol: "wHBAR2", type: TokenType.FungibleCommon });

    const account = new Account({
      generateKey: true,
      initialBalance: new Hbar(10),
      keyType: KeyType.ED25519
    });

    const contract = await Contract.newFrom({ code: read({ contract: 'AssociateDissociateTokens', relativeTo: 'hedera' }), ignoreWarnings: true });
  
    // Make everything live
    const { controller, session } = await ApiSession.default();
    const aliceLiveAccount = await session.create(account);
    const liveToken = await session.create(token);
    const liveToken2 = await session.create(token2);
    const liveContract = await session.upload(contract, { _contract: { gas: 200_000 } });
  
    controller.changeAccount(aliceLiveAccount.id, aliceLiveAccount.privateKey)

    // When
    await liveContract.tokensAssociate(aliceLiveAccount, [liveToken, liveToken2]);
    await liveContract.tokensDissociate(aliceLiveAccount, [liveToken, liveToken2]);
    const aliceInfo = await aliceLiveAccount.getLiveEntityInfo();
    
    // Then
    expect(aliceInfo.tokenRelationships._map.has(liveToken.id.toString())).toBeFalsy();
    expect(aliceInfo.tokenRelationships._map.has(liveToken2.id.toString())).toBeFalsy();
  
  });

  it("given a non-fungible, live, token, a contract would make use of the HTS to mint and make the NFT transfer to associated accounts", async () => {

    const account = new Account({
      generateKey: true,
      keyType: KeyType.ED25519,
      maxAutomaticTokenAssociations: 1
    });

    const contract = await Contract.newFrom({ code: read({ contract: 'MintTransHTS', relativeTo: 'hedera' }), ignoreWarnings: true });

    // Make everything live
    const { session } = await ApiSession.default();
    const aliceLiveAccount = await session.create(account);
    const liveToken = await session.create(new Token(defaultNonFungibleTokenSpecs));
    const liveContract = await session.upload(contract, { _contract: { gas: 200_000 } }, liveToken);

    // When
    await liveToken.assignSupplyControlTo(liveContract);
    const serialNumbers = await liveContract.mintNonFungibleToken(["ipfs-hash"]);
    await liveContract.transferNFT(aliceLiveAccount, serialNumbers[0].toNumber());

    const aliceInfo = await aliceLiveAccount.getLiveEntityInfo();
    const tokenInfo = await liveToken.getLiveEntityInfo();
    
    expect(aliceInfo.ownedNfts.toNumber()).toEqual(1);
    expect(tokenInfo.totalSupply.toNumber()).toEqual(1);
  });

  it("given a non-fungible, live, token, a contract would make use of the HTS to mint multiple and make the NFT transfers to associated accounts", async () => {

    const account = new Account({
      generateKey: true,
      keyType: KeyType.ED25519,
      maxAutomaticTokenAssociations: 1
    });

    const contract = await Contract.newFrom({ code: read({ contract: 'MintTransHTS', relativeTo: 'hedera' }), ignoreWarnings: true });

    // Make everything live
    const { session } = await ApiSession.default();
    const aliceLiveAccount = await session.create(account);
    const benLiveAccount = await session.create(account);
    const liveToken = await session.create(new Token(defaultNonFungibleTokenSpecs));
    const liveContract = await session.upload(contract, { _contract: { gas: 200_000 } }, liveToken);

    // When
    await liveToken.assignSupplyControlTo(liveContract);
    const serialNumbers = await liveContract.mintNonFungibleToken(["ipfs-hash", "another-ipfs-hash"]);
    await liveContract.transferNFTs([aliceLiveAccount, benLiveAccount], [serialNumbers[0].toNumber(), serialNumbers[1].toNumber()]);

    const aliceInfo = await aliceLiveAccount.getLiveEntityInfo();
    const benInfo = await benLiveAccount.getLiveEntityInfo();
    const tokenInfo = await liveToken.getLiveEntityInfo();
    
    expect(aliceInfo.ownedNfts.toNumber()).toEqual(1);
    expect(benInfo.ownedNfts.toNumber()).toEqual(1);
    expect(tokenInfo.totalSupply.toNumber()).toEqual(2);
  });

});



