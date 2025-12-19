// SPDX-License-Identifier: MIT
pragma solidity 0.8.19;

/// @title IStrategy
/// @notice Interface for LSG strategy contracts
/// @dev Strategies receive revenue tokens from Voter distribution and process them
interface IStrategy {
    /// @notice Execute the strategy logic on received tokens
    /// @dev Called by anyone (typically after distributeToStrategy in Voter)
    /// @param token Address of the token to process
    /// @return amount Amount of tokens processed
    function execute(address token) external returns (uint256 amount);

    /// @notice Execute strategy for multiple tokens
    /// @param tokens Array of token addresses to process
    /// @return amounts Array of amounts processed for each token
    function executeAll(address[] calldata tokens) external returns (uint256[] memory amounts);

    /// @notice Emergency rescue function to recover stuck tokens
    /// @dev Only callable by owner in emergency situations
    /// @param token Address of the token to rescue
    /// @param to Address to send rescued tokens to
    /// @param amount Amount of tokens to rescue
    function rescueTokens(address token, address to, uint256 amount) external;

    /// @notice Get the address of the associated voter contract
    /// @return Address of the voter contract
    function voter() external view returns (address);

    /// @notice Get the balance of a specific token in the strategy
    /// @param token Address of the token
    /// @return Balance of the token
    function tokenBalance(address token) external view returns (uint256);

    /// @notice Check if this contract supports the IStrategy interface
    /// @return True if supports IStrategy
    function supportsStrategy() external pure returns (bool);
}
