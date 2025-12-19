// SPDX-License-Identifier: MIT
pragma solidity 0.8.19;

/// @title IKodiakRouter
/// @notice Interface for Kodiak DEX router on Berachain
/// @dev Simplified interface for swap functionality
interface IKodiakRouter {
    /// @notice Swap exact tokens for tokens through a path
    /// @param amountIn Amount of input tokens
    /// @param amountOutMin Minimum output tokens (slippage protection)
    /// @param path Encoded swap path
    /// @param to Recipient of output tokens
    /// @param deadline Transaction deadline timestamp
    /// @return amountOut Amount of output tokens received
    function swapExactTokensForTokens(
        uint256 amountIn,
        uint256 amountOutMin,
        bytes calldata path,
        address to,
        uint256 deadline
    ) external returns (uint256 amountOut);

    /// @notice Get expected output amount for a swap
    /// @param amountIn Amount of input tokens
    /// @param path Encoded swap path
    /// @return amountOut Expected output amount
    function getAmountOut(uint256 amountIn, bytes calldata path) external view returns (uint256 amountOut);
}

/// @title ILBT
/// @notice Interface for Liquid Backing Token contract
/// @dev Used to add backing to the LBT
interface ILBT {
    /// @notice Add backing to the LBT
    /// @param token Address of the token to add as backing
    /// @param amount Amount of tokens to add
    function addBacking(address token, uint256 amount) external;

    /// @notice Get current backing amount for a token
    /// @param token Address of the token
    /// @return backing Amount of backing
    function backingOf(address token) external view returns (uint256 backing);
}
