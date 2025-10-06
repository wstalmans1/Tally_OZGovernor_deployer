# BytecodeFactory + Registry – DAO Deploy-and-Register System

This implementation provides a **DAO-owned factory** that can deploy **any contract** via CREATE or CREATE2, with support for chaining follow-up actions in the same Tally proposal. It now includes a **ContractRegistry** so every deployment can be recorded on-chain in the same action.

## Overview

- **`BytecodeFactory.sol`**: General-purpose factory owned by Timelock for deploying any contract
- **`ContractRegistry.sol`**: On-chain index of DAO deployments (writeable via role)
- **`IContractRegistry.sol`**: Minimal registry interface used by the factory
- **`Kinds.sol`**: Common `bytes32` tags to categorize deployments
- **`Counter.sol`**: Example contract for demonstration
- **Scripts**: Deploy factory, build initcode for any contract, compute CREATE2 addresses

## Key Features

- ✅ **Deploy ANY contract** (not just Counter)
- ✅ **CREATE and CREATE2** support for deterministic addresses
- ✅ **Ownable2Step** for secure ownership transfer to DAO
- ✅ **ETH forwarding** to contract constructors
- ✅ **Same-proposal chaining** - deploy and configure in one proposal
- ✅ **On-chain registry** - deploy + register in one call
- ✅ **Gas efficient** - uses raw assembly for deployment

## Quick Start (How-To)

### 1. Set Environment Variables

```bash
export ALCHEMY_SEPOLIA_RPC="https://eth-sepolia.g.alchemy.com/v2/YOUR_API_KEY"
export DEPLOYER_PK="0xYOUR_PRIVATE_KEY"
export ETHERSCAN_API_KEY="YOUR_ETHERSCAN_KEY"
export TIMELOCK_ADDRESS="0xYourDaoTimelock"
```

### 2. Deploy (or Re-deploy) the Factory

```bash
# Compile contracts
pnpm hardhat compile

# Deploy BytecodeFactory (sets Timelock as owner immediately)
pnpm hardhat run scripts/deployBytecodeFactory.ts --network sepolia

# Save the factory address
export FACTORY_ADDRESS="0x...printed..."

# Verify the factory (Blockscout)
pnpm hardhat verify --network sepolia $FACTORY_ADDRESS $TIMELOCK_ADDRESS

# (Optional) Verify on Etherscan too
# We force Etherscan verification by using a dedicated config at runtime
npx hardhat verify --config hardhat.config.etherscan.ts --network sepolia $FACTORY_ADDRESS $TIMELOCK_ADDRESS
```

Note: The factory constructor sets the Timelock as owner immediately, so no ownership transfer step is required.

### 3. Deploy the Registry and Grant Role

```bash
# Deploy ContractRegistry with Timelock as DEFAULT_ADMIN_ROLE
pnpm hardhat run scripts/deployRegistry.ts --network sepolia

# Save the printed registry address
export REGISTRY_ADDRESS="0x...printed..."

# Grant the REGISTRAR_ROLE to the factory (must be executed by Timelock/admin)
REGISTRY_ADDRESS=$REGISTRY_ADDRESS FACTORY_ADDRESS=$FACTORY_ADDRESS \
pnpm hardhat run scripts/grantRegistrar.ts --network sepolia

# If governance controls the admin, do it via a Tally proposal:
#   ContractRegistry.grantRole(keccak256("REGISTRAR_ROLE"), $FACTORY_ADDRESS)
```

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

### Step 3A: Single-call Deploy + Register (recommended)

Call the factory’s register-enabled deployer:

- **Target**: `$FACTORY_ADDRESS`
- **Function**: `deployCreate2AndRegister(bytes32,bytes,address,bytes32,uint64,string,string)`
- **Args**:
  - `salt`: `keccak256(utf8("counter-1"))`
  - `initcode`: `$INITCODE`
  - `registry`: `$REGISTRY_ADDRESS`
  - `kind`: `keccak256("COUNTER")` (or use constant from `Kinds.sol` when encoding off-chain)
  - `version`: `1`
  - `label`: `"Counter #1"`
  - `uri`: `"ipfs://..."`
- **Value**: `0`

Optionally add follow-up actions (e.g., `setValue`, `setConfig`, `inc`) using the predicted address.

### Step 3B: Chained Actions (manual register alternative)

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

Add a separate action to call `ContractRegistry.register(...)` if you prefer explicit registration instead of the factory’s combined method.

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
- `deployCreate2AndRegister(bytes32 salt, bytes initcode, address registry, bytes32 kind, uint64 version, string label, string uri)` - Deploy and record in registry in one call
- `computeAddress(bytes32 salt, bytes initcode)` - Predict CREATE2 address
- `initcodeHash(bytes initcode)` - Get initcode hash
- `acceptOwnership()` - Accept ownership transfer (Timelock only)

### ContractRegistry

- `register(address addr, bytes32 kind, address factory, bytes32 salt, bytes32 initCodeHash, uint64 version, string label, string uri)`
- `updateURI(address addr, string newURI)` (admin only)
- `updateLabel(address addr, string newLabel)` (admin only)
- `setDeprecated(address addr, bool)` (admin only)

Views:
- `getByAddress(address)` returns full stored entry
- `listByKind(bytes32)` returns addresses
- `getLatest(bytes32)` returns latest address for a kind
- `getBySalt(bytes32)` returns address deployed with a specific salt

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
- **Registry writes revert**: Ensure Factory has `REGISTRAR_ROLE` on the registry and the Timelock is calling the factory method.

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

---

## TODO / Ops Checklist

- [ ] Deploy `BytecodeFactory` with `TIMELOCK_ADDRESS`
- [ ] Verify on Blockscout (and Etherscan if desired)
- [ ] Deploy `ContractRegistry` with `TIMELOCK_ADDRESS`
- [ ] Grant `REGISTRAR_ROLE` to `FACTORY_ADDRESS`
- [ ] Build `INITCODE` for target contract
- [ ] Compute predicted `CREATE2` address
- [ ] Create Tally proposal calling `deployCreate2AndRegister(...)`
- [ ] (Optional) Add follow-up configuration actions in the same proposal
