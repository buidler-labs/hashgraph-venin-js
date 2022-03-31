import { Status, TopicDeleteTransaction, TopicId, TopicInfo, TopicInfoQuery, TopicMessageSubmitTransaction, TopicUpdateTransaction, Transaction } from "@hashgraph/sdk";

import { ApiSession, TypeOfExecutionReturn } from "../ApiSession";
import { Topic, TopicFeatures } from "../static/create/Topic";
import { LiveEntity } from "./LiveEntity";
import { SolidityAddressable } from "../core/SolidityAddressable";

type LiveTopicConstructorArgs = {
  session: ApiSession,
  topicId: string | TopicId,
}

/**
 * Represents a Topic on the Hedera Consensus Service
 */
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

  protected _mapFeaturesToArguments(args?: TopicFeatures): Promise<any> {
    return Topic.mapTopicFeaturesToTopicArguments(args);
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  protected _getDeleteTransaction<R>(args?: R): Transaction {
    return new TopicDeleteTransaction({topicId: this.id});
  }

  protected _getUpdateTransaction<R>(args?: R): Transaction {
    return new TopicUpdateTransaction({
      ...args,
      topicId: this.id,
    });
  }

  public submitMessage(message: string|Uint8Array): Promise<Status> {
    const messageSubmitTransaction = new TopicMessageSubmitTransaction({message, topicId: this.id});
    return this.executeAndReturnStatus(messageSubmitTransaction);
  }
}
