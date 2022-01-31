import { ConstructorFragment, FunctionFragment } from "@ethersproject/abi";
import { ContractFunctionParameters as HederaContractFunctionParameters } from "@hashgraph/sdk";
import BigNumber from "bignumber.js";

import { ParamTypeToFunctionNameMapper } from "../ParamTypeToFunctionNameMapper";
import { isSolidityAddressable } from "../core/SolidityAddressable";

export class ContractFunctionParameters extends HederaContractFunctionParameters {
    /**
     * Given a set of user-defined arguments and starting from the provided function/constructor interface definition, 
     * facilitates the construction of a {@see ContractFunctionParameters} ready to be embedded in a Contract transaction/query.
     * 
     * @param {ConstructorFragment|FunctionFragment} fDescription - The function/constructor schema
     * @param {Array} args - A list of arguments to be parsed into the underlying AbiDescription 
     */
    static async newFor(fDescription: ConstructorFragment|FunctionFragment, args: any[]) {
        if (!Array.isArray(args)) {
            throw new ContractFunctionParametersParser("I need an array of args in order to construct the ContractFunctionParameters instance for.");
        } else if (fDescription.inputs.length !== args.length) {
            throw new ContractFunctionParametersParser(`The contract expects ${fDescription.inputs.length} arguments yet ${args.length} were provided.`);
        }

        const toReturn = new ContractFunctionParameters();

        for (const id in args) {
            const fInputDescription = fDescription.inputs[id];
            const fctCallName = new ParamTypeToFunctionNameMapper(fInputDescription).map({ prefix: 'add' });
            const shouldUseBigNumbers = fctCallName.indexOf("64") !== -1 || fctCallName.indexOf("256") !== -1;
            let argToAdd = args[id];

            if (fInputDescription.type === 'address') {
                if (isSolidityAddressable(argToAdd)) {
                    // Colapse argument to its solidity-referenced address
                    argToAdd = await argToAdd.getSolidityAddress();
                }
            } else if (shouldUseBigNumbers) {
                if (Array.isArray(argToAdd)) {
                    argToAdd = argToAdd.map(v => v instanceof BigNumber ? v : new BigNumber(v));
                } else {
                    argToAdd = argToAdd instanceof BigNumber ? argToAdd : new BigNumber(argToAdd);
                }
            }
            toReturn[fctCallName](argToAdd);
        };
        return toReturn;
    }

    private constructor() {
        super();
    }
}

export class ContractFunctionParametersParser extends Error {
    constructor(msg: string) {
        super(msg);
    }
}