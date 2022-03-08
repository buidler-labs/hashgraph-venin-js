---
id: changelog
title: Changelog
---

## 0.7.4
* Support for [HIP-338 wallets](https://hips.hedera.com/hip/hip-338). See [the wallets guides section](./guides/wallet.md) for more info.
* Added the [bundling guide](./guides//bundling.md) that makes use of a custom defined `@buidlerlabs/hedera-strato-js/rollup-plugin` export
* Added [github actions workflows](https://github.com/buidler-labs/hedera-strato-js/actions) for manual/auto testing

## 0.7.3
* Supports `@hashgraph/sdk@2.7.0`
* Added support for creating `Token`s
* Added support for creating `Account`s
* Added more config options with sensible defaults to control behaviour and expenses
* Allowed constructors to generate logs
* Started adding a `Controller` mechanism for sessions in preparation to support integration with wallets

## 0.6.10
Initial release