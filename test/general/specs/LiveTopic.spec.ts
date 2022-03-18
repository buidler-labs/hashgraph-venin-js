import {
  beforeAll, describe, expect, it,
} from '@jest/globals';

import { ApiSession } from "../../../lib/ApiSession";
import { LiveTopic } from '../../../lib/live/LiveTopic';
import { Topic } from "../../../lib/static/create/Topic";

describe('LiveTopic', () => {
  
  let session: ApiSession;
  
  beforeAll(async () => {
    ({ session: session } = await ApiSession.default());
  });
  
  it("given a topic, solidity address is returned as expected", async () => {
    const liveTopic = await session.create(new Topic());
    expect(liveTopic.id.toSolidityAddress()).toEqual(liveTopic.getSolidityAddress());
  });

  it("given a default topic, getting info about a topic returns the expected information", async () => {
    const liveTopic = await session.create(new Topic());
    const topicInfo = await liveTopic.getLiveEntityInfo();
    expect(topicInfo.topicId.toString()).toEqual(liveTopic.id.toString());
    expect(topicInfo.autoRenewAccountId).toBeFalsy();
    expect(topicInfo.adminKey).toBeFalsy();
    expect(topicInfo.submitKey).toBeFalsy();
    expect(topicInfo.topicMemo).toBeFalsy();
  });

  it("given a topic, getting info about a topic returns the expected information", async () => {
    const memoText = "memo";
    const renewPeriod = 1000;
    const liveTopic = await session.create(new Topic({
      autoRenewAccountId: session.accountId,
      autoRenewPeriod: renewPeriod,
      keys: {
        admin: session.publicKey,
        submit: session.publicKey,
      },
      memo: memoText,
    }));
    const topicInfo = await liveTopic.getLiveEntityInfo();
    expect(topicInfo.topicId.toString()).toEqual(liveTopic.id.toString());
    expect(topicInfo.autoRenewAccountId.toString()).toEqual(session.accountId.toString());
    expect(topicInfo.autoRenewPeriod.seconds.toString()).toEqual(renewPeriod.toString());
    expect(topicInfo.adminKey.toString()).toEqual(session.publicKey.toStringDer());
    expect(topicInfo.submitKey.toString()).toEqual(session.publicKey.toStringDer());
    expect(topicInfo.topicMemo).toEqual(memoText);
  });

  it("given a topic, getting info about a topic returns the expected information", async () => {
    const memoText = "memo";
    const renewPeriod = 1000;
    const liveTopic = await session.create(new Topic({
      autoRenewAccountId: session.accountId,
      autoRenewPeriod: renewPeriod,
      keys: {
        admin: session.publicKey,
        submit: session.publicKey,
      },
      memo: memoText,
    }));
    const topicInfo = await liveTopic.getLiveEntityInfo();
    expect(topicInfo.topicId.toString()).toEqual(liveTopic.id.toString());
    expect(topicInfo.autoRenewAccountId.toString()).toEqual(session.accountId.toString());
    expect(topicInfo.autoRenewPeriod.seconds.toString()).toEqual(renewPeriod.toString());
    expect(topicInfo.adminKey.toString()).toEqual(session.publicKey.toStringDer());
    expect(topicInfo.submitKey.toString()).toEqual(session.publicKey.toStringDer());
    expect(topicInfo.topicMemo).toEqual(memoText);
  });

  it("given a topic, creating a live instance using the topicId works as expected", async () => {
    const liveTopic = await session.create(new Topic());

    const anotherLiveTopic = new LiveTopic({session, topicId: liveTopic.id.toString()});
    const anotherTopicInfo = await anotherLiveTopic.getLiveEntityInfo();

    expect(anotherTopicInfo.topicId.toString()).toEqual(liveTopic.id.toString());
  });

});
