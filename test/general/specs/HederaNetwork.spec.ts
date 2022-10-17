import { describe, expect, it } from "@jest/globals";
import { AccountId } from "@hashgraph/sdk";

import { DEFAULT_HEDERA_REST_MIRROR_URL } from "../../../lib/StratoContext";
import { HederaNetwork } from "../../../lib/hedera/HederaNetwork";

describe("HederaNetwork", () => {
  it("if environment targets a local-net, it should permit instantiating a HederaNetwork provided that a valid address-book can be parsed", async () => {
    const node0Account = new AccountId(2);
    const node1Account = new AccountId(5);

    expect(
      () =>
        new HederaNetwork({
          defaults: {
            fileChunkSize: 1024,
            restMirrorAddress: DEFAULT_HEDERA_REST_MIRROR_URL,
          },
          name: "customnet",
          nodes: {
            "node_0:52111": node0Account,
            "node_1:52111": node1Account,
          },
        })
    ).not.toThrowError();
  });
});
