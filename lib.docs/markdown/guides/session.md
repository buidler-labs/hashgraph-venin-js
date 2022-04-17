---
id: session
title: The Session
---

Sessions are the life-blood of the library. Virutally, you can't do anything meaningful without one.

## Creating a session

Head over to the [Configuration page](../configuration.md#introduction) to find out what are the session creating options available.

## What can it do?

... a couple of things spread into 2 categories:

Creational operations

- `create` a `Token` or an `Account` via the `create(what)` method with `what` being a `CreatableEntity`
- `upload` a `Contract` or a `Json` object via the conveniently named method, `upload(what, ...args)`, with `what` being a `UploadableEntity` in this case. `...args` are any additional info required to tweak the process (such as meta-arguments to control the parameters of the hedera transactions with) and/or any constructor arguments that might be required.

Retrieval operations

- `getLiveContract({ id, abi = [] })` - retrieves a `LiveContract` given its id and ABI info
- `getLiveJson({ id })` - retrieves a `LiveJson` object that was previously stored on-graph

## Subscribing to receipts

The session also allows to get notified of transaction receipts via the `subscribeToReceiptsWith` method. You pass it a callback, do some contract transactions and wait to get called like so:

```js live=true containerKey=subscribe_to_receipts
const code = `
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;

contract Counter {
    uint public count;

    function inc() public { count += 1; }
}`;
const { session } = await ApiSession.default();
const contract = await Contract.newFrom({ code });
const receiptsSubscription = session.subscribeToReceiptsWith(
  ({ transaction, receipt }) => {
    console.log(
      `Transaction ${transaction.transactionId} receipt reported finishing with status ${receipt.status}`
    );
  }
);
const liveContract = await session.upload(contract);

await liveContract.inc({ emitReceipt: true });
receiptsSubscription.unsubscribe();
```

The above example also shows how you can cancel such a subscription via the `Subscription.unsubscribe()` method.

Also, if you were to `Run` the example, you could see multiple transaction receipts being logged. What gives? Well, only the last one is reflecting our `liveContract.inc` operation, the rest are due to the transactions being carried out under the hood for uploading the actual `Counter` contract (both with the file service and with hedera's contract service).

<details>
  <summary>Emitting receipts by default, across the entire session, for all <code>LiveContract</code> interactions</summary>

In the above snippet we saw how one could emit an on-demand receipt (via the live-contract meta-arguments property of `emitReceipt` in `liveContract.inc({ emitReceipt: true })`) per individual contract method calls. That's great for controlling and keeping costs down, but what if we would like to have this behavior as default across the session usage?

To do that, you could either [set the `HEDERAS_DEFAULT_EMIT_LIVE_CONTRACT_RECEIPTS` environment option to `true`](../configuration.md#big-table-o-parameters) or have its runtime counter-part, `session.defaults.emitLiveContractReceipts`, to the same value.

The runtime variant will look something like this:

```json
const { session } = await ApiSession.default({
  session: { defaults: { emitLiveContractReceipts: true } }
});
```

Following this, you could get rid of the `{ emitReceipt: true }` meta-argument and just end up with a clean and more easily readable, `await liveContract.greet()` call.

</details>

:::caution

Setting `emitReceipt` meta-argument to true on contract functions that do not modify state will not have any effect.

`pure`/`view` solidity functions resolve to a `ContractCallQuery` that is being executed in Strato, which returns a `ContractFunctionResult`. The result of the contract call does not contain receipts or records as the call runs on a single node.

:::
