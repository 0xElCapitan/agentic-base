# Software Design Document: apDAO LSG (Liquid Signal Governance)

## Executive Summary

This document specifies the technical architecture for apDAO LSG, a fork of Heesho's Liquid Signal Governance system adapted for apDAO's soulbound NFT membership model on Berachain. The system enables weekly governance of Vase subvalidator revenue allocation through liquid democracy.

### Key Architectural Decisions

| Decision | Choice | Rationale |
|----------|--------|-----------|
| Voting Power Source | Direct NFT balance | Station X tokens never activated; NFT transfers already handle vote removal |
| Multi-Token Handling | Raw distribution | Each strategy handles its own token conversion |
| Strategy Model | Direct routing | No Dutch auction; revenue flows directly to destinations |
| Delegation | LSG-specific mapping | Separate from NFT-level delegation for flexibility |
| Emergency System | Multi-level | Per-strategy kill + global pause + timelock |
| Epoch Timing | Calendar weeks | Monday 00:00 UTC to Sunday 23:59 UTC |
| Gas Optimization | Standard patterns | Berachain gas is cheap; optimize post-launch if needed |

---

## System Architecture

### Contract Hierarchy

```
┌─────────────────────────────────────────────────────────────────────────┐
│                         EXTERNAL CONTRACTS                               │
├─────────────────────────────────────────────────────────────────────────┤
│  apDAO Seat NFT (0xfc2d...)  │  LBT  │  Auction House  │  Vase Revenue  │
└─────────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                          LSG CORE CONTRACTS                              │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│  ┌──────────────────────┐                                               │
│  │   MultiTokenRouter   │  ← Receives revenue from Vase                 │
│  │   (RevenueRouter)    │  ← Whitelists allowed tokens                  │
│  └──────────┬───────────┘  ← Anyone can call flush()                    │
│             │                                                            │
│             ▼                                                            │
│  ┌──────────────────────┐                                               │
│  │       LSGVoter       │  ← Core voting logic                          │
│  │                      │  ← Reads NFT balanceOf for voting power       │
│  │                      │  ← Manages delegation                         │
│  │                      │  ← Distributes revenue to strategies          │
│  └──────────┬───────────┘                                               │
│             │                                                            │
│             ▼                                                            │
│  ┌──────────────────────────────────────────────────────────────────┐   │
│  │                      STRATEGY CONTRACTS                           │   │
│  ├──────────────┬──────────────┬──────────────┬─────────────────────┤   │
│  │ LBTStrategy  │ DirectDistro │ PoLStrategy  │ GrowthTreasury      │   │
│  │              │   Strategy   │              │    Strategy         │   │
│  └──────┬───────┴──────┬───────┴──────┬───────┴──────┬──────────────┘   │
│         │              │              │              │                   │
│         ▼              ▼              ▼              ▼                   │
│  ┌──────────────────────────────────────────────────────────────────┐   │
│  │                       BRIBE CONTRACTS                             │   │
│  │  (One per strategy - distributes rewards to voters)               │   │
│  └──────────────────────────────────────────────────────────────────┘   │
│                                                                          │
└─────────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                         GOVERNANCE & SECURITY                            │
├─────────────────────────────────────────────────────────────────────────┤
│  Honey Track Governor (Owner)  │  Emergency Multisig  │  Timelock       │
└─────────────────────────────────────────────────────────────────────────┘
```

### Data Flow

```
Vase Subvalidator Revenue (BERA, vBGT, USDC, HONEY, bribe tokens)
                │
                ▼
        MultiTokenRouter.receive()
                │
                ▼ (anyone calls flush())
        LSGVoter.notifyRevenue(token, amount)
                │
                ▼ (per-token revenue index updated)
        LSGVoter.distribute(strategy)
                │
                ▼ (proportional to vote weight)
        Strategy.execute()
                │
        ┌───────┴───────┬───────────────┬────────────────┐
        ▼               ▼               ▼                ▼
    LBT.addBacking()  Bribe.notify()  GrowthTreasury  PoLManager
                           │
                           ▼
                    Voters claim rewards
```

---

## Technology Stack

### Smart Contract Layer

| Component | Technology | Version | Justification |
|-----------|------------|---------|---------------|
| Language | Solidity | 0.8.19+ | Match original LSG, mature tooling |
| Framework | Foundry | Latest | Fast compilation, native fuzzing, fork testing |
| Standards | OpenZeppelin | 5.x | Audited, battle-tested implementations |
| Testing | Forge | Latest | Native to Foundry, excellent coverage tools |

### Dependencies

```toml
# foundry.toml
[dependencies]
openzeppelin-contracts = "5.0.0"
solmate = "6.2.0"  # Gas-optimized utilities
```

### Target Chain

| Property | Value |
|----------|-------|
| Chain | Berachain Mainnet |
| Chain ID | 80094 |
| Gas Token | BERA |
| Block Time | ~2 seconds |

---

## Contract Design

### 1. MultiTokenRouter

**Purpose**: Accumulates revenue from Vase and forwards to LSGVoter.

