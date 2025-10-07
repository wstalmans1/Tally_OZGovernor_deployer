import { ethers } from "hardhat";

async function main() {
  console.log("=== Debugging Counter Deploy Transaction ===");
  
  // Contract addresses
  const BYTECODE_FACTORY = "0x596E8CC6e08aA684FFf78FdBF7E5146386ff76A0";
  const CONTRACT_REGISTRY = "0x793DB78E2d4dD68564735743FABc45482e6B9eeB";
  const TIMELOCK = "0xD54343A590e8fAAa1cb9ea9F1fddef4ABd365310";
  
  // Counter constructor parameters
  const INITIAL_VALUE = 0;
  const COUNTER_OWNER = TIMELOCK;
  
  console.log("BytecodeFactory:", BYTECODE_FACTORY);
  console.log("ContractRegistry:", CONTRACT_REGISTRY);
  console.log("Timelock:", TIMELOCK);
  console.log("Initial Value:", INITIAL_VALUE);
  console.log("Counter Owner:", COUNTER_OWNER);
  
  // Get the Counter contract factory
  const Counter = await ethers.getContractFactory("Counter");
  
  // Encode constructor arguments
  const constructorArgs = ethers.AbiCoder.defaultAbiCoder().encode(
    ["uint256", "address"],
    [INITIAL_VALUE, COUNTER_OWNER]
  );
  
  console.log("\n=== Constructor Args ===");
  console.log("Encoded:", constructorArgs);
  console.log("Length:", constructorArgs.length);
  
  // Create initcode
  const initcode = Counter.bytecode + constructorArgs.slice(2);
  
  console.log("\n=== Initcode ===");
  console.log("Length:", initcode.length);
  console.log("First 100 chars:", initcode.slice(0, 100));
  
  // Registry parameters
  const KIND = ethers.keccak256(ethers.toUtf8Bytes("Counter"));
  const VERSION = 1;
  const LABEL = "Counter v1.0";
  const URI = "https://github.com/your-org/counter-contract";
  
  console.log("\n=== Registry Parameters ===");
  console.log("Kind:", KIND);
  console.log("Version:", VERSION);
  console.log("Label:", LABEL);
  console.log("URI:", URI);
  
  // Get contracts
  const factory = await ethers.getContractAt("BytecodeFactory", BYTECODE_FACTORY);
  const registry = await ethers.getContractAt("ContractRegistry", CONTRACT_REGISTRY);
  
  console.log("\n=== Contract States ===");
  console.log("Factory owner:", await factory.owner());
  console.log("Factory pending owner:", await factory.pendingOwner());
  
  // Check if factory is owned by timelock
  const isOwnedByTimelock = (await factory.owner()).toLowerCase() === TIMELOCK.toLowerCase();
  console.log("Factory owned by Timelock:", isOwnedByTimelock);
  
  if (!isOwnedByTimelock) {
    console.log("\n❌ ISSUE FOUND: BytecodeFactory is not owned by Timelock!");
    console.log("Current owner:", await factory.owner());
    console.log("Expected owner:", TIMELOCK);
    console.log("\nSolution: The Timelock needs to call acceptOwnership() on the BytecodeFactory first.");
    return;
  }
  
  // Test the function call
  try {
    console.log("\n=== Testing Function Call ===");
    
    // Simulate the call (read-only)
    const callData = factory.interface.encodeFunctionData("deployAndRegister", [
      initcode,
      CONTRACT_REGISTRY,
      KIND,
      VERSION,
      LABEL,
      URI
    ]);
    
    console.log("Calldata length:", callData.length);
    console.log("Calldata (first 100 chars):", callData.slice(0, 100));
    
    // Try to estimate gas
    try {
      const gasEstimate = await factory.deployAndRegister.estimateGas(
        initcode,
        CONTRACT_REGISTRY,
        KIND,
        VERSION,
        LABEL,
        URI,
        { from: TIMELOCK }
      );
      console.log("Gas estimate:", gasEstimate.toString());
    } catch (gasError: any) {
      console.log("❌ Gas estimation failed:", gasError.message);
    }
    
    // Check if the function exists and is callable
    console.log("\n=== Function Check ===");
    const functionFragment = factory.interface.getFunction("deployAndRegister");
    console.log("Function exists:", !!functionFragment);
    console.log("Function inputs:", functionFragment?.inputs?.map(i => `${i.name}: ${i.type}`));
    
  } catch (error: any) {
    console.log("❌ Function call failed:", error.message);
    
    // Check for specific error patterns
    if (error.message.includes("Ownable: caller is not the owner")) {
      console.log("\n🔍 DIAGNOSIS: Ownership issue");
      console.log("The caller is not the owner of the BytecodeFactory");
    } else if (error.message.includes("EmptyInitcode")) {
      console.log("\n🔍 DIAGNOSIS: Empty initcode");
      console.log("The initcode parameter is empty or invalid");
    } else if (error.message.includes("DeployFailed")) {
      console.log("\n🔍 DIAGNOSIS: Deployment failed");
      console.log("The contract deployment failed during execution");
    } else if (error.message.includes("Stack too deep")) {
      console.log("\n🔍 DIAGNOSIS: Stack too deep");
      console.log("The function has too many local variables");
    } else {
      console.log("\n🔍 DIAGNOSIS: Unknown error");
      console.log("Full error:", error);
    }
  }
  
  // Check registry permissions
  console.log("\n=== Registry Permissions ===");
  try {
    const hasRole = await registry.hasRole(await registry.REGISTRAR_ROLE(), BYTECODE_FACTORY);
    console.log("Factory has REGISTRAR_ROLE:", hasRole);
    
    if (!hasRole) {
      console.log("❌ ISSUE: BytecodeFactory doesn't have REGISTRAR_ROLE in ContractRegistry");
      console.log("Solution: Grant REGISTRAR_ROLE to BytecodeFactory in ContractRegistry");
    }
  } catch (error: any) {
    console.log("Error checking registry permissions:", error.message);
  }
}

main().catch((e) => { 
  console.error(e); 
  process.exit(1); 
});
