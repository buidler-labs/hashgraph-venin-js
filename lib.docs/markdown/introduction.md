---
slug: /
id: introduction
title: 👋 Welcome to Strato! 🌌
---

<div align="center">

![NodeJS/JsDOM/Browser tests](https://img.shields.io/github/workflow/status/buidler-labs/hedera-strato-js/test-nodejs-jsdom-browser?style=flat-square&label=tests&color=yellowgreen)
[![codecov](https://img.shields.io/codecov/c/github/buidler-labs/hedera-strato-js?style=flat-square)](https://codecov.io/gh/buidler-labs/hedera-strato-js)
[![Discord support channel](https://img.shields.io/discord/949250301792239686?style=flat-square)](https://discord.com/invite/4mYCre869F)
![contributions](https://img.shields.io/badge/PRs-welcome-brightgreen.svg?style=flat-square)
![license](https://img.shields.io/github/license/buidler-labs/hedera-strato-js.svg?colorB=ff0000&style=flat-square)
![node version](https://img.shields.io/badge/Node.js-%3E%3D14.8.0-orange.svg?style=flat-square)
![npm version](https://img.shields.io/npm/v/@buidlerlabs/hedera-strato-js.svg?style=flat-square)

[![NPM](https://nodei.co/npm/@buidlerlabs/hedera-strato-js.png?mini=true)](https://nodei.co/npm/@buidlerlabs/hedera-strato-js/)

</div>

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';
import { OperatorId, OperatorNetwork } from '@site/src/components/OperatorCoordinates';

... because it's time we start writing [Hedera](https://hedera.com/) smart-contract dApps[^dapp] frictionless and with ease, without having to deal with the hustle and bustle of [Hedera's verbose, underlying services](https://docs.hedera.com/guides/docs/sdks).

[^dapp]: decentralized application

:::note Disclaimer
This project is not an official Hedera project. It is an independent, community driven, effort to bring clarity and _joy_ towards developing smart-contract applications on the Hedera network-chain ecosystem.

Having said that, we have been [featured on Hedera's blog](https://hedera.com/blog/meet-strato-a-concise-yet-powerful-sdk-alternative-for-js-devs) and, hopefully, will continue to be so as Strato draws closer to a more stable-badge status.
:::

:::caution
Please keep in mind that, although core features are extensively tested and appear to be working, this is still currently under _heavy-active_ development and, as such, we don't recommend this just yet for production use. The API is also very likely to change before we reach there! We strive to document all the changes, including braking ones, in [the appropriate docs section](./changelog.md).

We will continue to use it "as is" in production even in this initial stage just because we are really familiar with the library and are quick to solve any issues that we might encounter.
:::

## The drive

As any good-striving, long-lasting, endeavour, we are using Strato to hopefully fuel everything that we, here at [Buidler Labs](https://buidlerlabs.com/), build on Hedera. Our Hedera portfolio currently consists of:

- [FileCoin-Hedera Grant](https://github.com/taskbar-team/hedera-filecoin-devgrant) - a development grant used to put the foundations of [MyTaskbar](https://mytaskbar.io/) v2, the more decentralized version
- [HeadStarter](https://headstarter.org) - the first Hedera IDO platform

We're basically eating our own dog food. That way, we can hopefully prove that it's something delicious or, if not, we have a good incentive to make it so. This also makes it a good reason to not have it as a "shot and forget" kind of effort.

We will support this for as long as we're going to build on Hedera and, depending on general community interest, even beyond that.

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

```js live=true containerKey=greet_from_path
const { session } = await ApiSession.default();
const helloWorldContract = await Contract.newFrom({
  path: "./hello_world.sol",
});
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
  wallet: {
    sdk: {
      operatorId: <Your operator account id>
      operatorKey: <Your operator private key>
    }
  },
  network: {
    name: testnet / previewnet / customnet
  }
});
```

Head over to our [configuration page](configuration.md) for more info on other available options.

</details>

In both cases, we've left out the error handling part for brevity. Besides that, the Hedera code assumes that the developer has precompiled the contract and that its bytecode is provided to it via the `./hello_world.json` file. Strato does not enforce such an assumption. It takes care of the underlying compilation so that the developer does not have to.

Speaking of that, here's a more self-contained code snippet version that basically does the same thing, but gives even more in-browser control to play around with:

```js live=true containerKey=greet_from_code
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

## Give it a spin

If you want to quickly get your hands dirty, we prepared a [quick-start demo repo](https://github.com/buidler-labs/hsj-example) for you to play with. You'll first need to setup an `.env` file, but don't worry, there are a few mandatory entries and everything is explained in [configuration section](configuration.md).

You can also start from [the `.env.sample` file](https://github.com/buidler-labs/hedera-strato-js/blob/main/.env.sample) which is meant to be a minimal-config template. This also means that not all the config options are directly available there so you might as well cross-reference them with the [online config values](configuration.md).

Another option would be to just code in-browser using our [playground](playground.md).

## Features

Strato already is packed with a lot of stuff:  
✔️ Compile a Solidity contract to obtain its Hedera accepted ABI directly from within the library (no external compiler required)  
✔️ Deploy a contract to the network  
✔️ Use a fluent API to interact with deployed, _live entities_ such as contracts  
✔️ Pubsub for contract emitted events  
✔️ Pubsub for transaction receipts  
✔️ Fine grained cost-control  
✔️ Browser bundle-able via a custom made Rollup plugin ([webpack pending](https://github.com/buidler-labs/hedera-strato-js/issues/26))  
✔️ Using Hedera File Storage as a place to store generic files and JSONs  
✔️ Create token via the Hedera Token Service (HTS)  
✔️ Create a Hedera account  
✔️ Ready to be plugged into a web3 wallet (aka [HIP-338](https://hips.hedera.com/hip/hip-338) [supported](./guides//wallet.md))  
✔️ End to end tested, high coverage (targeting a minimum of 85%) sourcing multiple contracts for the test-base from places such as [solidity-by-example](https://solidity-by-example.org/) and the [hedera-sdk-js repo](https://github.com/hashgraph/hedera-sdk-js/tree/main/examples)

#### ... with more planned for development:

🔲 Better integration of _entities_ across the code-base  
🔲 Pubsub mechanics for Hedera's Consensus Service  
🔲 Other account operations  
🔲 Better error reporting  
🔲 Increase logging support  
... AND more.

## Contributions

Do you think we missed anything? Want some important feature prioritized? Do you have an idea of something that we might improve? Head over to [our issues page](https://github.com/buidler-labs/hedera-strato-js/issues) and let us know! We want Strato to be a community-lead initiative. This means that any opinion or critic is encouraged (and even welcomed)!

Of course, if you're eager to write it yourself, that's also fine and dandy! Just fork us, add your changes and open a pull request. We'll take it from there ...

Oh! And if you ever feel like talking to us, you can [reach us on discord](https://discord.gg/4mYCre869F). We're über friendly! 👨‍👩‍👧‍👦

## License

This work has been published under the `MIT License`.
