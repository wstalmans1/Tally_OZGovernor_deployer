// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {AccessControl} from "@openzeppelin/contracts/access/AccessControl.sol";
import {IContractRegistry} from "./IContractRegistry.sol";

contract ContractRegistry is AccessControl, IContractRegistry {
    bytes32 public constant REGISTRAR_ROLE = keccak256("REGISTRAR_ROLE");

    struct Store {
        address addr;
        bytes32 kind;
        address factory;
        bytes32 salt;
        bytes32 initCodeHash;
        uint64  version;
        uint64  createdAt;
        bool    deprecated;
        string  label;
        string  uri;
    }

    mapping(bytes32 => Store) public byId;
    mapping(bytes32 => address[]) public byKind;
    mapping(bytes32 => address) public latestByKind;
    mapping(bytes32 => address) public bySalt;
    address[] public allAddresses;

    event UpdatedURI(bytes32 indexed id, string newURI);
    event UpdatedLabel(bytes32 indexed id, string newLabel);
    event Deprecated(bytes32 indexed id, bool deprecated);

    constructor(address timelock) {
        _grantRole(DEFAULT_ADMIN_ROLE, timelock);
    }

    function _id(address a) internal pure returns (bytes32) {
        return keccak256(abi.encodePacked(a));
    }

    function register(
        address addr,
        bytes32 kind,
        address factory,
        bytes32 salt,
        bytes32 initCodeHash,
        uint64  version,
        string calldata label,
        string calldata uri
    ) external override onlyRole(REGISTRAR_ROLE) returns (bytes32 id) {
        require(addr != address(0), "zero addr");
        id = _id(addr);
        require(byId[id].addr == address(0), "exists");

        byId[id] = Store({
            addr: addr,
            kind: kind,
            factory: factory,
            salt: salt,
            initCodeHash: initCodeHash,
            version: version,
            createdAt: uint64(block.timestamp),
            deprecated: false,
            label: label,
            uri: uri
        });

        byKind[kind].push(addr);
        latestByKind[kind] = addr;
        if (salt != bytes32(0)) bySalt[salt] = addr;
        allAddresses.push(addr);

        emit Registered(id, addr, kind, factory, salt, initCodeHash, version, label, uri);
    }

    function updateURI(address addr, string calldata newURI) external onlyRole(DEFAULT_ADMIN_ROLE) {
        bytes32 id = _id(addr);
        require(byId[id].addr != address(0), "not found");
        byId[id].uri = newURI;
        emit UpdatedURI(id, newURI);
    }

    function updateLabel(address addr, string calldata newLabel) external onlyRole(DEFAULT_ADMIN_ROLE) {
        bytes32 id = _id(addr);
        require(byId[id].addr != address(0), "not found");
        byId[id].label = newLabel;
        emit UpdatedLabel(id, newLabel);
    }

    function setDeprecated(address addr, bool dep) external onlyRole(DEFAULT_ADMIN_ROLE) {
        bytes32 id = _id(addr);
        require(byId[id].addr != address(0), "not found");
        byId[id].deprecated = dep;
        emit Deprecated(id, dep);
    }

    function getByAddress(address addr) external view returns (Store memory) { return byId[_id(addr)]; }
    function listByKind(bytes32 kind) external view returns (address[] memory) { return byKind[kind]; }
    function getLatest(bytes32 kind) external view returns (address) { return latestByKind[kind]; }
    function getBySalt(bytes32 salt) external view returns (address) { return bySalt[salt]; }
    
    function listAllSlice(uint256 start, uint256 end) external view returns (address[] memory addrs) {
        require(start <= end && end <= allAddresses.length, "invalid range");
        uint256 len = end - start;
        addrs = new address[](len);
        for (uint256 i = 0; i < len; i++) {
            addrs[i] = allAddresses[start + i];
        }
    }
    
    function listAllSliceWithLabels(uint256 start, uint256 end) external view returns (address[] memory addrs, string[] memory labels) {
        require(start <= end && end <= allAddresses.length, "invalid range");
        uint256 len = end - start;
        addrs = new address[](len);
        labels = new string[](len);
        for (uint256 i = 0; i < len; i++) {
            address addr = allAddresses[start + i];
            addrs[i] = addr;
            labels[i] = byId[_id(addr)].label;
        }
    }
    
    function totalCount() external view returns (uint256) { return allAddresses.length; }
}


