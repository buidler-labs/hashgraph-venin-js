// A in-file FS registry to support lightning up the strato docs layout

export default {
  './hello_world.sol': `
    // SPDX-License-Identifier: MIT
    pragma solidity ^0.8.9;

    contract HelloWorld {
      string public greet = "Hello World!";
    }`,

  './increment.sol': `
    // SPDX-License-Identifier: MIT
    pragma solidity ^0.8.9;

    contract Counter {
      uint public count;

      function get() public view returns (uint) {
        return count;
      }

      function inc() public {
        count += 1;
      }
    }`
}