---
id: account
title: Account
---

## Creating an account

If you want to create such entities, it's as simple as:
```js live=true containerKey=creating_an_account
const { session } = await ApiSession.default();
const liveAccount = await session.create(new Account());

console.log(liveAccount.id.toString());
```

If you want more control over the resulting account, you can give it some constructor args such as:
```ts 
export type AccountFeatures = {
  keyType?: KeyType;
  key?: Key;
  initialBalance?: string | number | Long.Long | BigNumber | Hbar;
  receiverSignatureRequired?: boolean;
  proxyAccountId?: AccountId;
  autoRenewPeriod?: number | Long.Long | Duration;
  accountMemo?: string;
  maxAutomaticTokenAssociations?: number | Long.Long;
}
```

Be default, if you don't specify it a `key` / `keyType`, it defaults to generating a private `ED25519` PrivateKey. Here is how you would create an `ECDSA` one:
```js live=true containerKey=key_or_keyType
const { session } = await ApiSession.default();
const liveAccount = await session.create(new Account({ keyType: KeyType.ECDSA }));

console.log(liveAccount.id.toString());
```

### Using it
Upon success, the returned `liveAccount` will be an instance of `LiveAccountWithPrivateKey` which is a special type of `LiveAccount` that also allows for manual transaction signing via the `tryToSign`. This is helpful, for instance, in multi-sign scenarios.

Since it's a `LiveEntity` type (which implements the `SolidityAddressable` interface) , it can also be passed as arguments to `LiveContract` methods where `address`es are required. In this case, it will resolve to using the `liveAccount.id.toSolidityAddress()`.