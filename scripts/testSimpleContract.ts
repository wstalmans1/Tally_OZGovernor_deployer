import { ethers } from "hardhat";

async function main() {
  console.log("=== Testing Simple Contract with BytecodeFactory ===");
  
  const TIMELOCK = "0xD54343A590e8fAAa1cb9ea9F1fddef4ABd365310";
  const factoryAddress = "0xcee1062c24182cC9C7d662DF1Ff0e43e8204Bc6b";
  
  // Get contracts
  const factory = await ethers.getContractAt("BytecodeFactory", factoryAddress);
  const SimpleCounter = await ethers.getContractFactory("SimpleCounter");
  
  console.log("=== Factory State ===");
  console.log("Factory owner:", await factory.owner());
  console.log("Factory owned by Timelock:", (await factory.owner()).toLowerCase() === TIMELOCK.toLowerCase());
  
  // Create SimpleCounter initcode
  const constructorArgs = ethers.AbiCoder.defaultAbiCoder().encode(
    ["uint256", "address"],
    [0, TIMELOCK]
  );
  const initcode = SimpleCounter.bytecode + constructorArgs.slice(2);
  
  console.log("\n=== SimpleCounter Initcode ===");
  console.log("Bytecode length:", SimpleCounter.bytecode.length);
  console.log("Constructor args length:", constructorArgs.length);
  console.log("Initcode length:", initcode.length);
  
  // Test basic deploy function
  try {
    console.log("\n=== Testing Basic Deploy ===");
    const deployResult = await factory.deploy.staticCall(initcode);
    console.log("✅ Basic deploy works! Would deploy to:", deployResult);
  } catch (deployError: any) {
    console.log("❌ Basic deploy failed:", deployError.message);
  }
  
  // Test deployAndRegister function
  const CONTRACT_REGISTRY = "0x793DB78E2d4dD68564735743FABc45482e6B9eeB";
  const KIND = ethers.keccak256(ethers.toUtf8Bytes("SimpleCounter"));
  const VERSION = 1;
  const LABEL = "SimpleCounter v1.0";
  const URI = "https://github.com/your-org/simple-counter-contract";
  
  try {
    console.log("\n=== Testing DeployAndRegister ===");
    const result = await factory.deployAndRegister.staticCall(
      initcode,
      CONTRACT_REGISTRY,
      KIND,
      VERSION,
      LABEL,
      URI
    );
    console.log("✅ deployAndRegister works! Would deploy to:", result);
  } catch (error: any) {
    console.log("❌ deployAndRegister failed:", error.message);
  }
  
  // Try gas estimation
  try {
    console.log("\n=== Testing Gas Estimation ===");
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
  
  // Test direct SimpleCounter deployment
  try {
    console.log("\n=== Testing Direct SimpleCounter Deployment ===");
    const simpleCounter = await SimpleCounter.deploy(0, TIMELOCK);
    await simpleCounter.waitForDeployment();
    const address = await simpleCounter.getAddress();
    console.log("✅ Direct SimpleCounter deployment successful:", address);
    
    const value = await simpleCounter.value();
    const owner = await simpleCounter.owner();
    console.log("SimpleCounter value:", value.toString());
    console.log("SimpleCounter owner:", owner);
    
  } catch (directError: any) {
    console.log("❌ Direct SimpleCounter deployment failed:", directError.message);
  }
}

main().catch((e) => { 
  console.error(e); 
  process.exit(1); 
});
