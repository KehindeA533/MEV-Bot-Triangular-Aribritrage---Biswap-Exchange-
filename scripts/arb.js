const { structureTradingPair } = require('../arb-func_old/func')
const { calcSurfaceRate } = require('./func3')
const fs = require('fs')

/*//////////////////////////////////////////////////////////////
                      Reads JSON FILE
//////////////////////////////////////////////////////////////*/
function getFile(fPath) {
  try {
    const data = fs.readFileSync(fPath, 'utf8')
    return JSON.parse(data)
  } catch (err) {
    console.log(err)
    console.log('Error in GetFile')
  }
}

/*//////////////////////////////////////////////////////////////
                      Prints JSON FILE
//////////////////////////////////////////////////////////////*/

let fileInfo = getFile(
  'C:/Users/Mr. Bushido/Desktop/Courses/BlockChain Work/flashloans/PancakeSwapTri/pancake_alpha/myjsonfile.json'
)
// console.log(fileInfo)

/*//////////////////////////////////////////////////////////////
                      Prints Raw Data
//////////////////////////////////////////////////////////////*/
structured_pairs = structureTradingPair(fileInfo)
// console.log(structured_pairs)

let surfaceRatesList = []
let limit = structured_pairs.slice(0, 1) //Array Limitier 148
for (let t_pair of limit) {
  surface_rate = calcSurfaceRate(t_pair, (min_rate = 1), (num = 0))
  surfaceRatesList.push(surface_rate)
}

/*//////////////////////////////////////////////////////////////
                      Write to JSON File
//////////////////////////////////////////////////////////////*/
const surfaceRatesInfo = JSON.stringify(surfaceRatesList)
fs.writeFile('surfaceRatesInfo.json', surfaceRatesInfo, 'utf8', (err) => {
  if (err) {
    console.log('Error writing file', err)
  } else {
    console.log('Successfully wrote file')
  }
})
