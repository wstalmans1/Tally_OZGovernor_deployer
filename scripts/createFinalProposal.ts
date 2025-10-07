import { ethers } from "hardhat";

async function main() {
  console.log("=== Creating Final Working Tally Proposal ===");
  
  const TIMELOCK = "0xD54343A590e8fAAa1cb9ea9F1fddef4ABd365310";
  const WORKING_FACTORY = "0xe53e754a335610813051485166D5ad641d485918";
  
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
  const factory = await ethers.getContractAt("WorkingFactory", WORKING_FACTORY);
  
  try {
    const deployResult = await factory.deploy.staticCall(initcode);
    console.log("✅ Deployment simulation successful! Would deploy to:", deployResult);
  } catch (error: any) {
    console.log("❌ Deployment simulation failed:", error.message);
  }
  
  // Create the proposal data
  console.log("\n=== Tally Proposal Data ===");
  console.log("Contract Address:", WORKING_FACTORY);
  console.log("Function: deploy");
  console.log("Parameters:");
  console.log("  - initcode:", initcode);
  console.log("  - value: 0 ETH");
  
  // Create calldata for the proposal
  const calldata = factory.interface.encodeFunctionData("deploy", [initcode]);
  console.log("\nCalldata:", calldata);
  
  // Save proposal to file
  const proposalData = {
    contractAddress: WORKING_FACTORY,
    functionName: "deploy",
    parameters: {
      initcode: initcode,
      value: "0"
    },
    calldata: calldata,
    description: "Deploy Counter contract using WorkingFactory",
    timestamp: Date.now(),
    expectedDeployedAddress: "0x270aD5d82adb5FD383aDF80583d8AF98FBE6dad1"
  };
  
  const fs = require('fs');
  const filename = `proposals/counter-deploy-working-factory-${Date.now()}.json`;
  fs.writeFileSync(filename, JSON.stringify(proposalData, null, 2));
  console.log(`\n✅ Proposal saved to: ${filename}`);
  
  console.log("\n=== Instructions for Tally ===");
  console.log("1. Go to Tally proposal creation");
  console.log("2. Add a transaction with these details:");
  console.log(`   - To: ${WORKING_FACTORY}`);
  console.log(`   - Value: 0 ETH`);
  console.log(`   - Data: ${calldata}`);
  console.log("3. The transaction will deploy a Counter contract");
  console.log("4. The Counter will be initialized with value=0 and owner=Timelock");
  console.log("5. Expected deployed address: 0x270aD5d82adb5FD383aDF80583d8AF98FBE6dad1");
  console.log("6. This factory has NO onlyOwner restriction, so it will work from any address");
  
  console.log("\n=== Verification ===");
  console.log("The WorkingFactory is deployed and verified at:");
  console.log("https://eth-sepolia.blockscout.com/address/" + WORKING_FACTORY + "#code");
}

main().catch((e) => { 
  console.error(e); 
  process.exit(1); 
});
