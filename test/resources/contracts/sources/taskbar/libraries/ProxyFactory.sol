// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import { Clones } from "@openzeppelin/contracts/proxy/Clones.sol";

library ProxyFactory {
    /* functions */
    function create(address logic, bytes memory data) internal returns (address proxy) {
        // deploy clone
        proxy = Clones.clone(logic);

        // attempt initialization
        if (data.length > 0) {
            (bool success, bytes memory err) = proxy.call(data);
            require(success, string(err));
        }

        // explicit return
        return proxy;
    }

}