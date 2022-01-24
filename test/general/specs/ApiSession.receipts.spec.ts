import {
    describe, expect, it,
    jest
} from '@jest/globals';

import { read } from '../../utils';
import { Contract } from '../../../lib/static/Contract';
import { HederaNetwork } from '../../../lib/HederaNetwork';
import { ContractCreateTransaction, ContractExecuteTransaction, FileAppendTransaction, FileCreateTransaction, TransactionRecordQuery } from '@hashgraph/sdk';

async function verifyContractUploadEventFiringsFor(contract: string, emitConstructorLogs: boolean, ...expectedTransactions: any[]) {
    const session = await HederaNetwork.defaultApiSession();
    const solContract = await Contract.newFrom({ code: read({ contract }) });
    const spiedReceiptCallback = jest.fn();

    session.subscribeToReceiptsWith(spiedReceiptCallback);
    await session.upload(solContract, { _contract: { emitConstructorLogs } });

    expect(spiedReceiptCallback).toHaveBeenCalledTimes(expectedTransactions.length);
    expectedTransactions.forEach((expectedTransaction, index) => {
        expect(spiedReceiptCallback.mock.calls[index][0]).toBeInstanceOf(Object);
        expect((spiedReceiptCallback.mock.calls[index][0] as any).transaction).toBeInstanceOf(expectedTransaction);
    });
}

describe('ApiSession.Receipts', () => {
    it('uploading a json should generate appropriate receipts', async () => {
        const session = await HederaNetwork.defaultApiSession();
        
        return new Promise<void>((accept) => {
            session.subscribeToReceiptsWith(({ receipt }) => {
                expect(receipt.fileId).not.toBeNull();
                accept();
            });
            expect(session.upload({a: 1})).resolves.not.toBeNull();
        });
    });

    it('uploading a contract should generate appropriate receipts if constructor-event logs are of interest', async () => {
        return verifyContractUploadEventFiringsFor('solidity-by-example/hello_world', true,
            FileCreateTransaction,
            FileAppendTransaction,
            ContractCreateTransaction,
            TransactionRecordQuery
        );
    });

    it('uploading a contract should generate less receipts when constructor-event logs are not required', async () => {
        return verifyContractUploadEventFiringsFor('solidity-by-example/hello_world', false,
            FileCreateTransaction,
            FileAppendTransaction,
            ContractCreateTransaction
        );
    });

    it('executing a live-contract function in a default-session environment that does not emit receipts when calling such functions, should emit a receipt if one is requested', async () => {
        const session = await HederaNetwork.defaultApiSession({
            env: {
                ...process.env,
                HEDERAS_DEFAULT_EMIT_LIVE_CONTRACTS_RECEIPTS: "false"
            }
        });
        const solContract = await Contract.newFrom({ code: read({ contract: 'solidity-by-example/state_variables' }) });
        const liveContract = await session.upload(solContract);
        const spiedReceiptCallback = jest.fn();

        session.subscribeToReceiptsWith(spiedReceiptCallback);
        await liveContract.set({ emitReceipt: true }, 2);

        expect(spiedReceiptCallback).toHaveBeenCalled();
        expect(spiedReceiptCallback.mock.calls[0][0]).toBeInstanceOf(Object);
        expect((spiedReceiptCallback.mock.calls[0][0] as any).transaction).toBeInstanceOf(ContractExecuteTransaction);
    });
});
