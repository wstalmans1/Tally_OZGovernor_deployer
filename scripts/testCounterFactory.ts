import { ethers } from "hardhat";

async function main() {
  console.log("=== Testing Counter Factory ===");
  
  // Deploy a test timelock (for testing purposes)
  const [deployer] = await ethers.getSigners();
  console.log("Deployer:", deployer.address);
  
  // Deploy CounterFactory
  const Factory = await ethers.getContractFactory("CounterFactory");
  const factory = await Factory.deploy(deployer.address); // Use deployer as timelock for test
  await factory.waitForDeployment();
  
  console.log("CounterFactory deployed at:", await factory.getAddress());
  console.log("Owner:", await factory.owner());
  
  // Test address computation
  const salt = ethers.utils.keccak256(ethers.utils.toUtf8Bytes("test-counter"));
  const initial = 42;
  const counterOwner = deployer.address;
  
  const predictedAddress = await factory.computeAddress(salt, initial, counterOwner);
  console.log("\nPredicted Counter address:", predictedAddress);
  
  // Deploy Counter
  console.log("\nDeploying Counter...");
  const tx = await factory.deployCounter(salt, initial, counterOwner);
  const receipt = await tx.wait();
  
  const counterAddress = receipt.events?.find(e => e.event === "CounterDeployed")?.args?.counter;
  console.log("Actual Counter address:", counterAddress);
  console.log("Addresses match:", predictedAddress === counterAddress);
  
  // Test Counter functionality
  const Counter = await ethers.getContractFactory("Counter");
  const counter = Counter.attach(counterAddress);
  
  console.log("\nCounter initial value:", (await counter.value()).toString());
  console.log("Counter owner:", await counter.owner());
  
  // Test configuration
  await counter.setValue(100);
  console.log("After setValue(100):", (await counter.value()).toString());
  
  await counter.inc(5);
  console.log("After inc(5):", (await counter.value()).toString());
  
  const configKey = ethers.utils.keccak256(ethers.utils.toUtf8Bytes("maxStep"));
  await counter.setConfig(configKey, 10);
  console.log("Config maxStep:", (await counter.config(configKey)).toString());
  
  console.log("\n=== Test completed successfully! ===");
}

main().catch((e) => { 
  console.error(e); 
  process.exit(1); 
});
