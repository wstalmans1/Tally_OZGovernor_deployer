import { ethers } from "hardhat";

async function main() {
  const timelock = process.env.TIMELOCK_ADDRESS!;
  if (!timelock) throw new Error("Missing TIMELOCK_ADDRESS");

  console.log("Deploying BytecodeFactory...");
  console.log("Timelock address:", timelock);

  const F = await ethers.getContractFactory("BytecodeFactory");
  const factory = await F.deploy(timelock); // sets pending owner = timelock (must accept)
  await factory.waitForDeployment();

  const factoryAddress = await factory.getAddress();
  console.log("BytecodeFactory deployed at:", factoryAddress);
  console.log("Pending owner:", await factory.pendingOwner());
  console.log("Current owner:", await factory.owner());
  
  console.log("\n=== NEXT STEPS ===");
  console.log("1. Verify the contract:");
  console.log(`   pnpm hardhat verify --network sepolia ${factoryAddress} ${timelock}`);
  console.log("\n2. Create a Tally proposal to call acceptOwnership():");
  console.log(`   Target: ${factoryAddress}`);
  console.log(`   Function: acceptOwnership()`);
  console.log(`   Args: []`);
  console.log(`   Value: 0`);
  console.log("\n3. After ownership transfer, only governance can deploy contracts!");
}

main().catch((e) => { 
  console.error(e); 
  process.exit(1); 
});
