const puppeteer = require('puppeteer')

async function getTotalLiquityPrice(pairContractAddress) {
  const browser = await puppeteer.launch()
  const page = await browser.newPage()
  await page.goto(`https://bscscan.com/address/${pairContractAddress}`)
  let data = await page.evaluate(() => {
    const pg = document.querySelector('#availableBalanceDropdown')
    return pg.innerText
  })

  data = data.split(' ', 1)
  data = data[0].split('$')
  data = data[1]
  data = data.split(',').join('').split('.')
  data = parseInt(data[0])
  await browser.close()
  // console.log(data)
  return data
}

module.exports = { getTotalLiquityPrice }
