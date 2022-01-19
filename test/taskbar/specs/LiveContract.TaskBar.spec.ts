import BigNumber from "bignumber.js";
import {
  describe, expect, it,
} from '@jest/globals';
import { Hbar } from "@hashgraph/sdk";
import { arrayify } from '@ethersproject/bytes';

import { 
    ResouorceReadOptions, 
    read as readResource
} from "../../utils";
import { Contract } from "../../../lib/static/Contract";
import { HederaNetwork } from "../../../lib/HederaNetwork";
import { LiveEntity } from "../../../lib/live/LiveEntity";

function read(what: ResouorceReadOptions) {
    return readResource({ relativeTo: 'taskbar', ...what });
}

describe('LiveContract.TaskBar', () => {
  it("given the taskbar use-case contracts, initializing a task should allow for getting it back later on", async() => {
    const maxNrOfTasksPerRegistry = new BigNumber(2);
    const taskId = new BigNumber(1);

    const hapiSession = await HederaNetwork.defaultApiSession();
    const taskRegistryContract = await Contract.newFrom({ code: read({ contract: 'TaskRegistry' }), ignoreWarnings: true });
    const cappedRegistryHelperContract = await Contract.newFrom({ code: read({ contract: 'CappedRegistryHelper' }) });
    const cappedRegistryLiveContract = await hapiSession.upload(cappedRegistryHelperContract, maxNrOfTasksPerRegistry);
    const taskRegistryLiveContract = await hapiSession.upload(taskRegistryContract);

    await expect(taskRegistryLiveContract.initialize({ gas: 100000 }, 
      hapiSession,
      cappedRegistryLiveContract
    )).resolves.toBeUndefined();
    await expect(taskRegistryLiveContract.initializeTask({ gas: 200000 },
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
    expect(gottenTask.needer).toBeInstanceOf(LiveEntity);
    expect(gottenTask.needer.equals(hapiSession.accountId.toSolidityAddress())).toBeTruthy();
    expect(gottenTask.tasker).toBeInstanceOf(LiveEntity);
    expect(gottenTask.tasker.equals("0x0000000000000000000000000000000000000000")).toBeTruthy();
    expect(gottenTask).toMatchObject({
      disputed: [ false, false ],
      disputionTime: new BigNumber(0),
      dloc: arrayify("0x0000000000000000000000000000000000000000000000000000000000000000"),
      nploc: arrayify("0x0000000000000000000000000000000000000000000000000000000000000000"),
      ploc: arrayify("0x3637333437343635363837343335373236383737373437323635363736353732"),
      price: new BigNumber(200),
      taskType: 1,
      tploc: arrayify("0x0000000000000000000000000000000000000000000000000000000000000000")
    });
  });

  it.skip("given the taskbar contracts, do stuff", async () => {
    const maxNrOfTasksPerRegistry = new BigNumber(2);
    const hapiSession = await HederaNetwork.defaultApiSession();

    // Contracts
    const taskRegistryContract = await Contract.newFrom({ code: read({ contract: 'TaskRegistry' }), ignoreWarnings: true });
    const cappedRegistryHelperContract = await Contract.newFrom({ code: read({ contract: 'CappedRegistryHelper' }) });
    const taskRegistryManagerContract = await Contract.newFrom({ code: read({ contract: 'WRegistryManager' }) });

    // Live Contracts
    const cappedRegistryLiveContract = await hapiSession.upload(cappedRegistryHelperContract, maxNrOfTasksPerRegistry);
    const taskRegistryLiveContract = await hapiSession.upload(taskRegistryContract);
    const taskRegistryManagerLiveContract = await hapiSession.upload(
      taskRegistryManagerContract, 
      taskRegistryLiveContract, 
      cappedRegistryLiveContract
    );

    // Register events of interest
    taskRegistryLiveContract.onEvent("OwnershipTransferred", async ({ previousOwner, newOwner }) => {
      const hapAccountSolidityAddress = `0x${await hapiSession.getSolidityAddress()}`; 
      
      expect(previousOwner).toEqual('0x0000000000000000000000000000000000000002');
      expect(newOwner).toEqual(hapAccountSolidityAddress);
    });
    taskRegistryManagerLiveContract.onEvent("NewRegistryCreated", ({ registry }) => {
      expect(registry).not.toBeNull();
    });

    // Play around with the live-contracts testing ocasionally
    await expect(cappedRegistryLiveContract.getRegistrySize()).resolves.toEqual(maxNrOfTasksPerRegistry);
    await expect(taskRegistryLiveContract.initialize({ gas: 100000 }, 
      hapiSession,
      cappedRegistryLiveContract)
    ).resolves.toBeUndefined();
    await expect(taskRegistryLiveContract.initialize({ gas: 100000 }, 
      hapiSession,
      cappedRegistryLiveContract)
    ).rejects.toThrow();

    const taskRegistry = await taskRegistryManagerLiveContract.registryWithSlot({ gas: 250000 });

    expect(taskRegistry).not.toBeNull();

    // TODO: expect various task-registry methods to work from this point forward
  });
});
