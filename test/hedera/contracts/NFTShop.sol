// SPDX-License-Identifier: Apache-2.0
pragma solidity ^0.8.9;

import "./hip-206/IHederaTokenService.sol";
import "./hip-206/HederaResponseCodes.sol";

contract NFTShop is HederaResponseCodes {
    address constant precompileAddress = address(0x167);
    address tokenAddress;
    address tokenTreasury;
    uint64 mintPrice;
    bytes metadata;

    constructor(
        address _tokenAddress,
        address _tokenTreasury,
        uint64 _mintPrice,
        bytes memory _metadata
    ) {
        tokenAddress = _tokenAddress;
        tokenTreasury = _tokenTreasury;
        mintPrice = _mintPrice;
        metadata = _metadata;
    }

    error InsufficientPay();

    modifier isPaymentCovered(uint256 pieces) {
       if(uint256(mintPrice) * pieces > msg.value) {
           revert InsufficientPay();
       }
       _;
    }

    //isPaymentCovered(pieces)
    function mint(address to, uint256 amount) external payable returns (int64[] memory) {
        bytes[] memory nftMetadatas = generateBytesArrayForHTS(
            metadata,
            amount
        );

        (bool success, bytes memory result) = precompileAddress.call(
            abi.encodeWithSelector(
                IHederaTokenService.mintToken.selector,
                tokenAddress,
                0,
                nftMetadatas
            )
        );
        (int32 responseCode, , int64[] memory serialNumbers) = success
            ? abi.decode(result, (int32, uint64, int64[]))
            : (HederaResponseCodes.UNKNOWN, 0, new int64[](0));

        require(responseCode == HederaResponseCodes.SUCCESS, "Mint failed");

        address[] memory tokenTreasuryArray = generateAddressArrayForHTS(
            tokenTreasury,
            amount
        );
        address[] memory minterArray = generateAddressArrayForHTS(
            to,
            amount
        );

        (bool successTransfer, bytes memory resultTransfer) = precompileAddress
            .call(
                abi.encodeWithSelector(
                    IHederaTokenService.transferNFTs.selector,
                    tokenAddress,
                    tokenTreasuryArray,
                    minterArray,
                    serialNumbers
                )
            );
        responseCode = successTransfer
            ? abi.decode(resultTransfer, (int32))
            : HederaResponseCodes.UNKNOWN;

        require(responseCode == HederaResponseCodes.SUCCESS, "Transfer failed");

        return serialNumbers;
    }

    function generateAddressArrayForHTS(address _address, uint256 _items)
        internal
        pure
        returns (address[] memory _addresses)
    {
        _addresses = new address[](_items);
        for (uint256 i = 0; i < _items; i++) {
            _addresses[i] = _address;
        }
    }

    function generateBytesArrayForHTS(bytes memory _bytes, uint256 _items)
        internal
        pure
        returns (bytes[] memory _bytesArray)
    {
        _bytesArray = new bytes[](_items);
        for (uint256 i = 0; i < _items; i++) {
            _bytesArray[i] = _bytes;
        }
    }
}
