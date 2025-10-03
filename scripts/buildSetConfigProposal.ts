import { ethers } from "hardhat";

async function main() {
  console.log("=== Building setConfig Proposal ===");
  
  const COUNTER_ADDRESS = "0x2204b84766955abF8CF3114F1f4431ad47a68E02";
  const CONFIG_KEY = "maxStep";
  const CONFIG_VALUE = 3;
  
  console.log("Counter Address:", COUNTER_ADDRESS);
  console.log("Config Key:", CONFIG_KEY);
  console.log("Config Value:", CONFIG_VALUE);
  
  // Get counter interface
  const counterInterface = new ethers.Interface([
    "function setConfig(bytes32 key, uint256 val) external"
  ]);
  
  // Build proposal data
  const targets = [COUNTER_ADDRESS];
  const values = [0]; // No ETH sent
  const calldatas = [
    counterInterface.encodeFunctionData("setConfig", [
      ethers.keccak256(ethers.toUtf8Bytes(CONFIG_KEY)), 
      CONFIG_VALUE
    ])
  ];
  
  console.log("\n=== PROPOSAL: SET CONFIG maxStep=3 ===");
  
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
