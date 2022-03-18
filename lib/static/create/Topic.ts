import { AccountId, Key, TopicCreateTransaction } from "@hashgraph/sdk";
import Duration from "@hashgraph/sdk/lib/Duration";

import { ArgumentsForCreate } from "../../core/CreatableEntity";
import { BasicCreatableEntity } from "./BasicCreatableEntity";
import { LiveTopic } from "../../live/LiveTopic";
import { TypeOfExecutionReturn } from "../../ApiSession";

export type TopicFeatures = {
    autoRenewAccountId?: string | AccountId,
    autoRenewPeriod?: number | Long.Long | Duration,
    memo?: string,
    keys?: TopicKeys
}

type TopicKeys = {
    admin?: Key,
    submit?: Key
}

export class Topic extends BasicCreatableEntity<LiveTopic> {

  public constructor(private readonly topicFeatures: TopicFeatures = {}) {
    super("Topic")
  }

  public async createVia({ session }: ArgumentsForCreate): Promise<LiveTopic> {
    const constructorArgs = {
      adminKey: this.topicFeatures.keys?.admin,
      autoRenewAccountId: this.topicFeatures.autoRenewAccountId,
      autoRenewPeriod: this.topicFeatures.autoRenewPeriod,
      submitKey: this.topicFeatures.keys?.submit,
      topicMemo: this.topicFeatures.memo,
    }
    const createTopicTransaction = new TopicCreateTransaction(constructorArgs);
    const creationReceipt = await session.execute(createTopicTransaction, TypeOfExecutionReturn.Receipt, true);
    return new LiveTopic({session, topicId: creationReceipt.topicId});
  }

}
