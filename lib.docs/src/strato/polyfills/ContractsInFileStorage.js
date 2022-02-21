// A in-file FS registry to support lightning up the strato docs layout

export default {
  './counter.sol': `
    // SPDX-License-Identifier: MIT
    pragma solidity ^0.8.9;
    
    contract Counter {
        uint public count;
    
        // Function to get the current count
        function get() public view returns (uint) {
            return count;
        }
    
        // Function to increment count by 1
        function inc() public {
            count += 1;
        }
    
        // Function to decrement count by 1
        function dec() public {
            count -= 1;
        }
    }`,

  './events.sol': `
    // SPDX-License-Identifier: MIT
    pragma solidity ^0.8.9;
    
    contract Event {
        // Event declaration
        // Up to 3 parameters can be indexed.
        // Indexed parameters helps you filter the logs by the indexed parameter
        event Log(address indexed sender, string message);
        event AnotherLog();
    
        function test() public {
            emit Log(msg.sender, "Hello World!");
            emit Log(msg.sender, "Hello EVM!");
            emit AnotherLog();
        }
    }`,

  './hello_world.sol': `
    // SPDX-License-Identifier: MIT
    pragma solidity ^0.8.9;

    contract HelloWorld {
      string public greet = "Hello World!";
    }`,

  './increment.sol': `
    // SPDX-License-Identifier: MIT
    pragma solidity ^0.8.9;

    contract Incrementer {
      uint public count;

      function get() public view returns (uint) {
        return count;
      }

      function inc() public {
        count += 1;
      }
    }`,

    './state-variables.sol': `
    // SPDX-License-Identifier: MIT
    pragma solidity ^0.8.9;
    
    contract SimpleStorage {
        // State variable to store a number
        uint public num;
    
        // You need to send a transaction to write to a state variable.
        function set(uint _num) public {
            num = _num;
        }
    
        // You can read from a state variable without sending a transaction.
        function get() public view returns (uint) {
            return num;
        }
    }`
}