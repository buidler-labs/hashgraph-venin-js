import { Status, TopicDeleteTransaction, TopicId, TopicInfo, TopicInfoQuery } from "@hashgraph/sdk";

import { ApiSession, TypeOfExecutionReturn } from "../ApiSession";
import { LiveEntity } from "./LiveEntity";
import { SolidityAddressable } from "../core/SolidityAddressable";

type LiveTopicConstructorArgs = {
  session: ApiSession,
  topicId: string | TopicId,
}
export class LiveTopic extends LiveEntity<TopicId, TopicInfo> implements SolidityAddressable {

  public constructor({ session, topicId }: LiveTopicConstructorArgs) {
    super(session, topicId instanceof TopicId ? topicId : TopicId.fromString(topicId));
  }

  public getLiveEntityInfo(): Promise<TopicInfo> {
    const topicInfoQuery = new TopicInfoQuery({topicId: this.id});
    return this.session.execute(topicInfoQuery, TypeOfExecutionReturn.Result, false);
  }

  getSolidityAddress(): string {
    return this.id.toSolidityAddress();
  }

  // There are no other arguments other then the topicId for TopicDeleteTransactions
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  public deleteEntity<R>(args?: R): Promise<number|Status> {
    const topicDeleteTransaction = new TopicDeleteTransaction({topicId: this.id})
    return this.session.execute(topicDeleteTransaction, TypeOfExecutionReturn.Receipt, false)
      .then(receipt => receipt.status);
  }

  public updateEntity<R>(args?: R): Promise<number> {
    throw new Error("Method not implemented.");
  }
}
