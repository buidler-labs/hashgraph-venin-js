/* eslint-env browser */

import {
  AccountId,
  Client,
  Provider,
  PublicKey,
  SignerSignature,
  Transaction,
  TransactionId,
  Wallet,
} from "@hashgraph/sdk";
import { HashConnect, HashConnectTypes } from "hashconnect";
import Executable from "@hashgraph/sdk/lib/Executable";

import { HashConnectProvider } from "./provider";
import { HashConnectSender } from "./sender";
import { HashPackSigner } from "./signer";

export type PublicAccountInfo = {
  id: AccountId;
  publicKey?: PublicKey;
};

type HashPackConstructorArgs = {
  account: PublicAccountInfo;
  hcSender: HashConnectSender;
  networkMaturity: string;
};

const HP_LOCAL_STORAGE_KEY = "hashpack-session";
const HP_WAIT_FOR_EXTENSION_RESPONSE_TIMEOUT = 2000;

export class HashPackWallet extends Wallet {
  static async getConnection(debug = false) {
    const localWalletData = localStorage.getItem(HP_LOCAL_STORAGE_KEY);
    let connectionToReturn: null | HashPackWallet = null;

    if (localWalletData) {
      const jLocalWalletData = JSON.parse(localWalletData);
      const hashConnect = new HashConnect(debug);

      await hashConnect.init(
        jLocalWalletData.appMetadata,
        jLocalWalletData.privateKey
      );
      await hashConnect.connect(
        jLocalWalletData.topic,
        jLocalWalletData.pairedWalletData
      );

      const wallet = await HashPackWallet.newFor({
        account: {
          id: AccountId.fromString(jLocalWalletData.accountId),
          publicKey: PublicKey.fromString(jLocalWalletData.accountPublicKey),
        },
        hcSender: new HashConnectSender(hashConnect, jLocalWalletData.topic),
        networkMaturity: jLocalWalletData.networkName,
      });

      connectionToReturn = wallet;
    }
    return connectionToReturn;
  }

  static async newConnection({
    networkName = "testnet",
    debug = false,
    appMetadata,
  }: {
    networkName: string;
    debug: boolean;
    appMetadata: HashConnectTypes.AppMetadata;
  }) {
    const jLocalWalletData: any = {};
    const hashConnect = new HashConnect(debug);
    const initData = await hashConnect.init(appMetadata);
    const state = await hashConnect.connect();

    jLocalWalletData.privateKey = initData.privKey;
    jLocalWalletData.topic = state.topic;

    // First try to see if any browser wallet extension is available with a timeout
    const extensionCheckWatchdog = new Promise((_, reject) =>
      setTimeout(() => {
        reject(
          "The HashPack browser extension could not be found. Please install it to continue."
        );
      }, HP_WAIT_FOR_EXTENSION_RESPONSE_TIMEOUT)
    );
    const extensionFoundEvent = new Promise((accept) =>
      hashConnect.foundExtensionEvent.once((_) => {
        accept(hashConnect.generatePairingString(state, networkName, true));
      })
    );

    hashConnect.findLocalWallets();
    jLocalWalletData.pairingString = await Promise.race([
      extensionCheckWatchdog,
      extensionFoundEvent,
    ]);

    // Depending on the execution context, either auto-trigger the extension or dump the pairing string in its console log
    if (location.protocol !== "https:") {
      console.log(
        `Generated a new paring string: ${jLocalWalletData.pairingString}`
      );
    } else {
      // We can go ahead and trigger the browser wallet extension
      hashConnect.connectToLocalWallet(jLocalWalletData.pairingString);
    }

    return new Promise((accept, reject) => {
      hashConnect.pairingEvent.once(async (pairingData) => {
        if (pairingData.accountIds && pairingData.accountIds.length > 0) {
          const accountId = AccountId.fromString(pairingData.accountIds[0]);
          const wallet = await HashPackWallet.newFor({
            account: {
              id: accountId,
            },
            hcSender: new HashConnectSender(
              hashConnect,
              jLocalWalletData.topic
            ),
            networkMaturity: networkName,
          });

          localStorage.setItem(
            HP_LOCAL_STORAGE_KEY,
            JSON.stringify({
              ...jLocalWalletData,
              accountId: accountId.toString(),
              accountPublicKey: wallet.getAccountKey().toStringDer(),
              appMetadata,
              networkName,
              pairedWalletData: pairingData.metadata,
            })
          );
          accept(wallet);
        } else {
          reject("Did not receive back any paired accounts.");
        }
      });
    });
  }

