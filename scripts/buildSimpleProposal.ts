import { ethers } from "hardhat";

async function main() {
  console.log("=== Building Simple Counter Deployment Proposal ===");
  
  // Contract addresses
  const FACTORY_ADDRESS = "0x7E3aC36e1aeD213c9d34a188CeA7649205c21a8e";
  const TIMELOCK = "0xD54343A590e8fAAa1cb9ea9F1fddef4ABd365310";
  
  // Salt and parameters
  const salt = ethers.keccak256(ethers.toUtf8Bytes("counter-1"));
  const initial = 0;
  const counterOwner = TIMELOCK;
  
  console.log("Factory Address:", FACTORY_ADDRESS);
  console.log("Salt:", salt);
  console.log("Initial Value:", initial);
  console.log("Counter Owner:", counterOwner);
  
  // Get factory interface
  const factoryInterface = new ethers.Interface([
    "function deployCounter(bytes32 salt, uint256 initial, address ctrOwner) external"
  ]);
  
  // Build proposal data for COUNTER DEPLOYMENT ONLY
  const targets = [FACTORY_ADDRESS];
  const values = [0]; // No ETH sent
  const calldatas = [
    factoryInterface.encodeFunctionData("deployCounter", [salt, initial, counterOwner])
  ];
  
  console.log("\n=== PROPOSAL 1: DEPLOY COUNTER ===");
  console.log("This proposal will deploy the Counter contract at a deterministic address.");
  console.log("Predicted Counter Address: 0xA87DB77625fee6496e0C51E4930A0f4367acCbff");
  
  console.log("\nTargets:");
  console.log(JSON.stringify(targets, null, 2));
  
  console.log("\nValues:");
  console.log(JSON.stringify(values, null, 2));
  
  console.log("\nCalldatas:");
  console.log(JSON.stringify(calldatas, null, 2));
  
  console.log("\n=== FOR TALLY INPUT ===");
  console.log("Copy these values into Tally:");
  console.log(`Targets: ${JSON.stringify(targets)}`);
  console.log(`Values: ${JSON.stringify(values)}`);
  console.log(`Calldatas: ${JSON.stringify(calldatas)}`);
  
  console.log("\n=== AFTER DEPLOYMENT ===");
  console.log("Once this proposal executes, you can create separate proposals for:");
  console.log("1. setValue(42)");
  console.log("2. setConfig(maxStep, 3)");
  console.log("3. inc(1)");
  console.log("Each as individual proposals targeting the deployed Counter contract.");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
