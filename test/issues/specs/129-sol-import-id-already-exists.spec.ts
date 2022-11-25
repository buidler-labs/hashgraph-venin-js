import { describe, expect, it } from "@jest/globals";
import { Contract } from "../../../lib/static/upload/Contract";

describe("Issue #129 > Solidity import declaration error: Identifier already declared", () => {
  it("loading a cyclic-referenced, node_modules hosted, contract should not fail", async () => {
    await expect(
      Contract.newFrom({
        path: "issues/contracts/issue-129.sol",
      })
    ).resolves.not.toThrow();
  });
});
