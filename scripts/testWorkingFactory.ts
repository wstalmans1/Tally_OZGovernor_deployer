import { ethers } from "hardhat";

async function main() {
  console.log("=== Testing WorkingFactory ===");
  
  const TIMELOCK = "0xD54343A590e8fAAa1cb9ea9F1fddef4ABd365310";
  
  // Deploy WorkingFactory
  const WorkingFactory = await ethers.getContractFactory("WorkingFactory");
  const factory = await WorkingFactory.deploy();
  await factory.waitForDeployment();
  
  const factoryAddress = await factory.getAddress();
  console.log("WorkingFactory deployed at:", factoryAddress);
  
  // Test with Counter initcode
  const Counter = await ethers.getContractFactory("Counter");
  const constructorArgs = ethers.AbiCoder.defaultAbiCoder().encode(
    ["uint256", "address"],
    [0, TIMELOCK]
  );
  const initcode = Counter.bytecode + constructorArgs.slice(2);
  
  console.log("\n=== Testing Counter Deployment ===");
  console.log("Initcode length:", initcode.length);
  console.log("Initcode starts with:", initcode.slice(0, 20));
  
  try {
    const result = await factory.deploy.staticCall(initcode);
    console.log("✅ Static call successful! Would deploy to:", result);
    
    // Try actual deployment
    const tx = await factory.deploy(initcode);
    const receipt = await tx.wait();
    console.log("✅ Deployment successful!");
    console.log("Transaction hash:", tx.hash);
    console.log("Gas used:", receipt?.gasUsed.toString());
    
    // Check the deployed contract
    const events = receipt?.logs || [];
    if (events.length > 0) {
      const event = factory.interface.parseLog(events[0]);
      if (event) {
        const deployedAddress = event.args.addr;
        console.log("Deployed address:", deployedAddress);
        
        // Check the deployed contract's code
        const deployedCode = await ethers.provider.getCode(deployedAddress);
        console.log("Deployed code length:", deployedCode.length);
        console.log("Deployed code (first 100 chars):", deployedCode.slice(0, 100));
        
        if (deployedCode === "0x") {
          console.log("❌ Deployed contract has no code!");
        } else if (deployedCode.length < 100) {
          console.log("❌ Deployed contract has very little code!");
        } else {
          console.log("✅ Deployed contract has proper code");
          
          // Test the deployed counter
          try {
            const counter = await ethers.getContractAt("Counter", deployedAddress);
            const value = await counter.value();
            const owner = await counter.owner();
            console.log("Counter value:", value.toString());
            console.log("Counter owner:", owner);
            console.log("✅ Counter contract is working!");
          } catch (counterError: any) {
            console.log("❌ Counter contract test failed:", counterError.message);
          }
        }
      }
    }
    
  } catch (error: any) {
    console.log("❌ Deployment failed:", error.message);
  }
  
  // Verify the WorkingFactory
  console.log("\n=== Verifying WorkingFactory ===");
  try {
    await hre.run("verify:verify", {
      address: factoryAddress,
      constructorArguments: [],
    });
    console.log("✅ WorkingFactory verified on Etherscan");
  } catch (verifyError: any) {
    console.log("❌ Verification failed:", verifyError.message);
  }
  
  console.log("\n=== Final Contract Details ===");
  console.log("Address:", factoryAddress);
  console.log("Etherscan:", `https://sepolia.etherscan.io/address/${factoryAddress}#code`);
}

main().catch((e) => { 
  console.error(e); 
  process.exit(1); 
});