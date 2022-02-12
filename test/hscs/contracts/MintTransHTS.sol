// SPDX-License-Identifier: Apache-2.0
pragma solidity ^0.8.9;

import "../../hedera/contracts/hip-206/HederaTokenService.sol";

contract MintTransHTS is HederaTokenService {
    address tokenAddress;

    constructor(address _tokenAddress) {
        tokenAddress = _tokenAddress;
    }

    function mintFungibleToken(uint64 _amount) external {
        (int256 response, , ) = HederaTokenService.mintToken(
            tokenAddress,
            _amount,
            new bytes[](0)
        );

        if (response != HederaResponseCodes.SUCCESS) {
            revert("Mint Failed");
        }
    }

function mintNonFungibleToken(bytes[] memory metadata) external returns (int64[] memory) {
        (int256 response, , int64[] memory serialNumbers) = HederaTokenService.mintToken(
            tokenAddress,
            0,
            metadata
        );

        if (response != HederaResponseCodes.SUCCESS) {
            revert("Mint Failed");
        }
        return serialNumbers;
    }

    function tokenTransfer(
        address _sender,
        address _receiver,
        int64 _amount
    ) external {
        int256 response = HederaTokenService.transferToken(
            tokenAddress,
            _sender,
            _receiver,
            _amount
        );

        if (response != HederaResponseCodes.SUCCESS) {
            revert("Transfer Failed");
        }
    }

    function transferNFT(address to, int64 serialNumber) external {
        int256 responseCode = HederaTokenService.transferNFT(
            tokenAddress,
            msg.sender,
            to,
            serialNumber
        );
        if (responseCode != 22) {
            revert();
        }
    }

    function transferNFTs(address[] calldata to, int64[] calldata serialNumbers)
        external returns(int)
    {
        address[] memory from = new address[](to.length);
        for (uint256 i = 0; i < to.length; i++) {
            from[i] = msg.sender;
        }

        return HederaTokenService.transferNFTs(
            tokenAddress,
            from,
            to,
            serialNumbers
        );

        // if (responseCode != 22) {
        //     revert();
        // }
    }
}
