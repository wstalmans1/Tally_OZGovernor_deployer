import { ethers } from "hardhat";

async function main() {
  console.log("=== Creating Working Tally Proposal ===");
  
  const TIMELOCK = "0xD54343A590e8fAAa1cb9ea9F1fddef4ABd365310";
  const MINIMAL_FACTORY = "0x692F8333979866221638227b0570c3FcaCe001c6";
  const CONTRACT_REGISTRY = "0x793DB78E2d4dD68564735743FABc45482e6B9eeB";
  
  // Create Counter initcode
  const Counter = await ethers.getContractFactory("Counter");
  const constructorArgs = ethers.AbiCoder.defaultAbiCoder().encode(
    ["uint256", "address"],
    [0, TIMELOCK]
  );
  const initcode = Counter.bytecode + constructorArgs.slice(2);
  
  console.log("=== Counter Deployment Details ===");
  console.log("Counter bytecode length:", Counter.bytecode.length);
  console.log("Constructor args:", constructorArgs);
  console.log("Constructor args length:", constructorArgs.length);
  console.log("Full initcode length:", initcode.length);
  console.log("Full initcode:", initcode);
  
  // Test the deployment
  console.log("\n=== Testing Deployment ===");
  const factory = await ethers.getContractAt("MinimalFactory", MINIMAL_FACTORY);
  
  try {
    const deployResult = await factory.deploy.staticCall(initcode);
    console.log("✅ Deployment simulation successful! Would deploy to:", deployResult);
  } catch (error: any) {
    console.log("❌ Deployment simulation failed:", error.message);
  }
  
  // Create the proposal data
  console.log("\n=== Tally Proposal Data ===");
  console.log("Contract Address:", MINIMAL_FACTORY);
  console.log("Function: deploy");
  console.log("Parameters:");
  console.log("  - initcode:", initcode);
  console.log("  - value: 0 ETH");
  
  // Create calldata for the proposal
  const calldata = factory.interface.encodeFunctionData("deploy", [initcode]);
  console.log("\nCalldata:", calldata);
  
  // Save proposal to file
  const proposalData = {
    contractAddress: MINIMAL_FACTORY,
    functionName: "deploy",
    parameters: {
      initcode: initcode,
      value: "0"
    },
    calldata: calldata,
    description: "Deploy Counter contract using MinimalFactory",
    timestamp: Date.now()
  };
  
  const fs = require('fs');
  const filename = `proposals/counter-deploy-minimal-factory-${Date.now()}.json`;
  fs.writeFileSync(filename, JSON.stringify(proposalData, null, 2));
  console.log(`\n✅ Proposal saved to: ${filename}`);
  
  console.log("\n=== Instructions for Tally ===");
  console.log("1. Go to Tally proposal creation");
  console.log("2. Add a transaction with these details:");
  console.log(`   - To: ${MINIMAL_FACTORY}`);
  console.log(`   - Value: 0 ETH`);
  console.log(`   - Data: ${calldata}`);
  console.log("3. The transaction will deploy a Counter contract");
  console.log("4. The Counter will be initialized with value=0 and owner=Timelock");
  console.log("5. The deployed address will be deterministic based on the initcode");
}

main().catch((e) => { 
  console.error(e); 
  process.exit(1); 
});
