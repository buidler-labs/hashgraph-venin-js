import {
  Status,
  TopicDeleteTransaction,
  TopicId,
  TopicInfo,
  TopicInfoQuery,
  TopicMessageSubmitTransaction,
  TopicUpdateTransaction,
  Transaction,
} from "@hashgraph/sdk";

import { ApiSession, TypeOfExecutionReturn } from "../ApiSession";
import { Topic, TopicFeatures } from "../static/create/Topic";
import { LiveEntity } from "./LiveEntity";

type LiveTopicConstructorArgs = {
  session: ApiSession;
  topicId: string | TopicId;
};

/**
 * Represents a Topic on the Hedera Consensus Service
 */
export class LiveTopic extends LiveEntity<TopicId, TopicInfo, TopicFeatures> {
  public constructor({ session, topicId }: LiveTopicConstructorArgs) {
    super(
      session,
      topicId instanceof TopicId ? topicId : TopicId.fromString(topicId)
    );
  }

  public override getLiveEntityInfo(): Promise<TopicInfo> {
    const topicInfoQuery = new TopicInfoQuery({ topicId: this.id });
    return this.executeSanely(
      topicInfoQuery,
      TypeOfExecutionReturn.Result,
      false
    );
  }

  public override getSolidityAddress(): string {
    return this.id.toSolidityAddress();
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  protected override async _getDeleteTransaction<R>(
    args?: R
  ): Promise<Transaction> {
    return new TopicDeleteTransaction({ topicId: this.id });
  }

  protected override async _getUpdateTransaction(
    args?: TopicFeatures
  ): Promise<Transaction> {
    const featuresUsedInTransaction =
      Topic.mapTopicFeaturesToTopicArguments(args);

    return new TopicUpdateTransaction({
      ...featuresUsedInTransaction,
      topicId: this.id,
    });
  }

  public submitMessage(message: string | Uint8Array): Promise<Status> {
    const messageSubmitTransaction = new TopicMessageSubmitTransaction({
      message,
      topicId: this.id,
    });
    return this.sanelyExecuteAndGetStatus(messageSubmitTransaction);
  }
}
