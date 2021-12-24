// SPDX-License-Identifier: GPL-3.0-or-later
pragma solidity ^0.8.4;

import "../CappedRegistryHelper.sol";

/**
 *    @notice Interface decribing a task registry
 *    The TaskRegistry is responsible for handling actions based on tasking
 */
interface ITaskRegistry {
    /**
     * Enum describing a task type
     * HOURLY - an hourly task is represented by a rate for a number of hours of work
     * FIXED - a fixed task is paid at a fixed rate despite the number of hours required for the work
     */
    enum TaskType {
        UNKNOWN,
        HOURLY,
        FIXED
    }

    struct TaskInfo {
        address needer; // address of needer
        address tasker; // address of tasker
        uint256 price; // price for the task
        bytes32 ploc; // location of public information. Can be an IPFS hash or a File Id
        bytes32 nploc; // location of needer private information
        bytes32 tploc; // location of tasker private information
        bytes32 dloc; // location of dispute resolution information
        uint64 expiry; // unix timestamp of task expiry
        uint64 disputionTime; // time at which the first party asked for a dispute
        bool[2] disputed; // flags for each party that disputed the ask, 0 - needer, 1 - tasker
        TaskType taskType; // type of task
    }

    struct DisputeResolution {
        uint8 neederPercentage; // percentage of the task price to be sent to the needer
        uint8 taskerPercentage; // percentage of the task price to be sent to the tasker
    }

    /// @dev Error thrown when there is an issue with payments in the TaskRegistry
    error InsuficientPay();

    /// @dev Error thrown when the sender is unauthorized to make a specific transaction
    error Unauthorized();

    /// @dev Error thrown when the task state is inappropriate for the wanted action
    error InvalidTaskState();

    /**
     *    @notice Emitted when a new Task is initialized
     */
    event TaskInitialized(
        uint256 indexed taskId,
        uint256 indexed expiry,
        uint256 rate,
        uint8 hcount
    );

    /**
     *    @notice Emitted when a Task is disputed
     */
    event TaskDisputed(uint256 indexed taskId);

    /**
     *    @notice Emitted when a Task's dispute is resolved
     */
    event TaskDisputeResolved(uint256 indexed taskId);

    /**
     *    @notice Emitted when a Task is removed
     */
    event TaskRemoved(uint256 indexed taskId);

    /**
     *    @notice Emitted when a payment is done, either when task is finished or a dispute is settled
     */
    event PaymentDone(address indexed recipient, uint256 amount);

    /**
     *    @notice Emitted when a Task's payment added to contract. When a task is started
     */
    event TaskAddedAndPaid(
        uint256 indexed taskId,
        uint256 indexed paymentSize,
        address indexed tasker
    );

    /// @dev initialize function
    function initialize(address owner, CappedRegistryHelper helper) external;

    /**
     *   @dev Method used for creating a task
     *   @param taskId - the id of the task
     *   @param rate - the price of the work in tinybars
     *   @param ploc - location of public information. Can be an IPFS hash or a File Id
     *   @param ttl - time to live in seconds. TTL represents the time the task is available and changes if the task started.
     *   @param taskType - the type of task initialized
     *   @param hcount - the number of hours for the work required
     */
    function initializeTask(
        uint256 taskId,
        uint256 rate,
        bytes32 ploc,
        uint64 ttl,
        uint8 taskType,
        uint8 hcount
    ) external;

    /**
     *   @dev Method used for starting a task.
     *   Is called by the owner which needs to pay the required task price.
     *   The tasker needs to agree on the task terms before starting
     *   @param tasker - the address of the tasker
     *   @param taskId - the id of the task
     *   @param rate - the price of the work in tinybars. This can change since creation if a negotiation took place
     *   @param nploc - location of needer private information. Can be an IPFS hash or a File Id
     *   @param tploc - location of tasker private information. Can be an IPFS hash or a File Id
     *   @param ttl - time to live in seconds. Time since block.timestamp until task can be finished
     *   @param hcount - the number of hours for the work required
     *   @param signature - the signature of the tasker that he agreed on the task terms
     */
    function startTask(
        address tasker,
        uint256 taskId,
        uint256 rate,
        bytes32 nploc,
        bytes32 tploc,
        uint64 ttl,
        uint8 hcount,
        bytes calldata signature
    ) external payable;

    /**
     *   @dev Method used for disputing a task.
     *   Task needs to be disputed by both sides to share all the required private information with the admin.
     *   @param taskId - the id of the task
     */
    function disputeTask(uint256 taskId) external;

    /**
     *   @dev Method used for finishing a task when no dispute has appeared
     *   Payment is sent to the tasker
     *   @param taskId - the id of the task
     */
    function finishTask(uint256 taskId) external;

    /**
     *   @dev Method which can be called by the party which started a dispute.
     *   This action is possible if after a period of time, the other party hasn't agreed to share private information for solving the dispute.
     *   @param taskId - the id of the task
     */
    function resolveUnagreedDispute(uint256 taskId) external;

    /**
     *   @dev Method called by admin
     *   The admin can decide percentages to pay to each party involved in the task, depending on each case.
     *   @param taskId - the id of the task
     *   @param _bytes - the DisputeResolution object containing the percentages for each party of the task price for settlement.
     */
    function resolveDispute(uint256 taskId, bytes calldata _bytes) external;

    /**
     *   @dev Method for canceling a task if it has not been started
     *   @param taskId - the id of the task
     */
    function cancelTask(uint256 taskId) external;

    /**
     *   @dev Method for getting information about a task
     *   @param taskId - the id of the task
     */
    function getTask(uint256 taskId)
        external
        view
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
        );

    /**
     *   @dev Method used to learn if the task registry has space for new tasks if it is capped.
     */
    function isSpaceAvailable() external view returns (bool);

    /**
     *   @dev Method used to change the dispute agreement time of required.
     */
    function changeDisputeAgreementTime(uint64 newTime) external;
}
