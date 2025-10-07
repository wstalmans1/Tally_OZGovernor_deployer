import { ethers } from "hardhat";

async function main() {
  console.log("=== Debugging Initcode Issue ===");
  
  const TIMELOCK = "0xD54343A590e8fAAa1cb9ea9F1fddef4ABd365310";
  const MINIMAL_FACTORY = "0x692F8333979866221638227b0570c3FcaCe001c6";
  
  // Test with a very simple contract first
  console.log("=== Testing with Simple Contract ===");
  
  // Create a simple contract
  const SimpleContract = await ethers.getContractFactory("SimpleCounter");
  const simpleArgs = ethers.AbiCoder.defaultAbiCoder().encode(
    ["uint256", "address"],
    [42, TIMELOCK]
  );
  const simpleInitcode = SimpleContract.bytecode + simpleArgs.slice(2);
  
  console.log("SimpleContract bytecode length:", SimpleContract.bytecode.length);
  console.log("SimpleContract args length:", simpleArgs.length);
  console.log("SimpleContract initcode length:", simpleInitcode.length);
  
  const factory = await ethers.getContractAt("MinimalFactory", MINIMAL_FACTORY);
  
  try {
    const result = await factory.deploy.staticCall(simpleInitcode);
    console.log("✅ SimpleContract deploy works! Would deploy to:", result);
  } catch (error: any) {
    console.log("❌ SimpleContract deploy failed:", error.message);
  }
  
  // Test Counter contract directly
  console.log("\n=== Testing Counter Contract Directly ===");
  try {
    const Counter = await ethers.getContractFactory("Counter");
    const counter = await Counter.deploy(0, TIMELOCK);
    await counter.waitForDeployment();
    const address = await counter.getAddress();
    console.log("✅ Direct Counter deployment successful:", address);
    
    const value = await counter.value();
    const owner = await counter.owner();
    console.log("Counter value:", value.toString());
    console.log("Counter owner:", owner);
  } catch (error: any) {
    console.log("❌ Direct Counter deployment failed:", error.message);
  }
  
  // Test with minimal initcode
  console.log("\n=== Testing with Minimal Initcode ===");
  const minimalInitcode = "0x608060405234801561001057600080fd5b5060405161049838038061049883398101604081905261002f91610059565b60";
  
  try {
    const result = await factory.deploy.staticCall(minimalInitcode);
    console.log("✅ Minimal initcode deploy works! Would deploy to:", result);
  } catch (error: any) {
    console.log("❌ Minimal initcode deploy failed:", error.message);
  }
  
  // Check if the issue is with the Counter contract bytecode
  console.log("\n=== Analyzing Counter Bytecode ===");
  const Counter = await ethers.getContractFactory("Counter");
  console.log("Counter bytecode (first 200 chars):", Counter.bytecode.slice(0, 200));
  console.log("Counter bytecode (last 200 chars):", Counter.bytecode.slice(-200));
  console.log("Counter bytecode valid hex:", /^0x[0-9a-fA-F]+$/.test(Counter.bytecode));
  
  // Try to create initcode step by step
  console.log("\n=== Creating Initcode Step by Step ===");
  const constructorArgs = ethers.AbiCoder.defaultAbiCoder().encode(
    ["uint256", "address"],
    [0, TIMELOCK]
  );
  console.log("Constructor args:", constructorArgs);
  console.log("Constructor args valid hex:", /^0x[0-9a-fA-F]+$/.test(constructorArgs));
  
  const initcode = Counter.bytecode + constructorArgs.slice(2);
  console.log("Full initcode length:", initcode.length);
  console.log("Full initcode valid hex:", /^0x[0-9a-fA-F]+$/.test(initcode));
  console.log("Full initcode (first 200 chars):", initcode.slice(0, 200));
  console.log("Full initcode (last 200 chars):", initcode.slice(-200));
  
  // Try to decode the constructor args to verify
  try {
    const decoded = ethers.AbiCoder.defaultAbiCoder().decode(
      ["uint256", "address"],
      constructorArgs
    );
    console.log("Decoded constructor args:", decoded);
  } catch (error: any) {
    console.log("❌ Failed to decode constructor args:", error.message);
  }
}

main().catch((e) => { 
  console.error(e); 
  process.exit(1); 
});
