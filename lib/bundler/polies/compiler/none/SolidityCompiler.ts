/* eslint-disable no-undef */
export const VIRTUAL_SOURCE_CONTRACT_FILE_NAME = "__contract__.sol";

export class SolidityCompiler {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  static compile({ code, path }) {
    throw new Error(
      "Compiling contracts is not available in this distribution. Please see the docs on how to enable it."
    );
  }
}
