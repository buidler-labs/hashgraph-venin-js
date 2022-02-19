---
slug: /
id: introduction
title: 👋 Welcome to Strato! 🌌
---

<p align="center">
  <a href="https://www.npmjs.com/package/@buidlerlabs/hedera-strato-js"><img src="https://img.shields.io/npm/v/@buidlerlabs/hedera-strato-js.svg?style=flat-square" alt="npm version" /> </a>
  <a href=""><img src="https://img.shields.io/badge/Node.js-%3E%3D14.8.0-orange.svg?style=flat-square"/> </a>
  <a href="https://github.com/facebook/jest"><img src="https://img.shields.io/badge/tested_with-jest-99424f.svg?style=flat-square" alt="Tested with Jest" /> </a>
  <a href="#contributions"><img src="https://img.shields.io/badge/PRs-welcome-brightgreen.svg?style=flat-square" alt="PRs Welcome" /> </a>
  <a href="#license"><img src="https://img.shields.io/github/license/buidler-labs/hedera-strato-js.svg?colorB=ff0000&style=flat-square" /> </a>
</p>

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

export const OperatorId = () => (
  window.StratoOperator.network === 'testnet' ? 
  <a href={ "https://testnet.dragonglass.me/hedera/accounts/" + window.StratoOperator.accountId }>
    <code>
      {window.StratoOperator.accountId}
    </code>
  </a> 
  : 
  <code>
    {window.StratoOperator.accountId}
  </code>
);

export const OperatorNetwork = () => (
  <code>
    {window.StratoOperator.network}
  </code>
);

