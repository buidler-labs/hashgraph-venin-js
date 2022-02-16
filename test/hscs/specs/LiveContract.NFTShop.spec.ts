import { ContractExecuteTransaction, ContractFunctionParameters, Hbar, PrivateKey } from "@hashgraph/sdk";
import {
  describe, expect, it
} from '@jest/globals';

import { GasFees, defaultNonFungibleTokenFeatures } from "../../constants";
import { ResourceReadOptions, read as readResource } from "../../utils";
import { Account } from '../../../lib/static/create/Account';
import { ApiSession } from '../../../lib/ApiSession';
import { Contract } from '../../../lib/static/upload/Contract';
import { LiveAccountWithPrivateKey } from '../../../lib/live/LiveAccount';
import { Token } from '../../../lib/static/create/Token';

function read(what: ResourceReadOptions) {
  return readResource({ relativeTo: 'hscs', ...what })
}

describe('LiveContract.NFTShop', () => {

  it("Given an NFT Shop, a user is able to mint", async () => {
    const nftPrice = new Hbar(10);
    const amountToMint = 5;

    const { session } = await ApiSession.default();
    const account = new Account({ initialBalance: new Hbar(80), maxAutomaticTokenAssociations: 1 });
    const contract = await Contract.newFrom({ code: read({ contract: 'NFTShop' }), ignoreWarnings: true });
    const client = session.network.getClient().setOperator(process.env.HEDERAS_OPERATOR_ID, process.env.HEDERAS_OPERATOR_KEY);
    const privKey = PrivateKey.fromString(process.env.HEDERAS_OPERATOR_KEY);
    const token = new Token(defaultNonFungibleTokenFeatures);

    const aliceLiveAccount = await session.create(account);
    const aliceClient = session.network.getClient().setOperator(aliceLiveAccount.id, aliceLiveAccount.privateKey);
    const tokenOwnerAccount = new LiveAccountWithPrivateKey({
      id: client._operator.accountId,
      privateKey: privKey,
      publicKey: client._operator.publicKey,
      session
    });
    const liveToken = await session.create(token);
    const liveContract = await session.upload(
      contract,
      { _contract: { gas: 200_000 } },
      liveToken,
      client._operator.accountId.toSolidityAddress(),
      nftPrice.toTinybars().toNumber(),
      "ipfs-hash"
    );

    liveToken.assignSupplyControlTo(liveContract);

    const transaction = new ContractExecuteTransaction()
      .setContractId(liveContract.id)
      .setFunction("mint", new ContractFunctionParameters().addAddress(aliceLiveAccount.getSolidityAddress()).addUint256(amountToMint))
      .setPayableAmount(new Hbar(50))
      .setGas(GasFees.mintToken.toTinybars())
      .freezeWith(aliceClient)
    tokenOwnerAccount.tryToSign(transaction);

    const execute = await transaction.execute(aliceClient);
    await execute.getRecord(aliceClient);

    const aliceInfo = await aliceLiveAccount.getLiveEntityInfo();
    const contractInfo = await liveContract.getLiveEntityInfo();
    expect(aliceInfo.ownedNfts.toNumber()).toEqual(5);
    expect(aliceInfo.balance.toBigNumber().toNumber()).toBeLessThanOrEqual(30);
    expect(contractInfo.balance.toBigNumber().toNumber()).toEqual(50);

  });

  it("Given an NFT Shop, treasury is able to mint for user", async () => {
    const nftPrice = new Hbar(10);
    const amountToMint = 5;

    const account = new Account({ maxAutomaticTokenAssociations: 1 });
    const token = new Token(defaultNonFungibleTokenFeatures);
    const contract = await Contract.newFrom({ code: read({ contract: 'NFTShop' }), ignoreWarnings: true });

    const { session } = await ApiSession.default();
    const aliceLiveAccount = await session.create(account);

    const liveToken = await session.create(token);
    const liveContract = await session.upload(
      contract,
      liveToken,
      session.accountId.toSolidityAddress(),
      nftPrice.toTinybars().toNumber(),
      "ipfs-hash"
    );

    liveToken.assignSupplyControlTo(liveContract);

    await liveContract.mint(
      {
        amount: new Hbar(nftPrice.toBigNumber().toNumber() * amountToMint),
        gas: 1_500_000
      },
      aliceLiveAccount,
      amountToMint
    );

    const aliceInfo = await aliceLiveAccount.getLiveEntityInfo();
    const contractInfo = await liveContract.getLiveEntityInfo();
    expect(aliceInfo.ownedNfts.toNumber()).toEqual(5);
    expect(contractInfo.balance.toBigNumber().toNumber()).toEqual(50);

  });
});
