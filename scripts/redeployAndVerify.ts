import { ethers } from "hardhat";

async function main() {
  console.log("=== Redeploying and Verifying WorkingFactory ===");
  
  // Deploy WorkingFactory
  const WorkingFactory = await ethers.getContractFactory("WorkingFactory");
  const factory = await WorkingFactory.deploy();
  await factory.waitForDeployment();
  
  const factoryAddress = await factory.getAddress();
  console.log("WorkingFactory deployed at:", factoryAddress);
  
  // Test the factory
  console.log("\n=== Testing Factory ===");
  const testInitcode = "0x608060405234801561001057600080fd5b50600080fd5b6103f3806100256000396000f3fe608060405234801561001057600080fd5b50600436106100365760003560e01c8063c29855781461003b578063e1c7392a14610057575b600080fd5b610043610071565b60405161004e91906100a1565b60405180910390f35b61005f610077565b60405161006c91906100a1565b60405180910390f35b600080fd5b600080fd5b6000819050919050565b61009b81610088565b82525050565b60006020820190506100b66000830184610092565b9291505056fea2646970667358221220";
  
  try {
    const result = await factory.deploy.staticCall(testInitcode);
    console.log("✅ Factory test successful! Would deploy to:", result);
  } catch (error: any) {
    console.log("❌ Factory test failed:", error.message);
  }
  
  // Verify on Etherscan
  console.log("\n=== Verifying on Etherscan ===");
  try {
    await hre.run("verify:verify", {
      address: factoryAddress,
      constructorArguments: [],
    });
    console.log("✅ Contract verified on Etherscan");
  } catch (verifyError: any) {
    console.log("❌ Etherscan verification failed:", verifyError.message);
  }
  
  // Verify on Blockscout
  console.log("\n=== Verifying on Blockscout ===");
  try {
    await hre.run("verify:verify", {
      address: factoryAddress,
      constructorArguments: [],
      network: "sepolia-blockscout"
    });
    console.log("✅ Contract verified on Blockscout");
  } catch (blockscoutError: any) {
    console.log("❌ Blockscout verification failed:", blockscoutError.message);
  }
  
  console.log("\n=== Final Contract Details ===");
  console.log("Address:", factoryAddress);
  console.log("Etherscan:", `https://sepolia.etherscan.io/address/${factoryAddress}#code`);
  console.log("Blockscout:", `https://eth-sepolia.blockscout.com/address/${factoryAddress}#code`);
  
  // Create updated proposal
  console.log("\n=== Updated Proposal Data ===");
  const Counter = await ethers.getContractFactory("Counter");
  const constructorArgs = ethers.AbiCoder.defaultAbiCoder().encode(
    ["uint256", "address"],
    [0, "0xD54343A590e8fAAa1cb9ea9F1fddef4ABd365310"]
  );
  const initcode = Counter.bytecode + constructorArgs.slice(2);
  
  const calldata = factory.interface.encodeFunctionData("deploy", [initcode]);
  console.log("Contract Address:", factoryAddress);
  console.log("Calldata:", calldata);
}

main().catch((e) => { 
  console.error(e); 
  process.exit(1); 
});
