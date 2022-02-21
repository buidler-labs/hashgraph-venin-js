// SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;

contract LogAtConstructionTime {
    event Log(string message);

    constructor() {
        emit Log("Hello World!");
    }
}
