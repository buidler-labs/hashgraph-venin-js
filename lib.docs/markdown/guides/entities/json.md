---
id: json
title: Json
---

### Why?

Strato has native support to store and retrieve basic JavaScript objects (JSONs) using Hedera's File Service. This is particularly handy if you plan on storing some basic data/configuration for your dApp.

### Storing a Json

You use a `ApiSession` for that, like so:

```js live=true containerKey=store_a_json
const { session } = await ApiSession.default();
const liveJson = await session.upload(new Json({ theAnswer: 42 }));

console.log(`Json is stored at ${liveJson.id}`);
console.log(`The answer is: ${liveJson.theAnswer}`);
```

To make things easier, you can also upload any JS object and which will have the same end effect.

So you could replace `session.upload(new Json({ theAnswer: 42 }))` with a more skimmed-down version: `session.upload({ theAnswer: 42 })` making up for a more succinct code.

If you need to pass in/tweak file-transaction options when storing the Json object, you can use the `upload`s meta-arguments. For instance, if you want to add a memo, just pass it a `{ _file: { memo: "my json" } }` when `upload`ing, like so:

```js
const { session } = await ApiSession.default();
const liveJson = await session.upload(
  { theAnswer: 42 },
  { _file: { memo: "my json" } }
);

//...
```

:::note
The `_file` property is needed when `upload`ing a file to distinguish it from `upload`ing contract meta-arguments which also allow for fine-tweaking the [`ContractCreateTransaction` call](https://docs.hedera.com/guides/docs/sdks/smart-contracts/create-a-smart-contract) parameters through their own `_contract` property object.
:::

Besides setting a `memo` you can pick and use any other fields that [the `FileCreateTransaction` supports](https://docs.hedera.com/guides/docs/sdks/file-storage/create-a-file).

### Retrieving a Json

You'll need its `liveJson.id` for that which will need to be passed to `ApiSession`'s `getLiveJson` method:

```js live=true containerKey=retrieve_a_json
const { session } = await ApiSession.default();
const liveJson = await session.getLiveJson({ id: "0.0.30771386" });

console.log(`The answer is still: ${liveJson.theAnswer}`);
```

### Deleting a Json

You can delete a `LiveJson` via the `LiveEntity.deleteEntity` call. Just do a `LiveJson.deleteEntity()` to delete the underlying file from the network.

### Updating a Json

Updating such an entry is possible via the `LiveJson.updateEntity(FileFeatures)` call with [`FileFeatures` being an object type](./file.md) used by regular `LiveFile`s.
