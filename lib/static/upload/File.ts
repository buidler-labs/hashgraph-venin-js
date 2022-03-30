import { ArgumentsOnFileUploaded, BasicUploadableEntity } from "./BasicUploadableEntity";
import { LiveFile } from "../../live/LiveFile";

export type FileFeatures = {
    file: any,
}

export class File extends BasicUploadableEntity<LiveFile> {

  public constructor(private readonly info: object) {
    super('File');
  }

  protected override async getContent() {
    return JSON.stringify(this.info);
  }

  protected override async onFileUploaded({ session, receipt, args = [] }: ArgumentsOnFileUploaded) {
    return new LiveFile({
      data: this.info,
      id: receipt.fileId,
      session,
    });
  }
}
