import {
    describe, expect, it,
    jest
} from '@jest/globals';
import { 
    ContractCreateTransaction, 
    ContractExecuteTransaction, 
    FileAppendTransaction, 
    FileCreateTransaction, 
    TransactionRecordQuery 
} from '@hashgraph/sdk';

import { read as readResource, ResouorceReadOptions } from '../../utils';
import { Contract } from '../../../lib/static/upload/Contract';
import { ApiSession } from '../../..';

function read(what: ResouorceReadOptions) {
    return readResource({ relativeTo: 'solidity-by-example', ...what });
}

async function verifyContractUploadEventFiringsFor(contract: string, emitConstructorLogs: boolean, ...expectedTransactions: any[]) {
    const { session } = await ApiSession.default();
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

describe('ApiSession.Solidity-by-Example.Receipts', () => {

    it('uploading a contract should generate appropriate receipts if constructor-event logs are of interest', async () => {
        return verifyContractUploadEventFiringsFor('hello_world', true,
            FileCreateTransaction,
            FileAppendTransaction,
            ContractCreateTransaction,
            TransactionRecordQuery
        );
    });

    it('uploading a contract should generate less receipts when constructor-event logs are not required', async () => {
        return verifyContractUploadEventFiringsFor('hello_world', false,
            FileCreateTransaction,
            FileAppendTransaction,
            ContractCreateTransaction
        );
    });

    it('executing a live-contract function in a default-session environment that does not emit receipts when calling such functions, should emit a receipt if one is requested', async () => {
        const { session } = await ApiSession.default({
            session: {
                defaults: {
                    emitLiveContractReceipts: false
                }
            }
        });
        const solContract = await Contract.newFrom({ code: read({ contract: 'state_variables' }) });
        const liveContract = await session.upload(solContract);
        const spiedReceiptCallback = jest.fn();

        session.subscribeToReceiptsWith(spiedReceiptCallback);
        await liveContract.set({ emitReceipt: true }, 2);

        expect(spiedReceiptCallback).toHaveBeenCalled();
        expect(spiedReceiptCallback.mock.calls[0][0]).toBeInstanceOf(Object);
        expect((spiedReceiptCallback.mock.calls[0][0] as any).transaction).toBeInstanceOf(ContractExecuteTransaction);
    });
});
