---
id: playground
title: Playground
---

import { OperatorId, OperatorNetwork } from '@site/src/components/OperatorCoordinates';

Want to give it a in-browser spin, now you can. Type in your code and press the `Run` button and you should be set to go.

```js live=true containerKey=live_from_code
const code = `
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;

// TODO: add your solidity contract code here
`;
const { session } = await ApiSession.default();
const contract = await Contract.newFrom({ code });
const liveContract = await hapiSession.upload(contract);

// TODO: stuff with your contract or switch to a different entity such as a token or Json ...
```

<details>
  <summary>A note on the account paying for these transactions</summary>

Please be considerate with the transactions that you run as to also give others the opportunity to play and learn. By default, the session will be operated by <OperatorId /> on the <OperatorNetwork /> network. We strive to keep a working balance on it, but if we can't keep up with the usage, you might experience failed transactions due to insufficient funds. If this happens you can also
use your own hedera account to pay for them. [Hedera's Portal](https://portal.hedera.com/) is the best and easiest way to start out in this scenario.

Once available, you can create a session using your account like so:

```json
const { session } = await ApiSession.default({
  wallet: {
    sdk: {
      operatorId: <Your operator account id>
      operatorKey: <Your operator private key>
    }
  },
  network: {
    name: testnet / previewnet / customnet
  }
});
```

To find out more configuration options, head over to our [configuration page](configuration.md).

</details>
