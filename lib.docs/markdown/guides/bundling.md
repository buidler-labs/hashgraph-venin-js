---
id: bundling
title: Bundling
---

Currently we offer support for bundling strato via [rollup](https://rollupjs.org/) with support for other bundlers [being scheduled](https://github.com/buidler-labs/hedera-strato-js/issues/26), yet not committed.

### General considerations

Strato is delivered in both `es-module` and `common-js` formats. The challenge with bundling the library boils down to whether or not you wish to use the `SolidityCompiler` function in-browser. If you wish in-browser compilation, a web-worker is provided which fetches the appropriate solidity-compiler binary before carring out the compilation itself via calling any of the `Contract.newFrom`/`Contract.allFrom` family of functions.

Compiling `path` variants of the same `Contract.newFrom`/`Contract.allFrom` family of functions is made possible via a synthetically injected `ContractsInFileStorage` class which is basically a dictionary mapping the path of each solidity file from a given folder (default `contracts`) to its content.

:::note
You don't have to manually deal with `ContractsInFileStorage` in code. The bundler ties everything up for you so that, for example, if you have a file `a.sol` in a `contracts` folder situated in the root of your repo, `ContractsInFileStorage` would be generated holding something approximating:

```
export default {
  "a.sol": <code of a.sol>,
  ...
}
```

This will, for instance, allow calling `Contract.newFrom({ path: "./a.sol" })`.
:::

`ContractsInFileStorage` is not the only class being synthetically generated. `ContractRegistry` is another one which gets injected regardless if in-browser compilation is being used or not. This one is important since it contains contract names to their ABI mappings which is needed for acquiring `LiveContract` instances of already deployed `Contract`s. I'm talking here about the `ApiSession.getLiveContract({ id, abi })` method call.

:::note
For the same `a.sol` file situated in the `contracts` folder described above, if, let's say, it contains a `A` contract and a `B` contract inside, `ContractRegistry` will end up looking something similar to:

```
export default {
  "A": <ABI code for contract A>,
  "B": <ABI code for contract B>,
  ...
}
```

This allows calling `ApiSession.getLiveContract({ id, abi: ContractRegistry.A })` to get an instance of an already deployed `A` `LiveContract` to interact with.

### What about nested solidity files?

What if you have a `A` contract defined in `a.sol` which is situated in a subfolder 'others`in`contracts`? So basically, contract `A`is located somewhere at`contracts/others/a.sol`. How does this work?

We've got you covered!

In this scenario, `ContractRegistry` will be generated to something approximating:

```
export default {
  "others/A": <ABI code for contract A>,
  ...
}
```

which will allow you to reference its ABI via `ContractRegistry["others/A"]`.
:::

Besides synthetically generated classes, `process.env` also needs to be unpacked and injected to make the bundling possible.

## Rollup

:::caution
Depending on how much interest is for other bundlers to be supported (see [#26](https://github.com/buidler-labs/hedera-strato-js/issues/26)), this plugin might be extracted into its own package (see [#25](https://github.com/buidler-labs/hedera-strato-js/issues/25)).

When this happens, we will try to maintain backwards compatibility as much as possible so that, in theory, only `import` _specifiers_ will require updating.
:::

If your using [rollup](https://rollupjs.org/) to bundle your app, we have made available a plugin to take care of all the considerations described above. It's being available at `@buidlerlabs/hedera-strato-js/rollup-plugin` and you can immediately dive into a working demo [here](https://github.com/buidler-labs/hsj-rollup-demo).

Importing the `rollup-plugin` gives access to a default-exported function that generates a rollup-behaved object.

Currently, it accepts the following options object:

```ts
{
  contracts?: {
    path?: string,
    recurse?: boolean,
  },
  environment?: NodeJS.ProcessEnv,
  includeCompiler?: boolean,
  sourceMap?: boolean,
}
```

where:

- `contracts.path` is the path of the folder holding the contracts to load into `ContractRegistry` and possibly `ContractsInFileStorage` (if `includeCompiler` is `true`). Defaults to `contracts`
- `contracts.recurse` controls the behavior of navigating the `contracts.path` files. If set to `true`, it uses recursion to load everything from `contracts.path`. `false` only loads the first level of files. Defaults to `false`
- `environment` is the environment object that gets unpacked and injected in the library. It defaults to `process.env`
- `includeCompiler` allows for in-browser compilation when set to `true` and throws an error when trying to compile if set to `false`. Defaults to `false`
- `sourceMap` controls source-map generation. `true` generates the source-maps, `false` does not. Defaults to `false`

:::info
If you're changing `contracts.path` to something non-default, be sure to also change [the `HEDERAS_CONTRACTS_RELATIVE_PATH` config](../configuration.md) value so that Strato itself knows how to locate and compile your sources and have the synthetically defined classes (eg. `ContractRegistry`) generated.
:::

For guidance, see the [demo repo rollup.config.js](https://github.com/buidler-labs/hsj-rollup-demo/blob/main/rollup.config.js) which makes use of this rollup plugin with in-browser compilation turned on.
