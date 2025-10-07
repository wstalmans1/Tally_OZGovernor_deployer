import { ethers } from "hardhat";

async function main() {
  console.log("=== Debugging Tenderly Revert ===");
  
  const TIMELOCK = "0xD54343A590e8fAAa1cb9ea9F1fddef4ABd365310";
  const BYTECODE_FACTORY = "0x596E8CC6e08aA684FFf78FdBF7E5146386ff76A0";
  const CONTRACT_REGISTRY = "0x793DB78E2d4dD68564735743FABc45482e6B9eeB";
  
  // Get contracts
  const factory = await ethers.getContractAt("BytecodeFactory", BYTECODE_FACTORY);
  const registry = await ethers.getContractAt("ContractRegistry", CONTRACT_REGISTRY);
  
  console.log("=== Contract States ===");
  console.log("Factory owner:", await factory.owner());
  console.log("Factory owned by Timelock:", (await factory.owner()).toLowerCase() === TIMELOCK.toLowerCase());
  
  // Check registry permissions
  const REGISTRAR_ROLE = await registry.REGISTRAR_ROLE();
  const hasRole = await registry.hasRole(REGISTRAR_ROLE, BYTECODE_FACTORY);
  console.log("Factory has REGISTRAR_ROLE:", hasRole);
  console.log("REGISTRAR_ROLE:", REGISTRAR_ROLE);
  
  // Create Counter initcode (same as in Tally)
  const Counter = await ethers.getContractFactory("Counter");
  const constructorArgs = ethers.AbiCoder.defaultAbiCoder().encode(
    ["uint256", "address"],
    [0, TIMELOCK]
  );
  const initcode = Counter.bytecode + constructorArgs.slice(2);
  
  console.log("\n=== Initcode Analysis ===");
  console.log("Initcode length:", initcode.length);
  console.log("Initcode valid hex:", /^0x[0-9a-fA-F]+$/.test(initcode));
  
  // Registry parameters
  const KIND = ethers.keccak256(ethers.toUtf8Bytes("Counter"));
  const VERSION = 1;
  const LABEL = "Counter v1.0";
  const URI = "https://github.com/your-org/counter-contract";
  
  console.log("\n=== Registry Parameters ===");
  console.log("KIND:", KIND);
  console.log("VERSION:", VERSION);
  console.log("LABEL:", LABEL);
  console.log("URI:", URI);
  
  // Test individual components
  console.log("\n=== Testing Individual Components ===");
  
  // 1. Test factory.deploy
  try {
    console.log("\n--- Testing factory.deploy ---");
    const deployResult = await factory.deploy.staticCall(initcode);
    console.log("✅ factory.deploy works! Would deploy to:", deployResult);
  } catch (error: any) {
    console.log("❌ factory.deploy failed:", error.message);
  }
  
  // 2. Test registry.register
  try {
    console.log("\n--- Testing registry.register ---");
    const registration = {
      addr: "0x1234567890123456789012345678901234567890", // dummy address
      kind: KIND,
      factory: BYTECODE_FACTORY,
      salt: ethers.ZeroHash,
      initCodeHash: ethers.keccak256(initcode),
      version: VERSION,
      label: LABEL,
      uri: URI
    };
    
    const registerResult = await registry.register.staticCall(registration);
    console.log("✅ registry.register works!");
  } catch (error: any) {
    console.log("❌ registry.register failed:", error.message);
  }
  
  // 3. Test deployAndRegister with detailed error analysis
  try {
    console.log("\n--- Testing deployAndRegister ---");
    const result = await factory.deployAndRegister.staticCall(
      initcode,
      CONTRACT_REGISTRY,
      KIND,
      VERSION,
      LABEL,
      URI
    );
    console.log("✅ deployAndRegister works! Would deploy to:", result);
  } catch (error: any) {
    console.log("❌ deployAndRegister failed:", error.message);
    
    // Try to get more specific error information
    try {
      const gasEstimate = await factory.deployAndRegister.estimateGas(
        initcode,
        CONTRACT_REGISTRY,
        KIND,
        VERSION,
        LABEL,
        URI
      );
      console.log("Gas estimate:", gasEstimate.toString());
    } catch (gasError: any) {
      console.log("Gas estimation failed:", gasError.message);
    }
  }
  
  // 4. Test with a minimal initcode to see if it's an initcode issue
  try {
    console.log("\n--- Testing with minimal initcode ---");
    const minimalInitcode = "0x608060405234801561001057600080fd5b5060405161049838038061049883398101604081905261002f91610059565b60";
    
    const result = await factory.deploy.staticCall(minimalInitcode);
    console.log("✅ Minimal initcode deploy works! Would deploy to:", result);
  } catch (error: any) {
    console.log("❌ Minimal initcode deploy failed:", error.message);
  }
  
  // 5. Check if the issue is with the registry address
  console.log("\n--- Testing registry address ---");
  try {
    const registryCode = await ethers.provider.getCode(CONTRACT_REGISTRY);
    console.log("Registry has code:", registryCode !== "0x");
    console.log("Registry code length:", registryCode.length);
  } catch (error: any) {
    console.log("❌ Failed to get registry code:", error.message);
  }
}

main().catch((e) => { 
  console.error(e); 
  process.exit(1); 
});
