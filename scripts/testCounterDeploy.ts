import { ethers } from "hardhat";

async function main() {
  console.log("=== Testing Counter Deploy Transaction ===");
  
  // Contract addresses
  const BYTECODE_FACTORY = "0x596E8CC6e08aA684FFf78FdBF7E5146386ff76A0";
  const CONTRACT_REGISTRY = "0x793DB78E2d4dD68564735743FABc45482e6B9eeB";
  const TIMELOCK = "0xD54343A590e8fAAa1cb9ea9F1fddef4ABd365310";
  
  // Counter constructor parameters
  const INITIAL_VALUE = 0;
  const COUNTER_OWNER = TIMELOCK;
  
  // Get the Counter contract factory
  const Counter = await ethers.getContractFactory("Counter");
  
  // Encode constructor arguments
  const constructorArgs = ethers.AbiCoder.defaultAbiCoder().encode(
    ["uint256", "address"],
    [INITIAL_VALUE, COUNTER_OWNER]
  );
  
  // Create initcode
  const initcode = Counter.bytecode + constructorArgs.slice(2);
  
  // Registry parameters
  const KIND = ethers.keccak256(ethers.toUtf8Bytes("Counter"));
  const VERSION = 1;
  const LABEL = "Counter v1.0";
  const URI = "https://github.com/your-org/counter-contract";
  
  // Get contracts
  const factory = await ethers.getContractAt("BytecodeFactory", BYTECODE_FACTORY);
  const registry = await ethers.getContractAt("ContractRegistry", CONTRACT_REGISTRY);
  
  console.log("=== Contract States ===");
  console.log("Factory owner:", await factory.owner());
  console.log("Factory owned by Timelock:", (await factory.owner()).toLowerCase() === TIMELOCK.toLowerCase());
  
  // Check registry permissions
  const hasRole = await registry.hasRole(await registry.REGISTRAR_ROLE(), BYTECODE_FACTORY);
  console.log("Factory has REGISTRAR_ROLE:", hasRole);
  
  if (!hasRole) {
    console.log("❌ ISSUE: BytecodeFactory doesn't have REGISTRAR_ROLE in ContractRegistry");
    return;
  }
  
  // Test the function call with proper simulation
  try {
    console.log("\n=== Simulating Transaction ===");
    
    // Create a call data for the function
    const callData = factory.interface.encodeFunctionData("deployAndRegister", [
      initcode,
      CONTRACT_REGISTRY,
      KIND,
      VERSION,
      LABEL,
      URI
    ]);
    
    console.log("Call data length:", callData.length);
    
    // Simulate the call using staticCall
    try {
      const result = await factory.deployAndRegister.staticCall(
        initcode,
        CONTRACT_REGISTRY,
        KIND,
        VERSION,
        LABEL,
        URI,
        { from: TIMELOCK }
      );
      console.log("✅ Static call successful! Deployed address would be:", result);
    } catch (staticError: any) {
      console.log("❌ Static call failed:", staticError.message);
      
      // Analyze the error
      if (staticError.message.includes("Ownable: caller is not the owner")) {
        console.log("🔍 DIAGNOSIS: The caller (Timelock) is not the owner of BytecodeFactory");
        console.log("This suggests the transaction is being called by the wrong address");
      } else if (staticError.message.includes("EmptyInitcode")) {
        console.log("🔍 DIAGNOSIS: The initcode is empty or invalid");
      } else if (staticError.message.includes("DeployFailed")) {
        console.log("🔍 DIAGNOSIS: Contract deployment failed");
        console.log("This could be due to insufficient gas or invalid bytecode");
      } else if (staticError.message.includes("AccessControl")) {
        console.log("🔍 DIAGNOSIS: Access control issue");
        console.log("The BytecodeFactory might not have the required role in ContractRegistry");
      } else {
        console.log("🔍 DIAGNOSIS: Unknown error -", staticError.message);
      }
    }
    
    // Try to estimate gas without specifying from
    try {
      const gasEstimate = await factory.deployAndRegister.estimateGas(
        initcode,
        CONTRACT_REGISTRY,
        KIND,
        VERSION,
        LABEL,
        URI
      );
      console.log("✅ Gas estimate successful:", gasEstimate.toString());
    } catch (gasError: any) {
      console.log("❌ Gas estimation failed:", gasError.message);
    }
    
  } catch (error: any) {
    console.log("❌ Function call failed:", error.message);
  }
  
  // Check if the initcode is valid
  console.log("\n=== Initcode Validation ===");
  console.log("Initcode length:", initcode.length);
  console.log("Starts with 0x:", initcode.startsWith("0x"));
  console.log("Is valid hex:", /^0x[0-9a-fA-F]+$/.test(initcode));
  
  // Check constructor args
  console.log("\n=== Constructor Args Validation ===");
  console.log("Constructor args length:", constructorArgs.length);
  console.log("Constructor args:", constructorArgs);
  
  // Decode constructor args to verify
  try {
    const decoded = ethers.AbiCoder.defaultAbiCoder().decode(
      ["uint256", "address"],
      constructorArgs
    );
    console.log("Decoded constructor args:", decoded);
    console.log("Initial value:", decoded[0].toString());
    console.log("Counter owner:", decoded[1]);
  } catch (decodeError: any) {
    console.log("❌ Constructor args decode failed:", decodeError.message);
  }
}

main().catch((e) => { 
  console.error(e); 
  process.exit(1); 
});