```solidity
// SPDX-License-Identifier: MIT
pragma solidity 0.8.19;

import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import {SafeERC20} from "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";
import {Pausable} from "@openzeppelin/contracts/security/Pausable.sol";

contract MultiTokenRouter is Ownable, Pausable {
    using SafeERC20 for IERC20;

    /*//////////////////////////////////////////////////////////////
                                STATE
    //////////////////////////////////////////////////////////////*/

    address public voter;
    mapping(address => bool) public whitelistedTokens;
    address[] public tokenList;

    /*//////////////////////////////////////////////////////////////
                                EVENTS
    //////////////////////////////////////////////////////////////*/

    event TokenWhitelisted(address indexed token, bool status);
    event RevenueReceived(address indexed token, uint256 amount);
    event RevenueFlushed(address indexed token, uint256 amount);
    event VoterUpdated(address indexed oldVoter, address indexed newVoter);

    /*//////////////////////////////////////////////////////////////
                                ERRORS
    //////////////////////////////////////////////////////////////*/

    error TokenNotWhitelisted(address token);
    error NoRevenueToFlush();
    error InvalidAddress();

    /*//////////////////////////////////////////////////////////////
                              CONSTRUCTOR
    //////////////////////////////////////////////////////////////*/

    constructor(address _voter) {
        if (_voter == address(0)) revert InvalidAddress();
        voter = _voter;
    }

    /*//////////////////////////////////////////////////////////////
                            ADMIN FUNCTIONS
    //////////////////////////////////////////////////////////////*/

    function setWhitelistedToken(address _token, bool _status) external onlyOwner {
        if (_token == address(0)) revert InvalidAddress();

        if (_status && !whitelistedTokens[_token]) {
            tokenList.push(_token);
        }
        whitelistedTokens[_token] = _status;
        emit TokenWhitelisted(_token, _status);
    }

    function setVoter(address _voter) external onlyOwner {
        if (_voter == address(0)) revert InvalidAddress();
        emit VoterUpdated(voter, _voter);
        voter = _voter;
    }

    function pause() external onlyOwner {
        _pause();
    }

    function unpause() external onlyOwner {
        _unpause();
    }

    /*//////////////////////////////////////////////////////////////
                            PUBLIC FUNCTIONS
    //////////////////////////////////////////////////////////////*/

    /// @notice Flush a specific token to the Voter
    function flush(address _token) external whenNotPaused returns (uint256 amount) {
        if (!whitelistedTokens[_token]) revert TokenNotWhitelisted(_token);

        amount = IERC20(_token).balanceOf(address(this));
        if (amount == 0) revert NoRevenueToFlush();

        IERC20(_token).safeApprove(voter, amount);
        ILSGVoter(voter).notifyRevenue(_token, amount);

        emit RevenueFlushed(_token, amount);
    }

    /// @notice Flush all whitelisted tokens
    function flushAll() external whenNotPaused {
        for (uint256 i = 0; i < tokenList.length; i++) {
            address token = tokenList[i];
            if (!whitelistedTokens[token]) continue;

            uint256 amount = IERC20(token).balanceOf(address(this));
            if (amount > 0) {
                IERC20(token).safeApprove(voter, amount);
                ILSGVoter(voter).notifyRevenue(token, amount);
                emit RevenueFlushed(token, amount);
            }
        }
    }

    /*//////////////////////////////////////////////////////////////
                            VIEW FUNCTIONS
    //////////////////////////////////////////////////////////////*/

    function pendingRevenue(address _token) external view returns (uint256) {
        return IERC20(_token).balanceOf(address(this));
    }

    function getWhitelistedTokens() external view returns (address[] memory) {
        return tokenList;
    }
}

interface ILSGVoter {
    function notifyRevenue(address token, uint256 amount) external;
}
```

### 2. LSGVoter

**Purpose**: Core governance contract managing voting, delegation, and revenue distribution.

