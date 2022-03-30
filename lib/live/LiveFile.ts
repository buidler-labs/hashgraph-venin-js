
import { FileDeleteTransaction, FileId, FileInfo, FileInfoQuery, FileUpdateTransaction, Transaction } from "@hashgraph/sdk";

import { ApiSession, TypeOfExecutionReturn } from "../ApiSession";
import { FileFeatures } from '../static/upload/File';
import { LiveEntity } from "./LiveEntity";
import { SolidityAddressable } from "../core/SolidityAddressable";

export type LiveFileConstructorArgs = {
    session: ApiSession,
    id: string | FileId,
    data: object
}

export class LiveFile extends LiveEntity<FileId, FileInfo, FileFeatures> implements SolidityAddressable {

  readonly data: object;

  public constructor({ session, id, data }: LiveFileConstructorArgs) {
    super(session, id instanceof FileId ? id : FileId.fromString(id));
    this.data = data;
  }

  public getLiveEntityInfo(): Promise<FileInfo> {
    const fileInfoQuery = new FileInfoQuery({ fileId: this.id });
    return this.session.execute(fileInfoQuery, TypeOfExecutionReturn.Result, false);
  }

  getSolidityAddress(): string {
    return this.id.toSolidityAddress();
  }

  protected _mapFeaturesToArguments(args?: FileFeatures) {
    return null; //mapFileFeaturesToFileArguments(args);
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  protected _getDeleteTransaction<R>(args?: R): Transaction {
    return new FileDeleteTransaction({ fileId: this.id });
  }

  protected _getUpdateTransaction<R>(args?: R): Transaction {
    return new FileUpdateTransaction({
      ...args,
      fileId: this.id,
    });
  }
}
