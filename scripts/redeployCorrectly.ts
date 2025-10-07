import { ethers } from "hardhat";

async function main() {
  console.log("=== Redeploying WorkingFactory with Correct Settings ===");
  
  // Deploy WorkingFactory
  const WorkingFactory = await ethers.getContractFactory("WorkingFactory");
  const factory = await WorkingFactory.deploy();
  await factory.waitForDeployment();
  
  const factoryAddress = await factory.getAddress();
  console.log("WorkingFactory deployed at:", factoryAddress);
  
  // Test the factory
  console.log("\n=== Testing Factory ===");
  const testInitcode = "0x608060405234801561001057600080fd5b50600080fd5b6103f3806100256000396000f3fe608060405234801561001057600080fd5b50600436106100365760003560e01c8063c29855781461003b578063e1c7392a14610057575b600080fd5b610043610071565b60405161004e91906100a1565b60405180910390f35b61005f610077565b60405161006c91906100a1565b60405180910390f35b600080fd5b600080fd5b6000819050919050565b61009b81610088565b82525050565b60006020820190506100b66000830184610092565b9291505056fea2646970667358221220";
  
  try {
    const result = await factory.deploy.staticCall(testInitcode);
    console.log("✅ Factory test successful! Would deploy to:", result);
  } catch (error: any) {
    console.log("❌ Factory test failed:", error.message);
  }
  
  // Get the actual deployed bytecode
  const deployedCode = await ethers.provider.getCode(factoryAddress);
  const expectedBytecode = WorkingFactory.bytecode;
  
  console.log("\n=== Bytecode Verification ===");
  console.log("Deployed bytecode length:", deployedCode.length);
  console.log("Expected bytecode length:", expectedBytecode.length);
  console.log("Bytecode matches:", deployedCode === expectedBytecode);
  
  if (deployedCode === expectedBytecode) {
    console.log("✅ Bytecode matches - verification should work!");
    
    // Now verify on Etherscan
    console.log("\n=== Verifying on Etherscan ===");
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

    try {
      const formData = new URLSearchParams();
      formData.append("apikey", ETHERSCAN_API_KEY);
      formData.append("module", "contract");
      formData.append("action", "verifysourcecode");
      formData.append("contractaddress", factoryAddress);
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
        console.log("Etherscan URL: https://sepolia.etherscan.io/address/" + factoryAddress);
        
        // Wait and check status
        console.log("\n=== Checking verification status in 15 seconds... ===");
        await new Promise(resolve => setTimeout(resolve, 15000));
        
        const statusResponse = await fetch(
          `https://api-sepolia.etherscan.io/api?module=contract&action=getsourcecode&address=${factoryAddress}&apikey=${ETHERSCAN_API_KEY}`
        );
        const statusData = await statusResponse.json();
        
        if (statusData.result[0].SourceCode && statusData.result[0].SourceCode !== "") {
          console.log("✅ Contract is now verified on Etherscan!");
          console.log("Contract Name:", statusData.result[0].ContractName);
        } else {
          console.log("⏳ Verification still processing...");
        }
      } else {
        console.log("❌ Verification failed:", result.message);
      }
    } catch (error: any) {
      console.log("❌ Verification error:", error.message);
    }
  } else {
    console.log("❌ Bytecode still doesn't match - there's a deeper issue");
  }
  
  console.log("\n=== Final Contract Details ===");
  console.log("Address:", factoryAddress);
  console.log("Etherscan:", `https://sepolia.etherscan.io/address/${factoryAddress}#code`);
  console.log("Blockscout:", `https://eth-sepolia.blockscout.com/address/${factoryAddress}#code`);
}

main().catch((e) => { 
  console.error(e); 
  process.exit(1); 
});
