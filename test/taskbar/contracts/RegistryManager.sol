// SPDX-License-Identifier: GPL-3.0-or-later
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/access/Ownable.sol";
import "./interfaces/IRegistryManager.sol";
import "./interfaces/ITaskRegistry.sol";
import "./libraries/ProxyFactory.sol";
import "./CappedRegistryHelper.sol";

contract RegistryManager is IRegistryManager, Ownable {

    // Template of registry
    address public immutable registryTemplate;

    // Addresses of deployed registries;
    address[] private taskRegistries;

    // Cap helper injected in each registry at initialization.
    CappedRegistryHelper immutable capHelper;

    constructor(address template, CappedRegistryHelper helper) {
        require(template != address(0), "Invalid template for proxy creator");
        registryTemplate = template;
        capHelper = helper;
    }
    
    function registryWithSlot() external override returns (address)  {
        address registry;
        
        for(uint i = taskRegistries.length; i > 0; i--) {
            // check if registry has space for a new task
            bool isSpace = ITaskRegistry(taskRegistries[i - 1]).isSpaceAvailable();
            if(isSpace) {
                registry = taskRegistries[i - 1];
                break;
            }
        }

        // if no registry has been found to contain a task space, a new registry is created
        if(registry == address(0)) {
            registry = createNewRegistry();
        }
        return registry;
    }
    
    function createNewRegistry() internal returns (address) {
        address proxyContract = ProxyFactory.create(
            registryTemplate, 
            abi.encodeWithSelector(ITaskRegistry.initialize.selector, owner(), address(capHelper))
            );

        taskRegistries.push(proxyContract);

        emit NewRegistryCreated(proxyContract);

        return proxyContract;
    }
}