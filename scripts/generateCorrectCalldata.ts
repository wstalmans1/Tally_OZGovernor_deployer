import { ethers } from "hardhat";

async function main() {
  console.log("=== Generating Correct Calldata for WorkingFactory ===");
  
  const WORKING_FACTORY = "0x599C8688d802EC99E599BFA31430e0038fD7AdB6";
  const TIMELOCK = "0xD54343A590e8fAAa1cb9ea9F1fddef4ABd365310";
  
  // Get the WorkingFactory contract
  const factory = await ethers.getContractAt("WorkingFactory", WORKING_FACTORY);
  
  // Create Counter initcode
  const Counter = await ethers.getContractFactory("Counter");
  const constructorArgs = ethers.AbiCoder.defaultAbiCoder().encode(
    ["uint256", "address"],
    [0, TIMELOCK]
  );
  const initcode = Counter.bytecode + constructorArgs.slice(2);
  
  console.log("=== Counter Initcode Details ===");
  console.log("Counter bytecode length:", Counter.bytecode.length);
  console.log("Constructor args:", constructorArgs);
  console.log("Constructor args length:", constructorArgs.length);
  console.log("Full initcode length:", initcode.length);
  console.log("Full initcode:", initcode);
  
  // Generate calldata for the deploy function
  const calldata = factory.interface.encodeFunctionData("deploy", [initcode]);
  
  console.log("\n=== Correct Calldata ===");
  console.log("Contract Address:", WORKING_FACTORY);
  console.log("Function: deploy");
  console.log("Calldata:", calldata);
  
  // Test the calldata
  try {
    console.log("\n=== Testing Calldata ===");
    const result = await factory.deploy.staticCall(initcode);
    console.log("✅ Static call successful! Would deploy to:", result);
  } catch (error: any) {
    console.log("❌ Static call failed:", error.message);
  }
  
  // Also generate calldata for the registry role grant
  const CONTRACT_REGISTRY = "0x793DB78E2d4dD68564735743FABc45482e6B9eeB";
  const registry = await ethers.getContractAt("ContractRegistry", CONTRACT_REGISTRY);
  const REGISTRAR_ROLE = await registry.REGISTRAR_ROLE();
  
  const roleGrantCalldata = registry.interface.encodeFunctionData("grantRole", [REGISTRAR_ROLE, WORKING_FACTORY]);
  
  console.log("\n=== Registry Role Grant Calldata ===");
  console.log("Contract Address:", CONTRACT_REGISTRY);
  console.log("Function: grantRole");
  console.log("Calldata:", roleGrantCalldata);
  
  // Save both proposals
  const fs = require('fs');
  
  const roleGrantProposal = {
    contractAddress: CONTRACT_REGISTRY,
    functionName: "grantRole",
    parameters: {
      role: REGISTRAR_ROLE,
      account: WORKING_FACTORY
    },
    calldata: roleGrantCalldata,
    description: "Grant REGISTRAR_ROLE to WorkingFactory",
    timestamp: Date.now()
  };
  
  const counterDeployProposal = {
    contractAddress: WORKING_FACTORY,
    functionName: "deploy",
    parameters: {
      initcode: initcode
    },
    calldata: calldata,
    description: "Deploy Counter contract using WorkingFactory",
    timestamp: Date.now()
  };
  
  fs.writeFileSync(`proposals/role-grant-${Date.now()}.json`, JSON.stringify(roleGrantProposal, null, 2));
  fs.writeFileSync(`proposals/counter-deploy-${Date.now()}.json`, JSON.stringify(counterDeployProposal, null, 2));
  
  console.log("\n✅ Proposals saved to files");
  
  console.log("\n=== Tally Instructions ===");
  console.log("Step 1 - Grant Role:");
  console.log(`To: ${CONTRACT_REGISTRY}`);
  console.log(`Value: 0 ETH`);
  console.log(`Data: ${roleGrantCalldata}`);
  console.log("");
  console.log("Step 2 - Deploy Counter:");
  console.log(`To: ${WORKING_FACTORY}`);
  console.log(`Value: 0 ETH`);
  console.log(`Data: ${calldata}`);
}

main().catch((e) => { 
  console.error(e); 
  process.exit(1); 
});
