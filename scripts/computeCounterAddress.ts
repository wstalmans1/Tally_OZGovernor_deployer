import { ethers } from "hardhat";

async function main() {
  const factoryAddr = process.env.FACTORY_ADDRESS;
  const saltStr = process.env.SALT_STRING || "counter-1";
  const initialStr = process.env.INITIAL ?? "0";
  const ctrOwner = process.env.COUNTER_OWNER;

  if (!factoryAddr) throw new Error("Missing FACTORY_ADDRESS");
  if (!ctrOwner) throw new Error("Missing COUNTER_OWNER");

  const salt = ethers.keccak256(ethers.toUtf8Bytes(saltStr));
  const initial = BigInt(initialStr);

  console.log("=== Counter Address Computation ===");
  console.log("Factory address:", factoryAddr);
  console.log("Salt string:", saltStr);
  console.log("Salt (keccak256):", salt);
  console.log("Initial value:", initial.toString());
  console.log("Counter owner:", ctrOwner);

  const factory = await ethers.getContractAt("CounterFactory", factoryAddr);
  const predicted = await factory.computeAddress(salt, initial, ctrOwner);

  console.log("\n=== Results ===");
  console.log("Predicted Counter address:", predicted);
  
  console.log("\n=== Tally Proposal Actions ===");
  console.log("Action 1 - Deploy Counter:");
  console.log(`  Target: ${factoryAddr}`);
  console.log(`  Function: deployCounter(bytes32,uint256,address)`);
  console.log(`  Args: [${salt}, ${initial}, ${ctrOwner}]`);
  console.log(`  Value: 0`);
  
  console.log("\nAction 2 - Configure Counter (example):");
  console.log(`  Target: ${predicted}`);
  console.log(`  Function: setValue(uint256)`);
  console.log(`  Args: [42]`);
  console.log(`  Value: 0`);
  
  console.log("\nAction 3 - Set Config (example):");
  console.log(`  Target: ${predicted}`);
  console.log(`  Function: setConfig(bytes32,uint256)`);
  console.log(`  Args: [${ethers.keccak256(ethers.toUtf8Bytes("maxStep"))}, 3]`);
  console.log(`  Value: 0`);
  
  console.log("\nAction 4 - Use Counter (example):");
  console.log(`  Target: ${predicted}`);
  console.log(`  Function: inc(uint256)`);
  console.log(`  Args: [1]`);
  console.log(`  Value: 0`);
}

main().catch((e) => { 
  console.error(e); 
  process.exit(1); 
});
