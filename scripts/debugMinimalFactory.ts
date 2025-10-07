import { ethers } from "hardhat";

async function main() {
  console.log("=== Debugging MinimalFactory ===");
  
  const MINIMAL_FACTORY = "0x692F8333979866221638227b0570c3FcaCe001c6";
  
  // Get the factory contract
  const factory = await ethers.getContractAt("MinimalFactory", MINIMAL_FACTORY);
  
  console.log("=== Factory State ===");
  console.log("Factory address:", MINIMAL_FACTORY);
  console.log("Factory owner:", await factory.owner());
  
  // Check if the factory has code
  const factoryCode = await ethers.provider.getCode(MINIMAL_FACTORY);
  console.log("Factory has code:", factoryCode !== "0x");
  console.log("Factory code length:", factoryCode.length);
  
  // Test a very simple function first
  try {
    console.log("\n=== Testing Simple Function ===");
    const testData = ethers.toUtf8Bytes("test");
    // Try to call a function that doesn't exist to see if we get a different error
    const result = await factory.testFunction?.();
    console.log("Test function result:", result);
  } catch (error: any) {
    console.log("Test function error (expected):", error.message);
  }
  
  // Test with empty initcode (should fail with EmptyInitcode)
  try {
    console.log("\n=== Testing with Empty Initcode ===");
    const result = await factory.deploy.staticCall("0x");
    console.log("Empty initcode result:", result);
  } catch (error: any) {
    console.log("Empty initcode error:", error.message);
    if (error.message.includes("EmptyInitcode")) {
      console.log("✅ EmptyInitcode error is correct!");
    }
  }
  
  // Test with a single byte initcode
  try {
    console.log("\n=== Testing with Single Byte Initcode ===");
    const result = await factory.deploy.staticCall("0x60");
    console.log("Single byte result:", result);
  } catch (error: any) {
    console.log("Single byte error:", error.message);
  }
  
  // Test with a very simple contract bytecode (just the constructor)
  try {
    console.log("\n=== Testing with Simple Constructor Bytecode ===");
    // This is just a minimal contract that does nothing
    const simpleBytecode = "0x608060405234801561001057600080fd5b50600080fd5b6103f3806100256000396000f3fe608060405234801561001057600080fd5b50600436106100365760003560e01c8063c29855781461003b578063e1c7392a14610057575b600080fd5b610043610071565b60405161004e91906100a1565b60405180910390f35b61005f610077565b60405161006c91906100a1565b60405180910390f35b600080fd5b600080fd5b6000819050919050565b61009b81610088565b82525050565b60006020820190506100b66000830184610092565b9291505056fea2646970667358221220";
    
    const result = await factory.deploy.staticCall(simpleBytecode);
    console.log("Simple constructor result:", result);
  } catch (error: any) {
    console.log("Simple constructor error:", error.message);
  }
  
  // Check if the issue is with the assembly code by testing a different approach
  console.log("\n=== Testing Assembly Code ===");
  
  // Create a test contract that uses the same assembly pattern
  const TestAssembly = await ethers.getContractFactory("TestFactory");
  const testAssembly = await TestAssembly.deploy();
  await testAssembly.waitForDeployment();
  
  const testAssemblyAddress = await testAssembly.getAddress();
  console.log("TestAssembly deployed at:", testAssemblyAddress);
  
  try {
    const result = await testAssembly.deploy.staticCall("0x608060405234801561001057600080fd5b50600080fd5b6103f3806100256000396000f3fe608060405234801561001057600080fd5b50600436106100365760003560e01c8063c29855781461003b578063e1c7392a14610057575b600080fd5b610043610071565b60405161004e91906100a1565b60405180910390f35b61005f610077565b60405161006c91906100a1565b60405180910390f35b600080fd5b600080fd5b6000819050919050565b61009b81610088565b82525050565b60006020820190506100b66000830184610092565b9291505056fea2646970667358221220");
    console.log("✅ TestAssembly works! Result:", result);
  } catch (error: any) {
    console.log("❌ TestAssembly failed:", error.message);
  }
}

main().catch((e) => { 
  console.error(e); 
  process.exit(1); 
});
