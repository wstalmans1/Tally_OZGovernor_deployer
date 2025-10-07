import { ethers } from "hardhat";

async function main() {
  console.log("=== Checking BytecodeFactory Bytecode ===");
  
  const BYTECODE_FACTORY = "0x596E8CC6e08aA684FFf78FdBF7E5146386ff76A0";
  
  // Get the bytecode from the blockchain
  const factoryCode = await ethers.provider.getCode(BYTECODE_FACTORY);
  console.log("Factory has code:", factoryCode !== "0x");
  console.log("Factory code length:", factoryCode.length);
  console.log("Factory code (first 100 chars):", factoryCode.slice(0, 100));
  
  // Get the expected bytecode from our compiled contract
  const BytecodeFactory = await ethers.getContractFactory("BytecodeFactory");
  const expectedBytecode = BytecodeFactory.bytecode;
  console.log("\nExpected bytecode length:", expectedBytecode.length);
  console.log("Expected bytecode (first 100 chars):", expectedBytecode.slice(0, 100));
  
  // Compare the bytecodes
  console.log("\n=== Bytecode Comparison ===");
  console.log("Bytecodes match:", factoryCode === expectedBytecode);
  
  if (factoryCode !== expectedBytecode) {
    console.log("❌ Bytecode mismatch detected!");
    console.log("This suggests the deployed contract is different from our compiled version.");
  } else {
    console.log("✅ Bytecodes match - the deployed contract matches our compiled version.");
  }
  
  // Try to call a simple view function
  try {
    console.log("\n=== Testing Simple View Function ===");
    const factory = await ethers.getContractAt("BytecodeFactory", BYTECODE_FACTORY);
    const owner = await factory.owner();
    console.log("✅ owner() function works! Owner:", owner);
  } catch (error: any) {
    console.log("❌ owner() function failed:", error.message);
  }
  
  // Try to call initcodeHash function
  try {
    console.log("\n=== Testing initcodeHash Function ===");
    const factory = await ethers.getContractAt("BytecodeFactory", BYTECODE_FACTORY);
    const testInitcode = "0x608060405234801561001057600080fd5b5060405161049838038061049883398101604081905261002f91610059565b60";
    const hash = await factory.initcodeHash(testInitcode);
    console.log("✅ initcodeHash() function works! Hash:", hash);
  } catch (error: any) {
    console.log("❌ initcodeHash() function failed:", error.message);
  }
  
  // Check if the contract is actually a proxy or has some other issue
  console.log("\n=== Contract Analysis ===");
  console.log("Is contract address valid:", ethers.isAddress(BYTECODE_FACTORY));
  console.log("Contract address checksum:", ethers.getAddress(BYTECODE_FACTORY));
  
  // Try to get the contract's storage at slot 0 (for Ownable)
  try {
    const slot0 = await ethers.provider.getStorage(BYTECODE_FACTORY, 0);
    console.log("Storage slot 0 (owner):", slot0);
  } catch (error: any) {
    console.log("❌ Failed to read storage slot 0:", error.message);
  }
}

main().catch((e) => { 
  console.error(e); 
  process.exit(1); 
});
