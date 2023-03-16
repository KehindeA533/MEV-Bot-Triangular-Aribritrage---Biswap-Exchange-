module.exports = async ({ getNamedAccounts, deployments }) => {
  const { deploy, log } = deployments
  const { deployer } = await getNamedAccounts()
  const chainId = network.config.chainId

  const args = []
  const token = await deploy('FlashSwap', {
    from: deployer,
    args: args,
    log: true,
    waitConfirmations: network.config.blockConfirmations || 1,
  })

  // Verify the deployment
  //   if (chainId != 31337 && process.env.BSCSCAN_API_KEY) {
  //     await verify(token.address, args)
  //   }

  log('-----------------------------------------')
  log('Token Adress:', token.address) //Token Adress: 0x74B14BF9a6292de8888a7Ec2E44dC4c042B6f099
  log('-----------------------------------------')
}

module.exports.tags = ['all', 'token']
