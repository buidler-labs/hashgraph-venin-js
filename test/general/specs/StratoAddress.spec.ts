import {
  describe, expect, it,
} from '@jest/globals';
import {
  AccountId,
} from '@hashgraph/sdk';

import { load, read } from "../../utils";
import { Account } from '../../../lib/static/create/Account';
import { ApiSession } from "../../../lib/ApiSession";
import { Contract } from "../../../lib/static/upload/Contract";
import { LiveAccount } from '../../../lib/live/LiveAccount';
import { StratoAddress } from "../../../lib/core/StratoAddress";

describe('LiveAddress', () => {
  it("given an all-caps address, the resulting LiveAddress id should be lower-capsed, matching hedera's toSolidityAddress behavior", async () => {
    const { session } = await ApiSession.default();
    const allUpperCasedAddress = "0000000000000000000000000000000000000ABC";
    const liveAddress = new StratoAddress(session, allUpperCasedAddress);

    expect(liveAddress.id).toEqual(allUpperCasedAddress.toLowerCase());
    expect(liveAddress.equals(allUpperCasedAddress)).toBeTruthy();
  });

  it("given an all-caps address belonging to an AccountId, equal-ing the resulting LiveAddress to that AccountId should result in a match", async () => {
    const { session } = await ApiSession.default();
    const allUpperCasedAddress = "0000000000000000000000000000000000000ABC";
    const accountId = AccountId.fromSolidityAddress(allUpperCasedAddress);
    const liveAddress = new StratoAddress(session, allUpperCasedAddress);

    expect(liveAddress.equals(accountId)).toBeTruthy();
  });

  it("a bytes32 return value should not be interpreted as a LiveAddress", async () => {
    const liveContract = await load('keccak256');
    const hashResult = await liveContract.hash("asta banana");

    expect(hashResult).not.toBeInstanceOf(StratoAddress);
    expect(hashResult).toEqual("0x26d381901a017b1d62fe70cbbe9ed6cf7f66db86f97a1c64f3571b777d7fe07e");
  });

  it("given bytes to LiveAddress constructor, it throws an error as it is not a solidity address", async () => {
    const bytesString = "0x993dab3dd91f5c6dc28e17439be475478f5635c92a56e17e82349d3fb2f166196f466c0b4e0c146f285204f0dcb13e5ae67bc33f4b888ec32dfe0a063e8f3f781b";
    const { session } = await ApiSession.default();
    expect(() => { new StratoAddress(session, bytesString) }).toThrow();
  })

  it("given a liveContract, when building the LiveAddress, it then generates the same liveContract", async () => {
    const { session } = await ApiSession.default();
    const contract = await Contract.newFrom({ code: read({ contract: 'naive_owner_check' }) });
    const liveContract = await session.upload(contract);

    const address = new StratoAddress(session, liveContract.id.toSolidityAddress());

    const liveContractFromLiveAddress = await address.toLiveContract(contract.interface);

    expect(liveContractFromLiveAddress.equals(liveContract)).toBeTruthy();
  });

  it("given an account-id returned by a method from a live-contract, when converting it, it should allow mapping it to a live-account", async () => {
    const { session } = await ApiSession.default();
    const contract = await Contract.newFrom({ code: read({ contract: 'account_id_store' }) });
    const account = await session.create(new Account());
    const liveContract = await session.upload(contract, account);
    const idStoredInContract = await liveContract.idAddress() as StratoAddress;
    const liveAccountOfContractStoredAccountId = await idStoredInContract.toLiveAccount();

    expect(liveAccountOfContractStoredAccountId).toBeInstanceOf(LiveAccount);
    expect(liveAccountOfContractStoredAccountId.equals(account)).toBeTruthy();
  });
});
