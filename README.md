## Quickstart

```
git clone https://github.com/LegatoReign/MEV-Bot-Triangular-Aribritrage---Biswap-Exchange-
cd MEV-Bot-Triangular-Aribritrage---Biswap-Exchange-
yarn
```
# Usage

Deploy:

```
yarn hardhat deploy
```

## Testing

```
yarn hardhat test
```

### Test Coverage

```
yarn hardhat coverage
```

# Compile list of token pairs on the Biswap exchange only add those over a certain liquity value can be adjusted on line: 213

```
yarn hardhat run scripts/getPairInfo.js
```

# Compile list of possible trading pair groups and their profitibility

```
Run the Python main file to get list
```

# double checking possible triangular arbritrage trade by simulating trade using data from smart contract and prints out profitable trades

```
yarn hardhat run scripts/checkArb.js
```

