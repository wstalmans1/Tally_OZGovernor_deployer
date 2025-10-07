// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {IContractRegistry} from "./IContractRegistry.sol";

/// Minimal factory that can deploy via CREATE and then register the
/// deployed contract in a ContractRegistry. Registry is provided per-call
/// to avoid coupling and to keep the factory reusable. If `registry` is
/// address(0), registration is skipped.
contract WorkingFactoryRegistrar {
    event Deployed(address indexed addr, uint256 value);

    error EmptyInitcode();
    error DeployFailed();

    function deploy(bytes calldata initcode)
        public
        payable
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

    /// Deploy and optionally register in a registry that enforces REGISTRAR_ROLE.
    /// If `registry` == address(0) the register step is skipped.
    function deployAndRegister(
        bytes calldata initcode,
        address registry,
        bytes32 kind,
        bytes32 salt,
        uint64 version,
        string calldata label,
        string calldata uri
    ) external payable returns (address addr, bytes32 id) {
        addr = this.deploy{value: msg.value}(initcode);
        if (registry != address(0)) {
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
            id = IContractRegistry(registry).register(r);
        }
    }
}


