import { Interface } from '@ethersproject/abi';
import { ContractId, FileContentsQuery, FileId } from '@hashgraph/sdk';

import { LiveContract } from './live/LiveContract.mjs';
import { LiveJson } from './live/LiveJson.mjs';
import { Json } from './static/Json.mjs';
import { UploadableFile } from './UploadableFile.mjs';

export class ApiSession {
  constructor({ hClient, operatorInfo }) {
    this._hClient = hClient;
    this._opInfo = operatorInfo;
  }

  /**
   * Retrieves the operator account-id for this {@link ApiSession}.
   */
  get accountId() {
    return this._hClient.operatorAccountId;
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
   * Given an {@link Uploadable}, it triest ot upload it using the currently configured {@link Client} passing in-it any provided {@see args}.
   * 
   * @param {Uploadable | JSON} what - The {@link Uploadable} or a {@link Json}-acceptable payload to push through this {@link ApiSession}
   * @param {*} args - A list of arguments to pass through the upload operation itself.
   *                   Note: this list has, by convention, at various unpaking stages in the call hierarchy, the capabilities to specify SDK behaviour through
   *                         eg. "_file" ({@link Uploadable}) or "_contract" ({@link Contract})
   * @returns - Whatever the underlying Uploadable sees fit following a successful content push. Usually this is a {@link Receipt} of some kind or a higher-level
   *            managed instance ({@link LiveContract}).
   */
  async upload(what, ...args) {
    let uploadableWhat = what;

    if (what instanceof UploadableFile === false) {
      if (Json.isInfoAcceptable(what)) {
        uploadableWhat = new Json(what);
      } else {
        // There's nothing we can do
        throw new Error("Can only upload UploadableFile-s or Json-file acceptable content.");
      }
    }
    return await uploadableWhat.uploadTo({ client: this._hClient, args });
  }

  /**
   * Loads a pre-deployed {@link LiveContract} ready to be called into at runtime. The contract-interface is passed in raw-ly 
   * through the {@see abi} param.
   * 
   * @param {object} options
   * @param {ContractId | string} options.id - the contract-id to load
   * @param {Interface|Array} options.abi - either the etherjs contract interface or the etherjs Interface compatible ABI 
   *                                        definitions to use with the resulting live-contract
   * @returns {Promise<LiveContract>}
   */
  async getLiveContract({ id, abi = [] }) {
    let targetedContractId;

    try {
      targetedContractId = id instanceof ContractId ? id : ContractId.fromString(id)
    } catch(e) {
      throw new Error("Please provide a valid Hedera contract id in order try to lock onto an already-deployed contract.");
    }
    return new LiveContract({ 
      client: this._hClient,
      id: targetedContractId,
      cInterface: abi instanceof Interface ? abi : new Interface(abi)
    });
  }

  /**
   * Given a {@link FileId} of a deployed {@link Json} instance, retrieves a {@link LiveJson} reference ready to be used
   * @param {object} options 
   * @param {FileId | string} options.id - the file-id to load
   * @returns {Promise<LiveJson>}
   */
  async getLiveJson({ id }) {
    let targetedFileId;

    try {
      targetedFileId = id instanceof FileId ? id : FileId.fromString(id)
    } catch(e) {
      throw new Error("Please provide a valid Hedera file id in order try to lock onto an already-deployed Json object.");
    }
    const fileContentsBuffer = await new FileContentsQuery()
      .setFileId(targetedFileId)
      .execute(this._hClient);
    const fileContents = new TextDecoder('utf8').decode(fileContentsBuffer);
    
    // TODO: use file Memo to store hash of file-contents and only return LiveJson instance if the 2 values match
    return new LiveJson({ 
      client: this._hClient,
      id: targetedFileId,
      data: JSON.parse(fileContents)
    });
  }
}
