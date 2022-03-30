import { TopicDeleteTransaction, TopicId, TopicInfo, TopicInfoQuery, TopicUpdateTransaction, Transaction } from "@hashgraph/sdk";

import { ApiSession, TypeOfExecutionReturn } from "../ApiSession";
import { LiveEntity } from "./LiveEntity";
import { SolidityAddressable } from "../core/SolidityAddressable";
import { Topic, TopicFeatures } from "../static/create/Topic";

type LiveTopicConstructorArgs = {
  session: ApiSession,
  topicId: string | TopicId,
}
export class LiveTopic extends LiveEntity<TopicId, TopicInfo, TopicFeatures> implements SolidityAddressable {

  public constructor({ session, topicId }: LiveTopicConstructorArgs) {
    super(session, topicId instanceof TopicId ? topicId : TopicId.fromString(topicId));
  }

  public getLiveEntityInfo(): Promise<TopicInfo> {
    const topicInfoQuery = new TopicInfoQuery({ topicId: this.id });
    return this.session.execute(topicInfoQuery, TypeOfExecutionReturn.Result, false);
  }

  getSolidityAddress(): string {
    return this.id.toSolidityAddress();
  }

  protected _mapFeaturesToArguments(args?: TopicFeatures) {
    return Topic.mapTopicFeaturesToTopicArguments(args);
  }

  protected _getDeleteTransaction<R>(args?: R): Transaction {
    return new TopicDeleteTransaction({topicId: this.id});
  }

  protected _getUpdateTransaction<R>(args?: R): Transaction {
    return new TopicUpdateTransaction({
      ...args,
      topicId: this.id,
    });
  }
}
