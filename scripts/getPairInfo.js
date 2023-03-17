const { addressFactory, addressRouter } = require('./AddressList')
const { erc20ABI, factoryABI, pairABI, routerABI } = require('./AbiList')
const { getTotalLiquityPrice } = require('./getTotalLiquityPrice')
const { ethers } = require('hardhat')
const fs = require('fs')
require('dotenv').config()

/*//////////////////////////////////////////////////////////////
                          Read File
//////////////////////////////////////////////////////////////*/

//BNB Smart Chain RPC
const MAINNET_RPC_URL = process.env.MAINNET_RPC_URL
//Provider
const provider = new ethers.providers.JsonRpcProvider(MAINNET_RPC_URL)

const contractFactory = new ethers.Contract(
  addressFactory,
  factoryABI,
  provider
)
// console.log(contractFactory)

async function getTokenPairData() {
  console.log('Collecting Pair Data...')
  let pairsInfo = []
  const getTotalPairs = await contractFactory.allPairsLength()
  const length = getTotalPairs.toNumber()

  /*//////////////////////////////////////////////////////////////
                      Loop through all Pairs
//////////////////////////////////////////////////////////////*/
  for (let i = 0; i < length; i++) {
    console.log(i)
    const getPairContractAddress = await contractFactory.allPairs(i)
    const pairContractAddress = getPairContractAddress

    // console.log(getPairs) //Address of Individual Pair Address

    const pairContract = new ethers.Contract(
      pairContractAddress,
      pairABI,
      provider
    )
    // console.log(pairContract)

    /*//////////////////////////////////////////////////////////////
                      Get Pair Data
//////////////////////////////////////////////////////////////*/
    const getPairDecimals = await pairContract.decimals()
    const getToken0Address = await pairContract.token0()
    const getToken1Address = await pairContract.token1()
    const getReserves = await pairContract.getReserves()
    const getReserves0 = getReserves[0]
    const getReserves1 = getReserves[1]

    /*//////////////////////////////////////////////////////////////
                      format BigNumber Data to BNB 
//////////////////////////////////////////////////////////////*/
    const reserves0 = ethers.utils.formatUnits(
      getReserves0.toString(),
      getPairDecimals
    )
    // console.log('reserves0 ' + reserves0)

    const reserves1 = ethers.utils.formatUnits(
      getReserves1.toString(),
      getPairDecimals
    )

    let tokenDecimals = []
    let tokenName = []
    let tokenSymbol = []

    const tokenAdress = [getToken0Address, getToken1Address]
    for (let i = 0; i < tokenAdress.length; i++) {
      // console.log(tokenAdress[i])
      const tokenContract = new ethers.Contract(
        tokenAdress[i],
        erc20ABI,
        provider
      )
      let getTokenDecimals = await tokenContract.decimals()
      let getTokenName = await tokenContract.name()
      let getTokenSymbol = await tokenContract.symbol()

      tokenDecimals.push(getTokenDecimals)
      tokenName.push(getTokenName)
      tokenSymbol.push(getTokenSymbol)
    }

    // console.log(tokenDecimals)  ***
    // console.log(tokenName)  ***
    // console.log(tokenSymbol)  ***

    /*//////////////////////////////////////////////////////////////
                      Getting Token Swap Prices
//////////////////////////////////////////////////////////////*/
    const amount = '1' //Adjustables
    if (reserves0 > 0 && reserves1 > 0) {
      /*//////////////////////////////////////////////////////////////
                      Token 0 Value as Token 1
        //////////////////////////////////////////////////////////////*/
      const amountIn0 = ethers.utils
        .parseUnits(amount, tokenDecimals[0])
        .toString()

      const routerContract = new ethers.Contract(
        addressRouter,
        routerABI,
        provider
      )
      // console.log(routerContract)

      // Get amounts out
      const amountOut0 = await routerContract.getAmountsOut(amountIn0, [
        tokenAdress[0],
        tokenAdress[1],
      ])
      // console.log(amountOut0)

      const token0Price = ethers.utils.formatUnits(
        //parse to convert out of blockchain standard
        amountOut0[1].toString(),
        tokenDecimals[1]
      )
      // console.log(token0Price)

      /*//////////////////////////////////////////////////////////////
                      Token 1 Value as Token 0
      //////////////////////////////////////////////////////////////*/
      const amountIn1 = ethers.utils
        .parseUnits(amount, tokenDecimals[1])
        .toString()

      // Get amounts out
      const amountOut1 = await routerContract.getAmountsOut(amountIn1, [
        tokenAdress[1],
        tokenAdress[0],
      ])
      // console.log(amountOut1)

      const token1Price = ethers.utils.formatUnits(
        //parse to convert out of blockchain standard
        amountOut1[1].toString(),
        tokenDecimals[0]
      )
      // console.log(token1Price)

      /*//////////////////////////////////////////////////////////////
                      Get Pair liquidity Pair
      /////////////////////////////////////////////////////////////*/
      totalLiquity = await getTotalLiquityPrice(getPairContractAddress)

      // totalLiquity = totalLiquity
      // console.log(totalLiquity)
      // console.log(pairContractAddress)

      /*//////////////////////////////////////////////////////////////
                          Object Pairs
      //////////////////////////////////////////////////////////////*/
      pairs = {
        pairTotalLiquity: totalLiquity,
        id: getPairContractAddress,
        token0Price: token1Price,
        token1Price: token0Price,
        token0: {
          id: tokenAdress[0],
          symbol: tokenSymbol[0],
          name: tokenName[0],
          decimals: tokenDecimals[0],
        },
        token1: {
          id: tokenAdress[1],
          symbol: tokenSymbol[1],
          name: tokenName[1],
          decimals: tokenDecimals[1],
        },
      }
      if (totalLiquity > 50000) {
        pairsInfo.push(pairs)
      }
      if (i % 240 == 0) {
        console.log('sleeping...')
        await new Promise((r) => setTimeout(r, 60000))
      }
    }
  }
  // console.log(pairsInfo)

  /*//////////////////////////////////////////////////////////////
                      Write to JSON File
//////////////////////////////////////////////////////////////*/
  const jsonPairsInfo = JSON.stringify(pairsInfo)
  fs.writeFile('getPairInfo.json', jsonPairsInfo, 'utf8', (err) => {
    if (err) {
      console.log('Error writing file', err)
    } else {
      console.log('Successfully wrote file')
    }
  })
}

getTokenPairData()
