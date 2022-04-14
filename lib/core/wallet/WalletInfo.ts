import { PublicAccountInfo } from '../../ApiSession';
import { SignerInfo } from '../../core/wallet/SignerInfo';

export interface WalletInfo {
  get account(): PublicAccountInfo;
  get signer(): SignerInfo;
}
