import { describe, expect, it } from '@jest/globals';

import { ResourceReadOptions, read as readResource } from '../../utils';
import { Contract } from '../../../lib/static/upload/Contract';

const CALL_CALLER_BYTECODE = read({ solo: 'call_caller' }).evm.bytecode.object;
const CALL_RECEIVER_BYTECODE = read({ solo: 'call_receiver' }).evm.bytecode
  .object;
const HELLO_WORLD_BYTECODE = read({ solo: 'hello_world' }).evm.bytecode.object;

function read(what: ResourceReadOptions) {
  return readResource({ relativeTo: 'solidity-by-example', ...what });
}

describe('Contract.Solidity-by-Example', () => {
  it('given a perfectly valid solidity contract code, extracting all the Contracts should succeed', async () => {
    await Contract.allFrom({
      code: read({ contract: 'hello_world' }),
    });
  });

  it('given a valid solidity contract, serializing and then deserializing it should give back the same contract', async () => {
    const originalHelloWorldContract = await Contract.newFrom({
      code: read({ contract: 'hello_world' }),
    });
    const deserializedContract = Contract.deserialize(
      originalHelloWorldContract.serialize()
    );

    expect(
      originalHelloWorldContract.equals(deserializedContract)
    ).toBeTruthy();
  });

  it('given a simple valid solidity contract code, its resulting byteCode should be sane if querying without a contractName', async () => {
    const contracts = await Contract.allFrom({
      code: read({ contract: 'hello_world' }),
    });

    expect(contracts).toHaveLength(1);
    expect(contracts[0].byteCode).toEqual(HELLO_WORLD_BYTECODE);
  });

  it('given a 2x solidity contract code, its resulting byteCode should be sane', async () => {
    const contracts = await Contract.allFrom({
      code: read({ contract: 'call' }),
      // We need to compile ignoring warnings otherwise the original solidity code will fail with
      //    Warning: This contract has a payable fallback function, but no receive ...
      ignoreWarnings: true,
    });

    expect(contracts).toHaveLength(2);
    expect(contracts[0].byteCode).toEqual(CALL_CALLER_BYTECODE);
    expect(contracts[1].byteCode).toEqual(CALL_RECEIVER_BYTECODE);
  });

  it('given a 2x solidity contract code, retrieving entry by their name should be possible', async () => {
    const receiverContract = await Contract.newFrom({
      code: read({ contract: 'call' }),
      ignoreWarnings: true,
      name: 'Receiver',
    });
    const callerContract = await Contract.newFrom({
      code: read({ contract: 'call' }),
      ignoreWarnings: true,
      name: 'Caller',
    });

    expect(callerContract.byteCode).toEqual(CALL_CALLER_BYTECODE);
    expect(receiverContract.byteCode).toEqual(CALL_RECEIVER_BYTECODE);
  });

  it('given a 2x solidity contract code, various single-contract extraction scenarios should work as expected', async () => {
    const code = read({ contract: 'hello_world' });
    const allContracts = await Contract.allFrom({ code });

    expect(allContracts).toHaveLength(1);
    await expect(Contract.newFrom({ code, index: -1 })).rejects.toThrow();
    await expect(Contract.newFrom({ code, index: 1 })).rejects.toThrow();
    await Contract.newFrom({ code }).then((resolvedContract) =>
      expect(allContracts[0].equals(resolvedContract)).toBe(true)
    );
    await Contract.newFrom({ code, index: 0 }).then((resolvedContract) =>
      expect(allContracts[0].equals(resolvedContract)).toBe(true)
    );
  });
});
