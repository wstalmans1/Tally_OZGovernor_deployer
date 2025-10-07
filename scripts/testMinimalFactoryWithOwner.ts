import { ethers } from "hardhat";

async function main() {
  console.log("=== Testing MinimalFactory with Owner Check ===");
  
  const TIMELOCK = "0xD54343A590e8fAAa1cb9ea9F1fddef4ABd365310";
  const MINIMAL_FACTORY = "0x692F8333979866221638227b0570c3FcaCe001c6";
  
  // Get the factory contract
  const factory = await ethers.getContractAt("MinimalFactory", MINIMAL_FACTORY);
  
  console.log("=== Factory State ===");
  console.log("Factory owner:", await factory.owner());
  console.log("Factory owned by Timelock:", (await factory.owner()).toLowerCase() === TIMELOCK.toLowerCase());
  
  // Test with a simple initcode
  const simpleInitcode = "0x608060405234801561001057600080fd5b50600080fd5b6103f3806100256000396000f3fe608060405234801561001057600080fd5b50600436106100365760003560e01c8063c29855781461003b578063e1c7392a14610057575b600080fd5b610043610071565b60405161004e91906100a1565b60405180910390f35b61005f610077565b60405161006c91906100a1565b60405180910390f35b600080fd5b600080fd5b6000819050919050565b61009b81610088565b82525050565b60006020820190506100b66000830184610092565b9291505056fea2646970667358221220";
  
  // Test from current signer (should fail due to onlyOwner)
  try {
    console.log("\n=== Testing from Current Signer (should fail) ===");
    const result = await factory.deploy.staticCall(simpleInitcode);
    console.log("❌ Unexpected success! Result:", result);
  } catch (error: any) {
    console.log("✅ Expected failure:", error.message);
    if (error.message.includes("Ownable: caller is not the owner")) {
      console.log("🔍 DIAGNOSIS: This is the expected onlyOwner error");
    }
  }
  
  // Test from Timelock address (should work)
  try {
    console.log("\n=== Testing from Timelock Address ===");
    const factoryAsTimelock = factory.connect(await ethers.getSigner(TIMELOCK));
    const result = await factoryAsTimelock.deploy.staticCall(simpleInitcode);
    console.log("✅ Deploy from Timelock works! Would deploy to:", result);
  } catch (error: any) {
    console.log("❌ Deploy from Timelock failed:", error.message);
    
    // This is unexpected - let's debug further
    console.log("\n=== Debugging Timelock Call ===");
    
    // Check if we can call any function from Timelock
    try {
      const owner = await factoryAsTimelock.owner();
      console.log("✅ owner() call from Timelock works:", owner);
    } catch (ownerError: any) {
      console.log("❌ owner() call from Timelock failed:", ownerError.message);
    }
    
    // Check if the issue is with the assembly code
    console.log("\n=== Testing Assembly Code Directly ===");
    
    // Create a test contract without onlyOwner
    const TestFactory = await ethers.getContractFactory("TestFactory");
    const testFactory = await TestFactory.deploy();
    await testFactory.waitForDeployment();
    
    const testFactoryAddress = await testFactory.getAddress();
    console.log("TestFactory deployed at:", testFactoryAddress);
    
    try {
      const result = await testFactory.deploy.staticCall(simpleInitcode);
      console.log("✅ TestFactory works! Would deploy to:", result);
    } catch (testError: any) {
      console.log("❌ TestFactory failed:", testError.message);
    }
  }
}

main().catch((e) => { 
  console.error(e); 
  process.exit(1); 
});
