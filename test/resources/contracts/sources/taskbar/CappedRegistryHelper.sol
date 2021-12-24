// SPDX-License-Identifier: GPL-3.0-or-later
pragma solidity ^0.8.4;

import "@openzeppelin/contracts/access/Ownable.sol";

/**
*   @dev A helper contract used to change the task cap per registry
*   Separate contract is used so a single transaction can update the cap on multiple registries
*/
contract CappedRegistryHelper is Ownable {
    uint256 _registrySize;

    error InvalidSize();

    event RegistrySizeChanged(uint256 indexed newSize);

    constructor(uint256 size) {
        _registrySize = size;
    }

    function setNewRegistrySize(uint256 registrySize) external onlyOwner {
        if (registrySize == 0) {
            revert InvalidSize();
        }
        _registrySize = registrySize;
        emit RegistrySizeChanged(_registrySize);
    }

    function getRegistrySize() external view returns (uint256) {
        return _registrySize;
    }

    function isSpaceAvailable(uint256 noOfItems) public view returns (bool) {
        return noOfItems < _registrySize;
    }
}
