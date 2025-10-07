import { ethers } from "hardhat";

async function main() {
  console.log("=== Debugging Deployment Issue ===");
  
  const WORKING_FACTORY = "0x599C8688d802EC99E599BFA31430e0038fD7AdB6";
  const TIMELOCK = "0xD54343A590e8fAAa1cb9ea9F1fddef4ABd365310";
  
  // Get the WorkingFactory contract
  const factory = await ethers.getContractAt("WorkingFactory", WORKING_FACTORY);
  
  // Create Counter initcode
  const Counter = await ethers.getContractFactory("Counter");
  const constructorArgs = ethers.AbiCoder.defaultAbiCoder().encode(
    ["uint256", "address"],
    [0, TIMELOCK]
  );
  const initcode = Counter.bytecode + constructorArgs.slice(2);
  
  console.log("=== Initcode Analysis ===");
  console.log("Counter bytecode length:", Counter.bytecode.length);
  console.log("Constructor args:", constructorArgs);
  console.log("Full initcode length:", initcode.length);
  console.log("Initcode (first 100 chars):", initcode.slice(0, 100));
  console.log("Initcode (last 100 chars):", initcode.slice(-100));
  console.log("Is valid hex:", /^0x[0-9a-fA-F]+$/.test(initcode));
  
  // Test the deployment
  console.log("\n=== Testing Deployment ===");
  try {
    const result = await factory.deploy.staticCall(initcode);
    console.log("✅ Static call successful! Would deploy to:", result);
    
    // Try actual deployment
    console.log("\n=== Actual Deployment ===");
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
        console.log("Deployed code (last 100 chars):", deployedCode.slice(-100));
        
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
  
  // Test with a simpler contract
  console.log("\n=== Testing with Simple Contract ===");
  const simpleInitcode = "0x608060405234801561001057600080fd5b50600080fd5b6103f3806100256000396000f3fe608060405234801561001057600080fd5b50600436106100365760003560e01c8063c29855781461003b578063e1c7392a14610057575b600080fd5b610043610071565b60405161004e91906100a1565b60405180910390f35b61005f610077565b60405161006c91906100a1565b60405180910390f35b600080fd5b600080fd5b6000819050919050565b61009b81610088565b82525050565b60006020820190506100b66000830184610092565b9291505056fea2646970667358221220";
  
  try {
    const simpleResult = await factory.deploy.staticCall(simpleInitcode);
    console.log("✅ Simple contract static call successful! Would deploy to:", simpleResult);
    
    const simpleTx = await factory.deploy(simpleInitcode);
    const simpleReceipt = await simpleTx.wait();
    console.log("✅ Simple contract deployment successful!");
    
    const simpleEvents = simpleReceipt?.logs || [];
    if (simpleEvents.length > 0) {
      const simpleEvent = factory.interface.parseLog(simpleEvents[0]);
      if (simpleEvent) {
        const simpleAddress = simpleEvent.args.addr;
        console.log("Simple contract deployed at:", simpleAddress);
        
        const simpleCode = await ethers.provider.getCode(simpleAddress);
        console.log("Simple contract code length:", simpleCode.length);
        console.log("Simple contract code (first 100 chars):", simpleCode.slice(0, 100));
      }
    }
    
  } catch (simpleError: any) {
    console.log("❌ Simple contract deployment failed:", simpleError.message);
  }
}

main().catch((e) => { 
  console.error(e); 
  process.exit(1); 
});
