import { ethers } from "hardhat";

async function main() {
  console.log("=== Building increment Proposal ===");
  
  const COUNTER_ADDRESS = "0x2204b84766955abF8CF3114F1f4431ad47a68E02";
  const INCREMENT_BY = 1;
  
  console.log("Counter Address:", COUNTER_ADDRESS);
  console.log("Increment By:", INCREMENT_BY);
  
  // Get counter interface
  const counterInterface = new ethers.Interface([
    "function inc(uint256 by) external"
  ]);
  
  // Build proposal data
  const targets = [COUNTER_ADDRESS];
  const values = [0]; // No ETH sent
  const calldatas = [
    counterInterface.encodeFunctionData("inc", [INCREMENT_BY])
  ];
  
  console.log("\n=== PROPOSAL: INCREMENT BY 1 ===");
  
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
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
