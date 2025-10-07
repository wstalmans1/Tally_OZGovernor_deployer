// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

interface IContractRegistry {
    struct Registration {
        address addr;
        bytes32 kind;
        address factory;
        bytes32 salt;
        bytes32 initCodeHash;
        uint64  version;
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

    function register(Registration calldata r) external returns (bytes32 id);
}
