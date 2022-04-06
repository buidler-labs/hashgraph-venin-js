import { Key, KeyList } from "@hashgraph/sdk";

import { 
  ArgumentsOnFileUploaded, 
  BasicUploadableEntity, 
} from "./BasicUploadableEntity";
import { LiveFile } from "../../live/LiveFile";

export type FileFeatures = {
  keys?: KeyList | Key[],
  expirationTime?: Date,
  contents?: string | Uint8Array,
  fileMemo?: string,
}

export class File extends BasicUploadableEntity<LiveFile> {

  public constructor(private readonly info: string|Uint8Array) {
    super('File');
  }

  protected override async getContent() {
    return this.info;
  }

  protected override async onFileUploaded({ session, receipt, args = [] }: ArgumentsOnFileUploaded) {
    return new LiveFile({
      data: this.info,
      id: receipt.fileId,
      session,
    });
  }
}
