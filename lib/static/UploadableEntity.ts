import {
  FileAppendTransaction,
  FileCreateTransaction,
  Status,
  TransactionReceipt,
} from "@hashgraph/sdk";
import { ApiSession } from "../ApiSession";
import { LiveEntity } from "../live/LiveEntity";
import { QueryForTransactionReceipt } from "../query/QueryForTransactionReceipt";

type ArgumentsForUpload = {
  session: ApiSession,
  args: any[]
};

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

export abstract class UploadableEntity<T extends LiveEntity<R>, R = any> {
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
    const whatToUpload = await this._getContent();
    const { areOverridesProvided, fileTransactions } = await this._getFileTransactionsFor({ content: whatToUpload, session, args });
    const transactionResponse = await session.execute(fileTransactions[0]);
    const transactionReceipt = await session.execute(QueryForTransactionReceipt.of(transactionResponse));

    if (transactionReceipt.status !== Status.Success) {
      throw new Error(`There was an issue while creating the file (status ${transactionReceipt.status}). Aborting file upload.`);
    } else if (fileTransactions.length > 1 && fileTransactions[1] instanceof FileAppendTransaction) {
      // We update the upcoming file-append transaction request to reference the fileId
      await session.execute(fileTransactions[1].setFileId(transactionReceipt.fileId));
    }

    if (areOverridesProvided) {
      args = args.slice(1);
    }
    return this._onFileUploaded({ 
      session,  
      receipt: transactionReceipt,
      args
    });
  }

  private async _getFileTransactionsFor({ content, session, args = [] }: ArgumentsToGetFileTransaction) {
    const fileChunkSize: number = session.network.defaults.file_chunk_size;
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
    if (content.length > fileChunkSize) {
      const contentToAppend = content.slice(fileChunkSize);

      fileTransactions.push(new FileAppendTransaction({
        contents: contentToAppend,
        maxChunks: Math.ceil(contentToAppend.length / fileChunkSize)
      }));
    }
    
    return {
      areOverridesProvided: Object.keys(fileCreationOverrides).length !== 0,
      fileTransactions
    };
  }

  protected abstract _getContent(): Promise<Uint8Array|string>;
  protected abstract _onFileUploaded({ session, receipt, args }: ArgumentsOnFileUploaded): Promise<T>;
}
