require("@nomicfoundation/hardhat-toolbox");

require('dotenv').config();

module.exports = {
  solidity: "0.8.18",
  networks: {
    // for mainnet
    'lisk': {
      url: 'https://rpc.api.lisk.com',
      accounts: [process.env.WALLET_KEY],
      gasPrice: 1000000000,
    },
    // for testnet
    'lisk-sepolia': {
      url: 'https://rpc.sepolia-api.lisk.com',
      accounts: [process.env.WALLET_KEY],
      gasPrice: 1000000000,
    },
  },
    // Hardhat expects etherscan here, even if you're using Blockscout.
    etherscan: {
      // Use "123" as a placeholder, because Blockscout doesn't need a real API key, and Hardhat will complain if this property isn't set.
      apiKey: {
        "lisk-sepolia": "123"
      },
      customChains: [
        {
            network: "lisk-sepolia",
            chainId: 4202,
            urls: {
                apiURL: "https://sepolia-blockscout.lisk.com/api",
                browserURL: "https://sepolia-blockscout.lisk.com"
            }
        }
      ]
    },
    sourcify: {
      enabled: false
    },
};

