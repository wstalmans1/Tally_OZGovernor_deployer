// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";

/// Factory owned by a Timelock (or any owner) that can deploy contracts via CREATE.
/// Ownership is set in the constructor to the provided timelock address.
contract OwnedWorkingFactory is Ownable {
    event Deployed(address indexed addr, uint256 value);

    error EmptyInitcode();
    error DeployFailed();

    constructor(address timelock) Ownable(timelock) {}

    /// Deploy a contract from raw initcode. Restricted to owner (e.g., Timelock).
    function deploy(bytes calldata initcode)
        external
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
        emit Deployed(addr, msg.value);
    }
}


