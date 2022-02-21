// SPDX-License-Identifier: GPL-3.0-or-later
pragma solidity ^0.8.0;

/**
*    @notice Interface used to describe functions responsible for handling the creation of new task registries in TaskBar
*    The RegistryManager is responsible for keeping track if token ids spread across multiple registries.
*/
interface IRegistryManager {

    /**
    *    @notice Emitted when a new registry is created
    */
    event NewRegistryCreated(address indexed registry);

    /**
    *    Method used when creating a new task, it will return the registry and the task id.
    */
    function registryWithSlot() external returns (address);

}