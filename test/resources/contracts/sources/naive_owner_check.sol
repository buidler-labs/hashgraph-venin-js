// SPDX-License-Identifier: MIT
pragma solidity ^0.8.3;

contract OwnerCheck {
    address private _owner;

    constructor() {
        _owner = msg.sender;
    }

    function isOwnedBy(address owner) public view returns (bool) {
        return _owner == owner;
    }
}