```solidity
// SPDX-License-Identifier: MIT
pragma solidity 0.8.19;

import {ReentrancyGuard} from "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";
import {Pausable} from "@openzeppelin/contracts/security/Pausable.sol";
import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import {IERC721} from "@openzeppelin/contracts/token/ERC721/IERC721.sol";
import {SafeERC20} from "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";

contract LSGVoter is ReentrancyGuard, Ownable, Pausable {
    using SafeERC20 for IERC20;

    /*//////////////////////////////////////////////////////////////
                                CONSTANTS
    //////////////////////////////////////////////////////////////*/

    uint256 public constant EPOCH_DURATION = 7 days;
    uint256 public constant EPOCH_START = 1704067200; // Monday, Jan 1, 2024 00:00:00 UTC
    uint256 public constant MAX_STRATEGIES = 20;
    uint256 public constant DIVISOR = 10000; // basis points

    /*//////////////////////////////////////////////////////////////
                                IMMUTABLES
    //////////////////////////////////////////////////////////////*/

    address public immutable seatNFT;
    address public immutable treasury;

    /*//////////////////////////////////////////////////////////////
                                STATE
    //////////////////////////////////////////////////////////////*/

    // Revenue management
    address public revenueRouter;
    address[] public revenueTokens;
    mapping(address => bool) public isRevenueToken;

    // Per-token revenue tracking
    mapping(address => uint256) internal tokenIndex; // token => global index
    mapping(address => mapping(address => uint256)) internal strategy_TokenSupplyIndex; // strategy => token => index
    mapping(address => mapping(address => uint256)) public strategy_TokenClaimable; // strategy => token => claimable

    // Strategy management
    address[] public strategies;
    mapping(address => bool) public strategy_IsValid;
    mapping(address => bool) public strategy_IsAlive;
    mapping(address => address) public strategy_Bribe;
    mapping(address => uint256) public strategy_Weight;
    uint256 public totalWeight;

    // Voting
    mapping(address => mapping(address => uint256)) public account_Strategy_Votes; // voter => strategy => weight
    mapping(address => address[]) public account_StrategyVotes; // voter => strategies voted for
    mapping(address => uint256) public account_UsedWeight;
    mapping(address => uint256) public account_LastVoted; // voter => epoch

    // Delegation
    mapping(address => address) public delegation; // owner => delegate
    mapping(address => uint256) public delegatedPower; // delegate => total power delegated to them

    // Emergency
    address public emergencyMultisig;

    /*//////////////////////////////////////////////////////////////
                                EVENTS
    //////////////////////////////////////////////////////////////*/

    event StrategyAdded(address indexed strategy, address indexed bribe);
    event StrategyKilled(address indexed strategy);
    event Voted(address indexed voter, address indexed strategy, uint256 weight);
    event VoteReset(address indexed voter);
    event RevenueNotified(address indexed token, uint256 amount);
    event RevenueDistributed(address indexed strategy, address indexed token, uint256 amount);
    event DelegateSet(address indexed owner, address indexed delegate);
    event EmergencyPause(address indexed caller);

    /*//////////////////////////////////////////////////////////////
                                ERRORS
    //////////////////////////////////////////////////////////////*/

    error AlreadyVotedThisEpoch();
    error StrategyNotValid();
    error StrategyNotAlive();
    error ArrayLengthMismatch();
    error ZeroWeight();
    error NotAuthorized();
    error InvalidAddress();
    error MaxStrategiesReached();
    error CannotDelegateToSelf();

    /*//////////////////////////////////////////////////////////////
                                MODIFIERS
    //////////////////////////////////////////////////////////////*/

    modifier onlyNewEpoch(address account) {
        if (account_LastVoted[account] >= currentEpoch()) {
            revert AlreadyVotedThisEpoch();
        }
        _;
    }

    modifier onlyRevenueRouter() {
        if (msg.sender != revenueRouter) revert NotAuthorized();
        _;
    }

    modifier onlyEmergency() {
        if (msg.sender != emergencyMultisig && msg.sender != owner()) revert NotAuthorized();
        _;
    }

    /*//////////////////////////////////////////////////////////////
                              CONSTRUCTOR
    //////////////////////////////////////////////////////////////*/

    constructor(
        address _seatNFT,
        address _treasury,
        address _emergencyMultisig
    ) {
        if (_seatNFT == address(0) || _treasury == address(0)) revert InvalidAddress();
        seatNFT = _seatNFT;
        treasury = _treasury;
        emergencyMultisig = _emergencyMultisig;
    }

    /*//////////////////////////////////////////////////////////////
                            VOTING FUNCTIONS
    //////////////////////////////////////////////////////////////*/

    /// @notice Get voting power for an account (considers delegation)
    function getVotingPower(address account) public view returns (uint256) {
        // If account has delegated, they have 0 voting power
        if (delegation[account] != address(0)) {
            return 0;
        }

        // Base power from NFT ownership
        uint256 basePower = IERC721(seatNFT).balanceOf(account);

        // Add delegated power
        return basePower + delegatedPower[account];
    }

    /// @notice Vote for strategies with given weights
    function vote(
        address[] calldata _strategies,
        uint256[] calldata _weights
    ) external nonReentrant whenNotPaused onlyNewEpoch(msg.sender) {
        if (_strategies.length != _weights.length) revert ArrayLengthMismatch();

        // Reset existing votes
        _reset(msg.sender);

        uint256 votingPower = getVotingPower(msg.sender);
        if (votingPower == 0) revert ZeroWeight();

        uint256 totalVoteWeight = 0;
        for (uint256 i = 0; i < _strategies.length; i++) {
            if (strategy_IsValid[_strategies[i]] && strategy_IsAlive[_strategies[i]]) {
                totalVoteWeight += _weights[i];
            }
        }

        if (totalVoteWeight == 0) revert ZeroWeight();

        uint256 usedWeight = 0;
        for (uint256 i = 0; i < _strategies.length; i++) {
            address strategy = _strategies[i];

            if (!strategy_IsValid[strategy] || !strategy_IsAlive[strategy]) continue;

            uint256 strategyWeight = (_weights[i] * votingPower) / totalVoteWeight;
            if (strategyWeight == 0) continue;

            // Update all token indices for this strategy
            _updateStrategyIndices(strategy);

            strategy_Weight[strategy] += strategyWeight;
            account_Strategy_Votes[msg.sender][strategy] = strategyWeight;
            account_StrategyVotes[msg.sender].push(strategy);

            // Update bribe balance
            IBribe(strategy_Bribe[strategy])._deposit(strategyWeight, msg.sender);

            usedWeight += strategyWeight;
            emit Voted(msg.sender, strategy, strategyWeight);
        }

        totalWeight += usedWeight;
        account_UsedWeight[msg.sender] = usedWeight;
        account_LastVoted[msg.sender] = currentEpoch();
    }

    /// @notice Reset votes for caller
    function reset() external nonReentrant onlyNewEpoch(msg.sender) {
        _reset(msg.sender);
        account_LastVoted[msg.sender] = currentEpoch();
        emit VoteReset(msg.sender);
    }

    /// @notice Internal reset logic
    function _reset(address account) internal {
        address[] storage strategyVotes = account_StrategyVotes[account];
        uint256 voteCnt = strategyVotes.length;

        for (uint256 i = 0; i < voteCnt; i++) {
            address strategy = strategyVotes[i];
            uint256 votes = account_Strategy_Votes[account][strategy];

            if (votes > 0) {
                _updateStrategyIndices(strategy);
                strategy_Weight[strategy] -= votes;
                account_Strategy_Votes[account][strategy] = 0;

                IBribe(strategy_Bribe[strategy])._withdraw(votes, account);
            }
        }

        totalWeight -= account_UsedWeight[account];
        account_UsedWeight[account] = 0;
        delete account_StrategyVotes[account];
    }

    /*//////////////////////////////////////////////////////////////
                          DELEGATION FUNCTIONS
    //////////////////////////////////////////////////////////////*/

    /// @notice Delegate voting power to another address
    function delegate(address _delegate) external nonReentrant {
        if (_delegate == msg.sender) revert CannotDelegateToSelf();

        address currentDelegate = delegation[msg.sender];
        uint256 power = IERC721(seatNFT).balanceOf(msg.sender);

        // Remove from current delegate
        if (currentDelegate != address(0)) {
            delegatedPower[currentDelegate] -= power;
        }

        // Add to new delegate
        if (_delegate != address(0)) {
            delegatedPower[_delegate] += power;
        }

        delegation[msg.sender] = _delegate;
        emit DelegateSet(msg.sender, _delegate);
    }

    /// @notice Remove delegation
    function undelegate() external nonReentrant {
        address currentDelegate = delegation[msg.sender];
        if (currentDelegate == address(0)) return;

        uint256 power = IERC721(seatNFT).balanceOf(msg.sender);
        delegatedPower[currentDelegate] -= power;
        delegation[msg.sender] = address(0);

        emit DelegateSet(msg.sender, address(0));
    }

    /*//////////////////////////////////////////////////////////////
                        REVENUE DISTRIBUTION
    //////////////////////////////////////////////////////////////*/

    /// @notice Called by RevenueRouter to notify new revenue
    function notifyRevenue(address _token, uint256 _amount) external onlyRevenueRouter nonReentrant {
        IERC20(_token).safeTransferFrom(msg.sender, address(this), _amount);

        if (!isRevenueToken[_token]) {
            revenueTokens.push(_token);
            isRevenueToken[_token] = true;
        }

        if (totalWeight == 0) {
            // No votes, send to treasury
            IERC20(_token).safeTransfer(treasury, _amount);
            return;
        }

        uint256 ratio = (_amount * 1e18) / totalWeight;
        if (ratio > 0) {
            tokenIndex[_token] += ratio;
        }

        emit RevenueNotified(_token, _amount);
    }

    /// @notice Distribute accumulated revenue to a strategy
    function distribute(address _strategy, address _token) public nonReentrant {
        _updateStrategyIndex(_strategy, _token);

        uint256 claimable = strategy_TokenClaimable[_strategy][_token];
        if (claimable > 0) {
            strategy_TokenClaimable[_strategy][_token] = 0;
            IERC20(_token).safeTransfer(_strategy, claimable);
            emit RevenueDistributed(_strategy, _token, claimable);
        }
    }

    /// @notice Distribute all tokens to a strategy
    function distributeAllTokens(address _strategy) external {
        for (uint256 i = 0; i < revenueTokens.length; i++) {
            distribute(_strategy, revenueTokens[i]);
        }
    }

    /// @notice Distribute to all strategies for a token
    function distributeToAllStrategies(address _token) external {
        for (uint256 i = 0; i < strategies.length; i++) {
            if (strategy_IsAlive[strategies[i]]) {
                distribute(strategies[i], _token);
            }
        }
    }

    /// @notice Update strategy index for a specific token
    function _updateStrategyIndex(address _strategy, address _token) internal {
        uint256 weight = strategy_Weight[_strategy];
        if (weight > 0) {
            uint256 supplyIndex = strategy_TokenSupplyIndex[_strategy][_token];
            uint256 index = tokenIndex[_token];
            strategy_TokenSupplyIndex[_strategy][_token] = index;

            uint256 delta = index - supplyIndex;
            if (delta > 0 && strategy_IsAlive[_strategy]) {
                uint256 share = (weight * delta) / 1e18;
                strategy_TokenClaimable[_strategy][_token] += share;
            }
        } else {
            strategy_TokenSupplyIndex[_strategy][_token] = tokenIndex[_token];
        }
    }

    /// @notice Update all token indices for a strategy
    function _updateStrategyIndices(address _strategy) internal {
        for (uint256 i = 0; i < revenueTokens.length; i++) {
            _updateStrategyIndex(_strategy, revenueTokens[i]);
        }
    }

    /*//////////////////////////////////////////////////////////////
                            ADMIN FUNCTIONS
    //////////////////////////////////////////////////////////////*/

    function setRevenueRouter(address _router) external onlyOwner {
        if (_router == address(0)) revert InvalidAddress();
        revenueRouter = _router;
    }

    function addStrategy(
        address _strategy,
        address _bribe
    ) external onlyOwner returns (address) {
        if (strategies.length >= MAX_STRATEGIES) revert MaxStrategiesReached();
        if (_strategy == address(0) || _bribe == address(0)) revert InvalidAddress();

        strategies.push(_strategy);
        strategy_IsValid[_strategy] = true;
        strategy_IsAlive[_strategy] = true;
        strategy_Bribe[_strategy] = _bribe;

        // Initialize indices for all tokens
        for (uint256 i = 0; i < revenueTokens.length; i++) {
            strategy_TokenSupplyIndex[_strategy][revenueTokens[i]] = tokenIndex[revenueTokens[i]];
        }

        emit StrategyAdded(_strategy, _bribe);
        return _strategy;
    }

    function killStrategy(address _strategy) external onlyOwner {
        if (!strategy_IsAlive[_strategy]) revert StrategyNotAlive();

        // Update and send pending to treasury
        for (uint256 i = 0; i < revenueTokens.length; i++) {
            address token = revenueTokens[i];
            _updateStrategyIndex(_strategy, token);
            uint256 claimable = strategy_TokenClaimable[_strategy][token];
            if (claimable > 0) {
                strategy_TokenClaimable[_strategy][token] = 0;
                IERC20(token).safeTransfer(treasury, claimable);
            }
        }

        strategy_IsAlive[_strategy] = false;
        emit StrategyKilled(_strategy);
    }

    /*//////////////////////////////////////////////////////////////
                          EMERGENCY FUNCTIONS
    //////////////////////////////////////////////////////////////*/

    function emergencyPause() external onlyEmergency {
        _pause();
        emit EmergencyPause(msg.sender);
    }

    function unpause() external onlyOwner {
        _unpause();
    }

    function setEmergencyMultisig(address _multisig) external onlyOwner {
        if (_multisig == address(0)) revert InvalidAddress();
        emergencyMultisig = _multisig;
    }

    /*//////////////////////////////////////////////////////////////
                            VIEW FUNCTIONS
    //////////////////////////////////////////////////////////////*/

    function currentEpoch() public view returns (uint256) {
        return (block.timestamp - EPOCH_START) / EPOCH_DURATION;
    }

    function epochStartTime(uint256 epoch) public pure returns (uint256) {
        return EPOCH_START + (epoch * EPOCH_DURATION);
    }

    function timeUntilNextEpoch() public view returns (uint256) {
        uint256 nextEpochStart = epochStartTime(currentEpoch() + 1);
        return nextEpochStart - block.timestamp;
    }

    function getStrategies() external view returns (address[] memory) {
        return strategies;
    }

    function getAccountVotes(address account) external view returns (address[] memory) {
        return account_StrategyVotes[account];
    }

    function getRevenueTokens() external view returns (address[] memory) {
        return revenueTokens;
    }

    function pendingRevenue(address _strategy, address _token) external view returns (uint256) {
        uint256 weight = strategy_Weight[_strategy];
        if (weight == 0) return 0;

        uint256 delta = tokenIndex[_token] - strategy_TokenSupplyIndex[_strategy][_token];
        if (delta == 0) return 0;

        return (weight * delta) / 1e18;
    }
}

interface IBribe {
    function _deposit(uint256 amount, address account) external;
    function _withdraw(uint256 amount, address account) external;
}
```

