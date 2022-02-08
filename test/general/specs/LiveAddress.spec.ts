import {
    expect, describe, it,
} from '@jest/globals';

import { LiveAddress } from '../../../lib/live/LiveAddress';
import { load } from '../../utils';

describe('LiveAddress', () => {
  it("a 32bytes return value should not be interpreted as a LiveAddress", async () => {
    const liveContract = await load('keccak256');
    const hashResult = await liveContract.hash("asta banana");

    expect(hashResult).not.toBeInstanceOf(LiveAddress);
    expect(hashResult).toEqual("0x26d381901a017b1d62fe70cbbe9ed6cf7f66db86f97a1c64f3571b777d7fe07e");
  });
});
