const { addressRouter } = require('./AddressList')
const { erc20ABI, pairABI, routerABI } = require('./AbiList')
const { ethers } = require('hardhat')
const fs = require('fs')
require('dotenv').config()

/*//////////////////////////////////////////////////////////////   
                          Read File
//////////////////////////////////////////////////////////////*/
function getFile(fPath) {
  const fs = require('fs')

  try {
    const data = fs.readFileSync(fPath, 'utf8')
    return data
  } catch (err) {
    console.log(err)
    console.log('Error in GetFile')
  }
}

/*//////////////////////////////////////////////////////////////   
                          Get Price
//////////////////////////////////////////////////////////////*/
async function getPrice(factory, amtIn, tradeDirection) {
  //Provider
  const MAINNET_RPC_URL = process.env.MAINNET_RPC_URL
  const provider = new ethers.providers.JsonRpcProvider(MAINNET_RPC_URL)

  //Get Pool Token Information
  const poolContract = new ethers.Contract(factory, pairABI, provider)
  let token0Address = await poolContract.token0()
  let token1Address = await poolContract.token1()
  // console.log(token0Address, token1Address)

  //Get Individual Token Information (Symbol, Name, Decimals)
  let addressArray = [token0Address, token1Address]
  let tokenInfoArray = []

  for (let i = 0; i < addressArray.length; i++) {
    let tokenAddress = addressArray[i]
    // console.log(tokenAddress)
    let contract = new ethers.Contract(tokenAddress, erc20ABI, provider)
    let tokenSymbol = await contract.symbol()
    let tokenName = await contract.name()
    let tokenDecimals = await contract.decimals()
    let tokenInfo = {
      id: 'token' + i,
      tokenSymbol: tokenSymbol,
      tokenName: tokenName,
      tokenDecimals: tokenDecimals,
      tokenAddress: tokenAddress,
    }
    tokenInfoArray.push(tokenInfo)
    // console.log(tokenInfo)
  }
  // Identify the correct token to input as A and also B respectibely
  let inputTokenA = ''
  let inputDecimalsA = 0
  let inputTokenB = ''
  let inputDecimalsB = 0

  if (tradeDirection == 'baseToQuote') {
    inputTokenA = tokenInfoArray[0].tokenAddress
    inputDecimalsA = tokenInfoArray[0].tokenDecimals
    inputSymbolA = tokenInfoArray[0].tokenSymbol
    inputTokenB = tokenInfoArray[1].tokenAddress
    inputDecimalsB = tokenInfoArray[1].tokenDecimals
    inputSymbolB = tokenInfoArray[1].tokenSymbol
  }

  if (tradeDirection == 'quoteToBase') {
    inputTokenA = tokenInfoArray[1].tokenAddress
    inputDecimalsA = tokenInfoArray[1].tokenDecimals
    inputSymbolA = tokenInfoArray[1].tokenSymbol
    inputTokenB = tokenInfoArray[0].tokenAddress
    inputDecimalsB = tokenInfoArray[0].tokenDecimals
    inputSymbolB = tokenInfoArray[0].tokenSymbol
  }

  // Reformat Amount In
  if (!isNaN(amtIn)) {
    amtIn = amtIn.toString()
  }
  let amountIn = ethers.utils.parseUnits(amtIn, inputDecimalsA).toString()

  // Getting babyDoge Quote
  const routerContract = new ethers.Contract(addressRouter, routerABI, provider)
  let quotedAmountOut

  try {
    quotedAmountOut = await routerContract.getAmountsOut(amountIn, [
      inputTokenA,
      inputTokenB,
    ])
    // console.log(quotedAmountOut.toString())
  } catch (err) {
    console.log(err)
    console.log('Error in quotedAmountOut')
    return 0
  }
  //Format Output
  // console.log(quotedAmountOut)
  // console.log(inputDecimalsB)
  let OuputAmount = ethers.utils.formatUnits(quotedAmountOut[1], inputDecimalsB)
  return OuputAmount
}

/*//////////////////////////////////////////////////////////////   
                          Get Depth
//////////////////////////////////////////////////////////////*/
async function getDepth(amountIn, limit) {
  // limit for testing purposes
  //Get JSON Surface Rate
  console.log('Reading surface rate information...')
  let fileInfo = getFile(
    'C:/Users/Mr. Bushido/Desktop/Courses/BlockChain Work/flashloans/BiswapV1/getProfitibility.json'
  )
  // console.log(fileInfo)
  let fileJsonArray = JSON.parse(fileInfo)
  let maxLimit = fileJsonArray.length
  let fileJsonArrayLimit = fileJsonArray.slice(0, maxLimit)
  // console.log(fileJsonArrayLimit)

  for (let i = 0; i < maxLimit; i++) {
    let pair1ContractAddress = fileJsonArrayLimit[i].poolContract1
    let pair2ContractAddress = fileJsonArrayLimit[i].poolContract2
    let pair3ContractAddress = fileJsonArrayLimit[i].poolContract3
    let trade1Direction = fileJsonArrayLimit[i].poolDirectionTrade1
    let trade2Direction = fileJsonArrayLimit[i].poolDirectionTrade2
    let trade3Direction = fileJsonArrayLimit[i].poolDirectionTrade3
    let swap1 = fileJsonArrayLimit[i].swap1
    let swap2 = fileJsonArrayLimit[i].swap2
    let swap3 = fileJsonArrayLimit[i].swap3
    // console.log(pair1ContractAddress, trade1Direction)

    //Trade 1
    // console.log('Checking trade 1 acquired coin...')
    let acquiredCoinT1 = await getPrice(
      pair1ContractAddress,
      amountIn,
      trade1Direction
    )
    // console.log(acquiredCoinT1.OuputAmount, acquiredCoinT1.inputSymbolB)
    // console.log(acquiredCoinT1)

    //Trade 2
    if (acquiredCoinT1 == 0) {
      return console.log('Error')
    }
    // console.log('Checking trade 2 acquired coin..')
    let acquiredCoinT2 = await getPrice(
      pair2ContractAddress,
      acquiredCoinT1,
      trade2Direction
    )
    // console.log(acquiredCoinT2.OuputAmount, acquiredCoinT2.inputSymbolB)
    // console.log(acquiredCoinT2)

    //Trade 3
    if (acquiredCoinT2 == 0) {
      return console.log('Error')
    }
    // console.log('Checking trade 3 acquired coin..')
    let acquiredCoinT3 = await getPrice(
      pair3ContractAddress,
      acquiredCoinT2,
      trade3Direction
    )
    // console.log(acquiredCoinT3.OuputAmount, acquiredCoinT3.inputSymbolB)
    console.log(swap1, swap2, swap3, amountIn, acquiredCoinT3)
  }
}

getDepth((amount = 1), (limit = 1))
