const { ethers } = require("hardhat");

async function checkDeployment() {
    const provider = new ethers.JsonRpcProvider("https://sepolia.infura.io/v3/YOUR_INFURA_KEY"); // Replace with your RPC URL
    
    const expectedAddress = "0x9e3855beb7dc62201ad80496388c9d5082f5ce10";
    const singletonFactory = "0xce0042B868300000d44A59004Da54A005ffdcf9f";
    
    console.log("Checking deployment...");
    console.log("Expected address:", expectedAddress);
    
    try {
        // Check if contract exists at expected address
        const code = await provider.getCode(expectedAddress);
        console.log("Code at expected address:", code === "0x" ? "No contract" : "Contract exists");
        
        if (code !== "0x") {
            console.log("✅ Contract found at expected address!");
            console.log("Code length:", code.length);
        } else {
            console.log("❌ No contract at expected address");
            
            // Check if it might be at a different address by looking at recent transactions
            console.log("\nChecking Singleton Factory recent transactions...");
            
            // Get recent blocks and look for contract creation
            const latestBlock = await provider.getBlockNumber();
            console.log("Latest block:", latestBlock);
            
            // Check a few recent blocks for contract creations
            for (let i = 0; i < 5; i++) {
                const block = await provider.getBlock(latestBlock - i, true);
                if (block && block.transactions) {
                    for (const tx of block.transactions) {
                        if (tx.to === singletonFactory && tx.contractAddress) {
                            console.log(`Found contract creation in block ${block.number}:`, tx.contractAddress);
                            
                            // Check if this contract has the expected bytecode
                            const contractCode = await provider.getCode(tx.contractAddress);
                            if (contractCode !== "0x") {
                                console.log(`Contract at ${tx.contractAddress} has code length:`, contractCode.length);
                                
                                // Try to call the value() function to see if it's our Counter
                                try {
                                    const counterAbi = ["function value() view returns (uint256)"];
                                    const contract = new ethers.Contract(tx.contractAddress, counterAbi, provider);
                                    const value = await contract.value();
                                    console.log(`✅ Found Counter contract at ${tx.contractAddress} with value: ${value}`);
                                } catch (e) {
                                    console.log(`Contract at ${tx.contractAddress} is not a Counter`);
                                }
                            }
                        }
                    }
                }
            }
        }
    } catch (error) {
        console.error("Error:", error.message);
    }
}

checkDeployment();
