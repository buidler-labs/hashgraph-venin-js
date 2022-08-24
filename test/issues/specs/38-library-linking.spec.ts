import { describe, expect, it } from "@jest/globals";
import { ContractId } from "@hashgraph/sdk";

import { ResourceReadOptions, read as readResource } from "../../utils";
import { ApiSession } from "../../../lib/ApiSession";
import { Contract } from "../../../lib/static/upload/Contract";

function read(what: ResourceReadOptions) {
  return readResource({ relativeTo: "issues", ...what });
}

describe("Issue #38 > Solidity Library Linking support", () => {
  it("uploading a public library-dependent contract should fail if not all the expected library addresses are provided", async () => {
    await expect(
      Contract.newFrom({
        code: read({ contract: "library" }),
        name: "TestArray",
      })
    ).rejects.toThrow();
  });

  it("uploading a public library-dependent contract should succeed if the library's solidity-address is provided as a string regardless of the hex-address capitalization", async () => {
    const { session } = await ApiSession.default();
    const testArrayContract = await Contract.newFrom({
      code: read({ contract: "library" }),
      libraries: {
        Array: "0x625dbddee1a873bad1a9ffe0dae9c376548fb94B",
      },
      name: "TestArray",
    });

    await expect(session.upload(testArrayContract)).resolves.not.toThrow();
  });

  it("uploading a public library-dependent contract should succeed if the ContractId instance (or string id) of the expected library is provided", async () => {
    const { session } = await ApiSession.default();
    const testArrayContractByInstance = await Contract.newFrom({
      code: read({ contract: "library" }),
      libraries: {
        Array: ContractId.fromString("0.0.69"),
      },
      name: "TestArray",
    });
    const testArrayContractByString = await Contract.newFrom({
      code: read({ contract: "library" }),
      libraries: {
        Array: "0.0.69",
      },
      name: "TestArray",
    });

    await expect(
      session.upload(testArrayContractByInstance)
    ).resolves.not.toThrow();
    await expect(
      session.upload(testArrayContractByString)
    ).resolves.not.toThrow();
  });

  it("loading all contracts without successfully linking them all should fail if allOrNothing is required", async () => {
    await expect(
      Contract.allFrom({
        allOrNothing: true,
        code: read({ contract: "library" }),
        ignoreWarnings: true,
        libraries: {
          Array: "0.0.69",
        },
      })
    ).rejects.toThrow();
  });

  it("loading all available contracts having all of them linked should not fail if allOrNothing is required", async () => {
    await expect(
      Contract.allFrom({
        allOrNothing: true,
        code: read({ contract: "library" }),
        ignoreWarnings: true,
        libraries: {
          Array: "0.0.69",
          SafeMath: "0.0.70",
        },
      })
    ).resolves.not.toThrow();
  });

  it("uploading a library then linking it against a contract and calling it should not error out", async () => {
    const { session } = await ApiSession.default();
    const code = read({ contract: "library" });
    const arrayContract = await Contract.newFrom({
      code,
      name: "Array",
    });
    const liveArrayContract = await session.upload(arrayContract);
    const testArrayContract = await Contract.newFrom({
      code: read({ contract: "library" }),
      libraries: {
        Array: liveArrayContract.id,
      },
      name: "TestArray",
    });
    const liveTestArrayContract = await session.upload(testArrayContract);

    await expect(
      liveTestArrayContract.testArrayRemove()
    ).resolves.not.toThrow();
  });
});
