// SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;

contract ChangeStateWithReturn {
    uint public num;

    function setAndRetrieve(uint _num) public returns(uint) {
        num = _num;
        return num;
    }
}