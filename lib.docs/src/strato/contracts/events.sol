// SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;

contract Event {
  // Event declaration
  // Up to 3 parameters can be indexed.
  // Indexed parameters helps you filter the logs by the indexed parameter
  event Log(address indexed sender, string message);
  event AnotherLog();

  constructor() {
    emit Log(msg.sender, "Event contract constructed!");
  }

  function test() public {
    emit Log(msg.sender, "Hello World!");
    emit Log(msg.sender, "Hello EVM!");
    emit AnotherLog();
  }
}
