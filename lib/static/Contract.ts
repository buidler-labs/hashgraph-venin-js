import {
  ContractCreateTransaction,
} from "@hashgraph/sdk";

import { ArgumentsOnFileUploaded, UploadableEntity } from "./UploadableEntity";
import { CompileIssues } from '../errors/CompileIssues';
import { LiveContract, LiveContractWithLogs } from '../live/LiveContract';
import { HContractFunctionParameters } from '../HContractFunctionParameters';
import { Interface } from '@ethersproject/abi';
import { SolidityCompiler, VIRTUAL_SOURCE_CONTRACT_FILE_NAME } from '../SolidityCompiler';

/**
 * Default gas allocated for creating contracts.
 * 
 * Changelog (tailored against the 'hedera-services' version):
 *  - <= v0.21.0: 75_000
 *  - >= v0.22.0: 150_000
 */
const DEFAULT_GAS_FOR_CONTRACT_CREATION = 150_000;

type AllContractOptions = {
  /**
   * The Solidity full, human-readable, contract code
   */
  code?: string,
  /**
   * Should we fail at compile-time warnings or not? Default: false
   */
  ignoreWarnings?: boolean,
  /**
   * The top-level Solidity code file path if not using the 'code' alternative.
   */
  path?: string

};
type NewContractOptions = { 
  /**
   * The Contract index to retrieve (if the name is not provided). Defaults to 0
   */
  index?: number, 
  /**
   * The Contract we wish to retrieve (if no index is provided).
   */
  name?: string, 
} & AllContractOptions;

/**
 * The Solidity-backed, non-deployed, data-holder for a Smart Contract logic.
 */
export class Contract extends UploadableEntity<LiveContractWithLogs> {
  /**
   * Given an index or a name, this returns a specific {@link Contract} following the successfull compilation of 
   * either the contract code itself ({@link options.code}) or the solidity file located at the provided {@link options.path}
   * 
   * In terms of precidence, it first checks to see if the {@link options.name} is provided and, if so, it uses that otherwise
   * it looks at the {@link options.index} one and goes with that.
   * 
   * @param {Object} options - Provides a source and controls various {@see Contract} construction settings
   * @returns {Promise<Contract>}
   */
  public static async newFrom({ code, index = 0, ignoreWarnings = false, name, path }: NewContractOptions): Promise<Contract> {
    if (!code && ! path) {
      throw new Error("In order to continue, either provide the direct solidity code or a file path where the top-level code resides.");
    }
    if (!name && (!!index || (Number.isInteger(index) && index < 0))) {
      throw new Error("Please provide either a non-negative index or the actual name of the contract to reference the Contract instance with.");
    }

    const contracts = await Contract.allFrom({ code, ignoreWarnings, path });

    if (name) {
      const contractOfInterest = contracts.find(contract => contract.name === name);

      if (!contractOfInterest) {
        throw new Error(`There is no such contract named '${name}' present in the referenced code.`);
      }
      return contractOfInterest;
    } else if (index >= contracts.length) {
      throw new Error(`Index out of range. Your requested contract-id ${index} is not in range of the ${contracts.length} contracts present in the given code.`);
    }
    return contracts[index];
  }

  /**
   * Returns all the contracts present in the given 'options' (either from 'path' or from 'code').
   * 
   * @param {Object} options - Provides a source and controls various {@see Contract} construction settings.
   * @returns {Promise<Array<Contract>>} - A list of {@link Contract}s parsed via Hedera's officially supported solidity version compiler (`solc`) from the code
   */
  static async allFrom({ code, ignoreWarnings = false, path }: AllContractOptions): Promise<Array<Contract>> {
    if (!code && !path) {
      throw new Error("Can only retrieve contracts if either the direct solidity code is provided or a file path where that top-level code resides.");
    }

    const rawCompileResult = await SolidityCompiler.compile({ code, path });
    const compileResult = Contract._tryParsingCompileResultFrom({ rawCompileResult, ignoreWarnings });
    const compiledContractsInfo = compileResult.contracts[VIRTUAL_SOURCE_CONTRACT_FILE_NAME];
    let contracts = [];

    for (const contractName of Object.keys(compiledContractsInfo)) {
      const solo = compiledContractsInfo[contractName];

      contracts.push(
        new Contract({
          name: contractName,
          abi: solo.abi,
          byteCode: solo.evm.bytecode.object
        })
      );
    }
    return contracts;
  }

  /**
   * Deserializes the provided Contract representation which is assumed to be the output of the {@link Contract.serialize} method call.
   */
  public static deserialize(what: string): Contract {
    let jWhat: any = {};

    try {
      jWhat = JSON.parse(what)
    } catch(e) {
      throw new Error("Please provide something valid to be deserialized.");
    }
    return new Contract(jWhat);
  }

