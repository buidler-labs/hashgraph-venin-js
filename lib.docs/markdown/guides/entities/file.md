---
id: file
title: File
---

### Why?

Strato can store generic-content files using Hedera's File Service. This can be anything: from ascii text to binary files. Anything you want to store and are willing to pay Hedera's storage fee, the network will host it.

:::info
`LiveFile` is the basis of [`LiveJson`](./json.md) which is another type of file-content stored on Hedera, one dealing with structured JSON data.
:::

### Storing some text in a file

An `ApiSession` with this via it's `ApiSession.upload` method like so:

```js live=true containerKey=store_a_file
const { session } = await ApiSession.default();
const liveFile = await session.upload(new File("Strato is easy-peasy!"));

console.log(`File is stored at ${liveFile.id}`);
console.log(`The live file content is: ${liveFile.data}`);
```

If you don't like the verbose `new File(...)` notation, you can also go for the short-hand equivalent of just providing the string itself to the `ApiSession.upload` method like so: `ApiSession.upload("Strato is easy-peasy!")`. These 2 means are equivalent. Of course, you can do the same for the other `Uint8Array` argument type.

If you need to tweak the underlying file-transaction options when storing the content, you can use the `upload`s meta-arguments. For instance, if you want to add a memo, just pass it a `{ _file: { memo: "true facts" } }` when `upload`ing, like so:

```js
const { session } = await ApiSession.default();
const liveFile = await session.upload("Strato is easy-peasy-er!", {
  _file: { memo: "true facts" },
});

//...
```

:::note
The `_file` property is needed when `upload`ing a file to distinguish it from `upload`ing contract meta-arguments which also allow for fine-tweaking the [`ContractCreateTransaction` call](https://docs.hedera.com/guides/docs/sdks/smart-contracts/create-a-smart-contract) parameters through their own `_contract` property object.
:::

Besides setting a `memo` you can pick and use any other fields that [the `FileCreateTransaction` supports](https://docs.hedera.com/guides/docs/sdks/file-storage/create-a-file).

### Retrieving a file from the network

Although there is no `ApiSession.getLiveJson` equivalent method available to retrieve a `LiveFile` from Hedera (this will be supported [once #58 gets implemented](https://github.com/buidler-labs/hedera-strato-js/issues/58)), we do provide a workaround:

- having a `FileId` at hand, manually create a `LiveFile` via its constructor binding it to a working `ApiSession`
- call `LiveFile.getContents()` to retrieve it's raw `Uint8Array` content

### Deleting an online file

To delete a deployed `File`, you have to have the wallet `ApiSession` owner be the owner of the `LiveFile` and then do a `LiveFile.deleteEntity()` call.

### Updating a file object

Updating is easy, just call `LiveFile.updateEntity(FileFeatures)` where `FileFeatures` is an object type defined as:

```typescript
export type FileFeatures = {
  keys?: KeyList | Key[];
  expirationTime?: Date;
  contents?: string | Uint8Array;
  fileMemo?: string;
};
```

If you're familiar with Hedera's SDK documentation, this are basically [the available SDK options for updating a file](https://docs.hedera.com/guides/docs/sdks/file-storage/update-a-file) on HCS.
