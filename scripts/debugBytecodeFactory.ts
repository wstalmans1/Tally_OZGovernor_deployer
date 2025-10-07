import { ethers } from "hardhat";

async function main() {
  console.log("=== Debugging BytecodeFactory ===");
  
  const TIMELOCK = "0xD54343A590e8fAAa1cb9ea9F1fddef4ABd365310";
  const factoryAddress = "0xcee1062c24182cC9C7d662DF1Ff0e43e8204Bc6b";
  
  // Get factory contract
  const factory = await ethers.getContractAt("BytecodeFactory", factoryAddress);
  
  console.log("=== Factory State ===");
  console.log("Factory owner:", await factory.owner());
  console.log("Factory owned by Timelock:", (await factory.owner()).toLowerCase() === TIMELOCK.toLowerCase());
  
  // Create SimpleCounter initcode
  const SimpleCounter = await ethers.getContractFactory("SimpleCounter");
  const constructorArgs = ethers.AbiCoder.defaultAbiCoder().encode(
    ["uint256", "address"],
    [0, TIMELOCK]
  );
  const initcode = SimpleCounter.bytecode + constructorArgs.slice(2);
  
  console.log("\n=== Testing with Different Callers ===");
  
  // Test 1: Call from Timelock address (should work)
  try {
    console.log("\n--- Testing from Timelock address ---");
    const factoryAsTimelock = factory.connect(await ethers.getSigner(TIMELOCK));
    const result = await factoryAsTimelock.deploy.staticCall(initcode);
    console.log("✅ Deploy from Timelock works! Would deploy to:", result);
  } catch (error: any) {
    console.log("❌ Deploy from Timelock failed:", error.message);
  }
  
  // Test 2: Call from current signer (should fail due to onlyOwner)
  try {
    console.log("\n--- Testing from current signer ---");
    const result = await factory.deploy.staticCall(initcode);
    console.log("✅ Deploy from current signer works! Would deploy to:", result);
  } catch (error: any) {
    console.log("❌ Deploy from current signer failed:", error.message);
    if (error.message.includes("Ownable: caller is not the owner")) {
      console.log("🔍 DIAGNOSIS: This is expected - caller is not the owner");
    }
  }
  
  // Test 3: Check if the issue is with the modifier
  console.log("\n=== Testing Modifier Logic ===");
  
  // Try to call a function that doesn't have onlyOwner
  try {
    const initcodeHash = await factory.initcodeHash(initcode);
    console.log("✅ initcodeHash function works! Hash:", initcodeHash);
  } catch (error: any) {
    console.log("❌ initcodeHash function failed:", error.message);
  }
  
  // Test 4: Check if the issue is with the assembly code in the context of onlyOwner
  console.log("\n=== Testing Assembly in Context ===");
  
  // Create a simple test contract that has onlyOwner + deploy
  const TestFactoryWithOwner = await ethers.getContractFactory("TestFactoryWithOwner");
  const testFactoryWithOwner = await TestFactoryWithOwner.deploy(TIMELOCK);
  await testFactoryWithOwner.waitForDeployment();
  
  const testFactoryWithOwnerAddress = await testFactoryWithOwner.getAddress();
  console.log("TestFactoryWithOwner deployed at:", testFactoryWithOwnerAddress);
  
  // Test from Timelock
  try {
    const testFactoryAsTimelock = testFactoryWithOwner.connect(await ethers.getSigner(TIMELOCK));
    const result = await testFactoryAsTimelock.deploy.staticCall(initcode);
    console.log("✅ TestFactoryWithOwner deploy from Timelock works! Would deploy to:", result);
  } catch (error: any) {
    console.log("❌ TestFactoryWithOwner deploy from Timelock failed:", error.message);
  }
  
  // Test from current signer (should fail)
  try {
    const result = await testFactoryWithOwner.deploy.staticCall(initcode);
    console.log("✅ TestFactoryWithOwner deploy from current signer works! Would deploy to:", result);
  } catch (error: any) {
    console.log("❌ TestFactoryWithOwner deploy from current signer failed:", error.message);
    if (error.message.includes("Ownable: caller is not the owner")) {
      console.log("🔍 DIAGNOSIS: This is expected - caller is not the owner");
    }
  }
}

main().catch((e) => { 
  console.error(e); 
  process.exit(1); 
});
