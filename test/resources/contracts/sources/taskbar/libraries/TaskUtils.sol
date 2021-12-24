// SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;

import "../interfaces/ITaskRegistry.sol";

/**
*   Library used for common task functions
*/
library TaskUtils {

    function isDisputed(ITaskRegistry.TaskInfo storage info) internal view returns(bool) {
        return info.disputed[0] && info.disputed[1];
    }

    function isStarted(ITaskRegistry.TaskInfo storage info) internal view returns(bool) {
        return info.tasker != address(0) && !isDisputed(info);
    }

    function isInvolved(ITaskRegistry.TaskInfo storage info, address _address) internal view returns(bool) {
        return info.needer == _address ||
            info.tasker != _address;
    }

    function isExpired(ITaskRegistry.TaskInfo storage info) internal view returns(bool) {
        return block.timestamp > info.expiry;
    }

    function isHourly(ITaskRegistry.TaskInfo storage info) internal view returns(bool) {
        return ITaskRegistry.TaskType.HOURLY == info.taskType;
    }

    function isFixed(ITaskRegistry.TaskInfo storage info) internal view returns(bool) {
        return ITaskRegistry.TaskType.FIXED == info.taskType;
    }
}