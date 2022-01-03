import BigNumber from "bignumber.js";
import traverse from 'traverse';
import {
    ContractCallQuery, 
    ContractCreateTransaction, 
    ContractExecuteTransaction, 
    ContractFunctionResult, 
    ContractId, 
    Hbar, 
    TransactionId
} from "@hashgraph/sdk";
import { FunctionFragment, Interface } from "@ethersproject/abi";
import { arrayify } from '@ethersproject/bytes';

import { Contract } from "../static/Contract";
import { HContractFunctionParameters } from "../HContractFunctionParameters";
import { EventEmitter } from "events";
import { LiveEntity } from "./LiveEntity";
import { SolidityAddressable } from "../SolidityAddressable";
import { ApiSession } from "../ApiSession";
import { TransactionReceiptQuery } from "../TransactionReceiptQuery";

export const DEFAULT_GAS_PER_CONTRACT_TRANSACTION = 69_000;

export type ContractMethod<T = any> = (...args: Array<any>) => Promise<T>;

export class LiveContract extends EventEmitter implements LiveEntity, SolidityAddressable {
    /**
     * Constructs a new LiveContract to be interacted with on the Hashgraph.
     */
    public static async newFollowingUpload({ session, contract, transaction }: {
        session: ApiSession,
        contract: Contract,
        transaction: ContractCreateTransaction
    }): Promise<LiveContract> {
        if (session instanceof ApiSession === false ||
            contract instanceof Contract === false ||
            transaction instanceof ContractCreateTransaction === false) {
            throw new Error("We need a reference to the underlying client tranport, the contract blueprint being deployed and " +
                            "a referance to the pre-filled contract-create transaction in order to execute the transaction and create the live-contract link.");
        }
        const contractTransactionResponse = await session.execute(transaction);
        const createdContractReceipt = await session.execute(TransactionReceiptQuery.for(contractTransactionResponse));

        return new LiveContract({ 
            session, 
            id: createdContractReceipt.contractId,
            cInterface: contract.interface,
        });
    }

    private readonly session: ApiSession;
    public readonly id: ContractId;
    private readonly interface: Interface;

    // TODO: REFACTOR THIS AWAY! yet, there's no other way of making this quickly work right now!
    readonly [ k: string ]: ContractMethod | any;

    public constructor({ session, id, cInterface }: {
        session: ApiSession,
        id: ContractId,
        cInterface: Interface
    }) {
        super();

        this.session = session;
        this.id = id;
        this.interface = cInterface;

        // Dinamically inject ABI function handling
        Object.values(this.interface.functions).forEach(fDescription => Object.defineProperty(this, fDescription.name, {
                enumerable: true,
                value: (async function (this: LiveContract, fDescription: FunctionFragment, ...args: any[]) {
                    const request = await this._createContractRequestFor({ fDescription, args });
                    const callResponse = await this.session.execute(request);

                    this._tryToProcessForEvents(callResponse);
                    return await this._tryExtractingResponse(callResponse, fDescription);
                }).bind(this, fDescription),
                writable: false,
            }));
    }

    /**
     * Retrieves the Solidity address representation of the underlying, deployed, contract.
     */
    public async getSolidityAddress(): Promise<string> {
        return this.id.toSolidityAddress();
    }

    /**
     * Creates a contract query/call request based for the given function-description and the desired arguments (args).
     * The first argument is checked to see if it matches the constructor arguments schema and, if it does, it's used to construct the
     * actual request instance, discarding it in the process so that the remaining arguments can all be used as the actual values sent to 
     * the targeted function.
     */
    private async _createContractRequestFor({ fDescription, args }: { fDescription: FunctionFragment, args: any[] }): Promise<ContractCallQuery | ContractExecuteTransaction> {
        let requestOptionsPresentInArgs = false;
        let constructorArgs: any = { 
            contractId: this.id,
            gas: DEFAULT_GAS_PER_CONTRACT_TRANSACTION
        };
        let contractRequest;

        // Try to pick up any specific constructor arguments provided at call-time such as 'gas' or 'amount' to transfer
        if (args && args.length > 0) {
            if (Number.isInteger(args[0].gas)) {
                constructorArgs.gas = args[0].gas;
                requestOptionsPresentInArgs = true;
            }
            if (!fDescription.constant) {
                if (Number.isInteger(args[0].amount)) {
                    constructorArgs.amount = args[0].amount;
                    requestOptionsPresentInArgs = true;
                }
            }
        }
        
        // Initialize the Hedera request-object itself passing in any additional constructor args (if provided)
        contractRequest = fDescription.constant ? new ContractCallQuery(constructorArgs) : new ContractExecuteTransaction(constructorArgs);
        
        // Try to inject setter-only options
        if (args && args.length > 0) {
            if (fDescription.constant) {
                // Try setting aditional Query properties
                if (args[0].maxQueryPayment instanceof Hbar) {
                    contractRequest.setMaxQueryPayment(args[0].maxQueryPayment);
                    requestOptionsPresentInArgs = true;
                }
                if (args[0].paymentTransactionId instanceof TransactionId) {
                    contractRequest.setPaymentTransactionId(args[0].paymentTransactionId);
                    requestOptionsPresentInArgs = true;
                }
                if (args[0].queryPayment instanceof Hbar) {
                    contractRequest.setQueryPayment(args[0].queryPayment);
                    requestOptionsPresentInArgs = true;
                }
            } else {
                // This is a state-changing Transaction. Try setting aditional properties as well
                if (args[0].maxTransactionFee) {  // number | string | Long | BigNumber | Hbar
                    contractRequest.setMaxTransactionFee(args[0].maxTransactionFee);
                    requestOptionsPresentInArgs = true;
                }
                if (Array.isArray(args[0].nodeAccountIds)) {
                    contractRequest.setNodeAccountIds(args[0].nodeAccountIds);
                    requestOptionsPresentInArgs = true;
                }
                if (args[0].transactionId instanceof TransactionId) {
                    contractRequest.setTransactionId(args[0].transactionId);
                    requestOptionsPresentInArgs = true;
                }
                if (args[0].transactionMemo) {  // string
                    contractRequest.setTransactionMemo(args[0].transactionMemo);
                    requestOptionsPresentInArgs = true;
                }
                if (Number.isInteger(args[0].transactionValidDuration)) {
                    contractRequest.setTransactionValidDuration(args[0].transactionValidDuration);
                    requestOptionsPresentInArgs = true;
                }
            }
        }
        
        // Try cleaning up arguments list if config object was provide
        if (requestOptionsPresentInArgs) {
            args = args.slice(1);
        }
        
        // Prepare the targeted function
        contractRequest.setFunction(
            fDescription.name, 
            await HContractFunctionParameters.newFor(fDescription, args)
        );

        return contractRequest;
    }

