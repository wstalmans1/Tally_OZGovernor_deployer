// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract SimpleCounter {
    uint256 public value;
    address public owner;
    
    constructor(address _owner) {
        owner = _owner;
    }
    
    function increment() external {
        require(msg.sender == owner, "Only owner");
        value += 1;
    }
}
