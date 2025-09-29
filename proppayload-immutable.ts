// make_proposal_payload_immutable.ts
import { encodeFunctionData, encodeAbiParameters, parseAbi, parseAbiParameters, concat, keccak256, toBytes, hexToSignature, toHex } from 'viem';
import { ethers } from 'ethers';

async function main() {
const IMMUTABLE_FACTORY = '0x0000000000FFe8B47B3e2130213B802212439497';
const TIMELOCK = '0xD54343A590e8fAAa1cb9ea9F1fddef4ABd365310';
const COUNTER_BYTECODE = '0x608060405234801561001057600080fd5b5060405161030038038061030083398101604081905261002f916100be565b806001600160a01b03811661005e57604051631e4fbdf760e01b81526000600482015260240160405180910390fd5b6100678161006e565b50506100ee565b600080546001600160a01b038381166001600160a01b0319831681178455604051919092169283917f8be0079c531659141344cd1fd0a4f28419497f9722a3daafe3b4186f6b6457e09190a35050565b6000602082840312156100d057600080fd5b81516001600160a01b03811681146100e757600080fd5b9392505050565b610203806100fd6000396000f3fe608060405234801561001057600080fd5b50600436106100676760003560e01c80638da5cb5b116100505780638da5cb5b14610092578063d09de08a146100ad578063f2fde38b146100b557600080fd5b80633fa4f2451461006c578063715018a614610088575b600080fd5b61007560015481565b6040519081526020015b60405180910390f35b6100906100c8565b005b6000546040516001600160a01b03909116815260200161007f565b6100906100dc565b6100906100c33660046101c6565b6100ee565b6100d0610131565b6100da600061015e565b565b6100e4610131565b6001805481019055565b6100f6610131565b6001600160a01b03811661012557604051631e4fbdf760e01b8152600060048201526024015b60405180910390fd5b61012e8161015e565b50565b6000546001600160a01b038381167fffffffffffffffffffffffff0000000000000000000000000000000000000000831681178455604051919092169283917f8be0079c531659141344cd1fd0a4f28419497f9722a3daafe3b4186f6b6457e09190a35050565b6000602082840312156101d857600080fd5b81356001600160a01b03811681146101ef57600080fd5b939250505056fea164736f6c6343000814000a';

// 1) ABI-encode the constructor(address) - THIS IS THE KEY FIX!
const ctorArgs = encodeAbiParameters(parseAbiParameters('address'), [TIMELOCK]);

// 2) initCode = creation bytecode ++ ABI-encoded constructor args
const initCode = concat([COUNTER_BYTECODE, ctorArgs]);

// 3) pick a salt (unique, deterministic) - FIRST 20 BYTES MUST MATCH CALLING ADDRESS
const timelockAddress = TIMELOCK.replace('0x', '').toLowerCase();
const saltPrefix = timelockAddress; // First 20 bytes = calling address
const saltSuffix = keccak256(toBytes('DAO:Counter:v1')).slice(2, 26); // Remaining 12 bytes (24 hex chars)
const salt = `0x${saltPrefix}${saltSuffix}`;

// 4) calldata for ImmutableCreate2Factory.safeCreate2(bytes32,bytes)
const factoryAbi = parseAbi([
  'function safeCreate2(bytes32 salt, bytes initializationCode) payable returns (address)'
]);
const deployCalldata = encodeFunctionData({
  abi: factoryAbi,
  functionName: 'safeCreate2',
  args: [salt, initCode],  // salt first, then initCode
});

// 5) predict the address (CREATE2) - same calculation as before
const create2Addr = (() => {
  const prefix = '0xff';
  const parts = [
    IMMUTABLE_FACTORY,
    salt,
    keccak256(initCode)
  ].map(x => x.replace(/^0x/, ''));
  const hash = keccak256(`0x${prefix}${parts.join('')}`);
  return `0x${hash.slice(26)}`; // last 20 bytes
})();

console.log('=== IMMUTABLE CREATE2 FACTORY ===');
console.log('Factory Address:', IMMUTABLE_FACTORY);
console.log('Predicted Counter address:', create2Addr);
console.log('targets  =', JSON.stringify([IMMUTABLE_FACTORY]));
console.log('values   =', JSON.stringify([0]));
console.log('calldatas=', JSON.stringify([deployCalldata]));
console.log('\n=== RECOMMENDED GAS LIMIT ===');
console.log('Execute Gas Limit: 1,000,000 (NOT 55M!)');
console.log('This should be set in Tally when executing the proposal');
console.log('\n=== SALT & INITCODE FOR TALLY ===');
console.log('Salt:', salt);
console.log('InitCode:', initCode);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });