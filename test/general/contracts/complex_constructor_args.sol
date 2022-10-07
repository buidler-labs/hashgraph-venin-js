// Relates to complex_struct_args.sol (issue #73)

// SPDX-License-Identifier: MIT
pragma solidity ^0.8.3;

contract ComplexConstructorObject {
  struct LivingAddress {
    string street;
    string city;
    string country;
  }

  struct Student {
    uint id;
    address walletAddress;
    string firstName;
    string lastName;

    LivingAddress livingAddress;
  }

  constructor(Student[] memory _students) {
    // No-op
  }
}