### 3. Bribe Contract

**Purpose**: Distributes rewards to voters proportional to their vote weight.

```solidity
// SPDX-License-Identifier: MIT
pragma solidity 0.8.19;

import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import {SafeERC20} from "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import {ReentrancyGuard} from "@openzeppelin/contracts/security/ReentrancyGuard.sol";

contract Bribe is ReentrancyGuard {
    using SafeERC20 for IERC20;

    /*//////////////////////////////////////////////////////////////
                                CONSTANTS
    //////////////////////////////////////////////////////////////*/

    uint256 public constant DURATION = 7 days;

    /*//////////////////////////////////////////////////////////////
                                IMMUTABLES
    //////////////////////////////////////////////////////////////*/

    address public immutable voter;

    /*//////////////////////////////////////////////////////////////
                                STATE
    //////////////////////////////////////////////////////////////*/

    struct Reward {
        uint256 periodFinish;
        uint256 rewardRate;
        uint256 lastUpdateTime;
        uint256 rewardPerTokenStored;
    }

    mapping(address => Reward) public rewardData;
    mapping(address => bool) public isRewardToken;
    address[] public rewardTokens;

    uint256 public totalSupply;
    mapping(address => uint256) public balanceOf;
    mapping(address => mapping(address => uint256)) public userRewardPerTokenPaid;
    mapping(address => mapping(address => uint256)) public rewards;

    /*//////////////////////////////////////////////////////////////
                                EVENTS
    //////////////////////////////////////////////////////////////*/

    event Deposited(address indexed user, uint256 amount);
    event Withdrawn(address indexed user, uint256 amount);
    event RewardPaid(address indexed user, address indexed token, uint256 reward);
    event RewardNotified(address indexed token, uint256 reward);
    event RewardTokenAdded(address indexed token);

    /*//////////////////////////////////////////////////////////////
                                ERRORS
    //////////////////////////////////////////////////////////////*/

    error NotVoter();
    error InvalidAmount();

    /*//////////////////////////////////////////////////////////////
                                MODIFIERS
    //////////////////////////////////////////////////////////////*/

    modifier onlyVoter() {
        if (msg.sender != voter) revert NotVoter();
        _;
    }

    modifier updateReward(address account) {
        for (uint256 i = 0; i < rewardTokens.length; i++) {
            address token = rewardTokens[i];
            rewardData[token].rewardPerTokenStored = rewardPerToken(token);
            rewardData[token].lastUpdateTime = lastTimeRewardApplicable(token);
            if (account != address(0)) {
                rewards[account][token] = earned(account, token);
                userRewardPerTokenPaid[account][token] = rewardData[token].rewardPerTokenStored;
            }
        }
        _;
    }

    /*//////////////////////////////////////////////////////////////
                              CONSTRUCTOR
    //////////////////////////////////////////////////////////////*/

    constructor(address _voter) {
        voter = _voter;
    }

    /*//////////////////////////////////////////////////////////////
                          VOTER-ONLY FUNCTIONS
    //////////////////////////////////////////////////////////////*/

    function _deposit(uint256 amount, address account) external onlyVoter updateReward(account) {
        if (amount == 0) revert InvalidAmount();
        totalSupply += amount;
        balanceOf[account] += amount;
        emit Deposited(account, amount);
    }

    function _withdraw(uint256 amount, address account) external onlyVoter updateReward(account) {
        if (amount == 0) revert InvalidAmount();
        totalSupply -= amount;
        balanceOf[account] -= amount;
        emit Withdrawn(account, amount);
    }

    function addRewardToken(address _token) external onlyVoter {
        if (!isRewardToken[_token]) {
            rewardTokens.push(_token);
            isRewardToken[_token] = true;
            emit RewardTokenAdded(_token);
        }
    }

    /*//////////////////////////////////////////////////////////////
                            PUBLIC FUNCTIONS
    //////////////////////////////////////////////////////////////*/

    function getReward(address account) external nonReentrant updateReward(account) {
        for (uint256 i = 0; i < rewardTokens.length; i++) {
            address token = rewardTokens[i];
            uint256 reward = rewards[account][token];
            if (reward > 0) {
                rewards[account][token] = 0;
                IERC20(token).safeTransfer(account, reward);
                emit RewardPaid(account, token, reward);
            }
        }
    }

    function notifyRewardAmount(address _token, uint256 _amount) external updateReward(address(0)) {
        if (!isRewardToken[_token]) {
            rewardTokens.push(_token);
            isRewardToken[_token] = true;
        }

        IERC20(_token).safeTransferFrom(msg.sender, address(this), _amount);

        Reward storage r = rewardData[_token];
        if (block.timestamp >= r.periodFinish) {
            r.rewardRate = _amount / DURATION;
        } else {
            uint256 remaining = r.periodFinish - block.timestamp;
            uint256 leftover = remaining * r.rewardRate;
            r.rewardRate = (_amount + leftover) / DURATION;
        }

        r.lastUpdateTime = block.timestamp;
        r.periodFinish = block.timestamp + DURATION;

        emit RewardNotified(_token, _amount);
    }

    /*//////////////////////////////////////////////////////////////
                            VIEW FUNCTIONS
    //////////////////////////////////////////////////////////////*/

    function lastTimeRewardApplicable(address _token) public view returns (uint256) {
        return block.timestamp < rewardData[_token].periodFinish
            ? block.timestamp
            : rewardData[_token].periodFinish;
    }

    function rewardPerToken(address _token) public view returns (uint256) {
        if (totalSupply == 0) {
            return rewardData[_token].rewardPerTokenStored;
        }
        return rewardData[_token].rewardPerTokenStored + (
            (lastTimeRewardApplicable(_token) - rewardData[_token].lastUpdateTime)
            * rewardData[_token].rewardRate
            * 1e18
            / totalSupply
        );
    }

    function earned(address account, address _token) public view returns (uint256) {
        return (
            balanceOf[account]
            * (rewardPerToken(_token) - userRewardPerTokenPaid[account][_token])
            / 1e18
        ) + rewards[account][_token];
    }

    function getRewardTokens() external view returns (address[] memory) {
        return rewardTokens;
    }
}
```