  public static async newFor(opts: {
    account: PublicAccountInfo;
    hcSender: HashConnectSender;
    networkMaturity: string;
  }): Promise<HashPackWallet> {
    let accountPublicKey = opts.account.publicKey;

    if (!accountPublicKey) {
      const mirrorSubdomain =
        opts.networkMaturity === "mainnet" ? "mainnet-public" : "testnet";
      const accountInfoFetchUrl = `https://${mirrorSubdomain}.mirrornode.hedera.com/api/v1/accounts/${opts.account.id}`;
      const accountInfoResponse = await fetch(accountInfoFetchUrl);

      if (!accountInfoResponse.ok) {
        throw new Error("Account Id could not be retrieved from the network");
      }

      const jAccountInfo = await accountInfoResponse.json();

      accountPublicKey = PublicKey.fromString(jAccountInfo.key.key);
    }
    return new HashPackWallet({
      ...opts,
      account: { ...opts.account, publicKey: accountPublicKey },
    });
  }

  private readonly client: Client;
  private readonly account: PublicAccountInfo;
  private readonly provider: Provider;
  private readonly signer: HashPackSigner;

  private constructor(opts: HashPackConstructorArgs) {
    super();
    this.client = Client.forName(opts.networkMaturity);
    this.account = opts.account;
    this.provider = new HashConnectProvider(
      opts.hcSender,
      opts.networkMaturity
    );
    this.signer = new HashPackSigner(this.getAccountId(), opts.hcSender);
  }

  getProvider() {
    return this.provider;
  }

  getAccountKey() {
    return this.account.publicKey;
  }

  getLedgerId() {
    return this.provider.getLedgerId();
  }

  getAccountId() {
    return this.account.id;
  }

  getNetwork() {
    return this.provider.getNetwork();
  }

  getMirrorNetwork() {
    return this.provider.getMirrorNetwork();
  }

  async sign(messages: Uint8Array[]): Promise<SignerSignature[]> {
    const signatures = [];

    for (const message of messages) {
      signatures.push(
        new SignerSignature({
          accountId: this.getAccountId(),
          publicKey: this.getAccountKey(),
          signature: await this.signer.sign(message),
        })
      );
    }
    return signatures;
  }

  getAccountBalance() {
    return this.provider.getAccountBalance(this.getAccountId());
  }

  getAccountInfo() {
    return this.provider.getAccountInfo(this.getAccountId());
  }

  getAccountRecords() {
    return this.provider.getAccountRecords(this.getAccountId());
  }

  signTransaction(transaction: Transaction) {
    return transaction.signWith(this.getAccountKey(), this.signer.sign);
  }

  async checkTransaction(transaction: Transaction) {
    // TODO? : better handle this?
    return transaction;
  }

  async populateTransaction(transaction: Transaction) {
    transaction.setTransactionId(TransactionId.generate(this.getAccountId()));
    transaction.setNodeAccountIds(
      Object.values(this.getNetwork()) as AccountId[]
    );

    return transaction;
  }

  async sendRequest<RequestT, ResponseT, OutputT>(
    request: Executable<RequestT, ResponseT, OutputT>
  ): Promise<OutputT> {
    // Prepare request for most use-cases which will end up being routed to the browser wallet
    if (request instanceof Transaction) {
      this.populateTransaction(request);
      request.freezeWith(this.client);
      request._setOperatorWith(
        this.getAccountId(),
        this.getAccountKey(),
        this.signer.sign
      );

      return this.provider.sendRequest(
        request as Executable<RequestT, ResponseT, OutputT>
      );
    }
    return Promise.reject(
      "Executable type is not yet supported by this wallet."
    );
  }

  public wipePairingData() {
    try {
      localStorage.removeItem(HP_LOCAL_STORAGE_KEY);
    } catch (e) {
      console.error(e);
    }
  }
}
