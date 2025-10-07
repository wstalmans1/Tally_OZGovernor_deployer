import { ethers } from "hardhat";

async function main() {
  console.log("=== Creating Registry Role Grant Proposal ===");
  
  const CONTRACT_REGISTRY = "0x793DB78E2d4dD68564735743FABc45482e6B9eeB";
  const WORKING_FACTORY = "0xe53e754a335610813051485166D5ad641d485918";
  
  // Get contracts
  const registry = await ethers.getContractAt("ContractRegistry", CONTRACT_REGISTRY);
  
  // Get the REGISTRAR_ROLE
  const REGISTRAR_ROLE = await registry.REGISTRAR_ROLE();
  console.log("REGISTRAR_ROLE:", REGISTRAR_ROLE);
  
  // Create the proposal data
  console.log("\n=== Tally Proposal Data ===");
  console.log("Contract Address:", CONTRACT_REGISTRY);
  console.log("Function: grantRole");
  console.log("Parameters:");
  console.log("  - role:", REGISTRAR_ROLE);
  console.log("  - account:", WORKING_FACTORY);
  
  // Create calldata for the proposal
  const calldata = registry.interface.encodeFunctionData("grantRole", [REGISTRAR_ROLE, WORKING_FACTORY]);
  console.log("\nCalldata:", calldata);
  
  // Test the function call
  try {
    console.log("\n=== Testing Function Call ===");
    const result = await registry.grantRole.staticCall(REGISTRAR_ROLE, WORKING_FACTORY);
    console.log("✅ grantRole function call successful!");
  } catch (error: any) {
    console.log("❌ grantRole function call failed:", error.message);
  }
  
  // Save proposal to file
  const proposalData = {
    contractAddress: CONTRACT_REGISTRY,
    functionName: "grantRole",
    parameters: {
      role: REGISTRAR_ROLE,
      account: WORKING_FACTORY
    },
    calldata: calldata,
    description: "Grant REGISTRAR_ROLE to WorkingFactory so it can register deployed contracts",
    timestamp: Date.now()
  };
  
  const fs = require('fs');
  const filename = `proposals/grant-registrar-role-${Date.now()}.json`;
  fs.writeFileSync(filename, JSON.stringify(proposalData, null, 2));
  console.log(`\n✅ Proposal saved to: ${filename}`);
  
  console.log("\n=== Instructions for Tally ===");
  console.log("1. Go to Tally proposal creation");
  console.log("2. Add a transaction with these details:");
  console.log(`   - To: ${CONTRACT_REGISTRY}`);
  console.log(`   - Value: 0 ETH`);
  console.log(`   - Data: ${calldata}`);
  console.log("3. This will grant REGISTRAR_ROLE to WorkingFactory");
  console.log("4. After this proposal passes, WorkingFactory can register deployed contracts");
  
  console.log("\n=== Next Steps ===");
  console.log("1. Create and pass the role grant proposal");
  console.log("2. Then create the Counter deployment proposal using WorkingFactory");
  console.log("3. The Counter deployment will be automatically registered in the registry");
}

main().catch((e) => { 
  console.error(e); 
  process.exit(1); 
});
