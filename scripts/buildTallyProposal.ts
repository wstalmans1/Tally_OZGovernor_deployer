import { ethers } from "hardhat";

async function main() {
  console.log("=== Building Tally Proposal for Counter Deployment ===");
  
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
  
  // Create the function call data for Tally
  const iface = new ethers.Interface([
    "function deployAndRegister(bytes calldata initcode, address registry, bytes32 kind, uint64 version, string calldata label, string calldata uri) external payable returns (address)"
  ]);
  
  const functionData = iface.encodeFunctionData("deployAndRegister", [
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
  
  // Create a simplified proposal for Tally UI
  const tallyProposal = {
    title: "Deploy Counter Contract via BytecodeFactory",
    description: `This proposal deploys a new Counter contract using the BytecodeFactory and registers it in the ContractRegistry.

**Contract Details:**
- Initial Value: ${INITIAL_VALUE}
- Owner: ${COUNTER_OWNER}
- Kind: Counter
- Version: ${VERSION}
- Label: ${LABEL}

**What this does:**
- Deploys a Counter contract with initial value 0
- Sets the Timelock as the owner
- Registers the contract in the ContractRegistry for tracking`,
    target: BYTECODE_FACTORY,
    function: "deployAndRegister",
    value: "0",
    calldata: functionData,
    // Individual parameters for Tally UI
    parameters: {
      initcode: initcode,
      registry: CONTRACT_REGISTRY,
      kind: KIND,
      version: VERSION.toString(),
      label: LABEL,
      uri: URI
    }
  };
  
  // Save proposal to file
  const filename = `proposals/tally-counter-deploy-${Date.now()}.json`;
  require('fs').mkdirSync("proposals", { recursive: true });
  require('fs').writeFileSync(filename, JSON.stringify(tallyProposal, null, 2));
  
  console.log(`\n✅ Tally proposal saved to: ${filename}`);
  
  console.log("\n=== Tally UI Instructions ===");
  console.log("1. Go to Tally and create a new proposal");
  console.log("2. Use these values:");
  console.log(`   Target: ${BYTECODE_FACTORY}`);
  console.log(`   Function: deployAndRegister`);
  console.log(`   Value: 0`);
  console.log("3. For the function parameters, use:");
  console.log(`   initcode: ${initcode}`);
  console.log(`   registry: ${CONTRACT_REGISTRY}`);
  console.log(`   kind: ${KIND}`);
  console.log(`   version: ${VERSION}`);
  console.log(`   label: ${LABEL}`);
  console.log(`   uri: ${URI}`);
  
  console.log("\n=== Alternative: Use Raw Calldata ===");
  console.log("If Tally doesn't show individual parameter fields, use:");
  console.log(`Calldata: ${functionData}`);
}

main().catch((e) => { 
  console.error(e); 
  process.exit(1); 
});
