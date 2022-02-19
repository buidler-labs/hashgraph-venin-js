---
id: token
title: Token
---

### Creating one
Similar to how `Account`s get created, tokens are not that different. You define your token features object which has the following schema (and dependencies):
```ts
type TokenFeatures = {
  name: string,
  symbol: string,
  decimals?: number | Long.Long,
  initialSupply?: number | Long.Long,
  treasuryAccountId?: string | AccountId,
  keys?: TokenKeys,
  freezeDefault?: boolean,
  autoRenewAccountId?: string | AccountId,
  expirationTime?: Date | Timestamp,
  autoRenewPeriod?: number | Long.Long | Duration,
  tokenMemo?: string,
  customFees?: { feeCollectorAccountId?: string | AccountId | undefined }[],
  type: TokenType,
  supplyType?: TokenSupplyType,
  maxSupply?: number | Long.Long
};

type TokenKeys = {
  admin?: Key,
  feeSchedule?: Key,
  freeze?: Key,
  kyc?: Key,
  pause?: Key,
  supply?: Key,
  wipe?: Key
};

const TokenTypes = {
  FungibleCommon: new TokenType(HederaTokenType.FungibleCommon),
  NonFungibleUnique: new TokenType(HederaTokenType.NonFungibleUnique),
}
```
and `create` it via an `ApiSession`:
```js live
  const { session } = await ApiSession.default();
  const token = new Token({
    name: "Wrapped HBAR",
    symbol: "wHBAR",
    initialSupply: 1000,
    decimals: 3,
    type: TokenTypes.FungibleCommon
  });
  const liveToken = await session.create(token);

  console.log(`Token ${liveToken.id.toString()} has been successfully created.`);
```

Only the `name`, `symbol` and `type` are mandatory options, the rest are optional.

Needless to say that this snippet creates a `Wrapped HBAR` (symbolled `wHBAR`) fungible token with an initial supply of 1000 units and 2 decimal places.

By default, if not specified otherwise, all keys are assigned to the operator of the current session. If you don't want this behaviour for all the keys, just set the one you want to be excluded to `null` when creating the token. Of course, if you want to assign that key to another address, you can of course do that.

The following code does the same thing as above except that it leaves the `kyc` key unset:
```js
const { session } = await ApiSession.default();
const token = new Token({
  name: "Wrapped HBAR",
  symbol: "wHBAR",
  initialSupply: 1000,
  decimals: 3,
  keys: { kyc: null },
  type: TokenTypes.FungibleCommon
});
const liveToken = await session.create(token);

// ...
```

### LiveToken operations
Currently, `LiveToken`s support assigning supply control to something else (a different account or person) via the `assignSupplyControlTo` method.