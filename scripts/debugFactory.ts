import { ethers } from "hardhat";

async function main() {
  console.log("=== Debugging BytecodeFactory ===");
  
  // Contract addresses
  const BYTECODE_FACTORY = "0x596E8CC6e08aA684FFf78FdBF7E5146386ff76A0";
  const CONTRACT_REGISTRY = "0x793DB78E2d4dD68564735743FABc45482e6B9eeB";
  const TIMELOCK = "0xD54343A590e8fAAa1cb9ea9F1fddef4ABd365310";
  
  // Get contracts
  const factory = await ethers.getContractAt("BytecodeFactory", BYTECODE_FACTORY);
  const registry = await ethers.getContractAt("ContractRegistry", CONTRACT_REGISTRY);
  
  console.log("=== Contract States ===");
  console.log("Factory owner:", await factory.owner());
  console.log("Factory owned by Timelock:", (await factory.owner()).toLowerCase() === TIMELOCK.toLowerCase());
  
  // Check registry permissions
  const hasRole = await registry.hasRole(await registry.REGISTRAR_ROLE(), BYTECODE_FACTORY);
  console.log("Factory has REGISTRAR_ROLE:", hasRole);
  
  // Create Counter initcode
  const Counter = await ethers.getContractFactory("Counter");
  const constructorArgs = ethers.AbiCoder.defaultAbiCoder().encode(
    ["uint256", "address"],
    [0, TIMELOCK]
  );
  const initcode = Counter.bytecode + constructorArgs.slice(2);
  
  // Registry parameters
  const KIND = ethers.keccak256(ethers.toUtf8Bytes("Counter"));
  const VERSION = 1;
  const LABEL = "Counter v1.0";
  const URI = "https://github.com/your-org/counter-contract";
  
  console.log("\n=== Testing Individual Functions ===");
  
  // Test just the deploy function first
  try {
    console.log("Testing deploy function...");
    const deployResult = await factory.deploy.staticCall(initcode);
    console.log("✅ Deploy function works! Would deploy to:", deployResult);
  } catch (deployError: any) {
    console.log("❌ Deploy function failed:", deployError.message);
  }
  
  // Test the registry register function
  try {
    console.log("Testing registry register function...");
    
    // Create a mock registration
    const mockRegistration = {
      addr: "0x1234567890123456789012345678901234567890",
      kind: KIND,
      factory: BYTECODE_FACTORY,
      salt: ethers.ZeroHash,
      initCodeHash: ethers.keccak256(initcode),
      version: VERSION,
      label: LABEL,
      uri: URI
    };
    
    // Try to call register directly on registry
    await registry.register.staticCall(mockRegistration);
    console.log("✅ Registry register function works!");
  } catch (registerError: any) {
    console.log("❌ Registry register function failed:", registerError.message);
  }
  
  // Test the full deployAndRegister function step by step
  console.log("\n=== Step-by-step Analysis ===");
  
  // Check if the issue is with the function call itself
  try {
    const callData = factory.interface.encodeFunctionData("deployAndRegister", [
      initcode,
      CONTRACT_REGISTRY,
      KIND,
      VERSION,
      LABEL,
      URI
    ]);
    
    console.log("Call data length:", callData.length);
    console.log("Call data (first 200 chars):", callData.slice(0, 200));
    
    // Try to call the function with a different approach
    const iface = new ethers.Interface([
      "function deployAndRegister(bytes calldata initcode, address registry, bytes32 kind, uint64 version, string calldata label, string calldata uri) external payable returns (address)"
    ]);
    
    const decoded = iface.decodeFunctionData("deployAndRegister", callData);
    console.log("Decoded function data:");
    console.log("- initcode length:", decoded[0].length);
    console.log("- registry:", decoded[1]);
    console.log("- kind:", decoded[2]);
    console.log("- version:", decoded[3].toString());
    console.log("- label:", decoded[4]);
    console.log("- uri:", decoded[5]);
    
  } catch (decodeError: any) {
    console.log("❌ Function data decode failed:", decodeError.message);
  }
  
  // Check if the issue is with the initcode format
  console.log("\n=== Initcode Format Check ===");
  console.log("Initcode starts with 0x:", initcode.startsWith("0x"));
  console.log("Initcode length:", initcode.length);
  console.log("Initcode is valid hex:", /^0x[0-9a-fA-F]+$/.test(initcode));
  
  // Check if the issue is with the constructor args
  console.log("\n=== Constructor Args Check ===");
  console.log("Constructor args:", constructorArgs);
  console.log("Constructor args length:", constructorArgs.length);
  
  // Try to decode constructor args
  try {
    const decodedArgs = ethers.AbiCoder.defaultAbiCoder().decode(
      ["uint256", "address"],
      constructorArgs
    );
    console.log("Decoded constructor args:", decodedArgs);
  } catch (decodeArgsError: any) {
    console.log("❌ Constructor args decode failed:", decodeArgsError.message);
  }
  
  // Check if the issue is with the registry parameters
  console.log("\n=== Registry Parameters Check ===");
  console.log("Registry address:", CONTRACT_REGISTRY);
  console.log("Kind:", KIND);
  console.log("Version:", VERSION);
  console.log("Label:", LABEL);
  console.log("URI:", URI);
  console.log("URI length:", URI.length);
}

main().catch((e) => { 
  console.error(e); 
  process.exit(1); 
});
