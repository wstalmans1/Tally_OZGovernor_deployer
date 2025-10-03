// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

contract Counter {
    uint256 public value;
    address public owner;
    mapping(bytes32 => uint256) public config;

    event Incremented(uint256 by, uint256 newValue);
    event OwnerChanged(address indexed oldOwner, address indexed newOwner);
    event ValueSet(uint256 oldValue, uint256 newValue);
    event ConfigSet(bytes32 indexed key, uint256 oldVal, uint256 newVal);

    constructor(uint256 initial, address _owner) {
        value = initial;
        owner = _owner;
    }

    modifier onlyOwner() { require(msg.sender == owner, "not owner"); _; }

    function inc(uint256 by) external onlyOwner { value += by; emit Incremented(by, value); }
    function setOwner(address n) external onlyOwner { emit OwnerChanged(owner, n); owner = n; }
    function setValue(uint256 n) external onlyOwner { emit ValueSet(value, n); value = n; }
    function setConfig(bytes32 k, uint256 v) external onlyOwner {
        uint256 p = config[k]; config[k] = v; emit ConfigSet(k, p, v);
    }
}