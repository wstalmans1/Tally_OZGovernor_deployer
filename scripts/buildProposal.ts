import { ethers } from "hardhat";

async function main() {
  console.log("=== Building Tally Proposal Data ===");
  
  // Contract addresses
  const FACTORY_ADDRESS = "0x7E3aC36e1aeD213c9d34a188CeA7649205c21a8e";
  const PREDICTED_COUNTER = "0xA87DB77625fee6496e0C51E4930A0f4367acCbff";
  const TIMELOCK = "0xD54343A590e8fAAa1cb9ea9F1fddef4ABd365310";
  
  // Salt and parameters
  const salt = ethers.keccak256(ethers.toUtf8Bytes("counter-1"));
  const initial = 0;
  const counterOwner = TIMELOCK;
  
  console.log("Factory Address:", FACTORY_ADDRESS);
  console.log("Predicted Counter Address:", PREDICTED_COUNTER);
  console.log("Salt:", salt);
  console.log("Initial Value:", initial);
  console.log("Counter Owner:", counterOwner);
  
  // Get contract interfaces
  const factoryInterface = new ethers.Interface([
    "function deployCounter(bytes32 salt, uint256 initial, address ctrOwner) external"
  ]);
  
  const counterInterface = new ethers.Interface([
    "function setValue(uint256 newValue) external",
    "function setConfig(bytes32 key, uint256 val) external", 
    "function inc(uint256 by) external"
  ]);
  
  // Build proposal data
  const targets = [
    FACTORY_ADDRESS,           // Action 1: Deploy Counter
    PREDICTED_COUNTER,         // Action 2: setValue
    PREDICTED_COUNTER,         // Action 3: setConfig
    PREDICTED_COUNTER          // Action 4: inc
  ];
  
  const values = [0, 0, 0, 0]; // No ETH sent
  
  const calldatas = [
    // Action 1: deployCounter(bytes32,uint256,address)
    factoryInterface.encodeFunctionData("deployCounter", [salt, initial, counterOwner]),
    
    // Action 2: setValue(uint256)
    counterInterface.encodeFunctionData("setValue", [42]),
    
    // Action 3: setConfig(bytes32,uint256) 
    counterInterface.encodeFunctionData("setConfig", [
      ethers.keccak256(ethers.toUtf8Bytes("maxStep")), 
      3
    ]),
    
    // Action 4: inc(uint256)
    counterInterface.encodeFunctionData("inc", [1])
  ];
  
  console.log("\n=== PROPOSAL DATA FOR TALLY ===");
  console.log("Targets:");
  console.log(JSON.stringify(targets, null, 2));
  
  console.log("\nValues:");
  console.log(JSON.stringify(values, null, 2));
  
  console.log("\nCalldatas:");
  console.log(JSON.stringify(calldatas, null, 2));
  
  console.log("\n=== INDIVIDUAL ACTIONS ===");
  console.log("Action 1 - Deploy Counter:");
  console.log(`  Target: ${targets[0]}`);
  console.log(`  Value: ${values[0]}`);
  console.log(`  Calldata: ${calldatas[0]}`);
  
  console.log("\nAction 2 - Set Value to 42:");
  console.log(`  Target: ${targets[1]}`);
  console.log(`  Value: ${values[1]}`);
  console.log(`  Calldata: ${calldatas[1]}`);
  
  console.log("\nAction 3 - Set Config maxStep=3:");
  console.log(`  Target: ${targets[2]}`);
  console.log(`  Value: ${values[2]}`);
  console.log(`  Calldata: ${calldatas[2]}`);
  
  console.log("\nAction 4 - Increment by 1:");
  console.log(`  Target: ${targets[3]}`);
  console.log(`  Value: ${values[3]}`);
  console.log(`  Calldata: ${calldatas[3]}`);
  
  console.log("\n=== FOR MANUAL TALLY INPUT ===");
  console.log("Copy these values into Tally's proposal creation:");
  console.log(`Targets: ${JSON.stringify(targets)}`);
  console.log(`Values: ${JSON.stringify(values)}`);
  console.log(`Calldatas: ${JSON.stringify(calldatas)}`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});

