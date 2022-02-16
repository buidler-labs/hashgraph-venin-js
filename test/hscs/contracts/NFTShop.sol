// SPDX-License-Identifier: Apache-2.0
pragma solidity ^0.8.9;

import "../../hedera/contracts/hip-206/IHederaTokenService.sol";
import "../../hedera/contracts/hip-206/HederaResponseCodes.sol";

// @title NFTShop - a simple minting and transfering contract
// @author Buidler Labs
// @dev The functions implemented make use of Hedera Token Service precompiled contract
contract NFTShop is HederaResponseCodes {
    
    // @dev Hedera Token Service precompiled address
    address constant precompileAddress = address(0x167);

    // @dev The address of the Non-Fungible token
    address tokenAddress;

    // @dev The address of the token treasury, the address which receives tokens once they are minted
    address tokenTreasury;

    // @dev The price for a mint
    uint64 mintPrice;

    // @dev The metadata which the minted tokens will contain
    bytes metadata;

    // @dev Constructor is the only place where the tokenAddress, tokenTreasury, mintPrice and metadata are being set
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

    // @notice Error used when reverting the minting function if it doesn't receive the required payment amount
    error InsufficientPay();

    // @dev Modifier to test if while minting, the necessary amount of hbars is paid
    modifier isPaymentCovered(uint256 pieces) {
        if (uint256(mintPrice) * pieces > msg.value) {
            revert InsufficientPay();
        }
        _;
    }

    // @dev Main minting and transfering function
    // @param to The address to which the tokens are transfered after being minted
    // @param amount The number of tokens to be minted
    // @return The serial numbers of the tokens which have been minted
    function mint(address to, uint256 amount)
        external
        payable
        isPaymentCovered(amount)
        returns (int64[] memory)
    {
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
        address[] memory minterArray = generateAddressArrayForHTS(to, amount);

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

    // @dev Helper function which generates array of addresses required for HTSPrecompiled
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

    // @dev Helper function which generates array required for metadata by HTSPrecompiled
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
