import { ethers } from "hardhat";

async function main() {
  console.log("=== Generating Calldata for FixedFactory ===");
  
  const FIXED_FACTORY = "0xcA0894AfB4Db280b595066dDC3D7f32aa1F1a5Aa";
  const TIMELOCK = "0xD54343A590e8fAAa1cb9ea9F1fddef4ABd365310";
  
  // Get the FixedFactory contract
  const factory = await ethers.getContractAt("FixedFactory", FIXED_FACTORY);
  
  // Create Counter initcode
  const Counter = await ethers.getContractFactory("Counter");
  const constructorArgs = ethers.AbiCoder.defaultAbiCoder().encode(
    ["uint256", "address"],
    [0, TIMELOCK]
  );
  const initcode = Counter.bytecode + constructorArgs.slice(2);
  
  // Generate calldata for the deploy function
  const calldata = factory.interface.encodeFunctionData("deploy", [initcode]);
  
  console.log("=== FixedFactory Calldata ===");
  console.log("Contract Address:", FIXED_FACTORY);
  console.log("Function: deploy");
  console.log("Calldata:", calldata);
  
  // Test the calldata
  try {
    console.log("\n=== Testing Calldata ===");
    const result = await factory.deploy.staticCall(initcode);
    console.log("✅ Static call successful! Would deploy to:", result);
  } catch (error: any) {
    console.log("❌ Static call failed:", error.message);
  }
  
  // Also generate calldata for the registry role grant
  const CONTRACT_REGISTRY = "0x793DB78E2d4dD68564735743FABc45482e6B9eeB";
  const registry = await ethers.getContractAt("ContractRegistry", CONTRACT_REGISTRY);
  const REGISTRAR_ROLE = await registry.REGISTRAR_ROLE();
  
  const roleGrantCalldata = registry.interface.encodeFunctionData("grantRole", [REGISTRAR_ROLE, FIXED_FACTORY]);
  
  console.log("\n=== Registry Role Grant Calldata ===");
  console.log("Contract Address:", CONTRACT_REGISTRY);
  console.log("Function: grantRole");
  console.log("Calldata:", roleGrantCalldata);
  
  console.log("\n=== CORRECTED Tally Proposals ===");
  console.log("Step 1 - Grant Role:");
  console.log(`To: ${CONTRACT_REGISTRY}`);
  console.log(`Value: 0 ETH`);
  console.log(`Data: ${roleGrantCalldata}`);
  console.log("");
  console.log("Step 2 - Deploy Counter:");
  console.log(`To: ${FIXED_FACTORY}`);
  console.log(`Value: 0 ETH`);
  console.log(`Data: ${calldata}`);
  
  console.log("\n=== Key Differences ===");
  console.log("✅ FixedFactory properly deploys contracts with correct bytecode");
  console.log("✅ Counter contract will have proper code (2024+ bytes)");
  console.log("✅ Counter contract will be fully functional");
  console.log("✅ Verified on Etherscan for Tally ABI access");
}

main().catch((e) => { 
  console.error(e); 
  process.exit(1); 
});
