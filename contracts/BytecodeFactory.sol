// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {Ownable2Step} from "@openzeppelin/contracts/access/Ownable2Step.sol";
import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title BytecodeFactory
 * @notice DAO-owned factory to deploy arbitrary contracts from raw initcode via CREATE or CREATE2.
 *         - After initial setup, only the Timelock (owner) can deploy.
 *         - Supports sending ETH on deploy (msg.value).
 *         - Deterministic address support with CREATE2 + computeAddress().
 */
contract BytecodeFactory is Ownable2Step {
    event Deployed(address indexed addr, bytes32 indexed salt, bool create2, uint256 value);
    error EmptyInitcode();
    error DeployFailed();

    constructor(address initialOwner) Ownable(initialOwner) {
        // Ownership is set by parent constructor
    }

    /// @notice Deploy using CREATE. Payable: forwards msg.value to the new contract's constructor.
    function deploy(bytes calldata initcode) external payable onlyOwner returns (address addr) {
        if (initcode.length == 0) revert EmptyInitcode();
        // solhint-disable-next-line no-inline-assembly
        assembly {
            let mem := mload(0x40)
            let len := initcode.length
            let data := add(initcode.offset, 0x00)
            // copy to free memory
            calldatacopy(mem, data, len)
            addr := create(callvalue(), mem, len)
        }
        if (addr == address(0)) revert DeployFailed();
        emit Deployed(addr, bytes32(0), false, msg.value);
    }

    /// @notice Deploy using CREATE2 at deterministic address. Payable: forwards msg.value.
    function deployCreate2(bytes32 salt, bytes calldata initcode) external payable onlyOwner returns (address addr) {
        if (initcode.length == 0) revert EmptyInitcode();
        // solhint-disable-next-line no-inline-assembly
        assembly {
            let mem := mload(0x40)
            let len := initcode.length
            let data := add(initcode.offset, 0x00)
            calldatacopy(mem, data, len)
            addr := create2(callvalue(), mem, len, salt)
        }
        if (addr == address(0)) revert DeployFailed();
        emit Deployed(addr, salt, true, msg.value);
    }

    /// @notice Compute the address a CREATE2 deploy would use for the given salt+initcode.
    function computeAddress(bytes32 salt, bytes calldata initcode) external view returns (address predicted) {
        bytes32 hash = keccak256(abi.encodePacked(bytes1(0xff), address(this), salt, keccak256(initcode)));
        predicted = address(uint160(uint256(hash)));
    }

    /// @notice Helper to obtain keccak256(initcode) client-side checks.
    function initcodeHash(bytes calldata initcode) external pure returns (bytes32) {
        return keccak256(initcode);
    }

    // Ownable2Step:
    // - transferOwnership(newOwner)  -> callable by current owner (e.g., deployer)
    // - acceptOwnership()            -> callable by newOwner (e.g., Timelock via proposal)
}
