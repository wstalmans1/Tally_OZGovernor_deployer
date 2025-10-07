import { ethers } from "hardhat";

async function main() {
  console.log("=== Checking Registry Permissions ===");
  
  const CONTRACT_REGISTRY = "0x793DB78E2d4dD68564735743FABc45482e6B9eeB";
  const WORKING_FACTORY = "0xe53e754a335610813051485166D5ad641d485918";
  const TIMELOCK = "0xD54343A590e8fAAa1cb9ea9F1fddef4ABd365310";
  
  // Get contracts
  const registry = await ethers.getContractAt("ContractRegistry", CONTRACT_REGISTRY);
  
  console.log("=== Registry State ===");
  console.log("Registry address:", CONTRACT_REGISTRY);
  
  // Check who has DEFAULT_ADMIN_ROLE (equivalent to owner)
  const DEFAULT_ADMIN_ROLE = await registry.DEFAULT_ADMIN_ROLE();
  const timelockHasAdminRole = await registry.hasRole(DEFAULT_ADMIN_ROLE, TIMELOCK);
  console.log("Timelock has DEFAULT_ADMIN_ROLE (admin):", timelockHasAdminRole);
  
  // Check REGISTRAR_ROLE
  const REGISTRAR_ROLE = await registry.REGISTRAR_ROLE();
  console.log("REGISTRAR_ROLE:", REGISTRAR_ROLE);
  
  // Check if WorkingFactory has REGISTRAR_ROLE
  const hasRole = await registry.hasRole(REGISTRAR_ROLE, WORKING_FACTORY);
  console.log("WorkingFactory has REGISTRAR_ROLE:", hasRole);
  
  // Check if original BytecodeFactory has REGISTRAR_ROLE
  const ORIGINAL_FACTORY = "0x596E8CC6e08aA684FFf78FdBF7E5146386ff76A0";
  const originalHasRole = await registry.hasRole(REGISTRAR_ROLE, ORIGINAL_FACTORY);
  console.log("Original BytecodeFactory has REGISTRAR_ROLE:", originalHasRole);
  
  // Check who can grant roles
  console.log("DEFAULT_ADMIN_ROLE:", DEFAULT_ADMIN_ROLE);
  
  if (!hasRole) {
    console.log("\n=== Action Required ===");
    console.log("❌ WorkingFactory does NOT have REGISTRAR_ROLE");
    console.log("✅ Timelock can grant the role");
    console.log("\n=== Tally Proposal Needed ===");
    console.log("Create a proposal to grant REGISTRAR_ROLE to WorkingFactory:");
    console.log(`- To: ${CONTRACT_REGISTRY}`);
    console.log(`- Function: grantRole`);
    console.log(`- Parameters:`);
    console.log(`  - role: ${REGISTRAR_ROLE}`);
    console.log(`  - account: ${WORKING_FACTORY}`);
  } else {
    console.log("\n✅ WorkingFactory already has REGISTRAR_ROLE - no action needed!");
  }
}

main().catch((e) => { 
  console.error(e); 
  process.exit(1); 
});
