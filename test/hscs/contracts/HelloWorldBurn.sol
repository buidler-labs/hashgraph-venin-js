// SPDX-License-Identifier: Apache-2.0
pragma solidity ^0.8.9;

import "../../hedera/contracts/hip-206/HederaTokenService.sol";

contract HelloWorldMint is HederaTokenService {

    address tokenAddress;

    constructor(address _tokenAddress) {
        tokenAddress = _tokenAddress;
    }

    function ultraSoundMoneyBurning(uint64 amount) public returns (uint64) {
        (int responseCode, uint64 newTotalSupply) = HederaTokenService.burnToken(tokenAddress, amount, new int64[](0));
        if (responseCode != 22) {
            revert();
        }
        return newTotalSupply;
    }
}