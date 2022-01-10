// SPDX-License-Identifier: GPL-3.0-or-later
pragma solidity ^0.8.4;

import "@openzeppelin/contracts/proxy/utils/Initializable.sol";
import "@openzeppelin/contracts/utils/Counters.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "./interfaces/ITaskRegistry.sol";
import "./libraries/TaskbarSignatureVerifier.sol";
import "./libraries/TaskUtils.sol";
import "./CappedRegistryHelper.sol";

contract TaskRegistry is ITaskRegistry, Initializable, Ownable {
    using Counters for Counters.Counter;
    using TaskbarSignatureVerifier for address;
    using TaskUtils for TaskInfo;

    // Dispute agreement time defaulted to one week. Mutable value.
    uint64 public DISPUTE_AGREEMENT_TIME = 604800;

    Counters.Counter private noOfTasks;
    CappedRegistryHelper private capHelper;
    mapping(uint256 => TaskInfo) private taskInfos;

    modifier taskNotExpired(uint256 taskId) {
        if (taskInfos[taskId].isExpired()) {
            revert InvalidTaskState();
        }
        _;
    }

    modifier isNeeder(uint256 taskId) {
        if (taskInfos[taskId].needer != msg.sender) {
            revert Unauthorized();
        }
        _;
    }

    modifier isInvolved(uint256 taskId) {
        if (!taskInfos[taskId].isInvolved(msg.sender)) {
            revert Unauthorized();
        }
        _;
    }

    modifier taskOngoing(uint256 taskId) {
        if (!taskInfos[taskId].isStarted()) {
            revert InvalidTaskState();
        }
        _;
    }

    modifier validTaskType(uint8 taskType) {
        if (
            taskType != uint8(TaskType.FIXED) &&
            taskType != uint8(TaskType.HOURLY)
        ) {
            revert InvalidTaskState();
        }
        _;
    }

    function initialize(address owner, CappedRegistryHelper helper)
        external
        override
        initializer
    {
        _transferOwnership(owner);
        initCapHelper(helper);
    }

    function initCapHelper(CappedRegistryHelper helper) internal onlyOwner {
        capHelper = helper;
    }

    function initializeTask(
        uint256 taskId,
        uint256 rate,
        bytes32 ploc,
        uint64 ttl,
        uint8 taskType,
        uint8 hcount
    ) external override validTaskType(taskType) {
        if (
            (taskInfos[taskId].needer != address(0) &&
                msg.sender != taskInfos[taskId].needer) ||
            !capHelper.isSpaceAvailable(noOfTasks.current())
        ) {
            revert Unauthorized();
        }

        if (taskInfos[taskId].tasker != address(0)) {
            revert InvalidTaskState();
        }

        taskInfos[taskId].ploc = ploc;
        taskInfos[taskId].expiry = uint64(block.timestamp + ttl);
        taskInfos[taskId].needer = msg.sender;
        taskInfos[taskId].taskType = TaskType(taskType);

        if (hcount == 0) {
            taskInfos[taskId].price = rate;
        } else {
            taskInfos[taskId].price = rate * hcount;
        }

        noOfTasks.increment();

        emit TaskInitialized(taskId, taskInfos[taskId].expiry, rate, hcount);
    }

    function startTask(
        address tasker,
        uint256 taskId,
        uint256 rate,
        bytes32 nploc,
        bytes32 tploc,
        uint64 ttl,
        uint8 hcount,
        bytes calldata signature
    ) external payable override {
        if (taskInfos[taskId].needer != msg.sender) {
            revert Unauthorized();
        }

        if (
            (taskInfos[taskId].isHourly() && msg.value >= rate * hcount) ||
            (taskInfos[taskId].isFixed() && msg.value >= rate)
        ) {
            revert InsuficientPay();
        }

        if (
            !tasker.doesMatchTaskStartSignature(
                taskId,
                rate,
                ttl,
                hcount,
                signature
            )
        ) {
            revert Unauthorized();
        }

        taskInfos[taskId].tasker = tasker;
        taskInfos[taskId].expiry = uint64(block.timestamp + ttl);
        taskInfos[taskId].nploc = nploc;
        taskInfos[taskId].tploc = tploc;

        if (hcount == 0) {
            taskInfos[taskId].price = rate;
        } else {
            taskInfos[taskId].price = rate * hcount;
        }

        emit TaskAddedAndPaid(taskId, msg.value, tasker);
    }

    function disputeTask(uint256 taskId) external override isInvolved(taskId) {
        if (msg.sender == taskInfos[taskId].needer) {
            taskInfos[taskId].disputed[0] = true;
        } else if (msg.sender == taskInfos[taskId].tasker) {
            taskInfos[taskId].disputed[1] = true;
        }
        if (!taskInfos[taskId].isDisputed()) {
            taskInfos[taskId].disputionTime = uint64(block.timestamp);
        }

        emit TaskDisputed(taskId);
    }

    function finishTask(uint256 taskId)
        external
        override
        taskOngoing(taskId)
        isNeeder(taskId)
    {
        address tasker = taskInfos[taskId].tasker;
        uint256 price = taskInfos[taskId].price;

        cancelTask(taskId);

        makePayment(payable(tasker), price);
    }

    function resolveUnagreedDispute(uint256 taskId) external override {
        if (
            taskInfos[taskId].disputionTime + DISPUTE_AGREEMENT_TIME >
            block.timestamp
        ) {
            revert Unauthorized();
        }

        uint256 amount = taskInfos[taskId].price;
        address recipient;
        if (
            taskInfos[taskId].disputed[0] &&
            taskInfos[taskId].needer != address(0)
        ) {
            recipient = taskInfos[taskId].needer;
        } else if (
            taskInfos[taskId].disputed[1] &&
            taskInfos[taskId].tasker != address(0)
        ) {
            recipient = taskInfos[taskId].tasker;
        } else {
            revert Unauthorized();
        }

        cancelTask(taskId);
        makePayment(payable(recipient), amount);
    }

    function resolveDispute(uint256 taskId, bytes calldata _bytes)
        external
        override
        onlyOwner
    {
        if (!taskInfos[taskId].isDisputed()) {
            revert InvalidTaskState();
        }

        DisputeResolution memory disputeResolution = abi.decode(
            _bytes,
            (DisputeResolution)
        );

        if (
            disputeResolution.neederPercentage +
                disputeResolution.taskerPercentage !=
            100
        ) {
            revert InsuficientPay();
        }
        uint256 totalPrice = taskInfos[taskId].price;
        address tasker = taskInfos[taskId].tasker;
        address needer = taskInfos[taskId].needer;

        cancelTask(taskId);

        uint256 neederPayment = (totalPrice *
            disputeResolution.neederPercentage) / 100;
        uint256 taskerPayment = (totalPrice *
            disputeResolution.taskerPercentage) / 100;

        makePayment(payable(needer), neederPayment);
        makePayment(payable(tasker), taskerPayment);

        emit TaskDisputeResolved(taskId);
    }

    function makePayment(address payable _address, uint256 amount) internal {
        _address.transfer(amount);

        emit PaymentDone(_address, amount);
    }

    function cancelTask(uint256 taskId) public override {
        if (taskInfos[taskId].isDisputed()) {
            revert InvalidTaskState();
        }

        bool[2] memory initDispute;
        TaskInfo memory emptyTask = TaskInfo(
            address(0),
            address(0),
            0,
            0x0,
            0x0,
            0x0,
            0,
            0,
            0,
            initDispute,
            TaskType.UNKNOWN
        );
        taskInfos[taskId] = emptyTask;

        noOfTasks.decrement();
        emit TaskRemoved(taskId);
    }

    function getTask(uint256 taskId)
        external
        view
        override
        returns (
            address needer,
            address tasker,
            uint256 price,
            bytes32 ploc,
            bytes32 nploc,
            bytes32 tploc,
            bytes32 dloc,
            uint64 expiry,
            uint64 disputionTime,
            bool[2] memory disputed,
            TaskType taskType
        )
    {
        needer = taskInfos[taskId].needer;
        tasker = taskInfos[taskId].tasker;
        price = taskInfos[taskId].price;
        ploc = taskInfos[taskId].ploc;
        nploc = taskInfos[taskId].nploc;
        tploc = taskInfos[taskId].tploc;
        dloc = taskInfos[taskId].dloc;
        expiry = taskInfos[taskId].expiry;
        disputionTime = taskInfos[taskId].disputionTime;
        taskType = taskInfos[taskId].taskType;
        disputed = taskInfos[taskId].disputed;
    }

    function getNoOfTasksInRegistry() external view returns (uint256) {
        return noOfTasks.current();
    }

    function isSpaceAvailable() external view override returns (bool) {
        return capHelper.isSpaceAvailable(noOfTasks.current());
    }

    function changeDisputeAgreementTime(uint64 newTime)
        external
        override
        onlyOwner
    {
        if (newTime == 0) {
            revert Unauthorized();
        }
        DISPUTE_AGREEMENT_TIME = newTime;
    }
}
