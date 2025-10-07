import { ethers } from "hardhat";

async function main() {
  console.log("=== Simple Tally Proposal for Counter Deployment ===");
  
  // Contract addresses
  const BYTECODE_FACTORY = "0x596E8CC6e08aA684FFf78FdBF7E5146386ff76A0";
  const CONTRACT_REGISTRY = "0x793DB78E2d4dD68564735743FABc45482e6B9eeB";
  
  // Counter constructor parameters
  const INITIAL_VALUE = 0;
  const COUNTER_OWNER = "0xD54343A590e8fAAa1cb9ea9F1fddef4ABd365310";
  
  // Get the Counter contract factory
  const Counter = await ethers.getContractFactory("Counter");
  
  // Encode constructor arguments
  const constructorArgs = ethers.AbiCoder.defaultAbiCoder().encode(
    ["uint256", "address"],
    [INITIAL_VALUE, COUNTER_OWNER]
  );
  
  // Create initcode
  const initcode = Counter.bytecode + constructorArgs.slice(2);
  
  // Registry parameters
  const KIND = ethers.keccak256(ethers.toUtf8Bytes("Counter"));
  const VERSION = 1;
  const LABEL = "Counter v1.0";
  const URI = "https://github.com/your-org/counter-contract";
  
  console.log("\n=== Tally Proposal ===");
  console.log("Target:", BYTECODE_FACTORY);
  console.log("Function: deployAndRegister");
  console.log("Value: 0");
  console.log("\n=== Parameters ===");
  console.log("initcode:", initcode);
  console.log("registry:", CONTRACT_REGISTRY);
  console.log("kind:", KIND);
  console.log("version:", VERSION);
  console.log("label:", LABEL);
  console.log("uri:", URI);
  
  // Try different initcode formats
  console.log("\n=== Alternative initcode formats ===");
  console.log("Without 0x prefix:", initcode.slice(2));
  console.log("As bytes array:", `[${initcode.slice(2).match(/.{2}/g)?.join(',')}]`);
}

main().catch(console.error);
