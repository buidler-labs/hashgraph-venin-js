import {
  beforeAll, beforeEach, describe, expect, it,
} from '@jest/globals';

import { ApiSession } from "../../../lib/ApiSession";
import { LiveTopic } from "../../../lib/live/LiveTopic";
import { Topic } from "../../../lib/static/create/Topic";

describe('LiveTopic', () => {
  
  let session: ApiSession;
  let liveTopic: LiveTopic;
  
  beforeAll(async () => {
    ({ session: session } = await ApiSession.default());
  });
  
  beforeEach(async () => {
    liveTopic = await session.create(new Topic());
  });
  
  it("given a topic, solidity address is returned as expected", async () => {
    expect(liveTopic.id.toSolidityAddress()).toEqual(liveTopic.getSolidityAddress());
  });

});