### 4. Strategy Contracts

#### 4.1 Base Strategy Interface

```solidity
// SPDX-License-Identifier: MIT
pragma solidity 0.8.19;

interface IStrategy {
    function execute() external;
    function rescueTokens(address token, uint256 amount) external;
    function voter() external view returns (address);
}
```

#### 4.2 LBT Boost Strategy

```solidity
// SPDX-License-Identifier: MIT
pragma solidity 0.8.19;

import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import {SafeERC20} from "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";

contract LBTBoostStrategy is Ownable {
    using SafeERC20 for IERC20;

    address public immutable voter;
    address public immutable lbt;
    address public immutable swapRouter;
    address public immutable targetToken; // e.g., WETH

    address[] public supportedTokens;
    mapping(address => bool) public isSupportedToken;
    mapping(address => bytes) public swapPaths; // token => swap path

    event Executed(address indexed token, uint256 amountIn, uint256 amountOut);
    event SwapPathSet(address indexed token, bytes path);

    error NotVoter();
    error SwapFailed();

    constructor(
        address _voter,
        address _lbt,
        address _swapRouter,
        address _targetToken
    ) {
        voter = _voter;
        lbt = _lbt;
        swapRouter = _swapRouter;
        targetToken = _targetToken;
    }

    modifier onlyVoter() {
        if (msg.sender != voter) revert NotVoter();
        _;
    }

    function setSwapPath(address _token, bytes calldata _path) external onlyOwner {
        if (!isSupportedToken[_token]) {
            supportedTokens.push(_token);
            isSupportedToken[_token] = true;
        }
        swapPaths[_token] = _path;
        emit SwapPathSet(_token, _path);
    }

    /// @notice Execute strategy - swap tokens and deposit to LBT
    function execute() external {
        for (uint256 i = 0; i < supportedTokens.length; i++) {
            address token = supportedTokens[i];
            uint256 balance = IERC20(token).balanceOf(address(this));

            if (balance > 0 && token != targetToken) {
                // Swap to target token
                IERC20(token).safeApprove(swapRouter, balance);
                // Execute swap via router (implementation depends on DEX)
                // ...
            }
        }

        // Deposit all target tokens to LBT
        uint256 targetBalance = IERC20(targetToken).balanceOf(address(this));
        if (targetBalance > 0) {
            IERC20(targetToken).safeApprove(lbt, targetBalance);
            ILBT(lbt).addBacking(targetBalance);
        }
    }

    function rescueTokens(address _token, uint256 _amount) external onlyOwner {
        IERC20(_token).safeTransfer(owner(), _amount);
    }
}

interface ILBT {
    function addBacking(uint256 amount) external;
}
```

