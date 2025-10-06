import "dotenv/config";
import "@nomicfoundation/hardhat-toolbox";
import "hardhat-deploy";
import "hardhat-gas-reporter";
import type { HardhatUserConfig } from "hardhat/config";
import { vars } from "hardhat/config";
import { getChainConfig } from "./chain.config";

const PRIVATE_KEY = vars.get("PRIVATE_KEY", process.env.PRIVATE_KEY || "");

const config: HardhatUserConfig = {
  solidity: {
    compilers: [
      {
        version: "0.8.24",
        settings: {
          metadata: { bytecodeHash: "none" },
          optimizer: { enabled: true, runs: 200 },
          viaIR: true,
        },
      },
    ],
  },
  etherscan: {
    apiKey: {
      sepolia: vars.get("ETHERSCAN_API_KEY", process.env.ETHERSCAN_API_KEY || ""),
    },
  },
  networks: {
    sepolia: getChainConfig("sepolia"),
  },
  paths: {
    artifacts: "./artifacts",
    cache: "./cache",
    sources: "./contracts",
    tests: "./tests",
  },
  typechain: {
    outDir: "types",
    target: "ethers-v6",
  },
};

export default config;


