import {
  describe, expect, it,
} from '@jest/globals';
import BigNumber from "bignumber.js";
import { ContractId } from "@hashgraph/sdk";

import { load, read } from "../../utils";
import { ApiSession } from "../../../lib/ApiSession";
import { Contract } from "../../../lib/static/upload/Contract";
import { LiveContract } from "../../../lib/live/LiveContract";

describe('LiveContract', () => {
  it("emitting an event during contract construction time should be returned following a successfull upload", async () => {
    const { liveContract, logs } = await load('constructor_event');

    expect(liveContract).toBeInstanceOf(LiveContract);
    expect(logs).toHaveLength(1);
    expect(logs[0]).toEqual({
      name: "Log",
      payload: {
        message: "Hello World!"
      }
    });
  });

  it("given a contract which has methods that make use of the Hedera supported bytes type, calling them should work as expected", async () => {
    const { session } = await ApiSession.default();
    const bytesContract = await Contract.newFrom({ code: read({ contract: 'bytes' }) });
    const liveContract = await session.upload(bytesContract);
    const sentBytes = Buffer.from('Hello World!', 'utf8');
    const sentBytes32 = Buffer.from('0123456789ABCDEFFEDCBA9876543210', 'utf8');

    await expect(liveContract.set(sentBytes, sentBytes32)).resolves.not.toThrow();

    const [ recvBytes, recvBytes32 ] = await liveContract.get();

    expect(Buffer.compare(recvBytes, sentBytes)).toEqual(0);
    expect(Buffer.compare(recvBytes32, sentBytes32)).toEqual(0);
  });

  it("given a contract which has methods that allow both a state change and return something, when called, the expected value is returned", async () => {
    const liveContract = await load('change_state_with_return');

    await expect(liveContract.num()).resolves.toEqual(new BigNumber(0));
    await expect(liveContract.setAndRetrieve(42)).resolves.toEqual(new BigNumber(42));
    await expect(liveContract.num()).resolves.toEqual(new BigNumber(42));
  });

  it ("given a method that requires an address, passing it a solidity-addressable instance should resolve to the expected address type", async() => {
    const { session } = await ApiSession.default();
    const naiveOwnerCheckContract = await Contract.newFrom({ code: read({ contract: 'naive_owner_check' }) });
    const liveContract = await session.upload(naiveOwnerCheckContract);

    await expect(liveContract.isOwnedBy(session)).resolves.toBeTruthy();
  });

  it ("getting info for a contract, the information is correctly fetched", async() => {
    const { session } = await ApiSession.default();
    const naiveOwnerCheckContract = await Contract.newFrom({ code: read({ contract: 'naive_owner_check' }) });
    const liveContract = await session.upload(naiveOwnerCheckContract);

    const contractInfo = await liveContract.getInfo();
    
    await expect(contractInfo.contractId).toBeInstanceOf(ContractId);
  });
});
