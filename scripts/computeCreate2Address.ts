import { ethers } from "hardhat";

/**
 * Requires:
 *  FACTORY_ADDRESS, SALT_STRING, INITCODE
 */
async function main() {
  const factoryAddr = process.env.FACTORY_ADDRESS!;
  const saltStr = process.env.SALT_STRING || "deploy-1";
  const initcode = process.env.INITCODE!;
  
  if (!factoryAddr || !initcode) throw new Error("Missing FACTORY_ADDRESS or INITCODE");
  
  console.log("=== Computing CREATE2 Address ===");
  console.log("Factory address:", factoryAddr);
  console.log("Salt string:", saltStr);
  console.log("Initcode:", initcode);
  
  const salt = ethers.keccak256(ethers.toUtf8Bytes(saltStr));
  console.log("Salt (keccak256):", salt);
  
  const factory = await ethers.getContractAt("BytecodeFactory", factoryAddr);
  const predicted = await factory.computeAddress(salt, initcode);
  
  console.log("\n=== RESULTS ===");
  console.log("Predicted address:", predicted);
  
  console.log("\n=== FOR TALLY PROPOSAL CHAINING ===");
  console.log("You can now create follow-up actions targeting this predicted address:");
  console.log(`Target: ${predicted}`);
  console.log("Example functions: setValue(uint256), setConfig(bytes32,uint256), inc(uint256)");
  
  console.log("\n=== VERIFICATION ===");
  console.log("After deployment, verify with:");
  console.log(`pnpm hardhat verify --network sepolia ${predicted} <constructor_args>`);
}

main().catch((e) => { 
  console.error(e); 
  process.exit(1); 
});
