# Hedera Strato JS

![NodeJS/JsDOM/Browser tests](https://img.shields.io/github/workflow/status/buidler-labs/hedera-strato-js/test-nodejs-jsdom-browser?style=flat-square&label=tests&color=yellowgreen)
[![codecov](https://img.shields.io/codecov/c/github/buidler-labs/hedera-strato-js?style=flat-square)](https://codecov.io/gh/buidler-labs/hedera-strato-js)

[![Discord support channel](https://img.shields.io/discord/949250301792239686?style=flat-square)](https://discord.com/invite/4mYCre869F)
![contributions](https://img.shields.io/badge/PRs-welcome-brightgreen.svg?style=flat-square)
![license](https://img.shields.io/github/license/buidler-labs/hedera-strato-js.svg?colorB=ff0000&style=flat-square)

![node version](https://img.shields.io/badge/Node.js-%3E%3D14.8.0-orange.svg?style=flat-square)
![npm version](https://img.shields.io/npm/v/@buidlerlabs/hedera-strato-js.svg?style=flat-square)

[![NPM](https://nodei.co/npm/@buidlerlabs/hedera-strato-js.png?mini=true)](https://nodei.co/npm/@buidlerlabs/hedera-strato-js/)

Write Web3 [Hedera](https://hedera.com/) smart-contract dApps frictionless and with ease, without having to deal with the hustle and bustle of [Hedera's verbose, underlying services](https://docs.hedera.com/guides/docs/sdks).

> **Disclaimer:** This project is not an official Hedera project and, as such, it is not affiliated with it in any way, shape or form. It is an independent, community driven, effort to bring clarity and *joy* to developing decentralized apps (dApps) on the Hedera network-chain ecosystem.

> **Note:** Please keep in mind that, although core features are extensively tested and appear to be working, this is still currently under _heavy-active_ development and, as such, we don't recommend this just yet for production use. The API is also very likely to change before we reach there!
>
>Having said that, we will continue to use it "as is" in production even at this initial stage just because we can and are quick to solve any issues that we might encounter.

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
#### ... and even more to follow.

## The drive
As any good-striving, long-lasting, endeavour, we are using Strato to hopefully fuel everything that we, here at BuiDler Labs, build on Hedera. Our Hedera portfolio currently consists of:
* [FileCoin-Hedera Grant](https://github.com/taskbar-team/hedera-filecoin-devgrant) - a development grant used to put the foundations of [MyTaskbar](https://mytaskbar.io/) v2, the more decentralized version
* [HeadStarter](headstarter.org) - the first Hedera IDO platform

We're basically eating our own dog food. That way, we can hopefully prove that it's something delicious or, if not, we have a good incentive to make it so. This also makes it a good reason to not have it as a "shot and forget" kind of effort. 

We will support this for as long as we're going to build on Hedera and, if there's community interest, even beyond that. 

## Documentation
You can find the [API docs here](https://hsj-docs.buidlerlabs.com/).

We do offer Live Editor functionality where you can give a go to the samples we have prepared.

Another option would be to just code in-browser using our [playground](https://hsj-docs.buidlerlabs.com/markdown/playground)

## Quick start
1. Create an `.env` file at the root of your repo with the following content filled in accordingly (see [.env.sample](./.env.sample) for more details and options):
```sh
HEDERAS_NETWORK=testnet
HEDERAS_OPERATOR_ID=0.0...
HEDERAS_OPERATOR_KEY=...
```
2. Create a `contracts` folder in which you add your `hello_world.sol` solidity contract definition:

```solidity
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.3;

contract HelloWorld {
    string public greet = "Hello Hedera Strato!";
}
```
3. Upload and run your contract with the following code:

``` js
const { session } = await ApiSession.default();
const helloWorldContract = await Contract.newFrom({ path: './hello_world.sol' });
const liveContract = await session.upload(helloWorldContract);

console.log(await liveContract.greet());
```
If all goes well, you should see the expected `Hello Hedera Strato!` logged inside your console signifying that the contract was successfully compiled, uploaded and executed. 

Also, if you want a quick play-through a similar example, please have a look at [our minimum-working code](https://github.com/buidler-labs/hsj-example) repo. 

## Testing it
Have the `.env` file ready (see above) and run 
```
$ npm test
```
> **Note:** If you're targeting an official network such as a `testnet` or a `previewnet`, there will be a cost involved in running the library tests that has to do with API usage regarding contract deployments and execution (among other things). There's also the option of a `customnet` targeting a self-hosted `hedera-service` deployment. If you want to go down that path (recommended especially if you are planning to contribute), please [follow these instructions](https://github.com/buidler-labs/dockerized-hedera-services).

## Contributions
Do you think we missed anything? Want some feature badly? Do you have an idea of something that we might improve? Head over to [our issues page](https://github.com/buidler-labs/hedera-strato-js/issues) and let us know! We want Strato to be a community-lead initiative. This means that any opinion or critic is encouraged (and even welcomed)! 

Of course, if you're eager to write it yourself, that's also fine and dandy! Just fork us, add your changes and open a pull request. We'll take it from there ...

Oh! And if you ever feel like talking to us, you can [reach us on discord](https://discord.gg/4mYCre869F). We're über friendly! 👨‍👩‍👧‍👦

## License
This work has been published under the MIT License.