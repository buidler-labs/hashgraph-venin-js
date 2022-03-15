import { TopicId, TopicInfo, TopicInfoQuery } from "@hashgraph/sdk";

import { LiveEntity } from "./LiveEntity";
import { SolidityAddressable } from "../core/SolidityAddressable";
import { TypeOfExecutionReturn } from "../ApiSession";

export class LiveTopic extends LiveEntity<TopicId, TopicInfo> implements SolidityAddressable {

  public getLiveEntityInfo(): Promise<TopicInfo> {
    const topicInfoQuery = new TopicInfoQuery({topicId: this.id});
    return this.session.execute(topicInfoQuery, TypeOfExecutionReturn.Result, false);
  }

  getSolidityAddress(): string {
    return this.id.toSolidityAddress();
  }

}
