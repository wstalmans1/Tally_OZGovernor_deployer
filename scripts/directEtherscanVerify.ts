import { ethers } from "hardhat";

async function main() {
  console.log("=== Direct Etherscan Verification (Bypassing Hardhat Config) ===");
  
  const WORKING_FACTORY = "0x8EDE3d147d13b7C670C6ffA888059dD87bE2ebFa";
  const ETHERSCAN_API_KEY = "Y4EGK42DDQ1NUN88QPFH7SG1K91ADT1WVZ";
  
  // Get the actual deployed bytecode to verify it matches
  const deployedCode = await ethers.provider.getCode(WORKING_FACTORY);
  console.log("Deployed bytecode length:", deployedCode.length);
  
  // Get the expected bytecode from our contract
  const WorkingFactory = await ethers.getContractFactory("WorkingFactory");
  const expectedBytecode = WorkingFactory.bytecode;
  console.log("Expected bytecode length:", expectedBytecode.length);
  console.log("Bytecode matches:", deployedCode === expectedBytecode);
  
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

  console.log("\n=== Submitting to Etherscan API ===");
  
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
    console.log("API Response:", result);
    
    if (result.status === "1") {
      console.log("✅ Verification submitted successfully!");
      console.log("GUID:", result.result);
      console.log("Check status at: https://sepolia.etherscan.io/address/" + WORKING_FACTORY);
      
      // Wait a moment and check status
      console.log("\n=== Checking verification status in 10 seconds... ===");
      await new Promise(resolve => setTimeout(resolve, 10000));
      
      const statusResponse = await fetch(
        `https://api-sepolia.etherscan.io/api?module=contract&action=getsourcecode&address=${WORKING_FACTORY}&apikey=${ETHERSCAN_API_KEY}`
      );
      const statusData = await statusResponse.json();
      
      if (statusData.result[0].SourceCode && statusData.result[0].SourceCode !== "") {
        console.log("✅ Contract is now verified on Etherscan!");
        console.log("Contract Name:", statusData.result[0].ContractName);
        console.log("Compiler Version:", statusData.result[0].CompilerVersion);
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
}

main().catch((e) => { 
  console.error(e); 
  process.exit(1); 
});