#### 4.3 Direct Distribution Strategy

```solidity
// SPDX-License-Identifier: MIT
pragma solidity 0.8.19;

import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import {SafeERC20} from "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";

contract DirectDistributionStrategy is Ownable {
    using SafeERC20 for IERC20;

    address public immutable voter;
    address public immutable bribe;

    event Distributed(address indexed token, uint256 amount);

    error NotVoter();

    constructor(address _voter, address _bribe) {
        voter = _voter;
        bribe = _bribe;
    }

    /// @notice Execute strategy - forward all tokens to Bribe contract
    function execute() external {
        // Get list of revenue tokens from voter
        address[] memory tokens = ILSGVoter(voter).getRevenueTokens();

        for (uint256 i = 0; i < tokens.length; i++) {
            address token = tokens[i];
            uint256 balance = IERC20(token).balanceOf(address(this));

            if (balance > 0) {
                IERC20(token).safeApprove(bribe, balance);
                IBribe(bribe).notifyRewardAmount(token, balance);
                emit Distributed(token, balance);
            }
        }
    }

    function rescueTokens(address _token, uint256 _amount) external onlyOwner {
        IERC20(_token).safeTransfer(owner(), _amount);
    }
}

interface ILSGVoter {
    function getRevenueTokens() external view returns (address[] memory);
}

interface IBribe {
    function notifyRewardAmount(address token, uint256 amount) external;
}
```

#### 4.4 Growth Treasury Strategy

```solidity
// SPDX-License-Identifier: MIT
pragma solidity 0.8.19;

import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import {SafeERC20} from "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";

contract GrowthTreasuryStrategy is Ownable {
    using SafeERC20 for IERC20;

    address public immutable voter;
    address public growthTreasury;

    event TreasuryUpdated(address indexed oldTreasury, address indexed newTreasury);
    event Forwarded(address indexed token, uint256 amount);

    error NotVoter();
    error InvalidAddress();

    constructor(address _voter, address _growthTreasury) {
        voter = _voter;
        growthTreasury = _growthTreasury;
    }

    function setGrowthTreasury(address _treasury) external onlyOwner {
        if (_treasury == address(0)) revert InvalidAddress();
        emit TreasuryUpdated(growthTreasury, _treasury);
        growthTreasury = _treasury;
    }

    /// @notice Execute strategy - forward all tokens to Growth Treasury
    function execute() external {
        address[] memory tokens = ILSGVoter(voter).getRevenueTokens();

        for (uint256 i = 0; i < tokens.length; i++) {
            address token = tokens[i];
            uint256 balance = IERC20(token).balanceOf(address(this));

            if (balance > 0) {
                IERC20(token).safeTransfer(growthTreasury, balance);
                emit Forwarded(token, balance);
            }
        }
    }

    function rescueTokens(address _token, uint256 _amount) external onlyOwner {
        IERC20(_token).safeTransfer(owner(), _amount);
    }
}

interface ILSGVoter {
    function getRevenueTokens() external view returns (address[] memory);
}
```

