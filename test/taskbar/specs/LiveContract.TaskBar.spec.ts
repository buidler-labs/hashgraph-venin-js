import {
  describe, expect, it,
} from '@jest/globals';
import BigNumber from "bignumber.js";
import { Hbar } from "@hashgraph/sdk";
import { arrayify } from '@ethersproject/bytes';

import { 
  ResourceReadOptions, 
  read as readResource,
} from "../../utils";
import { ApiSession } from "../../../lib/ApiSession";
import { Contract } from "../../../lib/static/upload/Contract";
import { StratoAddress } from '../../../lib/core/StratoAddress';

function read(what: ResourceReadOptions) {
  return readResource({ relativeTo: 'taskbar', ...what });
}

describe('LiveContract.TaskBar', () => {
  it("given the taskbar use-case contracts, initializing a task should allow for getting it back later on", async() => {
    const maxNrOfTasksPerRegistry = new BigNumber(2);
    const taskId = new BigNumber(1);

    const { session } = await ApiSession.default();
    const taskRegistryContract = await Contract.newFrom({ code: read({ contract: 'TaskRegistry' }), ignoreWarnings: true });
    const cappedRegistryHelperContract = await Contract.newFrom({ code: read({ contract: 'CappedRegistryHelper' }) });
    const cappedRegistryLiveContract = await session.upload(cappedRegistryHelperContract, maxNrOfTasksPerRegistry);
    const taskRegistryLiveContract = await session.upload(taskRegistryContract);

    await expect(taskRegistryLiveContract.initialize({ gas: 100_000 }, 
      session,
      cappedRegistryLiveContract
    )).resolves.toBeUndefined();
    await expect(taskRegistryLiveContract.initializeTask({ gas: 200_000 },
      taskId,
      100,
      new TextEncoder().encode('67347465687435726877747265676572'),
      600,
      1,
      2
    )).resolves.toBeUndefined();

    const gottenTask = await taskRegistryLiveContract.getTask({ queryPayment: new Hbar(10) }, 
      taskId
    );
    expect(gottenTask.disputionTime).not.toBeUndefined();
    expect(gottenTask.needer).toBeInstanceOf(StratoAddress);
    expect(gottenTask.needer.equals(session.wallet.account.id)).toBeTruthy();
    expect(gottenTask.tasker).toBeInstanceOf(StratoAddress);
    expect(gottenTask.tasker.equals("0x0000000000000000000000000000000000000000")).toBeTruthy();
    expect(gottenTask).toMatchObject({
      disputed: [ false, false ],
      disputionTime: new BigNumber(0),
      dloc: arrayify("0x0000000000000000000000000000000000000000000000000000000000000000"),
      nploc: arrayify("0x0000000000000000000000000000000000000000000000000000000000000000"),
      ploc: arrayify("0x3637333437343635363837343335373236383737373437323635363736353732"),
      price: new BigNumber(200),
      taskType: 1,
      tploc: arrayify("0x0000000000000000000000000000000000000000000000000000000000000000"),
    });
  });

  it.skip("given the taskbar contracts, do stuff", async () => {
    const maxNrOfTasksPerRegistry = new BigNumber(2);
    const { session } = await ApiSession.default();

    // Contracts
    const taskRegistryContract = await Contract.newFrom({ code: read({ contract: 'TaskRegistry' }), ignoreWarnings: true });
    const cappedRegistryHelperContract = await Contract.newFrom({ code: read({ contract: 'CappedRegistryHelper' }) });
    const taskRegistryManagerContract = await Contract.newFrom({ code: read({ contract: 'RegistryManager' }) });

    // Live Contracts
    const cappedRegistryLiveContract = await session.upload(cappedRegistryHelperContract, maxNrOfTasksPerRegistry);
    const taskRegistryLiveContract = await session.upload(taskRegistryContract);
    const taskRegistryManagerLiveContract = await session.upload(
      taskRegistryManagerContract, 
      taskRegistryLiveContract, 
      cappedRegistryLiveContract
    );

    // Register events of interest
    taskRegistryLiveContract.onEvent("OwnershipTransferred", async ({ previousOwner, newOwner }) => {
      const hapAccountSolidityAddress = `0x${session.getSolidityAddress()}`; 
      
      expect(previousOwner).toEqual('0x0000000000000000000000000000000000000002');
      expect(newOwner).toEqual(hapAccountSolidityAddress);
    });
    taskRegistryManagerLiveContract.onEvent("NewRegistryCreated", ({ registry }) => {
      expect(registry).not.toBeNull();
    });

    // Play around with the live-contracts testing ocasionally
    await expect(cappedRegistryLiveContract.getRegistrySize()).resolves.toEqual(maxNrOfTasksPerRegistry);
    await expect(taskRegistryLiveContract.initialize({ gas: 100000 }, 
      session,
      cappedRegistryLiveContract)
    ).resolves.toBeUndefined();
    await expect(taskRegistryLiveContract.initialize({ gas: 100000 }, 
      session,
      cappedRegistryLiveContract)
    ).rejects.toThrow();

    const taskRegistry = await taskRegistryManagerLiveContract.registryWithSlot({ gas: 250000 });

    expect(taskRegistry).not.toBeNull();

    // TODO: expect various task-registry methods to work from this point forward
  });
});
