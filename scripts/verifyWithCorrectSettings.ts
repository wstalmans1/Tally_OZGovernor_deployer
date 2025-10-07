import { ethers } from "hardhat";

async function main() {
  console.log("=== Verifying with Correct Settings ===");
  
  const WORKING_FACTORY = "0x599C8688d802EC99E599BFA31430e0038fD7AdB6";
  const ETHERSCAN_API_KEY = "Y4EGK42DDQ1NUN88QPFH7SG1K91ADT1WVZ";
  
  // The deployed contract has metadata removed due to bytecodeHash: "none"
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
  console.log("Submitting verification with settings that match deployment...");
  
  try {
    const formData = new URLSearchParams();
    formData.append("apikey", ETHERSCAN_API_KEY);
    formData.append("module", "contract");
    formData.append("action", "verifysourcecode");
    formData.append("contractaddress", WORKING_FACTORY);
    formData.append("sourcecode", sourceCode);
    formData.append("codeformat", "solidity-single-file");
    formData.append("contractname", "WorkingFactory");
    formData.append("compilerversion", "v0.8.24+commit.e801b13b");
    formData.append("optimizationUsed", "1");
    formData.append("runs", "200");
    formData.append("licenseType", "3");
    formData.append("constructorArguements", "");

    const response = await fetch("https://api-sepolia.etherscan.io/api", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: formData,
    });

    const result = await response.json();
    console.log("Verification response:", result);
    
    if (result.status === "1") {
      console.log("✅ Verification submitted successfully!");
      console.log("GUID:", result.result);
      console.log("Etherscan URL: https://sepolia.etherscan.io/address/" + WORKING_FACTORY);
      
      // Wait and check status
      console.log("\n=== Checking verification status in 20 seconds... ===");
      await new Promise(resolve => setTimeout(resolve, 20000));
      
      const statusResponse = await fetch(
        `https://api-sepolia.etherscan.io/api?module=contract&action=getsourcecode&address=${WORKING_FACTORY}&apikey=${ETHERSCAN_API_KEY}`
      );
      const statusData = await statusResponse.json();
      
      if (statusData.result[0].SourceCode && statusData.result[0].SourceCode !== "") {
        console.log("✅ Contract is now verified on Etherscan!");
        console.log("Contract Name:", statusData.result[0].ContractName);
        console.log("Compiler Version:", statusData.result[0].CompilerVersion);
        console.log("Optimization Used:", statusData.result[0].OptimizationUsed);
        console.log("Runs:", statusData.result[0].Runs);
      } else {
        console.log("⏳ Verification still processing...");
        console.log("Status:", statusData.result[0].ABI);
      }
    } else {
      console.log("❌ Verification failed:", result.message);
      if (result.result) {
        console.log("Error details:", result.result);
      }
    }
  } catch (error: any) {
    console.log("❌ Error:", error.message);
  }
  
  console.log("\n=== Final Status ===");
  console.log("Contract Address:", WORKING_FACTORY);
  console.log("Etherscan:", `https://sepolia.etherscan.io/address/${WORKING_FACTORY}#code`);
  console.log("Blockscout:", `https://eth-sepolia.blockscout.com/address/${WORKING_FACTORY}#code`);
}

main().catch((e) => { 
  console.error(e); 
  process.exit(1); 
});