#### 4.5 PoL Reinvestment Strategy

```solidity
// SPDX-License-Identifier: MIT
pragma solidity 0.8.19;

import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import {SafeERC20} from "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";

contract PoLReinvestmentStrategy is Ownable {
    using SafeERC20 for IERC20;

    address public immutable voter;
    address public polManager; // Beekeeper-controlled wallet for PoL bribing

    event PolManagerUpdated(address indexed oldManager, address indexed newManager);
    event Forwarded(address indexed token, uint256 amount);

    error InvalidAddress();

    constructor(address _voter, address _polManager) {
        voter = _voter;
        polManager = _polManager;
    }

    function setPolManager(address _manager) external onlyOwner {
        if (_manager == address(0)) revert InvalidAddress();
        emit PolManagerUpdated(polManager, _manager);
        polManager = _manager;
    }

    /// @notice Execute strategy - forward all tokens to PoL Manager
    function execute() external {
        address[] memory tokens = ILSGVoter(voter).getRevenueTokens();

        for (uint256 i = 0; i < tokens.length; i++) {
            address token = tokens[i];
            uint256 balance = IERC20(token).balanceOf(address(this));

            if (balance > 0) {
                IERC20(token).safeTransfer(polManager, balance);
                emit Forwarded(token, balance);
            }
        }
    }

    function rescueTokens(address _token, uint256 _amount) external onlyOwner {
        IERC20(_token).safeTransfer(owner(), _amount);
    }
}

interface ILSGVoter {
    function getRevenueTokens() external view returns (address[] memory);
}
```

---

## Security Architecture

### Access Control Matrix

| Function | Owner | EmergencyMultisig | RevenueRouter | Public |
|----------|-------|-------------------|---------------|--------|
| addStrategy | ✅ | | | |
| killStrategy | ✅ | | | |
| setRevenueRouter | ✅ | | | |
| emergencyPause | ✅ | ✅ | | |
| unpause | ✅ | | | |
| notifyRevenue | | | ✅ | |
| vote/reset | | | | ✅ |
| delegate | | | | ✅ |
| flush | | | | ✅ |
| distribute | | | | ✅ |
| claimRewards | | | | ✅ |

### Emergency Procedures

```
Level 1: Per-Strategy Kill
├── Trigger: Governance proposal OR emergency multisig
├── Action: killStrategy(_strategy)
├── Effect: Strategy stops receiving revenue, pending sent to treasury
└── Recovery: Deploy new strategy, add via governance

Level 2: Global Pause
├── Trigger: Emergency multisig OR owner
├── Action: emergencyPause()
├── Effect: All voting and distribution halted
└── Recovery: Owner calls unpause() after investigation

Level 3: Revenue Router Pause
├── Trigger: Owner
├── Action: MultiTokenRouter.pause()
├── Effect: No new revenue enters system
└── Recovery: Owner calls unpause()
```

### Security Considerations

1. **Reentrancy Protection**: All state-changing functions use `nonReentrant` modifier
2. **Access Control**: Owner functions protected, emergency multisig for critical actions
3. **Token Whitelisting**: RevenueRouter only accepts whitelisted tokens
4. **Vote Manipulation Prevention**: One vote per epoch per account
5. **Flash Loan Protection**: Voting power from NFT balance, not flashloanable
6. **Integer Overflow**: Solidity 0.8+ built-in overflow checks

---

## Integration Points

### 1. apDAO Seat NFT

```solidity
// Read-only integration
IERC721(0xfc2d7ebfeb2714fce13caf234a95db129ecc43da).balanceOf(account)
```

### 2. Liquid Backing Treasury (LBT)

```solidity
// LBTBoostStrategy deposits
ILBT(lbtAddress).addBacking(amount);
```

### 3. Vase Subvalidator

```solidity
// Vase auto-pushes to RevenueRouter address
// No integration code needed - just deploy and share address
```

### 4. Honey Track Governor

```solidity
// LSGVoter.owner() = Governor contract address
// Strategy management via governance proposals
```

---

## Deployment Architecture

### Deployment Order

```
1. Deploy BribeFactory
2. Deploy Bribe contracts (4x, one per strategy)
3. Deploy LSGVoter(seatNFT, treasury, emergencyMultisig)
4. Deploy MultiTokenRouter(voter)
5. Deploy Strategy contracts (4x):
   - LBTBoostStrategy(voter, lbt, swapRouter, weth)
   - DirectDistributionStrategy(voter, bribe)
   - GrowthTreasuryStrategy(voter, growthTreasury)
   - PoLReinvestmentStrategy(voter, polManager)
6. Configure:
   - LSGVoter.setRevenueRouter(router)
   - LSGVoter.addStrategy(strategy, bribe) x4
   - MultiTokenRouter.setWhitelistedToken(token, true) for each token
7. Transfer ownership:
   - LSGVoter.transferOwnership(governor)
   - MultiTokenRouter.transferOwnership(governor)
   - Strategy contracts keep Beekeeper ownership initially
```

### Initialization Script

