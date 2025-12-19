// SPDX-License-Identifier: MIT
pragma solidity 0.8.19;

import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";

/// @title MockLBT
/// @notice Mock Liquid Backing Token for testing LBTBoostStrategy
contract MockLBT {
    /// @notice Track backing per token
    mapping(address => uint256) public backingOf;

    /// @notice Total backing amount
    uint256 public totalBacking;

    /// @notice Track addBacking calls
    uint256 public addBackingCount;

    event BackingAdded(address indexed token, uint256 amount);

    /// @notice Add backing (pulls tokens from caller)
    /// @param token Token to add as backing
    /// @param amount Amount to add
    function addBacking(address token, uint256 amount) external {
        // Pull tokens from caller
        (bool success, ) = token.call(
            abi.encodeWithSignature(
                "transferFrom(address,address,uint256)",
                msg.sender,
                address(this),
                amount
            )
        );
        require(success, "Transfer failed");

        backingOf[token] += amount;
        totalBacking += amount;
        addBackingCount++;

        emit BackingAdded(token, amount);
    }
}
