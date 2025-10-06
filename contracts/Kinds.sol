// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

library Kinds {
    bytes32 public constant GOVERNOR = keccak256("GOVERNOR");
    bytes32 public constant TIMELOCK = keccak256("TIMELOCK");
    bytes32 public constant FACTORY  = keccak256("FACTORY");
    bytes32 public constant TOKEN    = keccak256("TOKEN");
    bytes32 public constant COUNTER  = keccak256("COUNTER");
}