    /**
     * Given a contract-request response (txResponse) and a targeted function-description, it tries to extract and prepare the caller response based on
     * the contract's output function ABI specs.
     */
    private _tryExtractingResponse(txResponse: ContractFunctionResult, fDescription: FunctionFragment) {
        const EthersBigNumber = require('@ethersproject/bignumber').BigNumber;
        let fResponse;
        const fResult = this.interface.decodeFunctionResult(fDescription, txResponse.asBytes());
        const fResultKeys = Object.keys(fResult).filter(evDataKey => isNaN(Number(evDataKey)));

        if (fDescription.outputs && fDescription.outputs.length !== 0) {
            if (fResultKeys.length === fDescription.outputs.length) {
                // A named object can be returned since all the outputs are named
                const isBytesTypeExpectedFor = (propKey:string) => fDescription.outputs.find(o => o.name === propKey).type.startsWith('bytes');
                const tryMappingToHederaBytes = (propKey:string) => isBytesTypeExpectedFor(propKey) ? arrayify(fResult[propKey]) : fResult[propKey];

                fResponse = fResultKeys.map(namedfDataKey => ({ [namedfDataKey]: tryMappingToHederaBytes(namedfDataKey) }))
                    .reduce((p, c) => ({...p, ...c}), {});
            } else if (fDescription.outputs.length > 1) {
                fResponse = [...fResult];

                // Map all Ethers HexString representations of bytes-type responses to their UInt8Array forms (same used by Hedera)
                fResponse = fDescription.outputs.map((dType, id) => dType.type.startsWith('bytes') ? arrayify(fResponse[id]) : fResponse[id]);
            } else {
                fResponse = fResult[0];
            }

            // Map all Ethers' BigNumber to the Hedera-used, bignumber.js equivalent
            if (EthersBigNumber.isBigNumber(fResponse)) {
                fResponse = new BigNumber(fResponse.toString());
            } else {
                traverse(fResponse).forEach(function(x) {
                    if (EthersBigNumber.isBigNumber(x)) {
                        this.update(new BigNumber(x.toString()));
                    }
                });
            }
        }
        return fResponse;
    }

    /**
     * Given the call-response of a contract-method call/query, we try to see if there have been any events emitted and, if so, we re-emit them on the live-contract instance.
     */
    private _tryToProcessForEvents(callResponse: ContractFunctionResult): void {
        callResponse.logs.forEach(recordLog => {
            const data = `0x${recordLog.data.length === 0 ? "" : Buffer.from(recordLog.data).toString('hex')}`;
            const topics = recordLog.topics.map(topic => "0x" + Buffer.from(topic).toString('hex'));
            let logDescription;

            try {
                logDescription = this.interface.parseLog({ data, topics });
            } catch (e) {
                // No-op
            }
            if (!logDescription || this.listenerCount(logDescription.name) === 0) {
                // No one is interested in this event. Skip
                return;
            }

            const decodedEventObject = Object.keys(logDescription.args)
                .filter(evDataKey => isNaN(Number(evDataKey)))
                .map(namedEvDataKey => ({ [namedEvDataKey]: logDescription.args[namedEvDataKey] }))
                .reduce((p, c) => ({...p, ...c}), {});

            try {
                this.emit(logDescription.name, decodedEventObject);
            } catch (e) {
                if (process.env.NODE_ENV === 'test') {
                    // We re-interpret and throw it so that any tests running will be aware of it
                    throw new Error(`The event-emitter handle '${logDescription.name}' failed to execute with the following reason: ${e.message}`);
                }
                // otherwise, it's a No-op
            }
        });
    }
}
