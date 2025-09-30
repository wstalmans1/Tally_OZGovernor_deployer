import { ethers } from "hardhat";

async function main() {
  const timelock = process.env.TIMELOCK_ADDRESS;
  if (!timelock) throw new Error("Missing TIMELOCK_ADDRESS env var");

  console.log("Deploying CounterFactory...");
  console.log("Timelock address:", timelock);

  const Factory = await ethers.getContractFactory("CounterFactory");
  const factory = await Factory.deploy(timelock);
  await factory.deployed();

  console.log("CounterFactory deployed at:", factory.address);
  console.log("Owner:", await factory.owner());
  
  console.log("\nTo verify on Etherscan, run:");
  console.log(`pnpm hardhat verify --network sepolia ${factory.address} ${timelock}`);
}

main().catch((e) => { 
  console.error(e); 
  process.exit(1); 
});
