// make_proposal_payload.ts
import { encodeFunctionData, encodeAbiParameters, parseAbi, parseAbiParameters, concat, keccak256, toBytes, hexToSignature, toHex } from 'viem';
import { ethers } from 'ethers';

async function main() {
const SINGLETON_FACTORY = '0xce0042B868300000d44A59004Da54A005ffdcf9f';
const TIMELOCK = '0xD54343A590e8fAAa1cb9ea9F1fddef4ABd365310';               // <-- actual timelock address
const COUNTER_BYTECODE = '0x608060405234801561001057600080fd5b5060405161030038038061030083398101604081905261002f916100be565b806001600160a01b03811661005e57604051631e4fbdf760e01b81526000600482015260240160405180910390fd5b6100678161006e565b50506100ee565b600080546001600160a01b038381166001600160a01b0319831681178455604051919092169283917f8be0079c531659141344cd1fd0a4f28419497f9722a3daafe3b4186f6b6457e09190a35050565b6000602082840312156100d057600080fd5b81516001600160a01b03811681146100e757600080fd5b9392505050565b610203806100fd6000396000f3fe608060405234801561001057600080fd5b50600436106100675760003560e01c80638da5cb5b116100505780638da5cb5b14610092578063d09de08a146100ad578063f2fde38b146100b557600080fd5b80633fa4f2451461006c578063715018a614610088575b600080fd5b61007560015481565b6040519081526020015b60405180910390f35b6100906100c8565b005b6000546040516001600160a01b03909116815260200161007f565b6100906100dc565b6100906100c33660046101c6565b6100ee565b6100d0610131565b6100da600061015e565b565b6100e4610131565b6001805481019055565b6100f6610131565b6001600160a01b03811661012557604051631e4fbdf760e01b8152600060048201526024015b60405180910390fd5b61012e8161015e565b50565b6000546001600160a01b038381167fffffffffffffffffffffffff0000000000000000000000000000000000000000831681178455604051919092169283917f8be0079c531659141344cd1fd0a4f28419497f9722a3daafe3b4186f6b6457e09190a35050565b6000602082840312156101d857600080fd5b81356001600160a01b03811681146101ef57600080fd5b939250505056fea164736f6c6343000814000a';

// 1) encode constructor(address timelock)
const ctorArgs = encodeAbiParameters(parseAbiParameters('address'), [TIMELOCK]);

// 2) initCode = creation bytecode ++ ctorArgs
const initCode = concat([COUNTER_BYTECODE, ctorArgs]);

// 3) pick a salt (unique, deterministic)
const salt = keccak256(toBytes('DAO:Counter:v1'));       // or include proposalId, chainId, etc.

// 4) calldata for SingletonFactory.deploy(bytes,bytes32)
const factoryAbi = parseAbi([
  'function deploy(bytes initCode, bytes32 salt) payable returns (address createdContract)'
]);
const deployCalldata = encodeFunctionData({
  abi: factoryAbi,
  functionName: 'deploy',
  args: [initCode, salt],
});

// 5) predict the address (CREATE2)
const create2Addr = (() => {
  const prefix = '0xff';
  const parts = [
    SINGLETON_FACTORY,
    salt,
    keccak256(initCode)
  ].map(x => x.replace(/^0x/, ''));
  const hash = keccak256(`0x${prefix}${parts.join('')}`);
  return `0x${hash.slice(26)}`; // last 20 bytes
})();

console.log('Predicted Counter address:', create2Addr);
console.log('targets  =', JSON.stringify([SINGLETON_FACTORY]));
console.log('values   =', JSON.stringify([0]));
console.log('calldatas=', JSON.stringify([deployCalldata]));
console.log('\n=== RECOMMENDED GAS LIMIT ===');
console.log('Execute Gas Limit: 1,000,000 (NOT 55M!)');
console.log('This should be set in Tally when executing the proposal');
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
