import {
  ContractExecuteTransaction,
  Hbar,
  PrivateKey,
  TokenSupplyType,
} from "@hashgraph/sdk";
import { describe, expect, it } from "@jest/globals";

import { Account } from "../../../lib/static/create/Account";
import { ApiSession } from "../../../lib/ApiSession";
import { Contract } from "../../../lib/static/upload/Contract";
import { GasFees } from "../../constants";
import { LiveAccountWithPrivateKey } from "../../../lib/live/LiveAccount";
import { StratoContractArgumentsEncoder } from "../../../lib/core/StratoContractArgumentsEncoder";
import { TokenTypes } from "../../../lib/static/create/Token";
import { getTokenToTest } from "../../utils";

function getContractPath(fileName: string) {
  return `hscs/contracts/${fileName}.sol`;
}

describe("LiveContract.NFTShop", () => {
  it("Given an NFT Shop, a user is able to mint", async () => {
    const nftPrice = new Hbar(10);
    const amountToMint = 5;

    const { session } = await ApiSession.default();
    const account = new Account({
      initialBalance: new Hbar(80),
      maxAutomaticTokenAssociations: 1,
    });
    const contract = await Contract.newFrom({
      ignoreWarnings: true,
      path: getContractPath("NFTShop"),
    });
    const client = session.network
      .getClient()
      .setOperator(
        process.env.HEDERAS_OPERATOR_ID,
        process.env.HEDERAS_OPERATOR_KEY
      );
    const privKey = PrivateKey.fromString(process.env.HEDERAS_OPERATOR_KEY);
    const token = getTokenToTest(
      {
        decimals: 0,
        maxSupply: 10,
        supplyType: TokenSupplyType.Finite,
      },
      TokenTypes.NonFungibleUnique,
      false
    );

    const aliceLiveAccount = await session.create(account);
    const aliceClient = session.network
      .getClient()
      .setOperator(aliceLiveAccount.id, aliceLiveAccount.privateKey);
    const tokenOwnerAccount = new LiveAccountWithPrivateKey({
      id: client._operator.accountId,
      privateKey: privKey,
      session,
    });
    const liveToken = await session.create(token);
    const liveContract = await session.upload(
      contract,
      { _contract: { gas: 200_000 } },
      liveToken,
      client._operator.accountId.toSolidityAddress(),
      nftPrice,
      "0xbeef"
    );

    liveToken.assignSupplyControlTo(liveContract);

    const transaction = new ContractExecuteTransaction()
      .setContractId(liveContract.id)
      .setFunctionParameters(
        new StratoContractArgumentsEncoder(contract.interface).encode(
          [aliceLiveAccount, amountToMint],
          "mint"
        )
      )
      .setPayableAmount(new Hbar(50))
      .setGas(GasFees.mintToken.toTinybars())
      .freezeWith(aliceClient);
    const signedTransaction = await tokenOwnerAccount.sign(transaction);

    const execute = await signedTransaction.execute(aliceClient);
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
    const metadata = Buffer.from(
      "Qmbp4hqKpwNDYjqQxsAAm38wgueSY8U2BSJumL74wyX2Dy"
    );

    const account = new Account({ maxAutomaticTokenAssociations: 1 });
    const token = getTokenToTest(
      {
        decimals: 0,
        maxSupply: 10,
        supplyType: TokenSupplyType.Finite,
      },
      TokenTypes.NonFungibleUnique,
      false
    );
    const contract = await Contract.newFrom({
      path: getContractPath("NFTShop"),
    });

    const { session } = await ApiSession.default();

    const aliceLiveAccount = await session.create(account);
    const liveToken = await session.create(token);
    const liveContract = await session.upload(
      contract,
      { _contract: { gas: 250_000 } },
      liveToken,
      session,
      nftPrice,
      metadata
    );

    liveToken.assignSupplyControlTo(liveContract);

    liveContract.onEvent("NftMint", ({ tokenAddress, serialNumbers }) => {
      session.log.info(
        "NFTs minted",
        tokenAddress,
        serialNumbers.map((item) => item.toNumber())
      );
    });

    liveContract.onEvent(
      "NftTransfer",
      ({ tokenAddress, from, to, serialNumbers }) => {
        session.log.info(
          "NFTs transferred",
          tokenAddress,
          serialNumbers.map((item) => item.toNumber()),
          from,
          to
        );
      }
    );

    const serialNumbers = await liveContract.mint(
      {
        amount: new Hbar(nftPrice.toBigNumber().toNumber() * amountToMint),
        gas: 2_000_000,
      },
      aliceLiveAccount,
      amountToMint
    );

    session.log.info(
      "Serial numbers minted by the smart contract",
      serialNumbers.map((item) => item.toNumber())
    );

    const aliceInfo = await aliceLiveAccount.getLiveEntityInfo();
    const contractInfo = await liveContract.getLiveEntityInfo();

    session.log.info(
      `Number of NFTs owned by Alice: ${aliceInfo.ownedNfts.toNumber()}`
    );
    session.log.info(
      `HBar balance of contract: ${contractInfo.balance
        .toBigNumber()
        .toNumber()}`
    );
    expect(aliceInfo.ownedNfts.toNumber()).toEqual(serialNumbers.length);
    expect(contractInfo.balance.toBigNumber().toNumber()).toEqual(
      nftPrice.toBigNumber().toNumber() * amountToMint
    );
  });
});
