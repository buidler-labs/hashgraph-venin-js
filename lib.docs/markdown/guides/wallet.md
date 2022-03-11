---
id: wallet
title: Wallets
---

import { HeadStarterConnectWallet } from '@site/src/components/ConnectWallet';

## [HIP-338](https://hips.hedera.com/hip/hip-338) compliant
We might be the first library to support Hedera's standardised wallet proposal and we're damn proud of it.

Want to give it a spin? Make sure you have [HashPack installed](https://www.hashpack.app/) and then connect to the docs page by clicking 
<HeadStarterConnectWallet />

Then get a hold of [a Session that targets a `Browser` wallet](../configuration.md#HEDERAS_WALLET_TYPE) and use it normally:
```js live
const { session } = await ApiSession.default({ wallet: { type: 'Browser' } });
const liveJson = await session.upload(new Json({ theAnswer: 42 }));

console.log(`Wallet account id used: ${session.wallet.account.id.toString()}`);
console.log(`Json is stored at ${liveJson.id.toString()}`);
console.log(`The answer is: ${liveJson.theAnswer}`);
```

## Under the hood
### Hedera's [SDK implementation](https://github.com/hashgraph/hedera-sdk-js/pull/960)mersi Ș-

```mermaid
 classDiagram
  direction TB

  LocalProvider --o LocalWallet
  LocalProvider ..|> Provider
  Signer <|-- Wallet
  LocalWallet ..> SignerSignature
  LocalWallet ..|> Wallet
  Provider --o Wallet

  class Provider {
    <<interface>>
    +getLedgerId() LedgerId
    +getNetwork()
    +getMirrorNetwork() string[]
    +getAccountBalance(AccountId|string) Promise(AccountBalance)
    +getAccountInfo(AccountId|string) Promise(AccountInfo)
    +getAccountRecords(AccountId|string) Promise(TransactionRecord[])
    +getTransactionReceipt(TransactionId|string) Promise(TransactionReceipt)
    +waitForReceipt(TransactionResponse) Promise(TransactionReceipt)
    +sendRequest(Executable) Promise(Executable_OutputT)
  }

  class SignerSignature {
    +publicKey PublicKey
    +signature Uint8Array
    +accountId AccountId
  }

  class Signer {
    <<interface>>
    +getLedgerId() LedgerId
    +getAccountId() AccountId
    +getNetwork()
    +getMirrorNetwork() string[]
    +sign(Uint8Array[]) Promise(SignerSignature[])
    +getAccountBalance() Promise(AccountBalance)
    +getAccountInfo() Promise(AccountInfo)
    +getAccountRecords() Promise(TransactionRecord[])
    +signTransaction(Transaction) Promise(Transaction)
    +checkTransaction(Transaction) Promise(Transaction)
    +populateTransaction(Transaction) Promise(Transaction)
    +sendRequest(Executable) Promise(Executable_OutputT)
  }

  class Wallet {
    <<interface>>
    +getProvider() Provider
    +getAccountKey() Key
  }

  class LocalProvider {
    
  }

  class LocalWallet {

  }
```

### Strato's take
:::caution
This feature is currently in active development. As such, it is verry likely that the final API, once the stable release hits the streets, will differ.
:::

```mermaid
 classDiagram
  direction TB

  WalletInfo o-- SignerInfo
  WalletInfo <|-- StratoWallet

  class SignerInfo {
    <<interface>>
    +getLedgerId() LedgerId
    +getAccountId() AccountId
    +getNetwork()
    +getMirrorNetwork() string[]
    +getAccountBalance() Promise(AccountBalance)
    +getAccountInfo() Promise(AccountInfo)
    +getAccountRecords() Promise(TransactionRecord[])
  }

  class WalletInfo {
    <<interface>>
    +account PublicAccountInfo
    +signer SignerInfo
  }

  class StratoWallet {
    <<interface>>
    +execute(Transaction|Query) Promise(...)
    +getReceipt(TransactionResponse) Promise(TransactionReceipt)
  }
```