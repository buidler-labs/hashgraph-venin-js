import { FunctionFragment, Interface } from "@ethersproject/abi";
import BigNumber from "bignumber.js";
import { BigNumber as EthersBigNumber } from "@ethersproject/bignumber";
import { arrayify } from "@ethersproject/bytes";
import traverse from "traverse";

import { AccountId, ContractId, Hbar, TokenId, TopicId } from "@hashgraph/sdk";
import { decodeFromHex } from "./Hex";
import { isSolidityAddressable } from "./SolidityAddressable";
import { transform } from "./UsefulOps";

export class StratoContractArgumentsEncoder {
  public constructor(private readonly abi: Interface) {}

  /**
   * Byte encodes `args` to the solidity expected format for the ABI's deployment function (aka constructor)
   */
  public encode(args: any[]): Uint8Array;

  /**
   * Byte encodes `args` to the solidity-expected format for function `forWhatFct` within the ABI
   *
   * @param args a vector of positional arguments ready for `forWhatFct` consumption
   * @param forWhatFct the desired function definition (or name of it) for which to encode `args`
   */
  public encode(args: any[], forWhatFct: FunctionFragment | string): Uint8Array;

  public encode(
    args: any[],
    forWhatFct?: FunctionFragment | string
  ): Uint8Array {
    const targetedFunction =
      forWhatFct !== undefined
        ? typeof forWhatFct === "string"
          ? this.abi.getFunction(forWhatFct)
          : forWhatFct
        : this.abi.deploy;

    if (!targetedFunction) {
      throw new Error(
        `There is no such '${forWhatFct}' function present in the targeted ABI`
      );
    }

    const fctInputs = targetedFunction.inputs;

    traverse(args).forEach(function (potentialArg) {
      const solArgDescription = this.path.reduce((state, propName) => {
        if (!isNaN(parseInt(propName))) {
          // property name is numeric
          if (state.baseType === "array") {
            // Bypass instance references
            return state;
          }
        } else {
          // property name is NOT numeric. It might be referencing a solidity struct prop
          if (state.type.startsWith("tuple")) {
            return state.components.find(
              (component) => component.name === propName
            );
          }
        }
        return state[propName];
      }, fctInputs);
      const requireBytesYetStringProvided =
        this.isLeaf &&
        solArgDescription !== undefined &&
        solArgDescription.type !== undefined &&
        solArgDescription.type.startsWith("bytes") &&
        typeof potentialArg === "string";

      // Do primitive leaf processing
      if (requireBytesYetStringProvided) {
        const considerMappingStringToUint8Array = (arg: string): Uint8Array =>
          arg.startsWith("0x") ? arrayify(arg) : new TextEncoder().encode(arg);
        this.update(
          transform(potentialArg, considerMappingStringToUint8Array),
          true
        );
      }

      if (
        this.isLeaf ||
        (!(potentialArg instanceof Uint8Array) &&
          !(potentialArg instanceof Hbar) &&
          !isSolidityAddressable(potentialArg) &&
          !BigNumber.isBigNumber(potentialArg) &&
          !(potentialArg instanceof AccountId) &&
          !(potentialArg instanceof ContractId) &&
          !(potentialArg instanceof TokenId) &&
          !(potentialArg instanceof TopicId))
      ) {
        // We're only processing mostly leafs or higher objects of interest
        return;
      }

      if (solArgDescription.type.startsWith("address")) {
        const considerMappingSolidityAddressableToAddress = (
          arg: any
        ): string =>
          isSolidityAddressable(arg)
            ? arg.getSolidityAddress()
            : arg instanceof AccountId
            ? arg.toSolidityAddress()
            : arg instanceof ContractId
            ? arg.toSolidityAddress()
            : arg instanceof TokenId
            ? arg.toSolidityAddress()
            : arg instanceof TopicId
            ? arg.toSolidityAddress()
            : arg;
        this.update(
          transform(potentialArg, considerMappingSolidityAddressableToAddress),
          true
        );
      } else if (potentialArg instanceof Hbar) {
        this.update(
          EthersBigNumber.from(potentialArg.toTinybars().toString()),
          true
        );
      } else if (BigNumber.isBigNumber(potentialArg)) {
        this.update(EthersBigNumber.from(potentialArg.toString()), true);
      }
    });

    const encodedFuncParams =
      forWhatFct !== undefined
        ? this.abi.encodeFunctionData(targetedFunction.name, args)
        : this.abi.encodeDeploy(args);

    return decodeFromHex(encodedFuncParams.slice(2));
  }
}
