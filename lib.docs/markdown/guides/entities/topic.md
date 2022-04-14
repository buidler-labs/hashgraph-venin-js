---
id: topic
title: Topic
---

Topics (through the [Hedera Consensus Service - HCS](https://docs.hedera.com/guides/docs/sdks/consensus)) are the backbone of Hedera's traffic accounting, at the time of this writing, for [more then 85% of the network's traffic](https://app.dragonglass.me/chart?name=txn-service-type&period=1D). This makes them the hottest services used on the network. Naturally, Strato supports them with more features planned for the upcoming future.

### Creating a Topic

To create a `LiveTopic` to which you can post messages, you have a couple of constructor arguments to choose from:

```typescript
export type TopicFeatures = {
  autoRenewAccountId?: string | AccountId;
  autoRenewPeriod?: number | Long.Long | Duration;
  memo?: string;
  keys?: TopicKeys;
};

type TopicKeys = {
  admin?: Key;
  submit?: Key;
};
```

None of them are mandatory.

Once set, you `create` it as you would do with any `CreatableEntity` and here is an example:

```js live=true containerKey=create_a_topic
const { session } = await ApiSession.default();
const liveTopic = await session.create(new Topic());

console.log(`Topic is available at ${liveTopic.id}`);
```

### Retrieving a Topic

Is not currently possible but will be once [issue #60 gets resolved](https://github.com/buidler-labs/hedera-strato-js/issues/60).

### LiveTopic operations

Currently, `LiveTopic`s support sending messages via their `LiveTopic.submitMessage(message)` method. `message` can be either a `string` or a `Uint8Array`. Subscribing to messages will be possible following the [resolving of issue #47](https://github.com/buidler-labs/hedera-strato-js/issues/47).

#### Deleting a Topic

To delete a `LiveTopic` just call its `LiveTopic.deleteEntity()`. This will succeeds if the account owning the wallet configured in the `ApiSession` has the rights to do so.

#### Updating a Topic

`LiveTopic`s can be updated like any other `LiveEntity`: by calling its `LiveTopic.updateEntity(TopicFeatures)` method.
