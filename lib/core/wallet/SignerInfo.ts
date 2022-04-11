import { 
  AccountBalance, 
  AccountInfo, 
  LedgerId, 
  TransactionRecord,
} from "@hashgraph/sdk";

import { HederaNodesAddressBook } from "../../HederaNetwork";

/**
 * A set of sub-definitions for HIP-338's Signer interface 
 * that only deal with information presentation
 */
export interface SignerInfo {
  // Note: 'getAccountId' is part of the 'StratoWallet.account'
  getLedgerId(): LedgerId;
  getNetwork(): HederaNodesAddressBook;
  getMirrorNetwork(): string[];

  // Query-dependent signer info
  getAccountBalance(): Promise<AccountBalance>;
  getAccountInfo(): Promise<AccountInfo>;
  getAccountRecords(): Promise<TransactionRecord[]>
}
