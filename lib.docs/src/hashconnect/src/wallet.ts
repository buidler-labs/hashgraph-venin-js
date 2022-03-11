/* eslint-env browser */

import { 
  AccountBalanceQuery,
  AccountId, 
  AccountInfoQuery,
  AccountRecordsQuery,
  Client,
  Provider,
  PublicKey,
  SignerSignature,
  Transaction,
  TransactionId,
  Wallet,
} from '@hashgraph/sdk';
import { 
  HashConnect,
  HashConnectTypes,
} from 'hashconnect';
import Executable from '@hashgraph/sdk/lib/Executable';

import { HashConnectProvider } from './provider';
import { HashConnectSender } from './sender';
import { HashPackSigner } from './signer';

let wallet = null;

const MirrorNetwork = {
  "mainet": "https://mainnet-public.mirrornode.hedera.com",
  "previewnet": "https://previewnet.mirrornode.hedera.com",
  "testnet": "https://testnet.mirrornode.hedera.com",
};

function loadLocalData() {
  const foundData = localStorage.getItem("hashconnectData");

  if (foundData) {
    return { coldStart: false, storedData: JSON.parse(foundData) };
  }
  return { coldStart: true, storedData: {} };
}

export class HashPackWallet extends Wallet {
  static async initialize({ networkName = "testnet", debug = false, appMetadata }: { networkName: string, debug: boolean, appMetadata: HashConnectTypes.AppMetadata }) {
    if (!wallet) {
      const hashConnect = new HashConnect(debug);
      const { coldStart, storedData } = loadLocalData();

      if (coldStart) {
        const initData = await hashConnect.init(appMetadata);
        storedData.privateKey = initData.privKey;

        const state = await hashConnect.connect();
        storedData.topic = state.topic;
          
        storedData.pairingString = hashConnect.generatePairingString(state, networkName, true);
        console.log(`Generated a new paring string: ${storedData.pairingString}`);
        hashConnect.foundExtensionEvent.once(_ => {
          hashConnect.connectToLocalWallet(storedData.pairingString);
        });
        hashConnect.findLocalWallets();
      } else {
        await hashConnect.init(appMetadata, storedData.privateKey);
        await hashConnect.connect(storedData.topic, storedData.pairedWalletData);

        wallet = new HashPackWallet({ 
          accountId: AccountId.fromString(storedData.accountId), 
          accountKey: PublicKey.fromString(storedData.accountKey),
          hashConnect, networkName, 
          topicId: storedData.topic,
        });
        return wallet;
      }

      return new Promise((accept, reject) => {
        hashConnect.pairingEvent.once(pairingData => {
          if (pairingData.accountIds && pairingData.accountIds.length > 0) {
            const accountId = AccountId.fromString(pairingData.accountIds[0]);
            
            fetch(`${MirrorNetwork[networkName]}/api/v1/accounts?account.id=${accountId}`)
              .then(response => response.json())
              .then(jResponse => {
                const accountKey = PublicKey.fromString(jResponse.accounts[0].key.key);

                localStorage.setItem("hashconnectData", JSON.stringify({
                  ...storedData,
                  accountId: accountId.toString(), accountKey: accountKey.toStringDer(),
                  networkName,
                  pairedWalletData: pairingData.metadata,
                }));
                wallet = new HashPackWallet({ 
                  accountId, accountKey,
                  hashConnect, networkName, 
                  topicId: storedData.topic,
                });
                accept(wallet);
              });
          } else {
            reject("Did not receive back any paired accounts.");
          }
        });
      });
    }
    return wallet;
  }

  private readonly client: Client;
  private readonly accountId: AccountId;
  private readonly accountKey: PublicKey;
  private readonly provider: Provider;
  private readonly signer: HashPackSigner;
  
  private constructor({ accountId, accountKey, topicId, hashConnect, networkName }) {
    super();
    const hcSender = new HashConnectSender(hashConnect, topicId);

    this.client = Client.forName(networkName);
    this.accountId = accountId;
    this.accountKey = accountKey;
    this.provider = new HashConnectProvider(hcSender, networkName);
    this.signer = new HashPackSigner(accountId, hcSender);
  }

  getProvider() {
    return this.provider;
  }

  getAccountKey() {
    return this.accountKey;
  }

  getLedgerId() {
    return this.provider.getLedgerId();
  }
  
  getAccountId() {
    return this.accountId;
  }

  getNetwork() {
    return this.provider.getNetwork();
  }

  getMirrorNetwork() {
    return this.provider.getMirrorNetwork();
  }

  async sign(messages: Uint8Array[]): Promise<SignerSignature[]> {
    const sigantures = [];

    for (const message of messages) {
      sigantures.push(
        new SignerSignature({
          accountId: this.accountId,
          publicKey: this.accountKey,
          signature: await this.signer.sign(message),
        })
      );
    }
    return sigantures;
  }

  getAccountBalance() {
    return this.sendRequest(new AccountBalanceQuery().setAccountId(this.accountId));
  }

  getAccountInfo() {
    return this.sendRequest(new AccountInfoQuery().setAccountId(this.accountId));
  }
  
  getAccountRecords() {
    return this.sendRequest(new AccountRecordsQuery().setAccountId(this.accountId));
  }

  signTransaction(transaction: Transaction) {
    return transaction.signWith(this.accountKey, this.signer.sign);
  }

  async checkTransaction(transaction: Transaction) {
    // TODO? : better handle this?
    return transaction;
  }

  async populateTransaction(transaction: Transaction) {
    transaction.setTransactionId(TransactionId.generate(this.accountId));
    transaction.setNodeAccountIds(Object.values(this.getNetwork()) as AccountId[]);

    return transaction;
  }

  async sendRequest<RequestT, ResponseT, OutputT>(request: Executable<RequestT, ResponseT, OutputT>): Promise<OutputT> {
    request._setOperatorWith(this.accountId, this.accountKey, this.signer.sign);
    if (request instanceof Transaction) {
      this.populateTransaction(request);
      request.freezeWith(this.client);
    }
    return this.provider.sendRequest(request);
  }
}
