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
    mapping(bytes32 => address)  public latestByKind;
    mapping(bytes32 => address)  public bySalt;
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

    function register(Registration calldata r)
        external
        override
        onlyRole(REGISTRAR_ROLE)
        returns (bytes32 id)
    {
        address a = r.addr;
        if (a == address(0)) revert("zero addr");
        id = _id(a);
        if (byId[id].addr != address(0)) revert("exists");

        // write directly to storage via a single pointer — minimal locals
        Store storage s = byId[id];
        s.addr        = a;
        s.kind        = r.kind;
        s.factory     = r.factory;
        s.salt        = r.salt;
        s.initCodeHash= r.initCodeHash;
        s.version     = r.version;
        s.createdAt   = uint64(block.timestamp);
        s.deprecated  = false;
        s.label       = r.label;
        s.uri         = r.uri;

        // index updates (no extra locals)
        byKind[r.kind].push(a);
        latestByKind[r.kind] = a;
        if (r.salt != bytes32(0)) bySalt[r.salt] = a;
        allAddresses.push(a);

        emit Registered(
            id, a, r.kind, r.factory, r.salt, r.initCodeHash, r.version, r.label, r.uri
        );
    }

    // admin helpers (use very few locals)
    function updateURI(address addr_, string calldata newURI) external onlyRole(DEFAULT_ADMIN_ROLE) {
        bytes32 id = _id(addr_);
        if (byId[id].addr == address(0)) revert("not found");
        byId[id].uri = newURI;
        emit UpdatedURI(id, newURI);
    }

    function updateLabel(address addr_, string calldata newLabel) external onlyRole(DEFAULT_ADMIN_ROLE) {
        bytes32 id = _id(addr_);
        if (byId[id].addr == address(0)) revert("not found");
        byId[id].label = newLabel;
        emit UpdatedLabel(id, newLabel);
    }

    function setDeprecated(address addr_, bool dep) external onlyRole(DEFAULT_ADMIN_ROLE) {
        bytes32 id = _id(addr_);
        if (byId[id].addr == address(0)) revert("not found");
        byId[id].deprecated = dep;
        emit Deprecated(id, dep);
    }

    // views remain unchanged
    function getByAddress(address addr_) external view returns (Store memory) { return byId[_id(addr_)]; }
    function listByKind(bytes32 kind) external view returns (address[] memory) { return byKind[kind]; }
    function getLatest(bytes32 kind) external view returns (address) { return latestByKind[kind]; }
    function getBySalt(bytes32 salt) external view returns (address) { return bySalt[salt]; }

    function listAllSlice(uint256 start, uint256 end) external view returns (address[] memory addrs) {
        require(start <= end && end <= allAddresses.length, "invalid range");
        uint256 len = end - start;
        addrs = new address[](len);
        for (uint256 i; i < len; ++i) addrs[i] = allAddresses[start + i];
    }

    function listAllSliceWithLabels(uint256 start, uint256 end)
        external
        view
        returns (address[] memory addrs, string[] memory labels)
    {
        require(start <= end && end <= allAddresses.length, "invalid range");
        uint256 len = end - start;
        addrs = new address[](len);
        labels = new string[](len);
        for (uint256 i; i < len; ++i) {
            address a = allAddresses[start + i];
            addrs[i] = a;
            labels[i] = byId[_id(a)].label;
        }
    }

    function totalCount() external view returns (uint256) { return allAddresses.length; }
}
