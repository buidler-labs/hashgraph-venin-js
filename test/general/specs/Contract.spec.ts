import {
    expect, describe, it,
} from '@jest/globals';

import { read } from '../../utils';
import { Contract } from '../../../lib/static/Contract';
import { CompileIssues } from '../../../lib/errors/CompileIssues';

const CALL_CALLER_BYTECODE = read({ solo: 'call_caller' }).evm.bytecode.object;
const CALL_RECEIVER_BYTECODE = read({ solo: 'call_receiver' }).evm.bytecode.object;
const HELLO_IMPORTS_BYTECODE = read({ solo: 'hello_imports' }).evm.bytecode.object;
const HELLO_WORLD_BYTECODE = read({ solo: 'hello_world' }).evm.bytecode.object;

describe('Contract', () => {
    it('given neither the source code nor the source path, instantiating a Contract should not be permitted.', async () => {
        await expect(Contract.allFrom({ })).rejects.toThrow();
        await expect(Contract.newFrom({ })).rejects.toThrow();
    });

    it('given a perfectly valid solidity contract code, extracting all the Contracts should succede', async () => {
        await Contract.allFrom({
            code: read({ contract: 'solidity-by-example/hello_world' })
        });
    });

    it('given a valid solidity contract, serializing and then deserializing it should give back the same contract', async () => {
        const originalHelloWorldContract = await Contract.newFrom({ code: read({ contract: 'solidity-by-example/hello_world' }) });
        const deserializedContract = Contract.deserialize(originalHelloWorldContract.serialize());

        expect(originalHelloWorldContract.equals(deserializedContract)).toBeTruthy();
    });

    it('given several invalid serialized solidity contracts, deserializing them should fail', async () => {
        expect(() => Contract.deserialize(`{"byteCode": "ab", "abi": []}`)).toThrow();
        expect(() => Contract.deserialize(`{"name": "A", "abi": []}`)).toThrow();
        expect(() => Contract.deserialize(`{"name": "A", "byteCode": "$ab", "abi": []}`)).toThrow();
        expect(() => Contract.deserialize(`{"name": "A", "byteCode": "ab"}`)).toThrow();
    });

    it("given a solidity contract code which doesn't have a license, extracting all the Contracts should fail if we care about compiler warnings", async () => {
        try {
            await Contract.allFrom({
                code: read({ contract: 'no_license_hello_world' }),
                ignoreWarnings: false
            });
        } catch (e) {
            expect(e.constructor.name).toEqual(CompileIssues.name);
            return;
        }
        throw new Error("Instantiating a Contract works even though it should fail having warnings reported.");
    });

    it("given a solidity contract code which doesn't have a license, extracting all the Contracts should succede if we don't care about compiler warnings", async () => {
        await Contract.allFrom({
            code: read({ contract: 'no_license_hello_world' }),
            ignoreWarnings: true
        });
    });

    it("given a simple valid solidity contract code, its resulting byteCode should be sane if querying without a contractName", async () => {
        const contracts = await Contract.allFrom({
            code: read({ contract: 'solidity-by-example/hello_world' })
        });

        expect(contracts).toHaveLength(1);
        expect(contracts[0].byteCode).toEqual(HELLO_WORLD_BYTECODE);
    });

    it("given a 2x solidity contract code, its resulting byteCode should be sane", async () => {
        const contracts = await Contract.allFrom({
            code: read({ contract: 'solidity-by-example/call' }),
            // We need to compile ignoring warnings otherwise the original solidity code will fail with
            //    Warning: This contract has a payable fallback function, but no receive ... 
            ignoreWarnings: true
        });

        expect(contracts).toHaveLength(2);
        expect(contracts[0].byteCode).toEqual(CALL_CALLER_BYTECODE);
        expect(contracts[1].byteCode).toEqual(CALL_RECEIVER_BYTECODE);
    });

    it("given a 2x solidity contract code, retrieving entrie by their name should be possible", async () => {
        const receiverContract = await Contract.newFrom({ code: read({ contract: 'solidity-by-example/call' }), ignoreWarnings: true, name: 'Receiver' });
        const callerContract = await Contract.newFrom({ code: read({ contract: 'solidity-by-example/call' }), ignoreWarnings: true, name: 'Caller' });

        expect(callerContract.byteCode).toEqual(CALL_CALLER_BYTECODE);
        expect(receiverContract.byteCode).toEqual(CALL_RECEIVER_BYTECODE);
    });

    it("given a 2x solidity contract code, various single-contract extraction scenarios should work as expected", async () => {
        const code = read({ contract: 'solidity-by-example/hello_world' });
        const allContracts = await Contract.allFrom({ code });
        
        expect(allContracts).toHaveLength(1);
        await expect(Contract.newFrom({ code, index: -1 })).rejects.toThrow();
        await expect(Contract.newFrom({ code, index: 1 })).rejects.toThrow();
        await Contract.newFrom({ code }).then(resolvedContract => expect(allContracts[0].equals(resolvedContract)).toBe(true));
        await Contract.newFrom({ code, index: 0 }).then(resolvedContract => expect(allContracts[0].equals(resolvedContract)).toBe(true));
    });

    it("given a valid contract that is inter-linked via chain-import-ing with others and its path-prefix not set in env, compiling it should not fail", async () => {
        expect(process.env.HEDERAS_CONTRACTS_INCLUDED_PREFIXES.split(/\s*,\s*/)).not.toContain('import_resolution');

        await expect(Contract.allFrom({ path: './general/contracts/import_resolution/hello_imports.sol' })).resolves.not.toThrow();
    });

    it("given a valid contract that is inter-linked via chain-import-ing with others, compiling it should recurse to importing all of its dependencies", async () => {
        const path = './general/contracts/import_resolution/hello_imports.sol';
        const contracts = await Contract.allFrom({ path });
        
        expect(contracts).toHaveLength(1);
        await Contract.newFrom({ path }).then(resolvedContract => expect(contracts[0].equals(resolvedContract)).toBe(true));
        expect(contracts[0].byteCode).toEqual(HELLO_IMPORTS_BYTECODE);
    });
});
