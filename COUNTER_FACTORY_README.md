# Counter Factory for DAO Governance

This implementation provides a **Timelock-owned CREATE2 factory** and **configurable Counter** contracts that can be deployed and configured in a single Tally governance proposal.

## Overview

- **`Counter.sol`**: Configurable counter contract with owner controls
- **`CounterFactory.sol`**: CREATE2 factory owned by Timelock for deterministic deployments
- **Scripts**: Deploy factory and compute Counter addresses for proposal planning

## Quick Start

### 1. Set Environment Variables

```bash
export ALCHEMY_SEPOLIA_RPC="https://eth-sepolia.g.alchemy.com/v2/YOUR_API_KEY"
export DEPLOYER_PK="0xYOUR_PRIVATE_KEY"
export ETHERSCAN_API_KEY="YOUR_ETHERSCAN_KEY"
export TIMELOCK_ADDRESS="0xYourDaoTimelock"
```

### 2. Deploy the Factory

```bash
# Compile contracts
pnpm hardhat compile

# Deploy CounterFactory (owned by Timelock)
pnpm hardhat run scripts/deployFactory.ts --network sepolia

# Save the factory address
export FACTORY_ADDRESS="0x...printed..."
```

### 3. Verify Factory (Optional)

```bash
pnpm hardhat verify --network sepolia $FACTORY_ADDRESS $TIMELOCK_ADDRESS
```

### 4. Compute Counter Address for Proposal

```bash
# Set parameters for your Counter
export SALT_STRING="counter-1"            # Unique identifier
export INITIAL="0"                        # Initial counter value
export COUNTER_OWNER="$TIMELOCK_ADDRESS"  # Make DAO the owner

# Compute the predicted address
pnpm hardhat run scripts/computeCounterAddress.ts --network sepolia
```

## Building a Tally Proposal

The `computeCounterAddress.ts` script will output the exact parameters needed for your Tally proposal. Create a proposal with these **ordered actions**:

### Action 1 - Deploy Counter
- **Target**: `$FACTORY_ADDRESS`
- **Function**: `deployCounter(bytes32,uint256,address)`
- **Args**: `[salt, initial, ctrOwner]` (from script output)
- **Value**: `0`

### Action 2 - Configure Counter (example)
- **Target**: `$PREDICTED_COUNTER_ADDRESS`
- **Function**: `setValue(uint256)`
- **Args**: `[42]`
- **Value**: `0`

### Action 3 - Set Config (example)
- **Target**: `$PREDICTED_COUNTER_ADDRESS`
- **Function**: `setConfig(bytes32,uint256)`
- **Args**: `[keccak256("maxStep"), 3]`
- **Value**: `0`

### Action 4 - Use Counter (example)
- **Target**: `$PREDICTED_COUNTER_ADDRESS`
- **Function**: `inc(uint256)`
- **Args**: `[1]`
- **Value**: `0`

## Key Features

- **Deterministic Addresses**: Same salt + factory + constructor args = same address
- **Governance-Only Deployment**: Only the Timelock can deploy new Counters
- **Same-Proposal Chaining**: Deploy and configure in a single proposal
- **Configurable**: Set values, config parameters, and ownership
- **Gas Efficient**: Uses CREATE2 for predictable deployment costs

## Function Selectors (for raw calldata)

- `deployCounter(bytes32,uint256,address)` → `0x0c1a6bcd`
- `setValue(uint256)` → `0x55241077`
- `setConfig(bytes32,uint256)` → `0x58ae0b52`
- `inc(uint256)` → `0x371303c0`

## Important Notes

- **Unique Salts**: Each Counter instance needs a unique salt string
- **Authority**: Only governance (Timelock) can deploy new Counters
- **Gas**: The proposal executor pays deployment gas
- **Re-deployment**: Same salt + factory + args cannot be used twice

## Troubleshooting

- **Compilation Errors**: Ensure Solidity 0.8.24+ and OpenZeppelin contracts are installed
- **Deployment Fails**: Check Timelock address and network connectivity
- **Address Mismatch**: Verify salt string and constructor parameters match exactly
