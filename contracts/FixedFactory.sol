// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

contract FixedFactory {
    event Deployed(address indexed addr, uint256 value);
    
    error EmptyInitcode();
    error DeployFailed();
    
    function deploy(bytes calldata initcode)
        external
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
}
