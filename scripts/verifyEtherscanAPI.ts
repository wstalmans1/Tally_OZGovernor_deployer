import { ethers } from "hardhat";

async function main() {
  console.log("=== Verifying on Etherscan using API ===");
  
  const WORKING_FACTORY = "0x8EDE3d147d13b7C670C6ffA888059dD87bE2ebFa";
  const ETHERSCAN_API_KEY = "Y4EGK42DDQ1NUN88QPFH7SG1K91ADT1WVZ";
  
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

  // Prepare verification data
  const verificationData = {
    apikey: ETHERSCAN_API_KEY,
    module: "contract",
    action: "verifysourcecode",
    contractaddress: WORKING_FACTORY,
    sourcecode: sourceCode,
    codeformat: "solidity-single-file",
    contractname: "WorkingFactory",
    compilerversion: "v0.8.24+commit.e801b13b",
    optimizationUsed: "1",
    runs: "200",
    licenseType: "3", // MIT
    constructorArguements: ""
  };

  console.log("Submitting verification to Etherscan...");
  
  try {
    const formData = new URLSearchParams();
    Object.entries(verificationData).forEach(([key, value]) => {
      formData.append(key, value);
    });

    const response = await fetch("https://api-sepolia.etherscan.io/api", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: formData,
    });

    const result = await response.json();
    
    if (result.status === "1") {
      console.log("✅ Verification submitted successfully!");
      console.log("GUID:", result.result);
      console.log("Check status at: https://sepolia.etherscan.io/address/" + WORKING_FACTORY);
    } else {
      console.log("❌ Verification failed:", result.message);
      console.log("Result:", result);
    }
  } catch (error: any) {
    console.log("❌ Error submitting verification:", error.message);
  }
  
  console.log("\n=== Alternative: Manual Verification ===");
  console.log("If API verification fails, use manual verification:");
  console.log("1. Go to: https://sepolia.etherscan.io/address/" + WORKING_FACTORY);
  console.log("2. Click 'Contract' tab");
  console.log("3. Click 'Verify and Publish'");
  console.log("4. Select 'Solidity (Single file)'");
  console.log("5. Compiler Version: 0.8.24");
  console.log("6. License: MIT");
  console.log("7. Paste the source code above");
}

main().catch((e) => { 
  console.error(e); 
  process.exit(1); 
});
