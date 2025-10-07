import { ethers } from "hardhat";

async function main() {
  console.log("=== Testing TestFactory ===");
  
  const TIMELOCK = "0xD54343A590e8fAAa1cb9ea9F1fddef4ABd365310";
  
  // Deploy TestFactory
  const TestFactory = await ethers.getContractFactory("TestFactory");
  const testFactory = await TestFactory.deploy();
  await testFactory.waitForDeployment();
  
  const testFactoryAddress = await testFactory.getAddress();
  console.log("TestFactory deployed at:", testFactoryAddress);
  
  // Test assembly function first
  console.log("\n=== Testing Assembly Function ===");
  try {
    const testData = ethers.toUtf8Bytes("test data");
    const result = await testFactory.testAssembly(testData);
    console.log("✅ Assembly function works! Hash:", result);
  } catch (error: any) {
    console.log("❌ Assembly function failed:", error.message);
  }
  
  // Create SimpleCounter initcode
  const SimpleCounter = await ethers.getContractFactory("SimpleCounter");
  const constructorArgs = ethers.AbiCoder.defaultAbiCoder().encode(
    ["uint256", "address"],
    [0, TIMELOCK]
  );
  const initcode = SimpleCounter.bytecode + constructorArgs.slice(2);
  
  console.log("\n=== Testing Deploy Function ===");
  console.log("Initcode length:", initcode.length);
  
  try {
    const deployResult = await testFactory.deploy.staticCall(initcode);
    console.log("✅ Deploy function works! Would deploy to:", deployResult);
  } catch (deployError: any) {
    console.log("❌ Deploy function failed:", deployError.message);
    
    // Try to get more details about the error
    try {
      const gasEstimate = await testFactory.deploy.estimateGas(initcode);
      console.log("Gas estimate:", gasEstimate.toString());
    } catch (gasError: any) {
      console.log("Gas estimation failed:", gasError.message);
    }
  }
  
  // Try actual deployment
  try {
    console.log("\n=== Testing Actual Deployment ===");
    const tx = await testFactory.deploy(initcode);
    const receipt = await tx.wait();
    console.log("✅ Actual deployment successful!");
    console.log("Transaction hash:", tx.hash);
    console.log("Gas used:", receipt?.gasUsed.toString());
    
    // Check the deployed contract
    const events = receipt?.logs || [];
    if (events.length > 0) {
      const event = testFactory.interface.parseLog(events[0]);
      if (event) {
        console.log("Deployed address:", event.args.addr);
        console.log("Value sent:", event.args.value.toString());
      }
    }
    
  } catch (actualError: any) {
    console.log("❌ Actual deployment failed:", actualError.message);
  }
}

main().catch((e) => { 
  console.error(e); 
  process.exit(1); 
});
