// SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;

contract Bytes {
    bytes private buff;
    bytes32 private buff32;

    function set(bytes memory _buff, bytes32 _buff32) public {
        buff = _buff;
        buff32 = _buff32;
    }

    function get() public view returns (bytes memory, bytes32) {
        return (buff, buff32);
    }
}