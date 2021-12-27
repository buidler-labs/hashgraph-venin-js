import { Interface } from '@ethersproject/abi';
import { AccountInfo, Client, ContractId, FileContentsQuery, FileId } from '@hashgraph/sdk';

import { LiveContract } from './live/LiveContract';
import { LiveEntity } from './live/LiveEntity';
import { LiveJson } from './live/LiveJson';
import { Json } from './static/Json';
import { UploadableEntity } from './static/UploadableEntity';

type ApiSessionConstructorArgs = {
  hClient: Client,
  operatorInfo: AccountInfo
};

export class ApiSession {
  private readonly client: Client;
  private readonly operatorInfo: AccountInfo;

  constructor({ hClient, operatorInfo }: ApiSessionConstructorArgs) {
    this.client = hClient;
    this.operatorInfo = operatorInfo;
  }

  /**
   * Retrieves the operator account-id for this {@link ApiSession}.
   */
  get accountId() {
    return this.client.operatorAccountId;
  }

  /**
   * Returns true if the provided {@see solidityAddress } also owns this {@link ApiSession} and false otherwise. 
   * @param {object} options
   * @param {string} options.solidityAddress 
   */
  isOperatedBy({ solidityAddress }) {
    if (solidityAddress.indexOf('0x') === 0) {
      solidityAddress = solidityAddress.slice(2);
    }
    return this.accountId.toSolidityAddress() === solidityAddress;
  }

  /**
   * Given an {@link UploadableEntity}, it triest ot upload it using the currently configured {@link Client} passing in-it any provided {@see args}.
   * 
   * @param {Uploadable} what - The {@link UploadableEntity} to push through this {@link ApiSession}
   * @param {*} args - A list of arguments to pass through the upload operation itself.
   *                   Note: this list has, by convention, at various unpaking stages in the call hierarchy, the capabilities to specify SDK behaviour through
   *                         eg. "_file" ({@link UploadableEntity}) or "_contract" ({@link Contract})
   * @returns - An instance of the {@link UploadableEntity} concrete result-type which is a subtype of {@link LiveEntity}.
   */
  public async upload<T extends LiveEntity>(what: UploadableEntity<T>, ...args: any[]): Promise<T>;

  /**
   * Given a raw JSON {@link object}, it triest ot upload it using the currently configured {@link Client} passing in-it any provided {@see args}.
   * Note: This is the same as calling the more verbose equivalent of 'upload(new Json(what))'.
   * 
   * @param {object} what - The {@link Json}-acceptable payload to push through this {@link ApiSession}
   * @param {*} args - A list of arguments to pass through the upload operation itself.
   *                   Note: this list has, by convention, at various unpaking stages in the call hierarchy, the capabilities to specify SDK behaviour through
   *                         eg. "_file" ({@link Uploadable}) or "_contract" ({@link Contract})
   * @returns - An instance of the associated {@link LiveJson} resulting {@link LiveEntity}.
   */
  public async upload(what: object, ...args: any[]): Promise<LiveJson>;

  // Overload implementation
  public async upload<T extends LiveEntity>(what: UploadableEntity<T>|object, ...args: any[]): Promise<T|LiveJson> {
    let uploadableWhat: UploadableEntity<T>;

    if (what instanceof UploadableEntity === false) {
      // Try to go with a live-json upload
      if (Json.isInfoAcceptable(what)) {
        uploadableWhat = (new Json(what) as unknown) as UploadableEntity<T>;
      } else {
        // There's nothing we can do
        throw new Error("Can only upload UploadableFile-s or Json-file acceptable content.");
      }
    } else {
      // upload what was given as is since it's an UploadableEntity type already
      uploadableWhat = (what as unknown) as UploadableEntity<T>;
    }
    return uploadableWhat.uploadTo({ client: this.client, args });
  }

  /**
   * Loads a pre-deployed {@link LiveContract} ready to be called into at runtime. The contract-interface is passed in raw-ly 
   * through the {@link abi} param.
   * 
   * @param {object} options
   * @param {ContractId | string} options.id - the contract-id to load
   * @param {Interface|Array} options.abi - either the etherjs contract interface or the etherjs Interface compatible ABI 
   *                                        definitions to use with the resulting live-contract
   */
  public async getLiveContract({ id, abi = [] }: { id: ContractId|string, abi?: Interface|any[] }): Promise<LiveContract> {
    let targetedContractId: ContractId;

    try {
      targetedContractId = id instanceof ContractId ? id : ContractId.fromString(id)
    } catch(e) {
      throw new Error("Please provide a valid Hedera contract id in order try to lock onto an already-deployed contract.");
    }
    return new LiveContract({ 
      client: this.client,
      id: targetedContractId,
      cInterface: abi instanceof Interface ? abi : new Interface(abi)
    });
  }

  /**
   * Given a {@link FileId} of a deployed {@link Json} instance, retrieves a {@link LiveJson} reference ready to be used
   * @param {object} options 
   * @param {FileId | string} options.id - the file-id to load
   */
  public async getLiveJson({ id }: { id: FileId|string }): Promise<LiveJson> {
    let targetedFileId: FileId;

    try {
      targetedFileId = id instanceof FileId ? id : FileId.fromString(id)
    } catch(e) {
      throw new Error("Please provide a valid Hedera file id in order try to lock onto an already-deployed Json object.");
    }
    const fileContentsBuffer = await new FileContentsQuery()
      .setFileId(targetedFileId)
      .execute(this.client);
    const fileContents = new TextDecoder('utf8').decode(fileContentsBuffer);
    
    // TODO: use file Memo to store hash of file-contents and only return LiveJson instance if the 2 values match
    return new LiveJson({ 
      client: this.client,
      id: targetedFileId,
      data: JSON.parse(fileContents)
    });
  }
}
