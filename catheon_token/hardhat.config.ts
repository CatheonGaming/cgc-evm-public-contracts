import * as dotenv from "dotenv";
import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";

import "./scripts/deploy";

dotenv.config();

const config: HardhatUserConfig = {
  defaultNetwork: "hardhat",
  solidity: { version: "0.8.4" },
  networks: {
    hardhat: {
      hardfork: "istanbul",
      gas: 9500000,
      chainId: 31337,
      accounts: {
        count: 10,
        mnemonic: "horn horn horn horn horn horn horn horn horn horn horn horn",
        path: "m/44'/60'/0'/0",
      },
    },
    bsc_testnet: {
      url: "https://data-seed-prebsc-1-s1.binance.org:8545",
      chainId: 97,
      gasPrice: 20000000000,
      accounts: [process.env.ADMIN_KEY || ""],
    },
    bsc_mainnet: {
      url: "https://bsc-dataseed.binance.org/",
      chainId: 56,
      gasPrice: 20000000000,
      accounts: [process.env.ADMIN_KEY || ""],
    },
    ropsten: {
      url: `https://ropsten.infura.io/v3/${process.env.INFURA_API_KEY}`,
      accounts: [process.env.ADMIN_KEY || ""],
    },
    mainnet: {
      url: `https://mainnet.infura.io/v3/${process.env.INFURA_API_KEY}`,
      accounts: [process.env.ADMIN_KEY || ""],
    },
    mumbai: {
      url: "https://rpc-mumbai.maticvigil.com",
      accounts: [process.env.ADMIN_KEY || ""],
      chainId: 80001,
    },
    polygon: {
      url: "https://polygon-rpc.com",
      accounts: [process.env.ADMIN_KEY || ""],
      chainId: 137,
    },
  },
  gasReporter: {
    enabled: !!process.env.REPORT_GAS,
    currency: "USD",
  },
  typechain: {
    outDir: "./build/typechain",
    target: "ethers-v5",
  },
  paths: {
    sources: "contracts",
    artifacts: "./build/artifacts",
    cache: "./build/cache",
  },
  etherscan: {
    apiKey: process.env.ETHERSCAN_API_KEY,
  },
};

export default config;
