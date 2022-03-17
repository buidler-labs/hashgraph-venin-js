/* eslint-env browser */

import { default as merge } from 'lodash-es/merge';

import {
  Account,
  ApiSession,
  Contract,
  Json,
  KeyType,
  Token,
  TokenTypes,
} from '@buidlerlabs/hedera-strato-js';

import {
  HashPackWallet,
} from 'hashconnect-hip-338';

const hpAppMetaData = {
  description: "Hedera Strato Documentation",
  icon: "https://www.hashpack.app/img/logo.svg",
  name: "hStrato",
};

// Set this upfront for naive handling of race conditions (at least docs won't crash)
window["StratoOperator"] = {
  accountId: 'unknown',
  network: 'unknown',
};

async function fetchDocsOperator() {
  try {
    const docsOperatorResponse = await fetch('https://eu2.contabostorage.com/963797152a304f4bb7f75cc0af884bd7:buidler-labs/projects/hedera-strato-js/docs-operator.json');
    const { value: uint8ArrayDocsOperator } = await docsOperatorResponse.body.getReader().read();
    const rawDocsOperator = new TextDecoder().decode(uint8ArrayDocsOperator);
    const docsOperator = JSON.parse(rawDocsOperator);
    const githubOperatorContext = {
      client: {
        hedera: {
          operatorId: docsOperator.accountId,
          operatorKey: docsOperator.privateKey,
        },
      },
      network: {
        name: docsOperator.network,
      },
    };
    const originalApiSessionDefault = ApiSession.default;

    console.log(`ApiSession will default to using account-id '${docsOperator.accountId}' on network '${docsOperator.network}'.`);
    window["ApiSession"] = {
      default: function (...args) {
        let operatorCoordsProvided = false;

        if (args.length > 0 && args[0] instanceof Object) {
          if (args[0].client !== undefined && args[0].client.hedera !== undefined) {
            operatorCoordsProvided = args[0].client.hedera.operatorId !== undefined || args[0].client.hedera.operatorKey !== undefined;
          }
          operatorCoordsProvided ||= (args[0].network !== undefined && args[0].network.name !== undefined);
        }

        // eslint-disable-next-line no-undef
        return originalApiSessionDefault(merge(operatorCoordsProvided ? {} : githubOperatorContext, ...args));
      },
      ... ApiSession,
    };

    return {
      accountId: docsOperator.accountId,
      network: docsOperator.network,
    };
  } catch(e) {
    console.error('There was an error while fetching the docs-client operator. Falling back to the bundled operator.', e);
    window["ApiSession"] = ApiSession;
  } finally {
    window["Account"] = Account;
    window["Contract"] = Contract;
    window["Json"] = Json;
    window["KeyType"] = KeyType;
    window["Token"] = Token;
    window["TokenTypes"] = TokenTypes;
  }
}

(async function () {
  const stratoOperator = await fetchDocsOperator();

  if (stratoOperator) {
    window["StratoOperator"] = stratoOperator;

    const {connected, payload} = await HashPackWallet.getConnection({
      appMetadata: hpAppMetaData,
      debug: false,
      networkName: stratoOperator.network,
    })

    window['hedera'] = connected && payload;

    window["connectWallet"] = async (networkName) => {
      const wallet = await HashPackWallet.initialize({
        appMetadata: hpAppMetaData,
        debug: false,
        networkName,
      });

      window['hedera'] = wallet;
      return wallet;
    };

    window['disconnectWallet'] = () => {
      if(window['hedera']) {
        window['hedera'].wipePairingData();
        window['hedera'] = null;
      }
    }
  }
})();
