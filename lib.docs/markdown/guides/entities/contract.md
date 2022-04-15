---
id: contract
title: Contract
---

### Loading contract code

:::note
This is different then [deploying contracts](#deploying-contracts) on the network. Think of loading a contract as preparing its content to act as a blueprint for when we chose to make it live (hence its associated online type name, `LiveContract`).
:::

A contract can be loaded from 2 sources: either referencing a local file or by giving the contract's code directly. To load a contract one of the following methods can be used:

- `Contract.newFrom` - given either the `path` of the `.sol` file or the actual `code` of it, retrieves a single `Contract` instance. If there are multiple contracts defined, by default, the first one is retrieved. This can be overwritten to retrieve either the n-th `index` contract (by default `index=0`) or a contract by `name`.
- `Contract.allFrom` - same as `Contract.name` in all regards except for the fact that it does not take in an `index` nor a contract `name` and retrieves an array of all the available contracts.
  When building a `Contract` instance, there's also a `ignoreWarnings` property which is, by default, set to `false` that allows to bypass solidity's warnings when building the contract's code.

A thing to keep in mind here is the fact that, once a `Contract` instance has been constructed, this is also a guarantee that the provided code was accepted by the solidity compiler. This is the reason why `Contract`s have `byteCode` property defined on it.

### Deploying contracts

Once an `ApiSession` and a `Contract` is available, deploying the code on the network is as simple as doing an `session.upload(contract)` method call. This returns a `Promise<LiveContract>` so you might want _await_-ing for the result.

#### Transaction meta-arguments

Going into more depth with this method, if one wants to tweak the [Hedera File Service - Create File Transaction](https://docs.hedera.com/guides/docs/sdks/file-storage/create-a-file) step with extra-arguments, just pass in a second param to the `upload` call which is a object of the form `{_file: {...}}` containing any required options. For example, to attach a "Hello Strato" memo to the uploaded contract code, the resulting call would end up being: `session.upload(contract, {_file: {fileMemo: "Hello Strato"}})`.

To pass [Create Smart Contract Transaction](https://docs.hedera.com/guides/docs/sdks/smart-contracts/create-a-smart-contract) parameters, have the second object parameter contain a property called `_contract` with the same rationale in mind: set values that you wish to send to the `ContractCreateTransaction` constructor. For instance, if you would like to set a `gas` contract-creation limit to 100,000tℏ, your end `upload` call would be: `session.upload(contract, {_contract: {gas: 100_000}})`. By the way, the default `gas` set for contract-creation transaction [can be tweaked by the `HEDERAS_DEFAULT_CONTRACT_TRANSACTION_GAS` environment variable](../../configuration.md) and is currently set to `169_000`.

You can, of course, pass in both `_file` and `_contract` options. Merging the above 2 examples, `session.upload(contract, {_contract: {gas: 100_000}, _file: {fileMemo: "Hello Strato"}})` would end up uploading a `Contract.byteCode` to Hedera and have a memo attached to the resulting file called "Hello Strato". It would then set a `gas` limit of 100,000tℏ to create the contract. A working example of this, could look as follows:

```js live=true containerKey=contract_and_file_options
const { session } = await ApiSession.default();
const helloWorldContract = await Contract.newFrom({
  path: "./hello_world.sol",
});
const liveContract = await session.upload(helloWorldContract, {
  _contract: { gas: 100000 },
  _file: { fileMemo: "Hello Strato" },
});

console.log(await liveContract.greet());
```

#### Constructor parameters

Passing in constructor parameters is easy, just add them when `ApiSession.upload`-ing like so: `session.upload(contract, arg1, arg2, ... argn)`. If you're going to have meta-arguments (see above) as well as constructor-args passed in, add the meta-args object first and then add whatever constructor arguments are desired.

Example:

```js live=true containerKey=contructor_parameters
const code = `// SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;

contract MessageHolder {
    string public message;

    constructor(string memory _message) payable {
        message = _message;
    }
}`;
const { session } = await ApiSession.default();
const contract = await Contract.newFrom({ code });
const liveContract = await session.upload(
  contract,
  { _contract: { gas: 100000 } },
  "Strato is amazing!"
);

console.log(await liveContract.message());
```

This uploads a `contract` with a `gas` create-contract transaction set to 100,000tℏ and calling the `contract`'s constructor passing in the string `Strato is amazing!`.

### Interacting with deployed contracts

#### Calling methods

As you've probably seen so many times now, following a successful deployment, _await_-ing a `ApiSession.upload` call returns a `LiveContract` instance which has the solidity's contract functions dynamically attached to it and available for calling. This means that if a contract `A` has a method `foo` on it, the resulting `LiveContract` will also have a function `foo` defined on it.

So if, for example, we were to upload [solidity-by-example](https://solidity-by-example.org/)'s [First App](https://solidity-by-example.org/first-app/) Contract via a `session.upload` call, that will eventually resolve to a `LiveContract` instance which would have a `get`, an `inc` and a `dec` [defined on it as one might expect](https://github.com/buidler-labs/hedera-strato-js/blob/90bc1075892844bc46bf6e3fd191817622ee675d/test/LiveContract.spec.ts#L87).

```js live=true containerKey=call_deployed_contract_methods
const { session } = await ApiSession.default();
const contract = await Contract.newFrom({ path: "./counter.sol" });
const liveContract = await session.upload(contract);

await liveContract.inc();
await liveContract.inc();
console.log(await liveContract.get());
```

Of course, function arguments are also supported so if we have such a live-contract function ([solidity-by-example's State Variable](https://solidity-by-example.org/state-variables/) code, [for instance](https://github.com/buidler-labs/hedera-strato-js/blob/90bc1075892844bc46bf6e3fd191817622ee675d/test/LiveContract.spec.ts#L111)), you can call into these methods, passing in the expected values as expected.

```js live=true containerKey=function_arguments
const { session } = await ApiSession.default();
const contract = await Contract.newFrom({ path: "./state_variables.sol" });
const liveContract = await session.upload(contract);

await liveContract.set(42);
console.log(await liveContract.get());
```

:::note
When dealing with _big numbers_, the library uses the same one used by the Hedera SDK: [bignumber.js](https://github.com/MikeMcl/bignumber.js/) . This is intentional since one of the core design principles of Strato's API is to try to mimic as close as possible Hedera's own SDK return types.
:::

#### Dealing with events

Contract _events_ are propagated upwards from `LiveContract` through the `EventEmitter`-inspired methods. As such one can _listen_ to an event by simply calling a `.onEvent("event_name", () => { ... })` on the live-contract instance. Our test cases include [solidity-by-example's Events code](https://solidity-by-example.org/events/) to make sure this works. [Have a look for yourself](https://github.com/buidler-labs/hedera-strato-js/blob/12300217a7d19abb5edc118e01295fdb18774d85/test/LiveContract.spec.ts#L210), if interested, or check it out right now:

```js live=true containerKey=dealing_with_events
const { session } = await ApiSession.default();
const contract = await Contract.newFrom({ path: "./events.sol" });
const liveContract = await session.upload(contract);

liveContract.onEvent("Log", ({ sender, message }) => {
  console.log(`Log event received: ${message}`);
});

await liveContract.test();
```

Logs can also be emitted from within contract constructors provided that either [the `HEDERAS_DEFAULT_EMIT_CONSTRUCTOR_LOGS` parameter is set](../../configuration.md) to true or that `emitConstructorLogs` meta-arg is set to true in the `_contract` object when `upload`-ing the contract.

To get access to the constructor logs, you would need to destructure the live-contract `upload` result like so:

```js live=true containerKey=dealing_with_constructor_events
const { session } = await ApiSession.default();
const contract = await Contract.newFrom({ path: "./events.sol" });
const { liveContract, logs } = await session.upload(contract, {
  _contract: { emitConstructorLogs: true },
});

console.log(JSON.stringify(logs));
```

As you can see from running the above snippet, the resulting `logs` are an array of objects which adhere to the following schema:

```ts
{
    name: string,
    payload: any
}
```

`name` is the name of the event while `payload` is a JS object with keys named after the arguments of the event and values being the actual data passed when emit-ing that particular event.

#### Transaction meta-arguments

Similar to when uploading a _Smart Contract_, calling any of its methods follows the same meta-arguments passing logic: if the first argument is a JS object which has certain properties of interest, those properties are unpacked and used inside the transaction. One such property is the `maxQueryPayment` which makes for a good example: lets say that we would like to set a maximum query payment of 0.001ℏ for calling the [solidity-by-example's State Variable > get method](https://solidity-by-example.org/state-variables/). In this case, you would simply do a `liveContract.get({maxQueryPayment: 100000})` and it would suffice.

Of course, similar to the "upload contract operation" detailed above, any argument following the the meta-arguments object would be passed to the method itself. In this regards, using the same _State Variable_ contract, doing a `liveContract.set({maxTransactionFee: 100000}, 42)` would call the `set` method passing in integer `42` as parameter and setting the `maxTransactionFee` for the transaction to 100,000tℏ which is 0.001ℏ.

```js live=true containerKey=transaction_meta_arguments
const { session } = await ApiSession.default();
const contract = await Contract.newFrom({ path: "./state_variables.sol" });
const liveContract = await session.upload(contract);

await liveContract.set({ maxTransactionFee: 100000 }, 42);
console.log(await liveContract.get());
```

### Retrieving deployed contracts

Uploading a `Contract` is not the only way to get a hold on a deployed, `LiveContract` instance. `ApiSession` also exposes a `getLiveContract` method which takes in a `ContractId` as it's `id` object param and the contract's ABI as its `abi` parameter to lock onto a deployed version of that code on the network.

Want to find out more? [Have a look at our test-case](https://github.com/buidler-labs/hedera-strato-js/blob/90bc1075892844bc46bf6e3fd191817622ee675d/test/LiveContract.spec.ts#L31) for an example on how one might go about doing just that or check it out yourself with a pre-uploaded testnet [`SimpleStorage` contract](https://solidity-by-example.org/state-variables/) just for the sake of example:

```js live=true containerKey=retreive_deployed_contracts
const { session } = await ApiSession.default();
const liveContract = await session.getLiveContract({
  id: "0.0.30771282",
  abi: [
    "function get() view returns (uint256)",
    "function num() view returns (uint256)",
    "function set(uint256 _num)",
  ],
});
const bigNumberGetResult = await liveContract.get();

console.log(bigNumberGetResult.toNumber());
```

:::note
The `abi` type required for the `getLiveContract` property can be a `ethers` `Interface` object or anything that [can be parsed into one](https://docs.ethers.io/v5/api/utils/abi/interface/#Interface--creating). For our above example we used a more human readable approach.
:::

### Deleting a live contract

To delete a deployed contract owned by the account associated with the current `ApiSession`, just do a `LiveContract.deleteEntity({ transferAccountId?: AccountId, transferContractId?: ContractId })` where you can optionally pass in a `transferAccountId` or a `transferContractId` to transfer the hbar present on the deleted account to either an `AccountId` or a `ContractId`. If nothing is specified, the owner of the current `ApiSession` will get the remainder of the tokens.

### Updating a live contract

[Updating a deployed contract](https://docs.hedera.com/guides/docs/sdks/smart-contracts/update-a-smart-contract) is not currently possible but will be supported in a future release.
