import { 
  Query, 
  Transaction, 
  TransactionReceipt, 
  TransactionResponse, 
} from "@hashgraph/sdk";
import Executable from "@hashgraph/sdk/lib/Executable";

import { WalletInfo } from './WalletInfo';

export interface StratoWallet extends WalletInfo {
  execute<T extends Transaction|Query<Q>, Q>(transaction: T): Promise<
      T extends Query<infer Q> ? Q : 
      T extends Executable<unknown, unknown, infer OUT> ? OUT : 
      never
  >;
  getReceipt(response: TransactionResponse): Promise<TransactionReceipt>;
}
