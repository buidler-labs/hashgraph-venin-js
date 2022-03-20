import { FileId, FileInfo, FileInfoQuery, Status, } from "@hashgraph/sdk";

import { ApiSession, TypeOfExecutionReturn } from "../ApiSession";
import { LiveEntity } from "./LiveEntity";

type LiveJsonConstructorArgs = {
  session: ApiSession,
  id: FileId,
  data: object
};

/**
 * Represents a Hedera, HFS-managed Json object
 */
export class LiveJson extends LiveEntity<FileId, FileInfo> {
  public deleteEntity<R>(args?: R): Promise<number | Status> {
    throw new Error("Method not implemented.");
  }
  public updateEntity<R>(args?: R): Promise<number> {
    throw new Error("Method not implemented.");
  }

  public readonly id: FileId;
  readonly [k: string]: any;

  constructor({ session, id, data }: LiveJsonConstructorArgs) {
    super(session, id);

    // Dynamically bind jData properties to instance
    Object.keys(data).forEach(jDataKey => Object.defineProperty(this, jDataKey, {
      enumerable: true,
      value: data[jDataKey],
      writable: false,
    }));
  }

  public getLiveEntityInfo(): Promise<FileInfo> {
    const fileInfoQuery = new FileInfoQuery().setFileId(this.id);
    return this.session.execute(fileInfoQuery, TypeOfExecutionReturn.Result, false);
  }
}