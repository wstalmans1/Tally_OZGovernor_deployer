// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

contract Counter {
    uint256 public value;
    address public owner;

    mapping(bytes32 => uint256) public config; // simple config bucket

    event Incremented(uint256 by, uint256 newValue);
    event OwnerChanged(address indexed oldOwner, address indexed newOwner);
    event ValueSet(uint256 oldValue, uint256 newValue);
    event ConfigSet(bytes32 indexed key, uint256 oldVal, uint256 newVal);

    constructor(uint256 initial, address _owner) {
        value = initial;
        owner = _owner;
    }

    modifier onlyOwner() {
        require(msg.sender == owner, "Counter:not-owner");
        _;
    }

    function inc(uint256 by) external onlyOwner {
        value += by;
        emit Incremented(by, value);
    }

    // configuration helpers to demonstrate chained actions
    function setOwner(address newOwner) external onlyOwner {
        emit OwnerChanged(owner, newOwner);
        owner = newOwner;
    }

    function setValue(uint256 newValue) external onlyOwner {
        emit ValueSet(value, newValue);
        value = newValue;
    }

    function setConfig(bytes32 key, uint256 val) external onlyOwner {
        uint256 prev = config[key];
        config[key] = val;
        emit ConfigSet(key, prev, val);
    }
}