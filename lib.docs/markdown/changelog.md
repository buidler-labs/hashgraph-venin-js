---
id: changelog
title: Changelog
---

## 0.7.4

- Supports `@hashgraph/sdk@2.11.3`
- Support for [HIP-338 wallets](https://hips.hedera.com/hip/hip-338). See [the wallets guides section](./guides/wallet.md) for more info.
- Added the [bundling guide](./guides//bundling.md) that makes use of a custom defined `@buidlerlabs/hedera-strato-js/rollup-plugin` export
- Added `LiveEntity.deleteEntity` and `LiveEntity.updateEntity` operations to `delete` and/or `update` self-entity
- Added [`Topic`/`LiveTopic`](./guides/entities/topic.md) and [`File`/`LiveFile`](./guides/entities/file.md) pairs
- Implemented [`LiveAddress.equals(AccountId)` functionality](https://github.com/buidler-labs/hedera-strato-js/issues/34)
- Implemented [`StratoAddress.toLiveAccount()`](https://github.com/buidler-labs/hedera-strato-js/issues/49)
- [Auto arrayfying hex string](https://github.com/buidler-labs/hedera-strato-js/issues/40) if `bytes32` arguments are expected by the `LiveContract` call
- 💥 _Potentially braking change!_ Added [`HEDERAS_DEFAULT_CONTRACT_REQUESTS_RETURN_ONLY_RECEIPTS` config](./configuration.md) option to have [finer cost-control over contract-requests](https://github.com/buidler-labs/hedera-strato-js/issues/48). Set it to `false` to revert to v0.7.3 behavior. This only affects state-mutating contract-calls. Non-mutating (query) calls are not affected by this parameter.
- Fixed [recursive loading of ABIs into `ContractRegistry`s](https://github.com/buidler-labs/hedera-strato-js/issues/50) at bundling time
- Allow [`ContractRegistry`s to be created from abstract](https://github.com/buidler-labs/hedera-strato-js/issues/54) solidity contracts
- A lot of tweaks on docs, visual and others
- Added [github actions workflows](https://github.com/buidler-labs/hedera-strato-js/actions) for manual/auto testing

## 0.7.3

- Supports `@hashgraph/sdk@2.7.0`
- Added support for creating `Token`s
- Added support for creating `Account`s
- Added more config options with sensible defaults to control behavior and expenses
- Allowed constructors to generate logs
- Started adding a `Controller` mechanism for sessions in preparation to support integration with wallets

## 0.6.10

Initial release
