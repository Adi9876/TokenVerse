require("@nomicfoundation/hardhat-toolbox");

require("dotenv").config();

const SEPOLIA_URL = process.env.SEPOLIA_URL;
const MUMBAI_URL = process.env.MUMBAI_URL;
const PRIVATE_KEY = process.env.PRIVATE_KEY;
module.exports = {
  solidity: "0.8.20",
  networks: {
    hardhat: {
      chainId: 1337,
    },

    mumbai: {
      // Infura
      // url: `https://polygon-mumbai.infura.io/v3/${infuraId}`
      url: MUMBAI_URL,
      accounts: [PRIVATE_KEY]
    },

    sepolia: {
      url: SEPOLIA_URL,
      accounts: [PRIVATE_KEY],
    },
  },
};
