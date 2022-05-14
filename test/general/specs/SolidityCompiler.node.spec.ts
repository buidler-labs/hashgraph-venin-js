import { describe, expect, it } from "@jest/globals";

describe("SolidityCompiler.node", () => {
  it("loading the solc compiler should not register the 'unhandledRejection' process event", async () => {
    const preLoadEventHandlersCount =
      process.listenerCount("unhandledRejection");
    await import("../../../lib/SolidityCompiler");
    const postLoadEventHandlersCount =
      process.listenerCount("unhandledRejection");

    expect(postLoadEventHandlersCount).toEqual(preLoadEventHandlersCount);
  });
});
