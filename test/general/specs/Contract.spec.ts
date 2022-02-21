import {
    expect, describe, it,
} from '@jest/globals';

import { read } from '../../utils';
import { CompileIssues } from '../../../lib/errors/CompileIssues';
import { Contract } from '../../../lib/static/upload/Contract';

const HELLO_IMPORTS_BYTECODE = read({ solo: 'hello_imports' }).evm.bytecode.object;

describe('Contract', () => {
    it('given neither the source code nor the source path, instantiating a Contract should not be permitted.', async () => {
        await expect(Contract.allFrom({ })).rejects.toThrow();
        await expect(Contract.newFrom({ })).rejects.toThrow();
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
