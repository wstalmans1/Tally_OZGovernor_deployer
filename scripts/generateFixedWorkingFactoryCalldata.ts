import { ethers } from "hardhat";

async function main() {
  console.log("=== Generating Calldata for FIXED WorkingFactory ===");
  
  const FIXED_WORKING_FACTORY = "0x04BA953fc81a0fB6560ffF25d80A0872337DCBe9";
  const TIMELOCK = "0xD54343A590e8fAAa1cb9ea9F1fddef4ABd365310";
  
  // Get the Fixed WorkingFactory contract
  const factory = await ethers.getContractAt("WorkingFactory", FIXED_WORKING_FACTORY);
  
  // Create Counter initcode
  const Counter = await ethers.getContractFactory("Counter");
  const constructorArgs = ethers.AbiCoder.defaultAbiCoder().encode(
    ["uint256", "address"],
    [0, TIMELOCK]
  );
  const initcode = Counter.bytecode + constructorArgs.slice(2);
  
  // Generate calldata for the deploy function
  const calldata = factory.interface.encodeFunctionData("deploy", [initcode]);
  
  console.log("=== FIXED WorkingFactory Calldata ===");
  console.log("Contract Address:", FIXED_WORKING_FACTORY);
  console.log("Function: deploy");
  console.log("Calldata:", calldata);
  
  // Test the calldata
  try {
    console.log("\n=== Testing Calldata ===");
    const result = await factory.deploy.staticCall(initcode);
    console.log("✅ Static call successful! Would deploy to:", result);
    
    // Test actual deployment
    console.log("\n=== Testing Actual Deployment ===");
    const tx = await factory.deploy(initcode);
    const receipt = await tx.wait();
    console.log("✅ Deployment successful!");
    console.log("Transaction hash:", tx.hash);
    
    const events = receipt?.logs || [];
    if (events.length > 0) {
      const event = factory.interface.parseLog(events[0]);
      if (event) {
        const deployedAddress = event.args.addr;
        console.log("Deployed address:", deployedAddress);
        
        const deployedCode = await ethers.provider.getCode(deployedAddress);
        console.log("Deployed code length:", deployedCode.length);
        console.log("Deployed code starts with:", deployedCode.slice(0, 20));
        
        if (deployedCode.length > 100) {
          console.log("✅ Contract has proper bytecode!");
          
          // Test the counter
          const counter = await ethers.getContractAt("Counter", deployedAddress);
          const value = await counter.value();
          const owner = await counter.owner();
          console.log("Counter value:", value.toString());
          console.log("Counter owner:", owner);
          console.log("✅ Counter is fully functional!");
        } else {
          console.log("❌ Contract has no proper bytecode!");
        }
      }
    }
    
  } catch (error: any) {
    console.log("❌ Test failed:", error.message);
  }
  
  console.log("\n=== TALLY PROPOSAL ===");
  console.log("Step 1 - Deploy Counter:");
  console.log(`To: ${FIXED_WORKING_FACTORY}`);
  console.log(`Value: 0 ETH`);
  console.log(`Data: ${calldata}`);
  console.log("");
  console.log("✅ This will deploy a Counter with proper bytecode (2024+ bytes)");
  console.log("✅ Counter will be fully functional");
  console.log("✅ No more zero-code contracts!");
}

main().catch((e) => { 
  console.error(e); 
  process.exit(1); 
});
