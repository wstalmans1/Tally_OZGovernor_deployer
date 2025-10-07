import { ethers } from "hardhat";
import fs from "fs";

async function main() {
  console.log("=== Building Counter Deploy Proposal ===");
  
  // Contract addresses
  const BYTECODE_FACTORY = "0x596E8CC6e08aA684FFf78FdBF7E5146386ff76A0";
  const CONTRACT_REGISTRY = "0x793DB78E2d4dD68564735743FABc45482e6B9eeB";
  
  // Counter constructor parameters
  const INITIAL_VALUE = 0;
  const COUNTER_OWNER = "0xD54343A590e8fAAa1cb9ea9F1fddef4ABd365310"; // Timelock address
  
  console.log("BytecodeFactory:", BYTECODE_FACTORY);
  console.log("ContractRegistry:", CONTRACT_REGISTRY);
  console.log("Initial Value:", INITIAL_VALUE);
  console.log("Counter Owner:", COUNTER_OWNER);
  
  // Get the Counter contract factory
  const Counter = await ethers.getContractFactory("Counter");
  
  // Encode the constructor arguments
  const constructorArgs = ethers.AbiCoder.defaultAbiCoder().encode(
    ["uint256", "address"],
    [INITIAL_VALUE, COUNTER_OWNER]
  );
  
  // Get the bytecode
  const bytecode = Counter.bytecode;
  
  // Create the initcode (bytecode + constructor args)
  const initcode = bytecode + constructorArgs.slice(2); // Remove 0x prefix
  
  console.log("\n=== Initcode Details ===");
  console.log("Bytecode length:", bytecode.length);
  console.log("Constructor args:", constructorArgs);
  console.log("Initcode length:", initcode.length);
  console.log("Initcode (first 100 chars):", initcode.slice(0, 100) + "...");
  
  // Registry parameters
  const KIND = ethers.keccak256(ethers.toUtf8Bytes("Counter"));
  const VERSION = 1;
  const LABEL = "Counter v1.0";
  const URI = "https://github.com/your-org/counter-contract";
  
  console.log("\n=== Registry Parameters ===");
  console.log("Kind:", KIND);
  console.log("Version:", VERSION);
  console.log("Label:", LABEL);
  console.log("URI:", URI);
  
  // Encode the function call
  const functionData = ethers.Interface.from([
    "function deployAndRegister(bytes calldata initcode, address registry, bytes32 kind, uint64 version, string calldata label, string calldata uri) external payable returns (address)"
  ]).encodeFunctionData("deployAndRegister", [
    initcode,
    CONTRACT_REGISTRY,
    KIND,
    VERSION,
    LABEL,
    URI
  ]);
  
  console.log("\n=== Tally Proposal Details ===");
  console.log("Target Contract:", BYTECODE_FACTORY);
  console.log("Function: deployAndRegister");
  console.log("Value: 0 ETH");
  console.log("Calldata:", functionData);
  
  // Create proposal JSON
  const proposal = {
    title: "Deploy Counter Contract via BytecodeFactory",
    description: `This proposal deploys a new Counter contract using the BytecodeFactory and registers it in the ContractRegistry.

**Contract Details:**
- Initial Value: ${INITIAL_VALUE}
- Owner: ${COUNTER_OWNER}
- Kind: Counter
- Version: ${VERSION}
- Label: ${LABEL}

**Function Call:**
- Target: ${BYTECODE_FACTORY}
- Function: deployAndRegister
- Value: 0 ETH
- Calldata: ${functionData}

**Registry Parameters:**
- Registry: ${CONTRACT_REGISTRY}
- Kind: ${KIND}
- Version: ${VERSION}
- Label: ${LABEL}
- URI: ${URI}`,
    target: BYTECODE_FACTORY,
    function: "deployAndRegister",
    value: "0",
    calldata: functionData,
    initcode: initcode,
    constructorArgs: constructorArgs,
    registryParams: {
      registry: CONTRACT_REGISTRY,
      kind: KIND,
      version: VERSION,
      label: LABEL,
      uri: URI
    }
  };
  
  // Save proposal to file
  const filename = `proposals/counter-deploy-proposal-${Date.now()}.json`;
  fs.mkdirSync("proposals", { recursive: true });
  fs.writeFileSync(filename, JSON.stringify(proposal, null, 2));
  
  console.log(`\n✅ Proposal saved to: ${filename}`);
  console.log("\n=== Next Steps ===");
  console.log("1. Go to Tally: https://www.tally.xyz/");
  console.log("2. Connect your wallet");
  console.log("3. Create a new proposal");
  console.log("4. Use the details above to fill in the proposal form");
  console.log("5. Submit the proposal for voting");
  
  // Also create a simple script for testing
  const testScript = `// Test script for Counter deployment
import { ethers } from "hardhat";

async function testCounterDeploy() {
  const BYTECODE_FACTORY = "${BYTECODE_FACTORY}";
  const CONTRACT_REGISTRY = "${CONTRACT_REGISTRY}";
  const initcode = "${initcode}";
  
  const factory = await ethers.getContractAt("BytecodeFactory", BYTECODE_FACTORY);
  
  // This would be called by the Timelock after proposal execution
  const tx = await factory.deployAndRegister(
    initcode,
    CONTRACT_REGISTRY,
    "${KIND}",
    ${VERSION},
    "${LABEL}",
    "${URI}"
  );
  
  const receipt = await tx.wait();
  console.log("Counter deployed at:", receipt.logs[0].args.addr);
}

testCounterDeploy().catch(console.error);`;
  
  fs.writeFileSync("scripts/testCounterDeploy.ts", testScript);
  console.log("✅ Test script created: scripts/testCounterDeploy.ts");
}

main().catch((e) => { 
  console.error(e); 
  process.exit(1); 
});