```solidity
// scripts/Deploy.s.sol
contract DeployLSG is Script {
    function run() external {
        vm.startBroadcast();

        // 1. Deploy core
        LSGVoter voter = new LSGVoter(
            SEAT_NFT,
            TREASURY,
            EMERGENCY_MULTISIG
        );

        MultiTokenRouter router = new MultiTokenRouter(address(voter));

        // 2. Deploy bribes
        Bribe lbtBribe = new Bribe(address(voter));
        Bribe directBribe = new Bribe(address(voter));
        Bribe polBribe = new Bribe(address(voter));
        Bribe growthBribe = new Bribe(address(voter));

        // 3. Deploy strategies
        LBTBoostStrategy lbtStrategy = new LBTBoostStrategy(
            address(voter), LBT, SWAP_ROUTER, WETH
        );
        DirectDistributionStrategy directStrategy = new DirectDistributionStrategy(
            address(voter), address(directBribe)
        );
        GrowthTreasuryStrategy growthStrategy = new GrowthTreasuryStrategy(
            address(voter), GROWTH_TREASURY
        );
        PoLReinvestmentStrategy polStrategy = new PoLReinvestmentStrategy(
            address(voter), POL_MANAGER
        );

        // 4. Configure voter
        voter.setRevenueRouter(address(router));
        voter.addStrategy(address(lbtStrategy), address(lbtBribe));
        voter.addStrategy(address(directStrategy), address(directBribe));
        voter.addStrategy(address(growthStrategy), address(growthBribe));
        voter.addStrategy(address(polStrategy), address(polBribe));

        // 5. Whitelist tokens
        router.setWhitelistedToken(BERA, true);
        router.setWhitelistedToken(VBGT, true);
        router.setWhitelistedToken(USDC, true);
        router.setWhitelistedToken(HONEY, true);

        // 6. Transfer ownership to governor (after testing)
        // voter.transferOwnership(GOVERNOR);
        // router.transferOwnership(GOVERNOR);

        vm.stopBroadcast();
    }
}
```

---

## Testing Strategy

### Unit Tests

```
test/
├── LSGVoter.t.sol
│   ├── test_Vote_WithValidStrategies
│   ├── test_Vote_RevertIfSameEpoch
│   ├── test_Vote_UpdatesWeightsCorrectly
│   ├── test_Reset_ClearsVotes
│   ├── test_Delegate_TransfersPower
│   ├── test_NotifyRevenue_UpdatesIndex
│   ├── test_Distribute_SendsCorrectAmount
│   └── test_KillStrategy_SendsToTreasury
├── MultiTokenRouter.t.sol
│   ├── test_Flush_SingleToken
│   ├── test_FlushAll_MultipleTokens
│   ├── test_Flush_RevertIfNotWhitelisted
│   └── test_Pause_BlocksFlush
├── Bribe.t.sol
│   ├── test_Deposit_UpdatesBalance
│   ├── test_Withdraw_UpdatesBalance
│   ├── test_GetReward_TransfersEarned
│   └── test_NotifyReward_SetsRewardRate
└── Strategies.t.sol
    ├── test_LBTStrategy_SwapsAndDeposits
    ├── test_DirectStrategy_ForwardsToBribe
    ├── test_GrowthStrategy_ForwardsToTreasury
    └── test_PoLStrategy_ForwardsToManager
```

### Integration Tests

```solidity
// test/Integration.t.sol
contract IntegrationTest is Test {
    function test_FullFlow_VoteDistributeClaim() public {
        // 1. Setup: User has NFTs, strategies deployed
        // 2. Vote: User votes for strategies
        // 3. Revenue: Router receives tokens, flushes
        // 4. Distribute: Anyone calls distribute
        // 5. Claim: User claims bribe rewards
    }

    function test_DelegationFlow() public {
        // 1. Partner delegates to multisig
        // 2. Multisig votes with delegated power
        // 3. Partner claims rewards
    }

    function test_EmergencyPause() public {
        // 1. Emergency multisig pauses
        // 2. All operations blocked
        // 3. Owner unpases
        // 4. Operations resume
    }
}
```

### Fork Tests

```solidity
// test/Fork.t.sol
contract ForkTest is Test {
    function setUp() public {
        vm.createSelectFork("berachain");
    }

    function test_Integration_WithRealNFT() public {
        // Test with actual apDAO seat NFT
        address whale = 0x...; // Known seat holder
        vm.prank(whale);
        voter.vote(strategies, weights);
    }
}
```

---

## Gas Optimization

### Current Approach (v1)

- Standard OpenZeppelin SafeERC20
- Batch operations where sensible
- No premature optimization

### Future Optimizations (v2)

1. **Unchecked Math**: Where overflow impossible
2. **Packed Storage**: Combine related uint values
3. **Merkle Claims**: Off-chain calculation, on-chain verify
4. **Lazy Updates**: Defer index updates until needed

### Gas Estimates (Berachain)

| Operation | Estimated Gas | Cost @ 1 gwei |
|-----------|--------------|---------------|
| vote() | ~150,000 | ~$0.01 |
| reset() | ~100,000 | ~$0.01 |
| delegate() | ~50,000 | ~$0.005 |
| flush() per token | ~80,000 | ~$0.008 |
| distribute() per strategy | ~60,000 | ~$0.006 |
| claimRewards() | ~100,000 | ~$0.01 |

---

## Technical Risks & Mitigations

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| NFT balance manipulation | Low | High | Read-only integration, no state in NFT |
| Revenue token draining | Low | Critical | Whitelisting, access control, audit |
| Vote weight calculation error | Medium | High | Extensive testing, formal verification |
| Delegation accounting bug | Medium | High | Unit tests, integration tests |
| Strategy exploit | Medium | High | Per-strategy kill switch, audit |
| Index overflow | Low | Critical | Solidity 0.8+ checks, bounds testing |

---

## Future Considerations

### v1.1 Enhancements
- Delegate strategy restrictions (prevent delegates from Direct Distribution)
- Batch claim across all bribes
- Gas optimization based on mainnet data

### v2.0 Features
- Cross-epoch vote persistence (optional rollover)
- Multiple subvalidator support
- Auto-compound option
- Advanced delegation (partial, time-limited)

### Technical Debt
- Strategy swap paths hardcoded (make configurable)
- No upgradeability (by design, but limits flexibility)
- Single RevenueRouter (may need multiple for scaling)

---

*Document Version: 1.0*
*Last Updated: December 2024*
*Author: Architecture Designer Agent*
*Status: Ready for Sprint Planning*
