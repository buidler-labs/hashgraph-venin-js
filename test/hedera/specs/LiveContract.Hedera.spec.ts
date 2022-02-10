import {
  describe, expect, it
} from '@jest/globals';
import { TokenType, Hbar } from "@hashgraph/sdk";

import { read } from "../../utils";
import { Contract } from '../../../lib/static/upload/Contract';
import { ApiSession } from '../../../lib/ApiSession';
import { Account, KeyType } from '../../../lib/static/create/Account';
import { Token } from '../../../lib/static/create/Token';

describe('LiveContract.Hedera', () => {
  it("given a fungible, live, token, minting over a precompiled contract-service bridge should be permitted", async () => {
    const contract = await Contract.newFrom({ code: read({ contract: 'HelloWorldMint', relativeTo: 'hedera' }), ignoreWarnings: true });
    const token = new Token({ name: "PLM", symbol: "$", type: TokenType.FungibleCommon, initialSupply: 1000 });

    const { session } = await ApiSession.default();
    const liveToken = await session.create(token);
    const liveContract = await session.upload(contract, { _contract: { gas: 200_000 } }, liveToken);

    const newTotalSupply = parseInt(await liveContract.brrr(1));

    await expect(newTotalSupply).toEqual(1000 + 1);
    
    const tokenInfo = await liveToken.getInfo();
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
    
    const tokenInfo = await liveToken.getInfo();
    expect(tokenInfo.totalSupply.toNumber()).toEqual(newTotalSupply);
  });

  it("given a fungible, live, token, associating it to a live-contract should allow the contract to control the supply and transfer to associated accounts", async () => {
    const token = new Token({
      decimals: 0,
      initialSupply: 1000,
      name: "hbarRocks",
      symbol: "HROK",
      type: TokenType.FungibleCommon
    });

    const account = new Account({
      generateKey: true,
      keyType: KeyType.ED25519,
      maxAutomaticTokenAssociations: 1
    });

    const contract = await Contract.newFrom({ code: read({ contract: 'MintAssoTransHTS', relativeTo: 'hedera' }), ignoreWarnings: true });

    // Make everything live
    const { session } = await ApiSession.default();
    const aliceLiveAccount = await session.create(account);
    const liveToken = await session.create(token);
    const liveContract = await session.upload(contract, { _contract: { gas: 200_000 } }, liveToken);

    // When
    await liveToken.assignSupplyControlTo(liveContract);
    await liveContract.mintFungibleToken(150);
    await liveContract.tokenTransfer(session, aliceLiveAccount, 50);

    const aliceInfo = await aliceLiveAccount.getInfo();
    const tokenInfo = await liveToken.getInfo();
    
    expect(aliceInfo.tokenRelationships._map.get(liveToken.id.toString()).balance.toNumber())
      .toEqual(50);
    expect(tokenInfo.totalSupply.toNumber()).toEqual(1000 + 150);
  });

  it("given a fungible, live, token, associating it to the client account using the hedera token service precompiled contract works as expected", async () => {
    const token = new Token({ name: "wHBAR", symbol: "wHBAR", type: TokenType.FungibleCommon, initialSupply: 1000 });
  
    const account = new Account({
      generateKey: true,
      keyType: KeyType.ED25519,
      initialBalance: new Hbar(10)
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
  
    const aliceInfo = await aliceLiveAccount.getInfo();
    
    expect(aliceInfo.tokenRelationships._map.has(liveToken.id.toString())).toBeTruthy();
  
  });

  it("given a fungible, live, token, associating and dissociating it to the client account using the hedera token service precompiled works as expected", async () => {
    const token = new Token({ name: "wHBAR", symbol: "wHBAR", type: TokenType.FungibleCommon, initialSupply: 1000 });
  
    const account = new Account({
      generateKey: true,
      keyType: KeyType.ED25519,
      initialBalance: new Hbar(10)
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

    const aliceInfo = await aliceLiveAccount.getInfo();
    
    expect(aliceInfo.tokenRelationships._map.has(liveToken.id.toString())).toBeFalsy();
  
  });

  it("given 2 fungible, live, tokens, associating them to the client account using the hedera token service precompiled contract works as expected", async () => {
    const token = new Token({ name: "wHBAR", symbol: "wHBAR", type: TokenType.FungibleCommon, initialSupply: 1000 });
    const token2 = new Token({ name: "wHBAR2", symbol: "wHBAR2", type: TokenType.FungibleCommon, initialSupply: 1000 });

    const account = new Account({
      generateKey: true,
      keyType: KeyType.ED25519,
      initialBalance: new Hbar(10)
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
    await liveContract.tokensAssociate(aliceLiveAccount, [liveToken.getSolidityAddress(), liveToken2.getSolidityAddress()]);
  
    const aliceInfo = await aliceLiveAccount.getInfo();
    
    expect(aliceInfo.tokenRelationships._map.has(liveToken.id.toString())).toBeTruthy();
    expect(aliceInfo.tokenRelationships._map.has(liveToken2.id.toString())).toBeTruthy();
  
  });

  it("given 2 fungible, live, tokens, associating and dissociating them to the client account using the hedera token service precompiled contract works as expected", async () => {
    const token = new Token({ name: "wHBAR", symbol: "wHBAR", type: TokenType.FungibleCommon, initialSupply: 1000 });
    const token2 = new Token({ name: "wHBAR2", symbol: "wHBAR2", type: TokenType.FungibleCommon, initialSupply: 1000 });

    const account = new Account({
      generateKey: true,
      keyType: KeyType.ED25519,
      initialBalance: new Hbar(10)
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
    await liveContract.tokensAssociate(aliceLiveAccount, [liveToken.getSolidityAddress(), liveToken2.getSolidityAddress()]);
    await liveContract.tokensDissociate(aliceLiveAccount, [liveToken.getSolidityAddress(), liveToken2.getSolidityAddress()]);
    const aliceInfo = await aliceLiveAccount.getInfo();
    
    expect(aliceInfo.tokenRelationships._map.has(liveToken.id.toString())).toBeFalsy();
    expect(aliceInfo.tokenRelationships._map.has(liveToken2.id.toString())).toBeFalsy();
  
  });

});



