import { ethers } from "hardhat";

async function main() {
  console.log("=== Checking Bytecode Match ===");
  
  const WORKING_FACTORY = "0x8EDE3d147d13b7C670C6ffA888059dD87bE2ebFa";
  
  // Get deployed bytecode
  const deployedCode = await ethers.provider.getCode(WORKING_FACTORY);
  console.log("Deployed bytecode length:", deployedCode.length);
  console.log("Deployed bytecode (first 100 chars):", deployedCode.slice(0, 100));
  
  // Get expected bytecode from contract factory
  const WorkingFactory = await ethers.getContractFactory("WorkingFactory");
  const expectedBytecode = WorkingFactory.bytecode;
  console.log("\nExpected bytecode length:", expectedBytecode.length);
  console.log("Expected bytecode (first 100 chars):", expectedBytecode.slice(0, 100));
  
  // Check if they match
  console.log("\nBytecode matches:", deployedCode === expectedBytecode);
  
  if (deployedCode !== expectedBytecode) {
    console.log("\n❌ Bytecode mismatch detected!");
    console.log("This means the contract was compiled with different settings.");
    console.log("Need to redeploy with correct settings or verify with correct settings.");
    
    // Try to find the correct compiler version and settings
    console.log("\n=== Checking Hardhat Config ===");
    console.log("Current compiler version: 0.8.24");
    console.log("Optimization enabled: true");
    console.log("Optimization runs: 200");
    console.log("Bytecode hash: none");
  } else {
    console.log("\n✅ Bytecode matches - verification should work!");
  }
  
  // Try verification with different settings
  console.log("\n=== Trying Verification with Different Settings ===");
  
  const ETHERSCAN_API_KEY = "Y4EGK42DDQ1NUN88QPFH7SG1K91ADT1WVZ";
  
  // Try with optimization disabled
  const sourceCodeNoOpt = `// SPDX-License-Identifier: MIT
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

  try {
    const formData = new URLSearchParams();
    formData.append("apikey", ETHERSCAN_API_KEY);
    formData.append("module", "contract");
    formData.append("action", "verifysourcecode");
    formData.append("contractaddress", WORKING_FACTORY);
    formData.append("sourcecode", sourceCodeNoOpt);
    formData.append("codeformat", "solidity-single-file");
    formData.append("contractname", "WorkingFactory");
    formData.append("compilerversion", "v0.8.24+commit.e801b13b");
    formData.append("optimizationUsed", "0"); // Try without optimization
    formData.append("runs", "0");
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
    console.log("No optimization API Response:", result);
    
    if (result.status === "1") {
      console.log("✅ Verification submitted with no optimization!");
      console.log("GUID:", result.result);
    } else {
      console.log("❌ No optimization verification failed:", result.message);
    }
  } catch (error: any) {
    console.log("❌ Error:", error.message);
  }
}

main().catch((e) => { 
  console.error(e); 
  process.exit(1); 
});