... because it's time we start writing [Hedera](https://hedera.com/) smart-contract dApps[^dapp] frictionless and with ease, without having to deal with the hustle and bustle of [Hedera's verbose, underlying services](https://docs.hedera.com/guides/docs/sdks).

[^dapp]: descentralized application

:::note Disclaimer

This project is not an official Hedera project and, as such, it is not affiliated with it in any way, shape or form. It is an independent, community driven, effort to bring clarity and *joy* to developing smart-contract applications on the Hedera network-chain ecosystem.

:::

:::info

Currently, the library is mostly available for NodeJS runtime environments since there is where most of the bulk development effort occurs. Efforts are underway to have it deployable and working in web browsers as well. 

These docs are using such an ad-hoc bundleld to power the live-coding widgets. If you eager to see how this can be done, have a look over our browser smoke-test rollup config for inspiration. `TODO: add link here`

:::

:::caution

Please keep in mind that, although core features are extensively tested and appear to be working, this is still currently under _heavy-active_ development and, as such, we don't recommend this just yet for production use. The API is also very likely to change before we reach there!

Having said that, we will continue to use is in production even at this initial stage just because we can and are quick to solve any issues that we might encounter.

:::

## The drive
As any good-striving, long-lasting, endevour, we are using Strato to hopefully fuel everything that we, here at BuiDler Labs, build on Hedera. Our Hedera porfolio currently consists of:
* [FileCoin-Hedera Grant](https://github.com/taskbar-team/hedera-filecoin-devgrant) - a development grant used to put the foundations of [MyTaskbar](https://mytaskbar.io/) v2, the more decentralized version
* [HeadStarter](headstarter.org) - the first Hedera IDO platform

We're basically eating our own dog food. That way, we can hopefully proove that it's something delicious or, if not, we have a good incentive to make it so. This also makes it a good reason to not have it as a "shot and forget" kind of effort. 

We will support this for as long as we're going to build on Hedera and, if there's comunity interest, even beyond that. 

## The gist
Suppose you want to upload, execute and print the resulting `greet` message for [the following contract](https://solidity-by-example.org/hello-world/):

```sol title="./hello_world.sol"
// SPDX-License-Identifier: MIT
// compiler version must be greater than or equal to 0.8.9 and less than 0.9.0
pragma solidity ^0.8.9;

// highlight-start
contract HelloWorld {
  string public greet = "Hello World!";
}
// highlight-end
```

Here's how you would do it in Strato:
<Tabs>
  <TabItem value="strato-code" label="Strato">

```js live
const { session } = await ApiSession.default();
const helloWorldContract = await Contract.newFrom({ path: "./hello_world.sol" });
const liveContract = await session.upload(helloWorldContract);

console.log(await liveContract.greet());
```

  </TabItem>

  <TabItem value="hedera-code" label="Hedera">

```js title="./hello-hedera.js"
import {
    Client,
    PrivateKey,
    ContractCreateTransaction,
    FileCreateTransaction,
    ContractDeleteTransaction,
    ContractCallQuery,
    Hbar,
    AccountId,
} from "@hashgraph/sdk";
import helloWorld from "./hello_world.json";

// highlight-start
const client = Client.forName(process.env.HEDERA_NETWORK).setOperator(
    AccountId.fromString(process.env.OPERATOR_ID),
    PrivateKey.fromString(process.env.OPERATOR_KEY)
);
const contractByteCode = helloWorld.object;
const fileTransactionResponse = await new FileCreateTransaction()
    .setKeys([client.operatorPublicKey])
    .setContents(contractByteCode)
    .execute(client);
const fileReceipt = await fileTransactionResponse.getReceipt(client);
const fileId = fileReceipt.fileId;
const contractTransactionResponse = await new ContractCreateTransaction()
    .setGas(75000)
    .setBytecodeFileId(fileId)
    .execute(client);
const contractReceipt = await contractTransactionResponse.getReceipt(client);
const contractId = contractReceipt.contractId;
const contractCallResult = await new ContractCallQuery()
    .setGas(75000)
    .setContractId(contractId)
    .setFunction("greet")
    .setQueryPayment(new Hbar(1))
    .execute(client);
const greet = contractCallResult.getString(0);
// highlight-end

console.log(greet);
```
  
  </TabItem>
</Tabs>

_(click on the "Hedera" tab to find out what would be the equivalent of this snippet written solely using the [official Hedera SDK JS library](https://github.com/hashgraph/hedera-sdk-js))_

<details>
  <summary>Oh, by the way, if you haven't done it already, click <code>Run</code> on the <code>Strato</code> tab. See what happens.</summary>

It should run the code targeting the <OperatorId /> account id on the <OperatorNetwork /> network. We strive to keep a working balance on it, but if we can't keep up with the usage, you can also
use your own hedera account instead. [Hedera's Portal](https://portal.hedera.com/) is the best and easiest way to start in this sense.

Once ready, just edit the above code to use it in your own session like so:

```json
const { session } = await ApiSession.default({
  client: {
    operatorId: <Your operator account id>
    operatorKey: <Your operator private key>
  },
  network: {
    name: testnet / previewnet / customnet
  }
});
```

Head over to our [configuration page](configuration.md) for more info on other available options.

</details>

In both cases, I've left out the error handling part for bravety. Besides that, the Hedera code assumes that the developer has precompiled the contract and that its bytecode is provided to it via the `./hello_world.json` file. Strato does not enforce such an assumption. It takes care of the underlying compilation so that the developer does not have to.

Speaking of that, here's a more self-contained code snippet version that basically does the same thing, but gives even more in-browser control to play around with:
```js live
const code = `
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;

contract HelloWorld {
  string public greet = "Hello World!";
}`;
const { session } = await ApiSession.default();
const helloWorldContract = await Contract.newFrom({ code });
const liveContract = await session.upload(helloWorldContract);

console.log(await liveContract.greet());
```

... you get the idea. **It's that simple!**

<!-- If you're going to use the official-sdk, then you might end up with the following:

Just clone and follow the the instructions in our [quick-start demo repo](https://github.com/buidler-labs/hsj-example). As described in that readme, you will need a `.env` file to configure some network parameters. If you're going to use our [local, dockerized, hedera-node services](https://github.com/buidler-labs/dockerized-hedera-services), just copy-paste [this config](.env.local-customnet) and you should be good to go.

If you want a quick flavour of where that will get you, here's how one might tipically use the library:

By the way, the above code snippet loads a solidity file, compiles it, uploads it to the network and ends up console-logging the resulting output of calling the `greet` function/variable of the deployed `hello_world.sol` contract. It's that easy! -->

## Give it a spin
If you want to quickly get your hands dirty, we prepared a [quick-start demo repo](https://github.com/buidler-labs/hsj-example) for you to play with. You'll first need to setup an `.env` file, but don't worry, there are a few mandatory entries and everything is explained in that repo's readme.

Another option would be to just code in-browser using our [playground](playground.md).

## Features
Strato already supports a lot of stuff:
* [x] Compile a Solidity contract to obtain its Hedera accepted ABI directly from the library
* [x] Deploy a contract to the network
* [x] Use intuitive API mechanics for interacting with a deployed, live contract
* [x] Pubsub for contract emitted events
* [x] Pubsub for transaction receipts
* [x] Using Hedera File Storage as a place to store a generic JSON
* [x] Create token via the Hedera Token Service (HTS)
* [x] Create a Hedera account
* [x] Ready to be plugged into a web3 wallet (_when such will exist_)
* [x] End to end tested sourcing multiple contracts for the test-base from places such as [solidity-by-example](https://solidity-by-example.org/) and the [hedera-sdk-js repo](https://github.com/hashgraph/hedera-sdk-js/tree/main/examples)

#### ... with more planned for development:
* [ ] Be able to _seamlessly_ run it in browser (even the contract compilation part if required)
* [ ] Update/delete/_other_ token operations
* [ ] Other account operations
* [ ] Better error reporting
* [ ] Increase logging support
* [ ] Better integrate _entities_ accross the code-base
* ... and more.

## Contributions
Do you think we missed anything? Want some feature urgented? Do you have an idea of something that we might improve? Head over to [our issues page](https://github.com/buidler-labs/hedera-strato-js/issues) and let us know! We want Strato to be a community-lead initiative. This means that any opinion or critic is encouraged (and even welcomed)! 

Of course, if you're eager to write it yourself, that's also fine and dandy! Just fork us, add your changes and open a pull request. We'll take it from there ...

<!-- ## Features
- Upload a [Solidity Contract](https://docs.soliditylang.org/en/v0.8.10/index.html) (either by _code_ or by _path_) to Hedera and directly interact with it in JS (via [_LiveContracts_](https://github.com/buidler-labs/hedera-strato-js/blob/main/lib/live/LiveContract.ts))
- Given a [ContractId](https://docs.hedera.com/guides/docs/hedera-api/basic-types/contractid) and its ABI, retrieve a live-instance of a contract and interact with it
- Upload a JSON object to [Hedera File Services](https://docs.hedera.com/guides/docs/sdks/file-storage) allowing for later retrieval -->

## License
This work has been published under the `MIT License`.