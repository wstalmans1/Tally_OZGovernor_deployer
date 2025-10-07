import { ethers } from "hardhat";

async function main() {
  console.log("=== Checking Verification Status ===");
  
  const WORKING_FACTORY = "0xe53e754a335610813051485166D5ad641d485918";
  
  // Check if contract has code
  const code = await ethers.provider.getCode(WORKING_FACTORY);
  console.log("Contract has code:", code !== "0x");
  console.log("Code length:", code.length);
  
  // Try to get contract at address
  try {
    const factory = await ethers.getContractAt("WorkingFactory", WORKING_FACTORY);
    console.log("✅ Contract interface loaded successfully");
    
    // Try to call a function
    const testData = ethers.toUtf8Bytes("test");
    try {
      const result = await factory.deploy.staticCall(testData);
      console.log("✅ Contract functions work correctly");
    } catch (error: any) {
      console.log("❌ Contract function call failed:", error.message);
    }
  } catch (error: any) {
    console.log("❌ Failed to load contract interface:", error.message);
  }
  
  console.log("\n=== Verification URLs ===");
  console.log("Etherscan Sepolia:", `https://sepolia.etherscan.io/address/${WORKING_FACTORY}#code`);
  console.log("Blockscout Sepolia:", `https://eth-sepolia.blockscout.com/address/${WORKING_FACTORY}#code`);
  
  console.log("\n=== Manual Verification Instructions ===");
  console.log("If the contract is not showing as verified on Etherscan:");
  console.log("1. Go to: https://sepolia.etherscan.io/address/" + WORKING_FACTORY);
  console.log("2. Click 'Contract' tab");
  console.log("3. Click 'Verify and Publish'");
  console.log("4. Select 'Solidity (Single file)'");
  console.log("5. Use this source code:");
  console.log("");
  console.log("// SPDX-License-Identifier: MIT");
  console.log("pragma solidity ^0.8.24;");
  console.log("");
  console.log("contract WorkingFactory {");
  console.log("    event Deployed(address indexed addr, uint256 value);");
  console.log("    ");
  console.log("    error EmptyInitcode();");
  console.log("    error DeployFailed();");
  console.log("    ");
  console.log("    function deploy(bytes calldata initcode)");
  console.log("        external");
  console.log("        payable");
  console.log("        returns (address addr)");
  console.log("    {");
  console.log("        if (initcode.length == 0) revert EmptyInitcode();");
  console.log("        assembly {");
  console.log("            addr := create(callvalue(), initcode.offset, initcode.length)");
  console.log("        }");
  console.log("        if (addr == address(0)) revert DeployFailed();");
  console.log("        emit Deployed(addr, msg.value);");
  console.log("    }");
  console.log("}");
}

main().catch((e) => { 
  console.error(e); 
  process.exit(1); 
});
