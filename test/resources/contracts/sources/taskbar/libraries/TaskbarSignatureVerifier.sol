// SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;

import { ECDSA } from "./ECDSA.sol";

/**
*   Library used for verifying specific signatures on tasks 
*/
library TaskbarSignatureVerifier {

    function doesMatchTaskStartSignature (
        address pubKey,
        uint256 taskId,
        uint256 rate,
        uint64 ttl,
        uint8 hcount,
        bytes calldata signature
    ) internal pure returns(bool) {
        bytes32 messageHash = keccak256(abi.encodePacked(taskId, rate, hcount, ttl));
        return ECDSA.recoverSigner(messageHash, signature) == pubKey;
    }

}