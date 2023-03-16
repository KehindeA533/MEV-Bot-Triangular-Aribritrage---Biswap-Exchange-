require('@nomicfoundation/hardhat-toolbox')
require('@nomiclabs/hardhat-waffle')
require('dotenv').config()
require('hardhat-gas-reporter')
require('solidity-coverage')
require('@nomiclabs/hardhat-etherscan')
require('hardhat-deploy')

//BNB
const MAINNET_RPC_URL = process.env.MAINNET_RPC_URL
const BSCSCAN_API_KEY = process.env.BSCSCAN_API_KEY

//POLYGON
const MUMBAI_RPC_URL = process.env.MUMBAI_RPC_URL
const POLYGONSCAN_API_KEY = process.env.POLYGONSCAN_API_KEY

const PRIVATE_KEY = process.env.PRIVATE_KEY
const COINMARKET_API_KEY = process.env.COINMARKET_API_KEY

module.exports = {
  defaultNetwork: 'hardhat',
  networks: {
    bnbSmartChain: {
      url: MAINNET_RPC_URL,
      accounts: [PRIVATE_KEY],
      chainId: 56,
      blockConfirmation: 6,
    },
    mumbai: {
      url: MUMBAI_RPC_URL,
      accounts: [PRIVATE_KEY],
      chainId: 80001,
      blockConfirmation: 6,
    },
    hardhat: {
      blockConfirmation: 1,
      chainId: 31337,
      // forking: {
      //   url: MAINNET_RPC_URL,
      // },
    },
  },
  solidity: {
    compilers: [
      { version: '0.5.5' },
      { version: '0.6.0' },
      { version: '0.6.6' },
      { version: '0.8.8' },
    ],
  },
  etherscan: {
    apiKey: {
      bnbSmartChain: BSCSCAN_API_KEY,
      polygonMumbai: POLYGONSCAN_API_KEY,
    },
  },
  gasReporter: {
    enable: false,
    outputFile: 'gas-report.txt',
    noColors: true,
    currency: 'USD',
    coinmarketcap: COINMARKET_API_KEY,
    token: 'ETH', //MATIC
  },
  namedAccounts: {
    deployer: {
      default: 0,
    },
    user: {
      default: 1,
    },
  },
  mocha: {
    timeout: 300000,
  },
}
