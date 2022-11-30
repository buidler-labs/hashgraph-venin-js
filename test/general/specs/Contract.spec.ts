import * as path from "path";

import { describe, expect, it } from "@jest/globals";

import { CompileIssues } from "../../../lib/errors/CompileIssues";
import { Contract } from "../../../lib/static/upload/Contract";
import { read } from "../../utils";

const HELLO_IMPORTS_BYTECODE = read({ solo: "hello_imports" }).evm.bytecode
  .object;

describe("Contract", () => {
  it("given an abstract solidity contract, it should permit creating a Contract with ABI definitions present yet have no byteCode associated with it", async () => {
    try {
      const contract = await Contract.newFrom({
        code: read({ contract: "abstract_storage" }),
        ignoreWarnings: true,
      });

      expect(contract.interface.fragments.length).toBeGreaterThan(0);
      expect(contract.byteCode).toBeDefined();
      expect(contract.byteCode).toHaveLength(0);
    } catch (e) {
      throw new Error(
        "Should permit loading of abstract solidity contracts but it doesn't."
      );
    }
  });

  it("given neither the source code nor the source path, instantiating a Contract should not be permitted", async () => {
    await expect(Contract.allFrom({})).rejects.toThrow();
    await expect(Contract.newFrom({})).rejects.toThrow();
  });

  it("given a solidity contract code which doesn't have a license, extracting all the Contracts should fail if we care about compiler warnings", async () => {
    try {
      await Contract.allFrom({
        code: read({ contract: "no_license_hello_world" }),
        ignoreWarnings: false,
      });
    } catch (e) {
      expect(e.constructor.name).toEqual(CompileIssues.name);
      return;
    }
    throw new Error(
      "Instantiating a Contract works even though it should fail having warnings reported"
    );
  });

  it("given a solidity contract code which doesn't have a license, extracting all the Contracts should succeed if we don't care about compiler warnings", async () => {
    await Contract.allFrom({
      code: read({ contract: "no_license_hello_world" }),
      ignoreWarnings: true,
    });
  });

  it("given a valid contract that is inter-linked via chain-import-ing with others and its path-prefix not set in env, compiling it should not fail", async () => {
    expect(
      process.env.HEDERAS_CONTRACTS_INCLUDED_PREFIXES.split(/\s*,\s*/)
    ).not.toContain("import_resolution");

    await expect(
      Contract.allFrom({
        path: "./general/contracts/import_resolution/hello_imports.sol",
      })
    ).resolves.not.toThrow();
  });

  it("given a valid contract via its absolute path, we should be able to load it", async () => {
    await expect(
      Contract.allFrom({
        path: path.join(__dirname, "../contracts/change_state_with_return.sol"),
      })
    ).resolves.not.toThrow();
  });

  it("given a valid contract that is inter-linked via chain-import-ing with others, compiling it should recurse to importing all of its dependencies", async () => {
    const path = "./general/contracts/import_resolution/hello_imports.sol";
    const contracts = await Contract.allFrom({ path });

    expect(contracts).toHaveLength(1);
    await Contract.newFrom({ path }).then((resolvedContract) =>
      expect(contracts[0].equals(resolvedContract)).toBe(true)
    );
    expect(contracts[0].byteCode).toEqual(HELLO_IMPORTS_BYTECODE);
  });
});
