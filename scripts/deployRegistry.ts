import { ethers } from "hardhat";

async function main() {
  const timelock = process.env.TIMELOCK_ADDRESS!;
  if (!timelock) throw new Error("Missing TIMELOCK_ADDRESS");

  const F = await ethers.getContractFactory("ContractRegistry");
  const r = await F.deploy(timelock);
  await r.waitForDeployment();
  console.log("ContractRegistry:", await r.getAddress());
}

main().catch(e => { console.error(e); process.exit(1); });


