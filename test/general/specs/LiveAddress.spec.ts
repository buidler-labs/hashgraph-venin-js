import {
  describe, expect, it,
} from '@jest/globals';
import { load, read } from "../../utils";
import { ApiSession } from "../../../lib/ApiSession";
import { Contract } from "../../../lib/static/upload/Contract";
import { LiveAddress } from "../../../lib/live/LiveAddress";

describe('LiveAddress', () => {

  it("a bytes32 return value should not be interpreted as a LiveAddress", async () => {
    const liveContract = await load('keccak256');
    const hashResult = await liveContract.hash("asta banana");

    expect(hashResult).not.toBeInstanceOf(LiveAddress);
    expect(hashResult).toEqual("0x26d381901a017b1d62fe70cbbe9ed6cf7f66db86f97a1c64f3571b777d7fe07e");
  });

  it("given bytes to LiveAddress constructor, it throws an error as it is not a solidity address", async () => {
    const bytesString = "0x993dab3dd91f5c6dc28e17439be475478f5635c92a56e17e82349d3fb2f166196f466c0b4e0c146f285204f0dcb13e5ae67bc33f4b888ec32dfe0a063e8f3f781b";
    const { session } = await ApiSession.default();
    expect(() => { new LiveAddress({ address: bytesString, session: session }) }).toThrow();
  })

  it("given a liveContract, when building the LiveAddress, it then generates the same liveContract", async () => {
    const { session } = await ApiSession.default();
    const contract = await Contract.newFrom({ code: read({ contract: 'naive_owner_check' }) });
    const liveContract = await session.upload(contract);

    const liveAddress = new LiveAddress({ session, address: liveContract.id.toSolidityAddress() });

    const liveContractFromLiveAddress = await liveAddress.toLiveContract(contract.interface);

    expect(liveContractFromLiveAddress.equals(liveContract)).toBeTruthy();
  });
});