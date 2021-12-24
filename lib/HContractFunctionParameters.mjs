import { ConstructorFragment, FunctionFragment } from "@ethersproject/abi";
import { ContractFunctionParameters } from "@hashgraph/sdk";
import BigNumber from "bignumber.js";
import { ParamTypeToFunctionNameMapper } from "./ParamTypeToFunctionNameMapper.mjs";

export class HContractFunctionParameters extends ContractFunctionParameters {
    /**
     * Given a set of user-defined arguments and starting from the provided function/constructor interface definition, 
     * facilitates the construction of a {@see ContractFunctionParameters} ready to be embedded in a Contract transaction/query.
     * 
     * @param {ConstructorFragment|FunctionFragment} fDescription - The function/constructor schema
     * @param {Array} args - A list of arguments to be parsed into the underlying AbiDescription 
     * @returns {ContractFunctionParameters} - A Hedera managed function-parameters object
     */
     constructor(fDescription, args = []) {
        super();

        if (fDescription instanceof ConstructorFragment === false && fDescription instanceof FunctionFragment === false) {
            throw new ContractFunctionParametersParser("In order to create a contract-function-arguments instance we need a valid constructor/function fragment instance provided.");
        } else if (!Array.isArray(args)) {
            throw new ContractFunctionParametersParser("I need an array of args in order to construct the ContractFunctionParameters instance for.");
        } else if (fDescription.inputs.length !== args.length) {
            throw new ContractFunctionParametersParser(`The contract expects ${fDescription.inputs.length} arguments yet ${args.length} were provided.`);
        }

        args.forEach((arg, id) => {
            const fInputDescription = fDescription.inputs[id];
            const fctCallName = new ParamTypeToFunctionNameMapper(fInputDescription).map({ prefix: 'add' });
            const shouldUseBigNumbers = (fctCallName.indexOf("64") !== -1 || fctCallName.indexOf("256") !== -1) && fInputDescription.type !== 'address';
            let argToAdd = arg;

            // TODO: refactor this better maybe?
            // TODO: check if type of 'val' is accepted by the 'inputDefs[id].type' type
            if (shouldUseBigNumbers) {
                if (Array.isArray(arg)) {
                    argToAdd = arg.map(v => v instanceof BigNumber ? v : new BigNumber(v));
                } else {
                    argToAdd = arg instanceof BigNumber ? arg : new BigNumber(arg);
                }
            }
            this[fctCallName](argToAdd);
        });
    }
}

export class ContractFunctionParametersParser extends Error {
    constructor(msg) {
        super(msg);
    }
}