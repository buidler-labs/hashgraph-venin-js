import {
  beforeAll, describe, expect, it,
} from '@jest/globals';
import { Status } from '@hashgraph/sdk';

import { ApiSession } from "../../../lib/ApiSession";
import { LiveTopic } from '../../../lib/live/LiveTopic';
import { Topic } from "../../../lib/static/create/Topic";
import { VALID_AUTO_RENEW_IN_SECONDS } from '../../constants';

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
    const renewPeriod = VALID_AUTO_RENEW_IN_SECONDS;
    const walletPublicKey = session.wallet.account.publicKey;
    const walletAccountId = session.wallet.account.id;
    const liveTopic = await session.create(new Topic({
      autoRenewAccountId: walletAccountId,
      autoRenewPeriod: renewPeriod,
      keys: {
        admin: walletPublicKey,
        submit: walletPublicKey,
      },
      memo: memoText,
    }));
    const topicInfo = await liveTopic.getLiveEntityInfo();
    expect(topicInfo.topicId.toString()).toEqual(liveTopic.id.toString());
    expect(topicInfo.autoRenewAccountId.toString()).toEqual(walletAccountId.toString());
    expect(topicInfo.autoRenewPeriod.seconds.toString()).toEqual(renewPeriod.toString());
    expect(topicInfo.adminKey.toString()).toEqual(walletPublicKey.toStringDer());
    expect(topicInfo.submitKey.toString()).toEqual(walletPublicKey.toStringDer());
    expect(topicInfo.topicMemo).toEqual(memoText);
  });

  it("given a topic, creating a live instance using the topicId works as expected", async () => {
    const liveTopic = await session.create(new Topic());

    const anotherLiveTopic = new LiveTopic({session, topicId: liveTopic.id.toString()});
    const anotherTopicInfo = await anotherLiveTopic.getLiveEntityInfo();

    expect(anotherTopicInfo.topicId.toString()).toEqual(liveTopic.id.toString());
  });

  it("given a topic, deleting it will return status success", async () => {
    const liveTopic = await session.create(new Topic({keys: {admin: session.wallet.account.publicKey}}));

    const deleteStatus = await liveTopic.deleteEntity();

    expect(deleteStatus).toEqual(Status.Success);
  });

  it("given a topic, updating it will return status success and update is successful", async () => {
    const walletPublicKey = session.wallet.account.publicKey;
    const walletAccountId = session.wallet.account.id;
    const liveTopic = await session.create(new Topic({keys: {admin: walletPublicKey}}));

    const memoText = "memo";
    const renewPeriod = VALID_AUTO_RENEW_IN_SECONDS;
    const updateStatus = await liveTopic.updateEntity({
      autoRenewAccountId: walletAccountId,
      autoRenewPeriod: renewPeriod,
      keys: {
        admin: walletPublicKey,
        submit: walletPublicKey,
      },
      memo: memoText,
    });

    expect(updateStatus).toEqual(Status.Success);

  });

  it("given a topic, we can successfully publish messages to it", async () => {
    const liveTopic = await session.create(new Topic());

    const submitStatus = await liveTopic.submitMessage("Test message");

    expect(submitStatus).toEqual(Status.Success);
  });
});
