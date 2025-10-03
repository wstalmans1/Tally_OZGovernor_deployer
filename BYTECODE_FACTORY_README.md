# BytecodeFactory - General-Purpose DAO Contract Deployer

This implementation provides a **DAO-owned factory** that can deploy **any contract** via CREATE or CREATE2, with support for chaining follow-up actions in the same Tally proposal.

## Overview

- **`BytecodeFactory.sol`**: General-purpose factory owned by Timelock for deploying any contract
- **`Counter.sol`**: Example contract for demonstration
- **Scripts**: Deploy factory, build initcode for any contract, compute CREATE2 addresses

## Key Features

- ✅ **Deploy ANY contract** (not just Counter)
- ✅ **CREATE and CREATE2** support for deterministic addresses
- ✅ **Ownable2Step** for secure ownership transfer to DAO
- ✅ **ETH forwarding** to contract constructors
- ✅ **Same-proposal chaining** - deploy and configure in one proposal
- ✅ **Gas efficient** - uses raw assembly for deployment

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

# Deploy BytecodeFactory (sets Timelock as pending owner)
pnpm hardhat run scripts/deployBytecodeFactory.ts --network sepolia

# Save the factory address
export FACTORY_ADDRESS="0x...printed..."

# Verify the factory
pnpm hardhat verify --network sepolia $FACTORY_ADDRESS $TIMELOCK_ADDRESS
```

### 3. Transfer Ownership to DAO

Create a Tally proposal to call `acceptOwnership()` on the factory:

- **Target**: `$FACTORY_ADDRESS`
- **Function**: `acceptOwnership()`
- **Args**: `[]`
- **Value**: `0`

After execution, only governance can deploy contracts!

## Deploy Any Contract via DAO

### Step 1: Build Initcode

```bash
# Example: Deploy Counter with initial=0, owner=Timelock
export TARGET="Counter"
export ARGS='[0,"'$TIMELOCK_ADDRESS'"]'
pnpm hardhat run scripts/buildInitcode.ts --network sepolia

# Save the initcode
export INITCODE="0x...."
```

### Step 2: Compute CREATE2 Address

```bash
export SALT_STRING="counter-1"
pnpm hardhat run scripts/computeCreate2Address.ts --network sepolia

# Save the predicted address
export PREDICTED_ADDRESS="0x...."
```

### Step 3: Create Tally Proposal with Chained Actions

**Action 1 - Deploy Contract (CREATE2)**
- **Target**: `$FACTORY_ADDRESS`
- **Function**: `deployCreate2(bytes32,bytes)`
- **Args**: `[keccak256("counter-1"), $INITCODE]`
- **Value**: `0`

**Action 2 - Configure Contract**
- **Target**: `$PREDICTED_ADDRESS`
- **Function**: `setValue(uint256)`
- **Args**: `[42]`
- **Value**: `0`

**Action 3 - Set Config**
- **Target**: `$PREDICTED_ADDRESS`
- **Function**: `setConfig(bytes32,uint256)`
- **Args**: `[keccak256("maxStep"), 3]`
- **Value**: `0`

**Action 4 - Use Contract**
- **Target**: `$PREDICTED_ADDRESS`
- **Function**: `inc(uint256)`
- **Args**: `[1]`
- **Value**: `0`

## Advanced Usage

### Deploy Different Contract Types

```bash
# Deploy ERC20 token
export TARGET="ERC20Token"
export ARGS='["MyToken", "MTK", 18]'
pnpm hardhat run scripts/buildInitcode.ts --network sepolia

# Deploy with ETH
export TARGET="PayableContract"
export ARGS='[1000000000000000000]'  # 1 ETH in wei
# Set Value to 1000000000000000000 in Tally proposal
```

### CREATE vs CREATE2

- **CREATE**: Non-deterministic addresses, can deploy multiple times
- **CREATE2**: Deterministic addresses, same salt+initcode = same address

```bash
# For CREATE (non-deterministic)
# Use deploy(bytes) function instead of deployCreate2(bytes32,bytes)
```

## Contract Functions

### BytecodeFactory

- `deploy(bytes initcode)` - Deploy using CREATE
- `deployCreate2(bytes32 salt, bytes initcode)` - Deploy using CREATE2
- `computeAddress(bytes32 salt, bytes initcode)` - Predict CREATE2 address
- `initcodeHash(bytes initcode)` - Get initcode hash
- `acceptOwnership()` - Accept ownership transfer (Timelock only)

### Counter (Example)

- `inc(uint256 by)` - Increment counter
- `setValue(uint256 newValue)` - Set counter value
- `setConfig(bytes32 key, uint256 value)` - Set configuration
- `setOwner(address newOwner)` - Change owner

## Safety Features

- **Ownable2Step**: Secure ownership transfer requiring explicit acceptance
- **Only Owner**: Only Timelock can deploy contracts after ownership transfer
- **ETH Forwarding**: Supports payable constructors
- **Error Handling**: Reverts on empty initcode or failed deployment
- **Event Logging**: All deployments are logged with salt and value

## Troubleshooting

- **Compilation Errors**: Ensure Solidity 0.8.24+ and OpenZeppelin contracts
- **Ownership Issues**: Verify Timelock has accepted ownership
- **Address Mismatch**: Check salt string and initcode match exactly
- **Deployment Fails**: Verify initcode is valid and constructor args are correct

## Examples

### Deploy Counter with Chained Actions

```bash
# 1. Build initcode
export TARGET="Counter"
export ARGS='[0,"'$TIMELOCK_ADDRESS'"]'
pnpm hardhat run scripts/buildInitcode.ts --network sepolia

# 2. Compute address
export SALT_STRING="my-counter"
pnpm hardhat run scripts/computeCreate2Address.ts --network sepolia

# 3. Create Tally proposal with 4 actions:
#    - Deploy Counter
#    - Set value to 42
#    - Set config maxStep=3
#    - Increment by 1
```

### Deploy ERC20 Token

```bash
# 1. Build initcode for ERC20
export TARGET="ERC20Token"
export ARGS='["MyDAO Token", "MDT", 18]'
pnpm hardhat run scripts/buildInitcode.ts --network sepolia

# 2. Compute address
export SALT_STRING="dao-token"
pnpm hardhat run scripts/computeCreate2Address.ts --network sepolia

# 3. Create proposal to deploy and mint initial supply
```

This system provides maximum flexibility for DAO governance while maintaining security through proper ownership controls.
