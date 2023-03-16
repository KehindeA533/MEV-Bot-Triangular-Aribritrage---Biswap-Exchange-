// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.8;

/*//////////////////////////////////////////////////////////////   
                            Imports
//////////////////////////////////////////////////////////////*/
import 'hardhat/console.sol';
import '@uniswap/v2-core/contracts/interfaces/IERC20.sol';
import '@uniswap/v2-core/contracts/interfaces/IUniswapV2Factory.sol';
import '@uniswap/v2-core/contracts/interfaces/IUniswapV2Pair.sol';
import '@uniswap/v2-periphery/contracts/interfaces/IUniswapV2Router01.sol';
import '@uniswap/v2-periphery/contracts/interfaces/IUniswapV2Router02.sol';
import '@uniswap/v2-periphery/contracts/libraries/UniswapV2Library.sol';
import '@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol';

contract FlashSwap {
    using SafeERC20 for IERC20a;

    address private constant BISWAP_FACTORY =
        0x858E3312ed3A876947EA49d572A7C42DE08af7EE;
    address private constant BISWAP_ROUTER =
        0x10ED43C718714eb63d5aA57B78B54704E256024E;

    //Instance of Biswap factory
    IUniswapV2Factory private constant BISWAP =
        IUniswapV2Factory(BISWAP_FACTORY);

    //Token Address
    address private constant WBNB = 0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c;
    address private constant BUSD = 0xe9e7CEA3DedcA5984780Bafc599bD69ADd087D56;
    address private constant ETH = 0x2170Ed0880ac9A755fd29B2688956BD959F933F8;
    address private constant SAFEMOON = 0x8076C74C5e3F5852037F31Ff0093Eeb8c8ADd8D3;

    // Trade Variables
    uint256 private dealine = block.timestamp + 1 days;

    uint256 private constant MAX_INT = 10000000000000000000;

    function fundFlashSwapContrat(
        address _owner,
        address _token,
        uint256 _amount
    ) public {
        IERC20(_token).transferFrom(_owner, address(this), _amount);
    }

    //- GET CONTRACT BALANCE //
    function getBalanceOfToken(address _address) public view returns (uint256) {
        return IERC20(_address).balanceOf(address(this));
    }

    //-Place Trade - Executed placing a trade
    function placeTrade(
        address _fromToken,
        address _toToken,
        _amountIn
    ) private returns (uint256) {
        address pair = IUniswapV2Factory(BISWAP_FACTORY).getPair(
            _fromToken,
            _toToken
        );
        require(pair != address(0), 'Pool does not exist');

        // Calculate Amount Out
        address[] memory path = new address[](2);
        path[0] = _fromToken;
        path[1] = _toToken;

        uint amountRequired = IUniswapV2Router01(BISWAP_ROUTER).getAmountsOut(
            _amountIn,
            path
        )[1];
        console.log('amountRequired', amountRequired);

        // Perform Arbitrage - swap for amother token
        uint256 amountReceived = IUniswapV2Router01(BISWAP_ROUTER)
            .swapExactTokensForTokens(
                _amountIn,
                amountRequired,
                path,
                address(this),
                dealine
            )[1];
        console.log('amountReceived', amountReceived);

        require(amountReceived > 0, 'Aborted Tx: Trade returned zero');
        return amountReceived
    }

    //- CHECK PROFITABILITY - Output > Input
    function checkProfitibility(uint256 _input, uint256 _output) private returns(bool) {
        return _output > _input;
    }

    //- INITIATE ARBITRAGE //
    // Begins receiving loan and performing arbitrage trades
    function startArbitrage(address _tokenBorrow, uint256 _amount) external {
        //Approving set tokens to be swapped
        IERC20a(BUSD).safeApprove(address(BISWAP_ROUTER), MAX_INT);
        IERC20a(SAFEMOON).safeApprove(address(BISWAP_ROUTER), MAX_INT);
        IERC20a(ETH).safeApprove(address(BISWAP_ROUTER), MAX_INT);

        // Get the Factory Pair address for combined tokens
        address pairAddress = BISWAP.getPair(_tokenBorrow, WBNB);

        // Return error if combination does not exist
        require(pairAddress != address(0), 'Pool does not exist');

        // igure out which token (0 or 1) has the amount and assign
        address token0 = IUniswapV2Pair(pairAddress).token0();
        address token1 = IUniswapV2Pair(pairAddress).token1();
        uint256 amount0Out = _tokenBorrow == token0 ? _amount : 0;
        uint256 amount1Out = _tokenBorrow == token1 ? _amount : 0;

        // Passing data as bytes so that the "swap" function knows it is flashloan
        bytes memory data = abi.encode(_tokenBorrow, _amount, msg.sender);

        // Execute the initial swap to get the loan
        IUniswapV2Pair(pairAddress).swap(
            amount0Out,
            amount1Out,
            address(this),
            data
        );
    }

    function pancakeCall(
        address _sender,
        uint256 _amount0,
        uint256 _amount,
        bytes calldata _data
    ) external {
        //Ensure this request came from the contract
        address token0Address = IUniswapV2Pair(msg.sender).token0();
        address token1Address = IUniswapV2Pair(msg.sender).token1();
        address pairAddress = BISWAP.getPair(token0Address, token1Address);

        require(
            msg.sender == pairAddress,
            'The sender needs to match the pair'
        );
        require(
            _sender == address(this),
            'Sender needs to match this contract'
        );

        //Decode data for calculating the repayment
        (address tokenBorrow, uint256 amount, address myAddress) = abi.decode(
            _data,
            (address, uint256, address)
        );

        // Calculate the amount to repay at the end
        uint256 fee = ((amount * 3) / 997) + 1;
        uint256 amountToRepay = amount + fee;

        // Assign loan Amount
        uint256 loanAmount = _amount0 > 0 ? _amount0 : _amount;

        //Place Trades
        //Trade 1
        uint256 trade1AcquiredCoin = placeTrade(BUSD, SAFEMOON, loanAmount)
        //Trade 2
        uint256 trade2AcquiredCoin = placeTrade(SAFEMOON, ETH, trade2AcquiredCoin)
        //Trade 3
        uint256 trade3AcquiredCoin = placeTrade(ETH, BUSD, trade3AcquiredCoin)

        // CHECK PROFITABILITY
        bool profCheck = checkProfitibility(amountToRepay, trade3AcquiredCoin);
        require(profCheck, "Arbitrage not profitable");

        //Pay Myself
        IERC20a otherToken = IERC20a(BUSD);
        otherToken.transfer(myAddress, trade3AcquiredCoin - amountToRepay);

        //Pay Loan Back
        IERC20a(tokenBorrow).transfer(pairAddress, amountToRepay); 
    }
}
