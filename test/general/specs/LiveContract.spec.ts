import { ContractId, Hbar, Status, TokenId, TopicId } from "@hashgraph/sdk";
import { describe, expect, it } from "@jest/globals";
import BigNumber from "bignumber.js";

import { getTokenToTest, load, read } from "../../utils";
import { ApiSession } from "../../../lib/ApiSession";
import { Contract } from "../../../lib/static/upload/Contract";
import { LiveContract } from "../../../lib/live/LiveContract";

describe("LiveContract", () => {
  it("an abstract solidity contract should not be permitted to be uploaded to the network", async () => {
    const { session } = await ApiSession.default();
    const bytesContract = await Contract.newFrom({
      code: read({ contract: "abstract_storage" }),
    });

    expect(async () => await session.upload(bytesContract)).rejects.toThrow();
  });

  it("emitting an event during contract construction time should be returned following a successful upload", async () => {
    const { liveContract, logs } = await load("constructor_event");

    expect(liveContract).toBeInstanceOf(LiveContract);
    expect(logs).toHaveLength(1);
    expect(logs[0]).toEqual({
      name: "Log",
      payload: {
        message: "Hello World!",
      },
    });
  });

  it("given a contract which has methods that make use of the Hedera supported bytes type, calling them should work as expected", async () => {
    const { liveContract } = await load("bytes");
    const sentBytes = Buffer.from("Hello World!", "utf8");
    const sentBytes32 = Buffer.from("0123456789ABCDEFFEDCBA9876543210", "utf8");

    await expect(
      liveContract.set(sentBytes, sentBytes32)
    ).resolves.not.toThrow();

    const [recvBytes, recvBytes32] = await liveContract.get();

    expect(Buffer.compare(recvBytes, sentBytes)).toEqual(0);
    expect(Buffer.compare(recvBytes32, sentBytes32)).toEqual(0);
  });

  it("given a contract which has methods that allow both a state change and return something, when called, the expected value is returned", async () => {
    const liveContract = await load("change_state_with_return");

    await expect(liveContract.num()).resolves.toEqual(new BigNumber(0));
    await expect(liveContract.setAndRetrieve(42)).resolves.toEqual(
      new BigNumber(42)
    );
    await expect(liveContract.num()).resolves.toEqual(new BigNumber(42));
  });

  it("given a method that requires an address, passing it a solidity-addressable instance should resolve to the expected address type", async () => {
    const { session } = await ApiSession.default();
    const naiveOwnerCheckContract = await Contract.newFrom({
      code: read({ contract: "naive_owner_check" }),
    });
    const liveContract = await session.upload(naiveOwnerCheckContract);

    await expect(liveContract.isOwnedBy(session)).resolves.toBeTruthy();
  });

  it("getting info for a contract, the information is correctly fetched", async () => {
    const { liveContract } = await load("naive_owner_check");
    const contractInfo = await liveContract.getLiveEntityInfo();

    await expect(contractInfo.contractId).toBeInstanceOf(ContractId);
  });

  it("calling a live contract method with a bytes32 parameter encoded into hex format is permitted", async () => {
    const { liveContract } = await load("bytes");
    const testedHexString =
      "0x252ea5c5f95e9085d1cd6b85f35a83a2df722cd5e0c7609b5205a36076a61b14";

    await expect(
      liveContract.setBytes32(testedHexString)
    ).resolves.not.toThrow();
  });

  it("by having an instance of a liveContract, transferring hbar to the liveContract, the balance is as expected", async () => {
    const { liveContract } = await load("bytes");
    const status = await liveContract.transferHbarToLiveEntity(1);

    expect(status).toEqual(Status.Success);

    const balance = await liveContract.getBalanceOfLiveEntity();

    expect(balance.hbars.toBigNumber().toNumber()).toEqual(1);
  });

  it("by having an instance of a liveContract, associating a token with the liveContract returns status success", async () => {
    const { session } = await ApiSession.default();
    const bytesContract = await Contract.newFrom({
      code: read({ contract: "bytes" }),
    });
    const liveContract = await session.upload(bytesContract);

    const liveToken = await session.create(getTokenToTest());
    const status = await liveContract.associateTokensWithLiveEntity([
      liveToken.id.toString(),
    ]);

    expect(status).toEqual(Status.Success);
  });

  // FIXME: Enable this once issue #96 gets implemented
  it.skip("calling a live-contract function with complex nested object parameters should be permitted", async () => {
    const { liveContract } = await load("complex_struct_args");
    const groups = [
      {
        groupId: 1,
        groupName: "lighters",
        members: [
          {
            memberId: 2,
            memberName: "Luke",
          },
          {
            memberId: 3,
            memberName: "Obi One",
          },
        ],
      },
      {
        groupId: 2,
        groupName: "darkers",
        members: [
          {
            memberId: 5,
            memberName: "Vader",
          },
        ],
      },
    ];
    const reflectedGroups = await liveContract.reflectGroups(groups);

    expect(reflectedGroups).toEqual(groups);
  });

  it("calling a live-contract function with complex objects that have string addresses as leafs should be permitted", async () => {
    const { liveContract } = await load("complex_struct_args");
    const nftBurns = [
      {
        collectionAddress: "0x0000000000000000000000000000000000000062",
        serialNumbers: [1, 3, 5, 10],
      },
    ];
    const reflectedNftBurns = await liveContract.reflectNftBurns(nftBurns);

    expect(reflectedNftBurns).toHaveLength(1);
    expect(reflectedNftBurns[0].collectionAddress).toEqual(
      nftBurns[0].collectionAddress
    );
    expect(
      reflectedNftBurns[0].serialNumbers.map((serialNumber) =>
        serialNumber.toNumber()
      )
    ).toEqual(nftBurns[0].serialNumbers);
  });

  it("calling a live-contract function with uint argument, giving Hbar as a value, should be successful", async () => {
    const { liveContract } = await load("change_state_with_return");
    await expect(liveContract.setAndRetrieve(new Hbar(1))).resolves.toEqual(
      new BigNumber(new Hbar(1).toTinybars().toString())
    );
  });

  it("calling a live-contract constructor with a deep-nested object should be permitted", async () => {
    const { session } = await ApiSession.default();
    const bytesContract = await Contract.newFrom({
      code: read({ contract: "complex_constructor_args" }),
    });
    const students = [
      {
        firstName: "Vladut",
        id: 1,
        lastName: "OPRISOR",
        livingAddress: {
          city: "Timisoara",
          country: "Romania",
          street: "Martir Constatntin Radu",
        },
        walletAddress: "0x0000000000000000000000000000000000000069",
      },
      {
        firstName: "Victor",
        id: 2,
        lastName: "DeDeTaTorul",
        livingAddress: {
          city: "Giroc",
          country: "Romania",
          street: "Crinului",
        },
        walletAddress: "0x0000000000000000000000000000000000000169",
      },
    ];

    await expect(
      session.upload(bytesContract, students)
    ).resolves.not.toThrow();
  });

  it("given a method that requires an address, passing it a contract-id/token-id/account-id or topic-id should not error out", async () => {
    const { liveContract } = await load("naive_owner_check");

    await expect(
      liveContract.isOwnedBy(liveContract.session.wallet.account.id)
    ).resolves.toBeTruthy();
    await expect(
      liveContract.isOwnedBy(ContractId.fromString("0.0.69"))
    ).resolves.toBeFalsy();
    await expect(
      liveContract.isOwnedBy(TokenId.fromString("0.0.69"))
    ).resolves.toBeFalsy();
    await expect(
      liveContract.isOwnedBy(TopicId.fromString("0.0.69"))
    ).resolves.toBeFalsy();
  });
});
