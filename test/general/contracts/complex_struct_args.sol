// Taken from issue #73
// Source: https://discordapp.com/channels/373889138199494658/909532351388864542/967985376037859329 
//         (community post on hedera#smart-contracts)

// SPDX-License-Identifier: MIT
pragma solidity ^0.8.3;

contract ComplexObjects {
  struct Group {
    uint8 groupId;
    string groupName;
    Member[] members;
  }

  struct Member {
    uint8 memberId;
    string memberName;
  }

  struct NftBurn {
    address collectionAddress;
    int64[] serialNumbers;
  }

  function reflectGroups(Group[] memory _groups) public pure returns (Group[] memory) {
    return _groups;
  }

  function reflectNftBurns(NftBurn[] memory _nftBurns) public pure returns (NftBurn[] memory) {
    return _nftBurns;
  }
}
