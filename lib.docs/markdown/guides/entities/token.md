---
id: token
title: Token
---

### Creating one

Similar to how `Account`s get created, tokens are not that different. You define your token features object which has the following schema (and dependencies):

```ts
type TokenFeatures = {
  name?: string;
  symbol?: string;
  treasuryAccountId?: string | AccountId;
  keys?: TokenKeys;
  autoRenewAccountId?: string | AccountId;
  expirationTime?: Date | Timestamp;
  autoRenewPeriod?: number | Long.Long | Duration;
  tokenMemo?: string;
};

export type CreateTokenFeatures = TokenFeatures & {
  name: string;
  symbol: string;
  type: TokenType;
  maxSupply?: number | Long.Long;
  supplyType?: TokenSupplyType;
  initialSupply?: number | Long.Long;
  decimals?: number | Long.Long;
  customFees?: { feeCollectorAccountId?: string | AccountId | undefined }[];
  freezeDefault?: boolean;
};

type TokenKeys = {
  admin?: Key;
  feeSchedule?: Key;
  freeze?: Key;
  kyc?: Key;
  pause?: Key;
  supply?: Key;
  wipe?: Key;
};

const TokenTypes = {
  FungibleCommon: new TokenType(HederaTokenType.FungibleCommon),
  NonFungibleUnique: new TokenType(HederaTokenType.NonFungibleUnique),
};
```

and `create` it via an `ApiSession`:

```js live=true containerKey=create_a_token
const { session } = await ApiSession.default();
const token = new Token({
  name: "Wrapped HBAR",
  symbol: "wHBAR",
  initialSupply: 1000,
  decimals: 3,
  type: TokenTypes.FungibleCommon,
});
const liveToken = await session.create(token);

console.log(`Token ${liveToken.id} has been successfully created.`);
```

Only the `name`, `symbol` and `type` are mandatory options, the rest are optional.

Needless to say that this snippet creates a `Wrapped HBAR` (symbolized `wHBAR`) fungible token with an initial supply of 1000 units and 2 decimal places.

By default, if not specified otherwise, all keys are assigned to the operator of the current session. If you don't want this behavior for all the keys, just set the one you want to be excluded to `null` when creating the token. Of course, if you want to assign that key to another address, you can of course do that.

The following code does the same thing as above except that it leaves the `kyc` key unset:

```js
const { session } = await ApiSession.default();
const token = new Token({
  name: "Wrapped HBAR",
  symbol: "wHBAR",
  initialSupply: 1000,
  decimals: 3,
  keys: { kyc: null },
  type: TokenTypes.FungibleCommon,
});
const liveToken = await session.create(token);

// ...
```

### LiveToken operations

Currently, `LiveToken`s support assigning supply control to something else (a different account or person) via the `assignSupplyControlTo` method.

#### Retrieving a deployed token

It's currently not possible to retrieve a `Token` once deployed but it will be [once issue #59 is implemented](https://github.com/buidler-labs/hedera-strato-js/issues/59).

#### Deleting a LiveToken

Is possible if the wallet owning the `ApiSession` is allowed to do so (the wallet account public-key is the same as the token's admin key) and can be accomplished via a `LiveToken.deleteEntity()` call.

#### Updating a token

If the wallet owner of the `ApiSession` doing the update has the same public-key as the one configured on the token's admin key, the session can update the token via calling the `LiveToken.updateEntity(TokenFeatures)` method. Of course, `TokenFeatures` is the same object type like the one used to create a `LiveToken` (please check the discussion above).
