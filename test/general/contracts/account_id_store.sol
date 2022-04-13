// SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;

contract AccountIdAsAddressStorer {
  address public idAddress;

  constructor(address id) {
    idAddress = id;
  }
}
