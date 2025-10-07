// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";
import {Ownable2Step} from "@openzeppelin/contracts/access/Ownable2Step.sol";
import {IContractRegistry} from "./IContractRegistry.sol";

/**
 * @title BytecodeFactory
 * @notice DAO-owned factory that can deploy arbitrary contracts from raw initcode
 *         via CREATE or CREATE2. Intended to be owned by a Timelock.
 *         Supports ETH forwarding and automatic registration in a registry.
 */
contract BytecodeFactory is Ownable2Step {
    event Deployed(address indexed addr, bytes32 indexed salt, bool create2, uint256 value);

    error EmptyInitcode();
    error DeployFailed();

    /**
     * @param initialOwner The address that will own the factory (usually the Timelock).
     */
    constructor(address initialOwner) Ownable(initialOwner) {}

    // ---------------------------------------------------------------------
    // CREATE DEPLOYS
    // ---------------------------------------------------------------------

    /// @notice Deploys a contract using CREATE.
    function deploy(bytes calldata initcode)
        public
        payable
        onlyOwner
        returns (address addr)
    {
        if (initcode.length == 0) revert EmptyInitcode();
        assembly {
            let ptr := mload(0x40)
            let len := initcode.length
            let off := initcode.offset
            calldatacopy(ptr, off, len)
            addr := create(callvalue(), ptr, len)
        }
        if (addr == address(0)) revert DeployFailed();
        emit Deployed(addr, bytes32(0), false, msg.value);
    }

    /// @notice Deploys using CREATE and immediately registers the deployment.
    function deployAndRegister(
        bytes calldata initcode,
        address registry,
        bytes32 kind,
        uint64 version,
        string calldata label,
        string calldata uri
    )
        external
        payable
        onlyOwner
        returns (address addr)
    {
        addr = _deploy(initcode);

        IContractRegistry.Registration memory r = IContractRegistry.Registration({
            addr: addr,
            kind: kind,
            factory: address(this),
            salt: bytes32(0),
            initCodeHash: keccak256(initcode),
            version: version,
            label: label,
            uri: uri
        });

        IContractRegistry(registry).register(r);
    }

    // ---------------------------------------------------------------------
    // CREATE2 DEPLOYS
    // ---------------------------------------------------------------------

    /// @notice Deploys a contract deterministically using CREATE2.
    function deployCreate2(bytes32 salt, bytes calldata initcode)
        public
        payable
        onlyOwner
        returns (address addr)
    {
        if (initcode.length == 0) revert EmptyInitcode();
        assembly {
            let ptr := mload(0x40)
            let len := initcode.length
            let off := initcode.offset
            calldatacopy(ptr, off, len)
            addr := create2(callvalue(), ptr, len, salt)
        }
        if (addr == address(0)) revert DeployFailed();
        emit Deployed(addr, salt, true, msg.value);
    }

    /// @notice Deploys via CREATE2 and immediately registers the contract.
    function deployCreate2AndRegister(
        bytes32 salt,
        bytes calldata initcode,
        address registry,
        bytes32 kind,
        uint64 version,
        string calldata label,
        string calldata uri
    )
        external
        payable
        onlyOwner
        returns (address addr)
    {
        addr = _deployCreate2(salt, initcode);

        IContractRegistry.Registration memory r = IContractRegistry.Registration({
            addr: addr,
            kind: kind,
            factory: address(this),
            salt: salt,
            initCodeHash: keccak256(initcode),
            version: version,
            label: label,
            uri: uri
        });

        IContractRegistry(registry).register(r);
    }

    // ---------------------------------------------------------------------
    // INTERNAL HELPERS
    // ---------------------------------------------------------------------

    /// @notice Internal function to deploy using CREATE.
    function _deploy(bytes calldata initcode)
        internal
        returns (address addr)
    {
        if (initcode.length == 0) revert EmptyInitcode();
        assembly {
            let ptr := mload(0x40)
            let len := initcode.length
            let off := initcode.offset
            calldatacopy(ptr, off, len)
            addr := create(callvalue(), ptr, len)
        }
        if (addr == address(0)) revert DeployFailed();
        emit Deployed(addr, bytes32(0), false, msg.value);
    }

    /// @notice Internal function to deploy using CREATE2.
    function _deployCreate2(bytes32 salt, bytes calldata initcode)
        internal
        returns (address addr)
    {
        if (initcode.length == 0) revert EmptyInitcode();
        assembly {
            let ptr := mload(0x40)
            let len := initcode.length
            let off := initcode.offset
            calldatacopy(ptr, off, len)
            addr := create2(callvalue(), ptr, len, salt)
        }
        if (addr == address(0)) revert DeployFailed();
        emit Deployed(addr, salt, true, msg.value);
    }

    // ---------------------------------------------------------------------
    // HELPERS
    // ---------------------------------------------------------------------

    /// @notice Computes the deterministic address for a CREATE2 deployment.
    function computeAddress(bytes32 salt, bytes calldata initcode)
        external
        view
        returns (address predicted)
    {
        bytes32 hash = keccak256(
            abi.encodePacked(bytes1(0xff), address(this), salt, keccak256(initcode))
        );
        predicted = address(uint160(uint256(hash)));
    }

    /// @notice Returns keccak256(initcode) for off-chain verification.
    function initcodeHash(bytes calldata initcode)
        external
        pure
        returns (bytes32)
    {
        return keccak256(initcode);
    }
}
