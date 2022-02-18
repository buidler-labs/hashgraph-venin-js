---
id: configuration
title: Configuring
---

## Introduction
As we [previously saw](./quick-start.md), in order to get a hold on a precious session, one would need to call one of the 2 available static-factory methods:
* `ApiSession.default(params?, path?)`
* `ApiSession.buildFrom(StratoContext)`

Both of them return a Promise which, when resolved, give back the `ApiSession` instance to play with. In fact, `ApiSession.buildFrom(StratoContext)` is wrapped by it's `default` sibling which, we could argue, will most likey probabily end up to beeing used the most. 

This section describes the arguments of `ApiSession.default` and how they can be used to obtain a session to operate on.

The `default` session can be procured in one of the 4 following ways:
* `ApiSession.default()` - run most often with no arguments at all, in which case it will try to load the parameters from the environment file present at `HEDERAS_ENV_PATH` environment-variable path or, if not specified, default loading the `.env` from repo-root. This is basically equivalent to calling `ApiSession.default({}, path = process.env.HEDERAS_ENV_PATH || '.env')`
* `ApiSession.default(path)` - parse params present at `path` env-file location. This ends up running `ApiSession.default({}, path)`
* `ApiSession.default(params)` - build the desired context unpacking a runtime representation of a json object. This is equivalent to running `ApiSession.default(params, path = process.env.HEDERAS_ENV_PATH || '.env')`
* `ApiSession.default(params, path)` - creates a session-execution context (`StratoContex`) by [doing a parameter resolution](#parameters-resolution) over the provided arguments

Following is a table detailing all the object-parameters along with their environmental variables counterparts which can be used to bootstrap a Strato session.

## Big table o' parameters
| Environment Variable | Parameter Property | Required  | Type | Default | Description |
| ---                  | ---                      | ---  | ---                                  | --- | ---                       |
| HEDERAS_CLIENT_CONTROLLER_DEFAULT_PRIVATE_KEY | client.controller.default.operatorKey | [^default-operatorKey] | - | - | The private-key used by the operators when switching accounts on a `HederaClient` using a `DefaultPrivateKeyClientController`
| HEDERAS_CLIENT_CONTROLLER_TYPE | client.controller.type | - | `Hedera`, `DefaultPrivateKey` | `Hedera` | The type of client-controller deployed. It's basically laying out the foundation of wallet-integration since a `controller` can propagate either an account-change or a network change.
| HEDERAS_CLIENT_TYPE | client.type | No | `Hedera` | `Hedera` | The network-client type used for the underlying session
| HEDERAS_DEFAULT_CONTRACT_CREATION_GAS      | session.defaults.contractCreationGas             | No  | number  | 150000     | The default amount spent for creating a contract on the network
| HEDERAS_DEFAULT_CONTRACT_TRANSACTION_GAS   | session.defaults.contractTransactionGas          | No  | number  | 169000     | The default amount given when executing a contract transaction
| HEDERAS_DEFAULT_EMIT_CONSTRUCTOR_LOGS      | session.defaults.emitConstructorLogs             | No  | boolean | `true`    | `true` to emit the constructor logs at contract-creation time, `false` otherwise
| HEDERAS_DEFAULT_EMIT_LIVE_CONTRACT_RECEIPTS     | session.defaults.emitLiveContractReceipts   | No  | boolean | `false`   | `true` to ask for and emit the receipts originating from live-contract calls, `false` otherwise
| HEDERAS_DEFAULT_PAYMENT_FOR_CONTRACT_QUERY      | session.defaults.paymentForContractQuery    | No  | number  | 0   | The default amount payed for doing a contract query call
| HEDERAS_NETWORK      | network.name             | Yes  | `previewnet`, `testnet`, `mainnet`, `customnet` | -   | The network profile to use
| HEDERAS_NODES | network.nodes | [^customnet-hedera-network] | [^customnet-nodes] | - | A condensed address-book representation of the network nodes (see[^customnet-nodes])
| HEDERAS_OPERATOR_ID  | client.hedera.operatorId | [^client-type-hedera] | - | - | The account-id of the operator running a `HederaClient`
| HEDERAS_OPERATOR_KEY | client.hedera.operatorKey | [^client-type-hedera] | - | - | The operator private-key of the operator running a `HederaClient`
| HEDERAS_LOGGER_LEVEL | logger.level | No | `error`, `warn`, `info`, `verbose`, `debug`, `silly` | `info` | The logger sensitivity [^winston-logger-github]
| HEDERAS_LOGGER_ENABLED | logger.enabled | No | boolean | `false` | `true` to enable the logger, `false` otherwise
| HEDERAS_CLIENT_SAVED_STATE | client.saved | No | base64 string | - | Used to recover a previous ongoing session with the purpose of some day having some sort of wallet token here to work with. Can be obtained via a `ApiSession.save()` call
| HEDERAS_ENV_PATH | - | No | path | `.env` | The path of the `.env` like file used to source the config parameters from

[^customnet-hedera-network]: required if `HEDERAS_NETWORK`/`network.name` is `customnet`
[^customnet-nodes]: a comma separated string of node-network addreses having the following format : `<ip>:<port>#<account_id>` eg `127.0.0.2:52111#3` to make an address-book of one node located at `127.0.0.1`, port `52111` having account-id `0.0.3` 
[^client-type-hedera]: required if `HEDERAS_CLIENT_TYPE`/`client.type` is `Hedera` (the default)
[^default-operatorKey]: required
[^winston-logger-github]: see https://github.com/winstonjs/winston#logging

<!-- | `fromExtensions` | `string[]` | `[]` | The extensions to be removed from the route after redirecting. |
| `toExtensions` | `string[]` | `[]` | The extensions to be appended to the route after redirecting. |
| `redirects` | `RedirectRule[]` | `[]` | The list of redirect rules. |
| `createRedirects` | `CreateRedirectsFn` | `undefined` | A callback to create a redirect rule. | -->


## Parameters resolution
The default context parameters are being resolved in the following order:
* First, the runtime object-argument is checked and if a config property is present there, that's the one being used _otherwise_
* If `process.env` (nodejs-case) contains that equivalent environment variable, that is the one which will be used _else_
* If the `HEDERAS_ENV_PATH` environment file path has been supplied, exists and contains the same keyes expected in `process.env`, it will be used _else_
* If a `.env` file exists and it contains the same key expected in `process.env`, that's one is being used.

If none of the above conditions are true and the parameter is not mandatory, the default value is loaded or an error eventually propagates.