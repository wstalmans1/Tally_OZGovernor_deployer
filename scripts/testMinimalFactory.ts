import { ethers } from "hardhat";

async function main() {
  console.log("=== Testing MinimalFactory ===");
  
  const TIMELOCK = "0xD54343A590e8fAAa1cb9ea9F1fddef4ABd365310";
  
  // Deploy MinimalFactory
  const MinimalFactory = await ethers.getContractFactory("MinimalFactory");
  const factory = await MinimalFactory.deploy(TIMELOCK);
  await factory.waitForDeployment();
  
  const factoryAddress = await factory.getAddress();
  console.log("MinimalFactory deployed at:", factoryAddress);
  
  // Test the factory
  console.log("\n=== Testing MinimalFactory ===");
  
  // Create Counter initcode
  const Counter = await ethers.getContractFactory("Counter");
  const constructorArgs = ethers.AbiCoder.defaultAbiCoder().encode(
    ["uint256", "address"],
    [0, TIMELOCK]
  );
  const initcode = Counter.bytecode + constructorArgs.slice(2);
  
  console.log("Initcode length:", initcode.length);
  
  // Test from Timelock address
  try {
    console.log("\n--- Testing from Timelock address ---");
    const factoryAsTimelock = factory.connect(await ethers.getSigner(TIMELOCK));
    const result = await factoryAsTimelock.deploy.staticCall(initcode);
    console.log("✅ Deploy from Timelock works! Would deploy to:", result);
  } catch (error: any) {
    console.log("❌ Deploy from Timelock failed:", error.message);
  }
  
  // Test actual deployment from Timelock
  try {
    console.log("\n--- Testing actual deployment from Timelock ---");
    const factoryAsTimelock = factory.connect(await ethers.getSigner(TIMELOCK));
    const tx = await factoryAsTimelock.deploy(initcode);
    const receipt = await tx.wait();
    console.log("✅ Actual deployment successful!");
    console.log("Transaction hash:", tx.hash);
    console.log("Gas used:", receipt?.gasUsed.toString());
    
    // Check the deployed contract
    const events = receipt?.logs || [];
    if (events.length > 0) {
      const event = factory.interface.parseLog(events[0]);
      if (event) {
        console.log("Deployed address:", event.args.addr);
        console.log("Value sent:", event.args.value.toString());
        
        // Test the deployed counter
        const counter = await ethers.getContractAt("Counter", event.args.addr);
        const value = await counter.value();
        const owner = await counter.owner();
        console.log("Counter value:", value.toString());
        console.log("Counter owner:", owner);
      }
    }
    
  } catch (actualError: any) {
    console.log("❌ Actual deployment failed:", actualError.message);
  }
  
  // Test from current signer (should fail)
  try {
    console.log("\n--- Testing from current signer (should fail) ---");
    const result = await factory.deploy.staticCall(initcode);
    console.log("✅ Deploy from current signer works! Would deploy to:", result);
  } catch (error: any) {
    console.log("❌ Deploy from current signer failed:", error.message);
    if (error.message.includes("Ownable: caller is not the owner")) {
      console.log("🔍 DIAGNOSIS: This is expected - caller is not the owner");
    }
  }
}

main().catch((e) => { 
  console.error(e); 
  process.exit(1); 
});
