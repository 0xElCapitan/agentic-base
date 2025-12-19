// SPDX-License-Identifier: MIT
pragma solidity 0.8.19;

import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";

/// @title MockKodiakRouter
/// @notice Mock Kodiak router for testing LBTBoostStrategy
contract MockKodiakRouter {
    /// @notice Mock exchange rate (1:1 by default, can be configured)
    uint256 public exchangeRate = 1e18;

    /// @notice Output token for swaps
    address public outputToken;

    /// @notice Track swap calls
    uint256 public swapCount;

    /// @notice Flag to simulate swap failure
    bool public shouldFail;

    /// @notice Flag to simulate quote failure
    bool public shouldFailQuote;

    event SwapExecuted(
        uint256 amountIn,
        uint256 amountOutMin,
        address to,
        uint256 amountOut
    );

    constructor(address _outputToken) {
        outputToken = _outputToken;
    }

    /// @notice Set the exchange rate for swaps (scaled by 1e18)
    /// @param rate New exchange rate (e.g., 2e18 = 2:1 output:input)
    function setExchangeRate(uint256 rate) external {
        exchangeRate = rate;
    }

    /// @notice Set whether swaps should fail
    function setShouldFail(bool _shouldFail) external {
        shouldFail = _shouldFail;
    }

    /// @notice Set whether quotes should fail
    function setShouldFailQuote(bool _shouldFailQuote) external {
        shouldFailQuote = _shouldFailQuote;
    }

    /// @notice Get expected output amount (mock implementation)
    function getAmountOut(uint256 amountIn, bytes calldata) external view returns (uint256) {
        if (shouldFailQuote) revert("Quote failed");
        return (amountIn * exchangeRate) / 1e18;
    }

    /// @notice Execute swap (mock implementation)
    function swapExactTokensForTokens(
        uint256 amountIn,
        uint256 amountOutMin,
        bytes calldata,
        address to,
        uint256
    ) external returns (uint256 amountOut) {
        if (shouldFail) revert("Swap failed");

        amountOut = (amountIn * exchangeRate) / 1e18;
        require(amountOut >= amountOutMin, "Insufficient output");

        // Pull input tokens from caller
        // Note: caller must have approved this contract
        // We don't care about the input token address in mock

        // Mint output tokens to recipient
        // In real tests, the output token should be a MockERC20
        (bool success, ) = outputToken.call(
            abi.encodeWithSignature("mint(address,uint256)", to, amountOut)
        );
        require(success, "Mint failed");

        swapCount++;
        emit SwapExecuted(amountIn, amountOutMin, to, amountOut);
    }
}
