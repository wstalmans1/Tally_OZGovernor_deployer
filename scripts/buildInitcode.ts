import { ethers } from "hardhat";

/**
 * Usage examples:
 *  export TARGET="Counter"
 *  export ARGS='[0,"0xYourTimelock"]'
 *  pnpm hardhat run scripts/buildInitcode.ts --network sepolia
 */
async function main() {
  const target = process.env.TARGET || "Counter";
  const args = process.env.ARGS ? JSON.parse(process.env.ARGS) : [];
  
  console.log("=== Building Initcode for Any Contract ===");
  console.log("Target contract:", target);
  console.log("Constructor args:", JSON.stringify(args));
  
  const f = await ethers.getContractFactory(target);
  const tx = await f.getDeployTransaction(...args);
  const initcode = tx.data as string; // bytecode + encoded constructor args
  
  if (!initcode || initcode === "0x") throw new Error("Empty initcode; check constructor args");
  
  console.log("\n=== RESULTS ===");
  console.log("Initcode:", initcode);
  console.log("Initcode length (bytes):", (initcode.length - 2) / 2);
  console.log("Initcode keccak256:", ethers.keccak256(initcode));
  
  console.log("\n=== FOR TALLY PROPOSAL ===");
  console.log("Use this initcode in your BytecodeFactory.deployCreate2() call:");
  console.log(`Target: <FACTORY_ADDRESS>`);
  console.log(`Function: deployCreate2(bytes32,bytes)`);
  console.log(`Args: [<SALT>, "${initcode}"]`);
  console.log(`Value: 0`);
  
  console.log("\n=== ENVIRONMENT VARIABLES ===");
  console.log(`export INITCODE="${initcode}"`);
  console.log(`export INITCODE_HASH="${ethers.keccak256(initcode)}"`);
}

main().catch((e) => { 
  console.error(e); 
  process.exit(1); 
});
