import { describe, expect, it } from "@jest/globals";

import { Contract } from "../../../lib/static/upload/Contract";

describe("Issue #114 > Solidity Contract Import Resolution Fix for loading from paths", () => {
  it("import '../B' within A should resolve to a valid A contract resolving B as its dependency", async () => {
    await expect(
      Contract.newFrom({
        ignoreWarnings: true,
        path: "issues/contracts/issue-114/inner/A.sol",
      })
    ).resolves.not.toThrow();
  });

  it("import './inner/A' from C should resolve to a valid C contract resolving A and then B as its dependency", async () => {
    await expect(
      Contract.newFrom({
        ignoreWarnings: true,
        path: "issues/contracts/issue-114/C.sol",
      })
    ).resolves.not.toThrow();
  });

  it("importing '..' from code should not be supported until #117 gets resolved", async () => {
    await expect(
      Contract.newFrom({
        code: "import '../B.sol'; contract A {}",
        ignoreWarnings: true,
      })
    ).rejects.toThrow();
  });
});
