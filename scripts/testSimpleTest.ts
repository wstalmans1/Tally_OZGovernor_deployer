import { ethers } from "hardhat";

async function main() {
  console.log("=== Testing SimpleTest ===");
  
  // Deploy SimpleTest
  const SimpleTest = await ethers.getContractFactory("SimpleTest");
  const simpleTest = await SimpleTest.deploy();
  await simpleTest.waitForDeployment();
  
  const simpleTestAddress = await simpleTest.getAddress();
  console.log("SimpleTest deployed at:", simpleTestAddress);
  
  // Test with a very simple initcode
  const simpleInitcode = "0x608060405234801561001057600080fd5b50600080fd5b6103f3806100256000396000f3fe608060405234801561001057600080fd5b50600436106100365760003560e01c8063c29855781461003b578063e1c7392a14610057575b600080fd5b610043610071565b60405161004e91906100a1565b60405180910390f35b61005f610077565b60405161006c91906100a1565b60405180910390f35b600080fd5b600080fd5b6000819050919050565b61009b81610088565b82525050565b60006020820190506100b66000830184610092565b9291505056fea2646970667358221220";
  
  try {
    console.log("\n=== Testing SimpleTest with Simple Initcode ===");
    const result = await simpleTest.testCreate.staticCall(simpleInitcode);
    console.log("✅ SimpleTest works! Would deploy to:", result);
  } catch (error: any) {
    console.log("❌ SimpleTest failed:", error.message);
  }
  
  // Test actual deployment
  try {
    console.log("\n=== Testing Actual Deployment ===");
    const tx = await simpleTest.testCreate(simpleInitcode);
    const receipt = await tx.wait();
    console.log("✅ Actual deployment successful!");
    console.log("Transaction hash:", tx.hash);
    console.log("Gas used:", receipt?.gasUsed.toString());
    
    // Get the deployed address from the return value
    const returnData = receipt?.logs[0]?.data;
    if (returnData) {
      const deployedAddress = ethers.getAddress("0x" + returnData.slice(-40));
      console.log("Deployed address:", deployedAddress);
    }
    
  } catch (actualError: any) {
    console.log("❌ Actual deployment failed:", actualError.message);
  }
  
  // Test with Counter initcode
  console.log("\n=== Testing with Counter Initcode ===");
  const Counter = await ethers.getContractFactory("Counter");
  const constructorArgs = ethers.AbiCoder.defaultAbiCoder().encode(
    ["uint256", "address"],
    [0, "0xD54343A590e8fAAa1cb9ea9F1fddef4ABd365310"]
  );
  const counterInitcode = Counter.bytecode + constructorArgs.slice(2);
  
  try {
    const result = await simpleTest.testCreate.staticCall(counterInitcode);
    console.log("✅ Counter initcode works! Would deploy to:", result);
  } catch (error: any) {
    console.log("❌ Counter initcode failed:", error.message);
  }
}

main().catch((e) => { 
  console.error(e); 
  process.exit(1); 
});
