// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;
import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";

contract Counter is Ownable {
    uint256 public value;
    constructor(address timelock) Ownable(timelock) {}
    function increment() external onlyOwner { unchecked { value += 1; } }
}
