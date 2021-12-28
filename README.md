# Hedera Strato JS
Write Web3 [Hedera](https://hedera.com/) smart-contract dApps frictionless and with ease, without having to deal with the hustle and bustle of [Hedera's underlying services](https://docs.hedera.com/guides/docs/sdks).

> **Disclaimer:** This project is not an official Hedera project and, as such, it is not affiliated with it in any way, shape or form. It is an independent, community driven, effort to bring clarity and *joy* to developing descentralized apps (dApps) on the Hedera network-chain ecosystem.

> **Note:** Currently, the library is only available for NodeJS runtime environments but efforts are underway to have it deployable and working in web browsers as well.

> **Note #2:** Please keep in mind that, although core features are tested and working, this is still currently in heavy-active development and, as such, it's not yet ready for production usage. The API might also change before we reach there!

## Installing it
``` bash
$ npm i @3vs/hedera-strato-js
```

### Getting started
1. Create an `.env` file at the root of your repo with the following content filledin accordingly (see [.env.sample](./.env.sample) for more details and options):
```
HEDERA_NETWORK=testnet
HEDERA_OPERATOR_ID=0.0...
HEDERA_OPERATOR_KEY=...
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
const hapiSession = await HederaNetwork.defaultApiSession();
const helloWorldContract = await Contract.newFrom({ path: './hello_world.sol' });
const liveContract = await hapiSession.upload(helloWorldContract);

console.log(await liveContract.greet());
```
If all goes well, you should see the expected `Hello Hedera Strato!` logged inside your console signifying that the contract was successfully compiled, uploaded and executed. 

## Features
- Upload a [Solidity Contract](https://docs.soliditylang.org/en/v0.8.10/index.html) (either by _code_ or by _path_) to Hedera and directly interact with it in JS (via [_LiveContracts_](https://github.com/three-Vs/hedera-strato-js/blob/main/lib/live/LiveContract.ts))
- Given a [ContractId](https://docs.hedera.com/guides/docs/hedera-api/basic-types/contractid) and its ABI, retrieve a live-instance of a contract and interact with it
- Upload a JSON object to [Hedera File Services](https://docs.hedera.com/guides/docs/sdks/file-storage) allowing for later retrieval

## Using it
`TODO: Link to API docs`

## Testing it
Have the `.env` file ready (see above) and run 
```
$ npm test
```
> **Note:** If you're targeting an official network such as a `testnet` or a `previewnet`, there will be a cost involved in running the library tests that has to do with API usage regarding contract deployments and execution (among other things). There's also the option of a `customnet` targeting a self-hosted `hedera-service` deployment. If you want to go down that path (recommended especially if you are planning to contribute), please [follow these instructions](https://github.com/three-Vs/dockerized-hedera-services).

## Roadmap
- ESM library support to allow browser embedding
- Better align API outputs to Hedera SDK ones
- Add library logs support
- Add better compiler output support
- ... others `TBD`

## Contributions
Of course, contributions are more then welcomed and encouraged on all fronts: open an issue, update the docs or, if you feel bold enough, directly open a PR and make your case as to why your changes would benefit the libray. For further discussions, we're social on [our Discord channel](https://discord.gg/YavYCwfcMQ).

## License
This work has been published under the MIT License.