// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

interface IContractRegistry {
    struct Entry {
        address addr;
        bytes32 kind;
        address factory;
        bytes32 salt;
        bytes32 initCodeHash;
        uint64  version;
        uint64  createdAt;
        bool    deprecated;
        string  label;
        string  uri;
    }

    event Registered(
        bytes32 indexed id,
        address indexed addr,
        bytes32 indexed kind,
        address factory,
        bytes32 salt,
        bytes32 initCodeHash,
        uint64  version,
        string  label,
        string  uri
    );

    function register(
        address addr,
        bytes32 kind,
        address factory,
        bytes32 salt,
        bytes32 initCodeHash,
        uint64  version,
        string calldata label,
        string calldata uri
    ) external returns (bytes32 id);
}


