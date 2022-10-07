import {
  FileContentsQuery,
  FileDeleteTransaction,
  FileId,
  FileInfo,
  FileInfoQuery,
  FileUpdateTransaction,
  Transaction,
} from "@hashgraph/sdk";

import { ApiSession, TypeOfExecutionReturn } from "../ApiSession";
import { FileFeatures } from "../static/upload/File";
import { LiveEntity } from "./LiveEntity";

export type LiveFileConstructorArgs = {
  session: ApiSession;
  id: string | FileId;
  data?: string | Uint8Array;
};

export class LiveFile extends LiveEntity<FileId, FileInfo, FileFeatures> {
  readonly data: string | Uint8Array;

  public constructor({ session, id, data }: LiveFileConstructorArgs) {
    super(session, id instanceof FileId ? id : FileId.fromString(id));
    this.data = data;
  }

  public override getLiveEntityInfo(): Promise<FileInfo> {
    const fileInfoQuery = new FileInfoQuery({ fileId: this.id });
    return this.executeSanely(
      fileInfoQuery,
      TypeOfExecutionReturn.Result,
      false
    );
  }

  override getSolidityAddress(): string {
    return this.id.toSolidityAddress();
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  protected override async _getDeleteTransaction<R>(
    args?: R
  ): Promise<Transaction> {
    return new FileDeleteTransaction({ fileId: this.id });
  }

  protected override async _getUpdateTransaction(
    args?: FileFeatures
  ): Promise<Transaction> {
    return new FileUpdateTransaction({
      ...args,
      fileId: this.id,
    });
  }

  public async getContents(): Promise<Uint8Array> {
    const fileContentsQuery = new FileContentsQuery({ fileId: this.id });
    const queryResponse = await this.executeSanely(
      fileContentsQuery,
      TypeOfExecutionReturn.Result,
      false
    );
    return queryResponse;
  }
}
