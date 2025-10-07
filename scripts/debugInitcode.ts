import { ethers } from "hardhat";

async function main() {
  console.log("=== Debugging Initcode Generation ===");
  
  const TIMELOCK = "0xD54343A590e8fAAa1cb9ea9F1fddef4ABd365310";
  
  // Get Counter contract factory
  const Counter = await ethers.getContractFactory("Counter");
  
  console.log("=== Counter Contract Analysis ===");
  console.log("Bytecode length:", Counter.bytecode.length);
  console.log("Bytecode (first 100 chars):", Counter.bytecode.slice(0, 100));
  
  // Test constructor args encoding
  const constructorArgs = ethers.AbiCoder.defaultAbiCoder().encode(
    ["uint256", "address"],
    [0, TIMELOCK]
  );
  
  console.log("\n=== Constructor Args Analysis ===");
  console.log("Constructor args:", constructorArgs);
  console.log("Constructor args length:", constructorArgs.length);
  
  // Decode to verify
  try {
    const decoded = ethers.AbiCoder.defaultAbiCoder().decode(
      ["uint256", "address"],
      constructorArgs
    );
    console.log("Decoded args:", decoded);
    console.log("Initial value:", decoded[0].toString());
    console.log("Owner:", decoded[1]);
  } catch (error: any) {
    console.log("❌ Constructor args decode failed:", error.message);
  }
  
  // Create initcode
  const initcode = Counter.bytecode + constructorArgs.slice(2);
  
  console.log("\n=== Initcode Analysis ===");
  console.log("Initcode length:", initcode.length);
  console.log("Initcode (first 100 chars):", initcode.slice(0, 100));
  console.log("Initcode (last 100 chars):", initcode.slice(-100));
  console.log("Is valid hex:", /^0x[0-9a-fA-F]+$/.test(initcode));
  
  // Try to deploy Counter directly to see if it works
  console.log("\n=== Direct Counter Deployment Test ===");
  try {
    const counter = await Counter.deploy(0, TIMELOCK);
    await counter.waitForDeployment();
    const address = await counter.getAddress();
    console.log("✅ Direct Counter deployment successful:", address);
    
    // Test the deployed counter
    const value = await counter.value();
    const owner = await counter.owner();
    console.log("Counter value:", value.toString());
    console.log("Counter owner:", owner);
    
  } catch (directError: any) {
    console.log("❌ Direct Counter deployment failed:", directError.message);
  }
  
  // Test with a simpler contract
  console.log("\n=== Testing with Simple Contract ===");
  
  // Create a very simple contract
  const simpleContractCode = `
    pragma solidity ^0.8.24;
    contract Simple {
        uint256 public value;
        constructor(uint256 _value) {
            value = _value;
        }
    }
  `;
  
  // Try to compile and deploy a simple contract
  try {
    const Simple = await ethers.getContractFactory("Simple");
    const simpleArgs = ethers.AbiCoder.defaultAbiCoder().encode(
      ["uint256"],
      [42]
    );
    const simpleInitcode = Simple.bytecode + simpleArgs.slice(2);
    
    console.log("Simple contract initcode length:", simpleInitcode.length);
    
    // Test with the new factory
    const factoryAddress = "0xcee1062c24182cC9C7d662DF1Ff0e43e8204Bc6b";
    const factory = await ethers.getContractAt("BytecodeFactory", factoryAddress);
    
    try {
      const result = await factory.deploy.staticCall(simpleInitcode);
      console.log("✅ Simple contract deploy works! Would deploy to:", result);
    } catch (simpleError: any) {
      console.log("❌ Simple contract deploy failed:", simpleError.message);
    }
    
  } catch (compileError: any) {
    console.log("❌ Simple contract compilation failed:", compileError.message);
  }
}

main().catch((e) => { 
  console.error(e); 
  process.exit(1); 
});
