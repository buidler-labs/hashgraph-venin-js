import { ApiSession, TypeOfExecutionReturn } from "../../ApiSession";
import { ArgumentsForUpload, UploadableEntity } from "../../core/UploadableEntity";
import {
  FileAppendTransaction,
  FileCreateTransaction,
  Status,
  TransactionReceipt,
} from "@hashgraph/sdk";
import { LiveEntity } from "../../live/LiveEntity";

export type ArgumentsOnFileUploaded = { 
  session: ApiSession, 
  receipt: TransactionReceipt, 
  args: any[] 
};

type ArgumentsToGetFileTransaction = {
  session: ApiSession,
  content: Uint8Array|string,
  args: any[]
};

export abstract class BasicUploadableEntity<T extends LiveEntity<R, I, P>, R = any, I = any, P = any> implements UploadableEntity<T, R> {
  public constructor(public readonly nameOfUpload: string) {}

  /**
   * Uploads this Uploadable to the desired session passing in arguments if provided.
   * 
   * @param {Array} args - A list of arguments to use and/or pass along. If the first object contains a '_file' property, it's assumed that its content contains
   *                       FileCreateTransaction constructor arguments and is embedded in the transaction being created. It then goes on to discard that initial
   *                       value before passing the remaining arguments along to the _onFileUploaded implementation.
   * @public
   */
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  public async uploadTo({ session, args = [] }: ArgumentsForUpload): Promise<T> {
    const whatToUpload = await this.getContent();
    const { 
      appendTxCount, 
      areOverridesProvided, 
      fileTransactions, 
    } = await this._getFileTransactionsFor({ args, content: whatToUpload, session });
    const transactionReceipt = await session.execute(fileTransactions[0], TypeOfExecutionReturn.Receipt, true);

    if (transactionReceipt.status !== Status.Success) {
      throw new Error(`There was an issue while creating the file (status ${transactionReceipt.status}). Aborting file upload.`);
    } else {
      session.log.debug(`Uploaded content to HFS resulting in file id ${transactionReceipt.fileId}`);
      if (fileTransactions.length > 1 && fileTransactions[1] instanceof FileAppendTransaction) {
        session.log.debug(`Appending the remaining content with a total of ${appendTxCount} file-append transactions.`);
        await session.execute(fileTransactions[1].setFileId(transactionReceipt.fileId), TypeOfExecutionReturn.Result, true);
        session.log.verbose(`Done appending. Content has been successfully uploaded and is available at HFS id ${transactionReceipt.fileId}`);
      }
    }

    if (areOverridesProvided) {
      args = args.slice(1);
    }
    return this.onFileUploaded({ 
      session,  
      receipt: transactionReceipt,
      args
    });
  }

  private async _getFileTransactionsFor({ content, session, args = [] }: ArgumentsToGetFileTransaction) {
    const fileChunkSize: number = session.network.defaults.fileChunkSize;
    const fileTransactions: Array<FileCreateTransaction|FileAppendTransaction> = [];
    let fileCreationOverrides = {};

    // If available, lock onto any file-creation arguments to embedd when constructing the initial transaction
    if (args.length > 0 && Object.keys(args[0]).length !== 0 && Object.keys(args[0])[0] === '_file') {
      fileCreationOverrides = args[0]._file;
    }

    // Start off with a file-create transaction
    fileTransactions.push(new FileCreateTransaction(Object.assign(
      {}, 
      { keys: [session.publicKey], ...fileCreationOverrides }, 
      { contents: content.length > fileChunkSize ? content.slice(0, fileChunkSize) : content }
    )));

    // Add, if necessary, other file-append transactions to consume the rest of the chunks
    let maxChunks = 0;
    if (content.length > fileChunkSize) {
      const contentToAppend = content.slice(fileChunkSize);
      maxChunks = Math.ceil(contentToAppend.length / fileChunkSize);

      fileTransactions.push(new FileAppendTransaction({
        contents: contentToAppend,
        maxChunks,
      }));
    }
    
    return {
      appendTxCount: maxChunks,
      areOverridesProvided: Object.keys(fileCreationOverrides).length !== 0,
      fileTransactions,
    };
  }

  protected abstract getContent(): Promise<Uint8Array|string>;
  protected abstract onFileUploaded({ session, receipt, args }: ArgumentsOnFileUploaded): Promise<T>;
}