  private static _tryParsingCompileResultFrom({ rawCompileResult, ignoreWarnings }) {
    const compileResult = JSON.parse(rawCompileResult);

    CompileIssues.tryThrowingIfErrorsIn({ compileResult, ignoreWarnings });
    return compileResult;
  }

  /**
   * The name of the referenced Solidity contract. 
   * Note: this can be different then the source-file used to host it.
   */
  public readonly name: string;
  /**
   * The byte-code representation of the contract's code ready to be uploaded and executed inside an EVM. 
   */
  public readonly byteCode: string;
  /**
   * Retrieves the Contract's Application Binary Interface (ABI) specs.
   * {@link https://docs.soliditylang.org/en/v0.8.10/abi-spec.html#json}
   * @returns {Interface}
   */
  public readonly interface: Interface;

  private constructor({ name, abi, byteCode }: { name: string, abi: any[], byteCode: string }) {
    if (!name) {
      throw new Error("Please provide a name for the Contract instance.");
    } else if(!abi) {
      throw new Error("Please provide a, valid, EthersProject-compatible, ABI definition for the Contract instance.");
    } else if(!byteCode || !/^[0-9a-f]+$/.test(byteCode)) {
      throw new Error("Please provide the valid formatted byte-code definition for the Contract in order to instantiate it.");
    }

    super();
    this.name = name;
    this.byteCode = byteCode;
    this.interface = new Interface(abi);
  }

  /**
   * Tests if this contract is the same (functionally speaking) as another one.
   */
  public equals(other?: Contract): boolean {
    if (other instanceof Contract === false) {
      return false;
    }
    return this.byteCode === other.byteCode;
  }

  /**
   * Serializes the current entity. This then can be reversed via calling {@link Contract.deserialize}.
   * 
   * Note: when de-serializing, the properties exported here should allow for a complete re-instantiation of the original {@link Contract}. 
   * 
   * @returns {string} - The serialized representation of the current instance
   */
  public serialize(): string {
    return JSON.stringify({
      name: this.name,
      byteCode: this.byteCode,
      abi: this.interface.format()
    });
  }

  protected override async _getContent() {
    return this.byteCode;
  }

  /**
   * Having a file-create {@link receipt} provided, this function uses it to create a contract via the Hedera Contract Service (HCS). The provided {@link args}
   * are used both to populate the {@link ContractCreateTransaction} constructor (if the first object from the list has a '_contract' property) and to pass along
   * as constructor arguments when publishing the Contract. 
   * If there is a constructor config object present (first args from list if it has the '_contract' property) this is consumed and the remainder of the arguments 
   * are passed to the Contract constructor.
   */
  protected override async _onFileUploaded({ session, receipt, args = [] }: ArgumentsOnFileUploaded): Promise<LiveContractWithLogs> {
    const { createContractOptions, emitConstructorLogs } = await this._getContractCreateOptionsFor({ session, receipt, args });
    const createContractTransaction = new ContractCreateTransaction(createContractOptions);

    return await LiveContract.newFollowingUpload({
      session,
      contract: this,
      emitConstructorLogs,
      transaction: createContractTransaction
    });
  }

  private async _getContractCreateOptionsFor({ session, receipt, args = [] }: ArgumentsOnFileUploaded) {
    const contractFileId = receipt.fileId;
    const constructorDefinition = this.interface.deploy;
    let contractCreationOverrides: any = {};
    let emitConstructorLogs = session.defaults.emit_constructor_logs ?? true;

    if (args.length > 0 && Object.keys(args[0]).length !== 0 && Object.keys(args[0])[0] === '_contract') {
      const contractCreationArgs = args[0]._contract;

      // try locking onto library-controlling behaviour flags
      emitConstructorLogs = contractCreationArgs.emitConstructorLogs !== undefined ? contractCreationArgs.emitConstructorLogs : emitConstructorLogs;
      delete contractCreationArgs.emitConstructorLogs;

      // consider everything else as contract-creation constructor arguments
      contractCreationOverrides = contractCreationArgs;

      args = args.slice(1);
    }
    return {
      emitConstructorLogs,
      createContractOptions: Object.assign({}, {
        adminKey: session.publicKey,
        bytecodeFileId: contractFileId,
        constructorParameters: await HContractFunctionParameters.newFor(constructorDefinition, args),
        gas: session.defaults.contract_creation_gas || DEFAULT_GAS_FOR_CONTRACT_CREATION,
        ...contractCreationOverrides
      })
    }
  }
}
