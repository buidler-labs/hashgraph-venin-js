/* eslint-env browser */

import { default as merge } from 'lodash-es/merge';

import {
  Account,
  ApiSession,
  Contract,
  File,
  Json,
  KeyType,
  Token,
  TokenTypes,
  Topic,
} from '@buidlerlabs/hedera-strato-js';

import {
  HashPackWallet,
} from 'hashconnect-hip-338';

const hpAppMetaData = {
  description: "Hedera Strato Documentation",
  icon: "https://www.hashpack.app/img/logo.svg",
  name: "hStrato",
};

async function injectStrato() {
  try {
    const docsOperatorResponse = await fetch('https://eu2.contabostorage.com/963797152a304f4bb7f75cc0af884bd7:buidler-labs/projects/hedera-strato-js/docs-operator.json');
    const { value: uint8ArrayDocsOperator } = await docsOperatorResponse.body.getReader().read();
    const rawDocsOperator = new TextDecoder().decode(uint8ArrayDocsOperator);
    const docsOperator = JSON.parse(rawDocsOperator);
    const s3OperatorContext = {
      network: {
        name: docsOperator.network,
      },
      wallet: {
        sdk: {
          operatorId: docsOperator.accountId,
          operatorKey: docsOperator.privateKey,
        },
      },
    };
    const originalApiSessionDefault = ApiSession.default;

    console.log(`ApiSession will default to using account-id '${docsOperator.accountId}' on network '${docsOperator.network}'.`);
    window["ApiSession"] = {
      default: function (...args) {
        let operatorCoordsProvided = false;

        if (args.length > 0 && args[0] instanceof Object) {
          if (args[0].wallet !== undefined && args[0].wallet.hedera !== undefined) {
            operatorCoordsProvided = args[0].wallet.sdk.operatorId !== undefined || args[0].wallet.sdk.operatorKey !== undefined;
          }
          operatorCoordsProvided ||= (args[0].network !== undefined && args[0].network.name !== undefined);
        }

        // eslint-disable-next-line no-undef
        return originalApiSessionDefault(merge(operatorCoordsProvided ? {} : s3OperatorContext, ...args));
      },
      ... ApiSession,
    };
  } catch(e) {
    console.error('There was an error while fetching the docs-client operator. Falling back to the bundled operator.', e);
    window["ApiSession"] = ApiSession;
  } finally {
    window["Account"] = Account;
    window["Contract"] = Contract;
    window["File"] = File;
    window["Json"] = Json;
    window["KeyType"] = KeyType;
    window["Token"] = Token;
    window["TokenTypes"] = TokenTypes;
    window["Topic"] = Topic;
  }
}

(async function () {
  await injectStrato();

  window["connectWallet"] = async (networkName) => {
    const wallet = await HashPackWallet.newConnection({
      appMetadata: hpAppMetaData,
      debug: false,
      networkName,
    });

    setWallet(wallet);
    return wallet;
  };

  window['disconnectWallet'] = () => {
    if(window['hedera']) {
      window['hedera'].wipePairingData();
      window['hedera'] = null;
    }
  }

  setWallet(await HashPackWallet.getConnection(false));
})();

function setWallet(wallet) {
  if (wallet) {
    window['hedera'] = wallet;
    window.postMessage("WalletLoaded");
  }
}
