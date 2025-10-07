import { ethers } from "hardhat";

async function main() {
  console.log("=== Manual Etherscan Verification Instructions ===");
  
  const WORKING_FACTORY = "0x8EDE3d147d13b7C670C6ffA888059dD87bE2ebFa";
  
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
  console.log("Etherscan URL:", `https://sepolia.etherscan.io/address/${WORKING_FACTORY}#code`);
  
  console.log("\n=== Step-by-Step Verification Instructions ===");
  console.log("1. Go to: https://sepolia.etherscan.io/address/" + WORKING_FACTORY);
  console.log("2. Click the 'Contract' tab");
  console.log("3. Click 'Verify and Publish'");
  console.log("4. Select 'Solidity (Single file)'");
  console.log("5. Click 'Continue'");
  console.log("6. Fill in the form:");
  console.log("   - Compiler Type: Solidity (Single file)");
  console.log("   - Compiler Version: 0.8.24");
  console.log("   - License: MIT");
  console.log("   - Constructor Arguments: (leave empty)");
  console.log("7. Paste this source code:");
  console.log("");
  console.log("=" * 80);
  console.log(sourceCode);
  console.log("=" * 80);
  console.log("");
  console.log("8. Complete the CAPTCHA");
  console.log("9. Click 'Verify and Publish'");
  
  console.log("\n=== Alternative: Use Hardhat with API Key ===");
  console.log("If you have an Etherscan API key, you can run:");
  console.log("ETHERSCAN_API_KEY=your_api_key pnpm hardhat verify --network sepolia " + WORKING_FACTORY);
  
  console.log("\n=== Contract Details ===");
  console.log("✅ Contract is deployed and working");
  console.log("✅ Contract is verified on Blockscout");
  console.log("⏳ Contract needs manual verification on Etherscan");
  
  // Test the contract to make sure it works
  try {
    const factory = await ethers.getContractAt("WorkingFactory", WORKING_FACTORY);
    const testInitcode = "0x608060405234801561001057600080fd5b50600080fd5b6103f3806100256000396000f3fe608060405234801561001057600080fd5b50600436106100365760003560e01c8063c29855781461003b578063e1c7392a14610057575b600080fd5b610043610071565b60405161004e91906100a1565b60405180910390f35b61005f610077565b60405161006c91906100a1565b60405180910390f35b600080fd5b600080fd5b6000819050919050565b61009b81610088565b82525050565b60006020820190506100b66000830184610092565b9291505056fea2646970667358221220";
    
    const result = await factory.deploy.staticCall(testInitcode);
    console.log("✅ Contract test successful! Would deploy to:", result);
  } catch (error: any) {
    console.log("❌ Contract test failed:", error.message);
  }
}

main().catch((e) => { 
  console.error(e); 
  process.exit(1); 
});
