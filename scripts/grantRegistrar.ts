import { ethers } from "hardhat";

async function main() {
  const registry = process.env.REGISTRY_ADDRESS!;
  const factory  = process.env.FACTORY_ADDRESS!;
  if (!registry) throw new Error("Missing REGISTRY_ADDRESS");
  if (!factory) throw new Error("Missing FACTORY_ADDRESS");

  const REGISTRAR_ROLE = ethers.keccak256(ethers.toUtf8Bytes("REGISTRAR_ROLE"));

  const reg = await ethers.getContractAt("ContractRegistry", registry);
  const tx = await reg.grantRole(REGISTRAR_ROLE, factory);
  await tx.wait();
  console.log("Granted REGISTRAR_ROLE to Factory");
}

main().catch(e => { console.error(e); process.exit(1); });


