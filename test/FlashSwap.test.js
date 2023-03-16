const { assert, expect } = require('chai')
const { ethers } = require('hardhat')
const { impersonateFundErc20 } = require('../utils/utilites')
const abi = require('../artifacts/@uniswap/v2-core/contracts/interfaces/IERC20.sol/IERC20.json')
//~ running mainnet fork 85. 4:29

const provider = waffle.provider
describe('FlashSwap Contract', function () {
  let FLASHSWAP,
    BORROW_AMOUNT,
    FUND_AMOUNT,
    initialFundingHuman,
    txArbitrage,
    gasUsedUSD

  const DECIMALS = 18

  const BUSD_WHALE = '0x5616e2b8acff064bf902b8a93cbd5da2ca1edc7c'
  const BUSD = '0xe9e7cea3dedca5984780bafc599bd69add087d56'
  const ETH = '0x2170ed0880ac9a755fd29b2688956bd959f933f8'
  const SAFEMOON = '0x8076c74c5e3f5852037f31ff0093eeb8c8add8d3'

  const BASE_TOKEN_ADDRESS = BUSD

  const tokenBase = new ethers.Contract(BASE_TOKEN_ADDRESS, abi, provider)

  beforeEach(async () => {
    // Get owner as signer
    ;[owner] = await ethers.getSigners()

    // Get Whale balance
    const whaleBalance = await provider.getBalance(BUSD_WHALE)

    //Deploy smart contract
    const Flashswap = await ethers.getContractFactory('PanSAFEMOONFlashSwap')
    FLASHSWAP = await Flashswap.deploy()
    await FLASHSWAP.deployed()

    // Configure our Borrowing
    initialFundingHuman = '100'
    //~FUND_AMOUNT = ethers.utils.parseUnits(initialFundingHuman, DECIMALS)

    //Fund Contract
    await impersonateFundErc20(
      tokenBase,
      BUSD_WHALE,
      FLASHSWAP.address,
      initialFundingHuman
    )
  })
  describe('Arbitrage Execution', () => {
    it('Ensure that the Whale has a balance', async () => {
      console.log(ethers.utils.formatUnits(whaleBalance.toString(), DECIMALS))
      expect(whaleBalance).not.equal('0')
    })
    it('Arbitrage Execution', async () => {
      const flashSwapBalance = await FLASHSWAP.getBalanceOfToken(
        BASE_TOKEN_ADDRESS
      )
      const flashSwapBalanceHuman = ethers.utils.formatUnits(
        flashSwapBalance,
        DECIMALS
      )
      console.log(flashSwapBalanceHuman)

      expect(Number(flashSwapBalanceHuman)).equal(Number(initialFundingHuman))
    })
    it('excutes the arbitrage', async () => {
      txArbitrage = await FLASHSWAP.startArbitrage(
        BASE_TOKEN_ADDRESS,
        BORROW_AMOUNT
      )
      assert(txArbitrage)

      //Print Balances
      // BUSD
      const contractBalanceBUSD = await FLASHSWAP.getBalanceOfToken(BUSD)
      const formattedBalBUSD = Number(
        ethers.utils.formatUnits(contractBalanceBUSD, DECIMALS)
      )
      console.log('Balance of BUSD' + formattedBalBUSD)

      // ETH
      const contractBalanceETH = await FLASHSWAP.getBalanceOfToken(ETH)
      const formattedBalETH = Number(
        ethers.utils.formatUnits(contractBalanceETH, DECIMALS)
      )
      console.log('Balance of ETH' + formattedBalETH)
      // SAFEMOON
      const contractBalanceSAFEMOON = await FLASHSWAP.getBalanceOfToken(
        SAFEMOON
      )
      const formattedBalSAFEMOON = Number(
        ethers.utils.formatUnits(contractBalanceSAFEMOON, DECIMALS)
      )
      console.log('Balance of SAFEMOON' + formattedBalSAFEMOON)
    })
  })
})
