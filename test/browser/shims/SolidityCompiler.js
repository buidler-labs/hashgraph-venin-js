export const VIRTUAL_SOURCE_CONTRACT_FILE_NAME = "not-used";

export class SolidityCompiler {
    static compile() { 
        throw new Error('Contracts cannot currently be compiled in browser, use a ContractRegistry instead.'); 
    }
} 