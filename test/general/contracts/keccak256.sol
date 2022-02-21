// SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;

contract Kecack256 {
    function hash(
        string memory _message
    ) public pure returns (bytes32) {
        return keccak256(abi.encodePacked(_message));
    }
}
