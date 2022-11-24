// SPDX-License-Identifier: GPL-3.0
pragma solidity >=0.0;

import "../../../../solidity-by-example/contracts/hello_world.sol";

contract B {
    function greetB() public pure returns (string memory) {
        return "Hello B!";
    }
}