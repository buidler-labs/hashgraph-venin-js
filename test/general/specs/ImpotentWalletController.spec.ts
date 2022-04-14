import { describe, expect, it } from '@jest/globals';

import {
  AVAILABLE_NETWORK_NAMES,
  HederaNetwork,
} from '../../../lib/HederaNetwork';
import { DefinedNetworkDefaults } from '../../../lib/StratoContext';
import { ImpotentWalletController } from '../../../lib/wallet/controller/ImpotentWalletController';

describe('ImpotentWalletController', () => {
  it('given a impotent-wallet-controller, it should error out when trying to change the network', () => {
    const walletController = new ImpotentWalletController();

    expect(() =>
      walletController.changeNetwork(
        HederaNetwork.newFrom({
          defaults: DefinedNetworkDefaults[AVAILABLE_NETWORK_NAMES.TestNet],
          name: AVAILABLE_NETWORK_NAMES.TestNet,
          nodes: '',
        })
      )
    ).toThrow();
  });

  it('given a impotent-wallet-controller, it should error out when trying to change the account', () => {
    const walletController = new ImpotentWalletController();

    expect(() => walletController.changeAccount('0.0.69')).toThrow();
  });
});
