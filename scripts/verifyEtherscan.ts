import { ethers } from "hardhat";

async function main() {
  console.log("=== Verifying on Etherscan ===");
  
  const WORKING_FACTORY = "0x8EDE3d147d13b7C670C6ffA888059dD87bE2ebFa";
  
  // Get the contract source code
  const sourceCode = `// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

contract WorkingFactory {
    event Deployed(address indexed addr, uint256 value);
    
    error EmptyInitcode();
    error DeployFailed();
    
    function deploy(bytes calldata initcode)
        external
        payable
        returns (address addr)
    {
        if (initcode.length == 0) revert EmptyInitcode();
        assembly {
            addr := create(callvalue(), initcode.offset, initcode.length)
        }
        if (addr == address(0)) revert DeployFailed();
        emit Deployed(addr, msg.value);
    }
}`;

  console.log("Contract Address:", WORKING_FACTORY);
  console.log("Source Code Length:", sourceCode.length);
  
  // Try to verify using hardhat verify with specific network
  try {
    console.log("\n=== Attempting Etherscan Verification ===");
    
    // Force verification by running the verify task directly
    await hre.run("verify:verify", {
      address: WORKING_FACTORY,
      constructorArguments: [],
      network: "sepolia"
    });
    
    console.log("✅ Verification successful!");
  } catch (error: any) {
    console.log("❌ Verification failed:", error.message);
    
    // Check if it's already verified
    if (error.message.includes("already verified")) {
      console.log("✅ Contract is already verified on Etherscan");
    } else {
      console.log("\n=== Manual Verification Instructions ===");
      console.log("1. Go to: https://sepolia.etherscan.io/address/" + WORKING_FACTORY);
      console.log("2. Click 'Contract' tab");
      console.log("3. Click 'Verify and Publish'");
      console.log("4. Select 'Solidity (Single file)'");
      console.log("5. Compiler Version: 0.8.24");
      console.log("6. License: MIT");
      console.log("7. Paste this source code:");
      console.log("");
      console.log(sourceCode);
    }
  }
  
  // Check verification status
  console.log("\n=== Verification URLs ===");
  console.log("Etherscan:", `https://sepolia.etherscan.io/address/${WORKING_FACTORY}#code`);
  console.log("Blockscout:", `https://eth-sepolia.blockscout.com/address/${WORKING_FACTORY}#code`);
}

main().catch((e) => { 
  console.error(e); 
  process.exit(1); 
});
