const erc20ABI = [
  'function decimals() external pure returns (uint8)',
  'function name() external pure returns (string memory)',
  'function symbol() external pure returns (string memory)',
]

const factoryABI = [
  'function allPairs(uint) external view returns (address pair)',
  'function allPairsLength() external view returns (uint)',
]

const pairABI = [
  'function token0() external view returns (address)',
  'function token1() external view returns (address)',
  'function getReserves() external view returns (uint112 reserve0, uint112 reserve1, uint32 blockTimestampLast)',
  'function price0CumulativeLast() external view returns (uint)',
  'function price1CumulativeLast() external view returns (uint)',
  'function kLast() external view returns (uint)',
  'function decimals() external pure returns (uint8)',
]

const routerABI = [
  'function getAmountsOut(uint amountIn, address[] memory path) public view returns (uint[] memory amounts)',
]

module.exports = {
  erc20ABI,
  factoryABI,
  pairABI,
  routerABI,
}
