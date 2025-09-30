// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";
import {Create2} from "@openzeppelin/contracts/utils/Create2.sol";
import {Counter} from "./Counter.sol";

contract CounterFactory is Ownable {
    event CounterDeployed(address indexed counter, bytes32 indexed salt, uint256 initial, address owner);

    // Timelock (DAO) must be the owner so only governance can deploy
    constructor(address timelock) Ownable(timelock) {}

    /// @notice Predict the address a Counter will be deployed at with given params.
    function computeAddress(bytes32 salt, uint256 initial, address ctrOwner) public view returns (address) {
        bytes memory bytecode = abi.encodePacked(
            type(Counter).creationCode,
            abi.encode(initial, ctrOwner)
        );
        return Create2.computeAddress(salt, keccak256(bytecode), address(this));
    }

    /// @notice Deploy a Counter at a deterministic address. Only the Timelock (owner) may call.
    function deployCounter(bytes32 salt, uint256 initial, address ctrOwner) external onlyOwner returns (address addr) {
        bytes memory bytecode = abi.encodePacked(
            type(Counter).creationCode,
            abi.encode(initial, ctrOwner)
        );
        addr = Create2.deploy(0, salt, bytecode); // no ETH sent
        emit CounterDeployed(addr, salt, initial, ctrOwner);
    }
}
