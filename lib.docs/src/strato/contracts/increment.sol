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
}
