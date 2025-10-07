import { ethers } from "hardhat";

async function main() {
  console.log("=== Force Etherscan Verification ===");
  
  const WORKING_FACTORY = "0x8EDE3d147d13b7C670C6ffA888059dD87bE2ebFa";
  
  // Try to verify using the etherscan plugin directly
  try {
    console.log("Attempting direct Etherscan verification...");
    
    // Use the verify task with explicit etherscan configuration
    await hre.run("verify:verify", {
      address: WORKING_FACTORY,
      constructorArguments: [],
      network: "sepolia",
      // Force etherscan by overriding the custom chains
      etherscan: {
        apiKey: process.env.ETHERSCAN_API_KEY,
        customChains: []
      }
    });
    
    console.log("✅ Verification successful on Etherscan!");
  } catch (error: any) {
    console.log("❌ Direct verification failed:", error.message);
    
    // Try alternative approach - check if it's already verified
    console.log("\n=== Checking Verification Status ===");
    
    // Try to fetch contract source from Etherscan API
    const etherscanApiKey = process.env.ETHERSCAN_API_KEY;
    if (etherscanApiKey) {
      try {
        const response = await fetch(
          `https://api-sepolia.etherscan.io/api?module=contract&action=getsourcecode&address=${WORKING_FACTORY}&apikey=${etherscanApiKey}`
        );
        const data = await response.json();
        
        if (data.status === "1" && data.result[0].SourceCode) {
          console.log("✅ Contract is already verified on Etherscan!");
          console.log("Etherscan URL: https://sepolia.etherscan.io/address/" + WORKING_FACTORY + "#code");
        } else {
          console.log("❌ Contract is not verified on Etherscan");
          console.log("Response:", data);
        }
      } catch (apiError: any) {
        console.log("❌ Failed to check Etherscan API:", apiError.message);
      }
    }
  }
  
  console.log("\n=== Manual Verification ===");
  console.log("If automatic verification fails, use manual verification:");
  console.log("1. Go to: https://sepolia.etherscan.io/address/" + WORKING_FACTORY);
  console.log("2. Click 'Contract' tab");
  console.log("3. Click 'Verify and Publish'");
  console.log("4. Use the source code from the manual verification script");
}

main().catch((e) => { 
  console.error(e); 
  process.exit(1); 
});
