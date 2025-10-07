import { ethers } from "hardhat";

async function main() {
  console.log("=== Simple Counter Deploy Test ===");
  
  // Contract addresses
  const BYTECODE_FACTORY = "0x596E8CC6e08aA684FFf78FdBF7E5146386ff76A0";
  const CONTRACT_REGISTRY = "0x793DB78E2d4dD68564735743FABc45482e6B9eeB";
  const TIMELOCK = "0xD54343A590e8fAAa1cb9ea9F1fddef4ABd365310";
  
  // Get contracts
  const factory = await ethers.getContractAt("BytecodeFactory", BYTECODE_FACTORY);
  const registry = await ethers.getContractAt("ContractRegistry", CONTRACT_REGISTRY);
  
  console.log("=== Contract States ===");
  console.log("Factory owner:", await factory.owner());
  console.log("Factory owned by Timelock:", (await factory.owner()).toLowerCase() === TIMELOCK.toLowerCase());
  
  // Check registry permissions
  const hasRole = await registry.hasRole(await registry.REGISTRAR_ROLE(), BYTECODE_FACTORY);
  console.log("Factory has REGISTRAR_ROLE:", hasRole);
  
  // Create Counter initcode
  const Counter = await ethers.getContractFactory("Counter");
  const constructorArgs = ethers.AbiCoder.defaultAbiCoder().encode(
    ["uint256", "address"],
    [0, TIMELOCK]
  );
  const initcode = Counter.bytecode + constructorArgs.slice(2);
  
  // Registry parameters
  const KIND = ethers.keccak256(ethers.toUtf8Bytes("Counter"));
  const VERSION = 1;
  const LABEL = "Counter v1.0";
  const URI = "https://github.com/your-org/counter-contract";
  
  console.log("\n=== Testing Function Call ===");
  
  try {
    // Test without from parameter
    const result = await factory.deployAndRegister.staticCall(
      initcode,
      CONTRACT_REGISTRY,
      KIND,
      VERSION,
      LABEL,
      URI
    );
    console.log("✅ Static call successful! Deployed address would be:", result);
  } catch (error: any) {
    console.log("❌ Static call failed:", error.message);
    
    // Check for specific error patterns
    if (error.message.includes("Ownable: caller is not the owner")) {
      console.log("🔍 DIAGNOSIS: Ownership issue - caller is not the owner");
    } else if (error.message.includes("EmptyInitcode")) {
      console.log("🔍 DIAGNOSIS: Empty initcode");
    } else if (error.message.includes("DeployFailed")) {
      console.log("🔍 DIAGNOSIS: Deployment failed");
    } else if (error.message.includes("AccessControl")) {
      console.log("🔍 DIAGNOSIS: Access control issue");
    } else if (error.message.includes("execution reverted")) {
      console.log("🔍 DIAGNOSIS: Execution reverted - check contract logic");
    } else {
      console.log("🔍 DIAGNOSIS: Unknown error");
    }
  }
  
  // Try gas estimation
  try {
    const gasEstimate = await factory.deployAndRegister.estimateGas(
      initcode,
      CONTRACT_REGISTRY,
      KIND,
      VERSION,
      LABEL,
      URI
    );
    console.log("✅ Gas estimate:", gasEstimate.toString());
  } catch (gasError: any) {
    console.log("❌ Gas estimation failed:", gasError.message);
  }
  
  // Check if the issue is with the initcode
  console.log("\n=== Initcode Analysis ===");
  console.log("Initcode length:", initcode.length);
  console.log("Bytecode length:", Counter.bytecode.length);
  console.log("Constructor args length:", constructorArgs.length);
  
  // Try to deploy Counter directly to see if it works
  try {
    console.log("\n=== Testing Direct Counter Deployment ===");
    const counter = await Counter.deploy(0, TIMELOCK);
    await counter.waitForDeployment();
    const address = await counter.getAddress();
    console.log("✅ Direct Counter deployment successful:", address);
  } catch (directError: any) {
    console.log("❌ Direct Counter deployment failed:", directError.message);
  }
}

main().catch((e) => { 
  console.error(e); 
  process.exit(1); 
});
