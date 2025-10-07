import { ethers } from "hardhat";

async function main() {
  console.log("=== Deploying New Fixed BytecodeFactory ===");
  
  const TIMELOCK = "0xD54343A590e8fAAa1cb9ea9F1fddef4ABd365310";
  
  console.log("Timelock address:", TIMELOCK);
  
  // Deploy the new BytecodeFactory
  const BytecodeFactory = await ethers.getContractFactory("BytecodeFactory");
  const factory = await BytecodeFactory.deploy(TIMELOCK);
  await factory.waitForDeployment();
  
  const factoryAddress = await factory.getAddress();
  console.log("New BytecodeFactory deployed at:", factoryAddress);
  
  // Test the new contract
  console.log("\n=== Testing New Contract ===");
  
  // Create Counter initcode
  const Counter = await ethers.getContractFactory("Counter");
  const constructorArgs = ethers.AbiCoder.defaultAbiCoder().encode(
    ["uint256", "address"],
    [0, TIMELOCK]
  );
  const initcode = Counter.bytecode + constructorArgs.slice(2);
  
  // Test basic deploy function
  try {
    const deployResult = await factory.deploy.staticCall(initcode);
    console.log("✅ Basic deploy function works! Would deploy to:", deployResult);
  } catch (deployError: any) {
    console.log("❌ Basic deploy function failed:", deployError.message);
  }
  
  // Test deployAndRegister function
  const CONTRACT_REGISTRY = "0x793DB78E2d4dD68564735743FABc45482e6B9eeB";
  const KIND = ethers.keccak256(ethers.toUtf8Bytes("Counter"));
  const VERSION = 1;
  const LABEL = "Counter v1.0";
  const URI = "https://github.com/your-org/counter-contract";
  
  try {
    const result = await factory.deployAndRegister.staticCall(
      initcode,
      CONTRACT_REGISTRY,
      KIND,
      VERSION,
      LABEL,
      URI
    );
    console.log("✅ deployAndRegister function works! Would deploy to:", result);
  } catch (error: any) {
    console.log("❌ deployAndRegister function failed:", error.message);
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
  
  // Verify the contract
  console.log("\n=== Verifying Contract ===");
  try {
    await hre.run("verify:verify", {
      address: factoryAddress,
      constructorArguments: [TIMELOCK],
    });
    console.log("✅ Contract verified on Etherscan");
  } catch (verifyError: any) {
    console.log("❌ Verification failed:", verifyError.message);
  }
  
  console.log("\n=== Next Steps ===");
  console.log("1. Use the new factory address in Tally:", factoryAddress);
  console.log("2. Update the initcode and calldata for the new factory");
  console.log("3. Test the Tenderly simulation with the new factory");
}

main().catch((e) => { 
  console.error(e); 
  process.exit(1); 
});
