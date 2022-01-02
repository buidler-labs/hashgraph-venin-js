# Hedera Strato JS
Write Web3 [Hedera](https://hedera.com/) smart-contract dApps frictionless and with ease, without having to deal with the hustle and bustle of [Hedera's underlying services](https://docs.hedera.com/guides/docs/sdks).

> **Disclaimer:** This project is not an official Hedera project and, as such, it is not affiliated with it in any way, shape or form. It is an independent, community driven, effort to bring clarity and *joy* to developing descentralized apps (dApps) on the Hedera network-chain ecosystem.

> **Note:** Currently, the library is only available for NodeJS runtime environments but efforts are underway to have it deployable and working in web browsers as well.

> **Note #2:** Please keep in mind that, although core features are tested and working, this is still currently in heavy-active development and, as such, it's not yet ready for production usage. The API might also change before we reach there!

## Quick start example
Just clone and follow the the instructions in our [quick-start demo repo](https://github.com/buidler-labs/hsj-example). As described in that readme, you will need a `.env` file to configure some network parameters. If you're going to use our [local, dockerized, hedera-node services](https://github.com/buidler-labs/dockerized-hedera-services), just copy-paste [this config](.env.local-customnet) and you should be good to go.

If you want a quick flavour of where that will get you, here's how one might tipically use the library:
``` js
const hapiSession = await HederaNetwork.defaultApiSession();
const helloWorldContract = await Contract.newFrom({ path: './hello_world.sol' });
const liveContract = await hapiSession.upload(helloWorldContract);

console.log(await liveContract.greet());
```
By the way, the above code snippet loads a solidity file, compiles it, uploads it to the network and ends up console-logging the resulting output of calling the `greet` function/variable of the deployed `hello_world.sol` contract. It's that easy!

## Features walkthrough
The following is a breakthrough of all the possible cases currently permitted by the library which are 3 broad ones:
- create/retrieve an api session -> load a contract code -> compile and upload the contract -> interact with the deployed contract
- create/retrieve an api session -> retrieve a reference of a previously deployed contract -> interact with the contract
- create/retrieve an api session -> upload a JSON object; retrieve a _live_ json data-instance

### Creating an ApiSession
Sessions can be conveniantly created via a call to `HederaNetwork.defaultApiSession()`. This will, by default, try to look for a file called `.env` and load some network params from there (please see the [`.env.sample` file](.env.sample) for more info and options). The [full method signature accepts an options argument with 2 extra fields](classes/HederaNetwork.html#defaultApiSession): an `env` dictionary and/or a `path` string. Both of them portray obey the same naming as that depicted in the [`.env.sample` file](.env.sample). Whichever one is provided gets to be used but if both of them are fed in, the `env` runtime dictionary overwrites the `path`-loaded parameters. 

Each `HederaNetwork` instance also carries with it a _api-session cache_ which allows for subsequent calls to `HederaNetwork.defaultApiSession()` to retrieve the same api-session instance instead of creating a new one.

### Loading contract code
To load the code of a contract-file/text, there are 2 static-factory methods that one could use:
- `Contract.newFrom` - given either the `path` of the `.sol` file or the actual `code` of it, retrieves a single `Contract` instance. If there are multiple contracts defined, by default, the first one is retrieved. This can be overwritten to retrieve either the n-th `index` contract (by default `index=0`) or a contract by `name`.
- `Contract.allFrom` - same as `Contract.name` in all regards except for the fact that it does not take in an `index` nor a contract `name` and retrieves an array of all the available contracts.
When bulding a `Contract` instance, there's also a `ignoreWarnings` property which is, by default, set to `false` that allows to bypass solidity's warnings when building the contract's code.

A thing to keep in mind here is the fact that, once a `Contract` instance has been constructed, this is also a guarantee that the provided code was accepted by the solidity compiler. This is the reason why `Contract`s have `byteCode` property defined on it.

### Deploying contracts
Once an `ApiSession` and a `Contract` is available, deploying the code on the network is as simple as doing an `session.upload(contract)` method call. This returns a `Promise<LiveContract>` so you might want _await_-ing for the result.

#### Transaction meta-arguments
Going into more depth with this method, if one wants to tweak the [Hedera File Service - Create File Transaction](https://docs.hedera.com/guides/docs/sdks/file-storage/create-a-file) step with extra-arguments, just pass in a second param to the `upload` call which is a object of the form `{_file: {...}}` containing any required options. For example, to attach a "Hello Strato" memo to the uploaded contract code, the resulting call would end up being: `session.upload(contract, {_file: {fileMemo: "Hello Strato"}})`. 

To pass [Create Smart Contract Transaction](https://docs.hedera.com/guides/docs/sdks/smart-contracts/create-a-smart-contract)
parameters, have the second parameter contain a property called `_contract` with the same rationale in mind: set values that you wish to send to the `ContractCreateTransaction` constructor. For instance, if you would like to set a `gas` contract-creation limit to 100000 hbar, your end `upload` call would be: `session.upload(contract, {_contract: {gas: 100_000}})`. By the way, the default `gas` set for contract-creation transaction is `69_000`.

You can, of course, pass in both `_file` and `_contract` options. Merging the above 2 examples, `session.upload(contract, {_contract: {gas: 100_000}, _file: {fileMemo: "Hello Strato"}})` would end up uploading a `Contract.byteCode` to Hedera and have a memo attached to the resulting file called "Hello Strato". It would then set a `gas` limit of 100000 hbar to create the contract.

#### Constructor parameters
Passing in constructor parameters is easy, just add them when `ApiSession.upload`-ing like so: `session.upload(contract, arg1, arg2, ... argn)`. If you're going to have meta-arguments (see above) as well as constructor-args passed in, add the meta-args object first and then add whatever constructor arguments are desired.

Example: `session.upload(contract, {_contract: {gas: 100_000}}, "This is a string")` - uploads a `contract` with a `gas` create-contract transaction set to 100000 hbar and calling the `contract`'s constructor passing in the string "This is a string".

### Interacting with deployed contracts
#### Calling methods
Following a succesfull deployment, _await_-ing a `ApiSession.upload` call returns a `LiveContract` instance which has the solidity's contract functions dinamically attached to it and available for calling. This means that if a contract `A` has a method `foo` on it, the resulting `LiveContract` will also have a function `foo` defined on it.

So if, for example, we were to upload [solidity-by-example](https://solidity-by-example.org/)'s [First App](https://solidity-by-example.org/first-app/) Contract via a `session.upload` call, that will eventually resolve to a `LiveContract` instance which would have a `get`, an `inc` and a `dec` [defined on it as one might expect](https://github.com/buidler-labs/hedera-strato-js/blob/90bc1075892844bc46bf6e3fd191817622ee675d/test/LiveContract.spec.ts#L87).

Of course, function arguments are also supported so if we have such a live-contract function ([solidity-by-example's State Variable](https://solidity-by-example.org/state-variables/) code, [for instance](https://github.com/buidler-labs/hedera-strato-js/blob/90bc1075892844bc46bf6e3fd191817622ee675d/test/LiveContract.spec.ts#L111)), you can call into these methods, passing in the expected values as expected.

`Note:` When dealing with _big numbers_, the library uses the same one as Hedera SDK does: [bignumber.js](https://github.com/MikeMcl/bignumber.js/) . This is intentional since one of the core design principles of it's API is to try to mimic as close as possible Hedera's own SDK return types.

#### Dealing with events
Contract _events_ are propagated upwards from `LiveContract` through the inherited `EventEmitter` methods. As such one can _listen_ to an event by simply calling a `.on("event_name", () => { ... })` on the live-contract instance. Our test cases include [solidity-by-example's Events code](https://solidity-by-example.org/events/) to make sure this works. [Have a look for yourself](https://github.com/buidler-labs/hedera-strato-js/blob/90bc1075892844bc46bf6e3fd191817622ee675d/test/LiveContract.spec.ts#L158) if interested.

#### Transaction meta-arguments
Similar to when uploading a _Smart Contract_, calling any of its methods follows the same meta-arguments passing logic: if the first argument is a JS object which has certain properties of interest, those properties are unpacked and used inside the transaction. One such property is the `maxQueryPayment` which makes for a good example: lets say that we would like to set a maximum query payment of 2 hbar for calling the [solidity-by-example's State Variable > get method](https://solidity-by-example.org/state-variables/). In this case, you would simply do a `liveContract.get({maxQueryPayment: new HBar(2)})` and it would suffice.

Of course, similar to the "upload contract operation" detailed above, any argument following the the meta-arguments object would be passed to the method itself. In this regards, using the same _State Variable_ contract, doing a `liveContract.set({maxTransactionFee: new HBar(2)}, 42)` would call the `set` method passing in integer `42` as parameter and setting the `maxTransactionFee` for the transaction to 2 hbar.

### Retrieving deployed contracts
Uploading a `Contract` is not the only way to get a hold on a deployed, `LiveContract` instance. `ApiSession` also exposes a `getLiveContract` method which takes in a `ContractId` as it's `id` object param and the contract's ABI as its `abi` parameter to lock onto a deployed version of that code on the network. 

Want to find out more? [Have a look at our test-case](https://github.com/buidler-labs/hedera-strato-js/blob/90bc1075892844bc46bf6e3fd191817622ee675d/test/LiveContract.spec.ts#L31) for an example on how one might go about doing just that.

### Uploading JSON data
`Contract` are not the only thing that you can upload to Hedera. We also support pushing JSON entities through `ApiSession`s overloaded `upload` method. 

Let's say you have the following object that you want to persist to Hedera: `{a: 1, {b: "d"}}`. To do that, you would only have to do a `session.upload({a: 1, {b: "d"}})` (a less verbose form for `session.upload(new Json({a: 1, {b: "d"}}))`). This would result for an eventual return of a `LiveJson` object that is a generic object which exposes the underlying JSON.

`Note:` That uploading Jsons allow for the same meta-arguments transaction parameters to be provided as with _uploading a contract_ (please see the above discussion).

### Retrieving the JSON data
Of course, storing a Json wouldn't be that helpful unless someone might be able to retrieve it at some later moment in the future. That's done through the `session.getLiveJson` method call. You only need the `LiveJson.id` to pass in as the `id` object parameter.

[This test-case](https://github.com/buidler-labs/hedera-strato-js/blob/90bc1075892844bc46bf6e3fd191817622ee675d/test/LiveJson.spec.ts#L33) shows how this can be done.

## Features summary
- Upload a [Solidity Contract](https://docs.soliditylang.org/en/v0.8.10/index.html) (either by _code_ or by _path_) to Hedera and directly interact with it in JS (via [_LiveContracts_](https://github.com/buidler-labs/hedera-strato-js/blob/main/lib/live/LiveContract.ts))
- Given a [ContractId](https://docs.hedera.com/guides/docs/hedera-api/basic-types/contractid) and its ABI, retrieve a live-instance of a contract and interact with it
- Upload a JSON object to [Hedera File Services](https://docs.hedera.com/guides/docs/sdks/file-storage) allowing for later retrieval

## License
This work has been published under the MIT License.