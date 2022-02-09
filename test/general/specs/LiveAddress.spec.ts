import {
  describe, expect, it,
} from '@jest/globals';
import { load, read } from "../../utils";
import { ApiSession } from "../../../lib/ApiSession";
import { Contract } from "../../../lib/static/upload/Contract";
import { LiveAddress } from "../../../lib/live/LiveAddress";

describe('LiveAddress', () => {
  it("given a liveContract, when building the LiveAddress, it then generates the same liveContract", async () => {
    const { session } = await ApiSession.default();
    const contract = await Contract.newFrom({ code: read({ contract: 'naive_owner_check' }) });
    const liveContract = await session.upload(contract);

    const liveAddress = new LiveAddress({ session, address: liveContract.id.toSolidityAddress() });

    const liveContractFromLiveAddress = await liveAddress.toLiveContract(contract.interface);

    expect(liveContractFromLiveAddress.equals(liveContract)).toBeTruthy();
    });
});