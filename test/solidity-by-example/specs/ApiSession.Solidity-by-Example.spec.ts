import { afterEach, describe, expect, it } from "@jest/globals";

import { ResourceReadOptions, read as readResource } from "../../utils";
import { ApiSession } from "../../../lib/ApiSession";
import { Contract } from "../../../lib/static/upload/Contract";

function read(what: ResourceReadOptions) {
  return readResource({ relativeTo: "solidity-by-example", ...what });
}

describe("ApiSession.Solidity-by-Example", () => {
  const ORIGINAL_ENV = process.env;

  afterEach(() => {
    process.env = ORIGINAL_ENV;
  });

  it("given enough hbar, uploading a simple solidity contract should succeed", async () => {
    const { session } = await ApiSession.default();
    const helloWorldContract = await Contract.newFrom({
      code: read({ contract: "hello_world" }),
    });

    await expect(session.upload(helloWorldContract)).resolves.not.toThrow();
  });
});
