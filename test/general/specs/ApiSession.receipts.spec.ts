import {
    describe, expect, it,
} from '@jest/globals';

import { read } from '../../utils';
import { Contract } from '../../../lib/static/Contract';
import { HederaNetwork } from '../../../lib/HederaNetwork';
import { ContractCreateTransaction, FileAppendTransaction, FileCreateTransaction, TransactionRecordQuery } from '@hashgraph/sdk';

async function verifyContractUploadEventFiringsFor(contract: string, emitConstructorLogs: boolean, ...expectedTransactions: any[]) {
    const session = await HederaNetwork.defaultApiSession();
    const solContract = await Contract.newFrom({ code: read({ contract }) });

    return new Promise<void>((accept, reject) => {
        session.subscribeToReceiptsWith(({ transaction }) => {
            if (expectedTransactions.length === 0) {
                reject(`There are no more receipts expected, yet one was captured: ${JSON.stringify(transaction)}`);
            }

            const transactionIsExpected = transaction instanceof expectedTransactions[0];

            if (transactionIsExpected) {
                expectedTransactions = expectedTransactions.slice(1);
                if (expectedTransactions.length === 0) {
                    accept();
                }
            } else {
                reject(`Captured a receipt for un unexpected transaction: ${JSON.stringify(transaction)}`);
            }
        });
        
        // Upload the contract and and wait for the receipts
        session.upload(solContract, { _contract: { emitConstructorLogs } });
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
});
