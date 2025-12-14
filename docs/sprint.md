# Sprint Plan: apDAO LSG (Liquid Signal Governance)

## Overview

| Parameter | Value |
|-----------|-------|
| **Team** | 1 senior Solidity developer (full-time, shared capacity) |
| **Sprint Duration** | 1-2 weeks |
| **Audit Target** | Q4 2025 (Pashov Audit Group) |
| **Mainnet Target** | January 2026 |
| **Definition of Done** | Code + Tests + Docs + Testnet Deploy |
| **Approach** | Balanced quality |

## MVP Scope

### In Scope (v1.0)
- MultiTokenRouter (revenue accumulation)
- LSGVoter (voting, multi-token distribution)
- Bribe contract (reward distribution)
- 3 Strategies: LBT Boost, Growth Treasury, Direct Distribution
- Unit tests (80%+ coverage)
- NatSpec documentation
- Testnet deployment

### Deferred (v1.1)
- Delegation system
- PoL Reinvestment Strategy
- Fork tests against mainnet

## Technology Decisions

| Component | Choice |
|-----------|--------|
| DEX Router | Kodiak (swap aggregator + API) |
| Framework | Foundry |
| Testnet | Berachain Bartio |
| Multisig | TBD (placeholder in contracts) |

---

## Sprint 1: Foundation & Revenue Router
**Duration**: 1 week
**Goal**: Project setup and MultiTokenRouter implementation

### Tasks

#### S1-T1: Project Initialization
**Description**: Set up Foundry project structure with dependencies and configuration.

**Acceptance Criteria**:
- [ ] Foundry project initialized with `forge init`
- [ ] OpenZeppelin contracts v5.x installed
- [ ] Solmate installed for gas-optimized utilities
- [ ] `foundry.toml` configured for Berachain
- [ ] `.env.example` with required variables
- [ ] Basic CI/CD workflow (GitHub Actions for tests)

**Effort**: 0.5 days
**Dependencies**: None

---

#### S1-T2: MultiTokenRouter Implementation
**Description**: Implement revenue router that accumulates tokens from Vase and forwards to Voter.

**Acceptance Criteria**:
- [ ] Contract compiles without errors
- [ ] `setWhitelistedToken()` adds/removes tokens from whitelist
- [ ] `flush(token)` transfers single token to Voter
- [ ] `flushAll()` transfers all whitelisted tokens
- [ ] `pause()`/`unpause()` controls operation
- [ ] Events emitted for all state changes
- [ ] Custom errors instead of require strings
- [ ] NatSpec comments on all public functions

**Effort**: 1.5 days
**Dependencies**: S1-T1

---

#### S1-T3: MultiTokenRouter Tests
**Description**: Comprehensive unit tests for MultiTokenRouter.

**Acceptance Criteria**:
- [ ] Test: whitelist token successfully
- [ ] Test: flush single token transfers correctly
- [ ] Test: flushAll transfers multiple tokens
- [ ] Test: revert on non-whitelisted token
- [ ] Test: revert when paused
- [ ] Test: only owner can whitelist/pause
- [ ] Test: pendingRevenue view returns correct balance
- [ ] Coverage: >90% for MultiTokenRouter

**Effort**: 1 day
**Dependencies**: S1-T2

---

#### S1-T4: Mock Contracts
**Description**: Create mock contracts for testing (MockERC20, MockERC721, MockVoter).

**Acceptance Criteria**:
- [ ] MockERC20 with mint function
- [ ] MockERC721 with mint function (simulates seat NFT)
- [ ] MockVoter with notifyRevenue stub
- [ ] All mocks in `test/mocks/` directory

**Effort**: 0.5 days
**Dependencies**: S1-T1

---

### Sprint 1 Deliverables
- [ ] Working Foundry project
- [ ] MultiTokenRouter contract with full test coverage
- [ ] Mock contracts for testing
- [ ] Documentation: README with setup instructions

---

## Sprint 2: LSGVoter Core
**Duration**: 1.5 weeks
**Goal**: Implement core Voter contract with voting mechanics

### Tasks

#### S2-T1: LSGVoter Base Structure
**Description**: Implement LSGVoter contract skeleton with state variables and modifiers.

**Acceptance Criteria**:
- [ ] Immutables: seatNFT, treasury
- [ ] State: strategies array, mappings for weights/votes
- [ ] Epoch calculation functions (currentEpoch, epochStartTime)
- [ ] Calendar-aligned epochs (Monday 00:00 UTC)
- [ ] Access control modifiers (onlyOwner, onlyRevenueRouter, onlyEmergency)
- [ ] NatSpec documentation

**Effort**: 1 day
**Dependencies**: S1-T4

---

#### S2-T2: Voting Power Implementation
**Description**: Implement voting power calculation from NFT balance.

**Acceptance Criteria**:
- [ ] `getVotingPower(account)` returns NFT balance
- [ ] Voting power = `IERC721(seatNFT).balanceOf(account)`
- [ ] No delegation logic (deferred to v1.1)
- [ ] Test with mock NFT contract

**Effort**: 0.5 days
**Dependencies**: S2-T1

---

#### S2-T3: Vote Function Implementation
**Description**: Implement vote() and reset() functions.

**Acceptance Criteria**:
- [ ] `vote(strategies[], weights[])` allocates voting power
- [ ] Votes normalized to total weight
- [ ] Only one vote per epoch per account
- [ ] `reset()` clears all votes for account
- [ ] Updates strategy_Weight and totalWeight correctly
- [ ] Calls Bribe._deposit() for each voted strategy
- [ ] Events: Voted, VoteReset

**Effort**: 2 days
**Dependencies**: S2-T2

---

#### S2-T4: Multi-Token Revenue Distribution
**Description**: Implement notifyRevenue and distribute functions for multiple tokens.

**Acceptance Criteria**:
- [ ] `notifyRevenue(token, amount)` updates per-token index
- [ ] Tracks multiple revenue tokens in array
- [ ] `distribute(strategy, token)` sends proportional share
- [ ] `distributeAllTokens(strategy)` handles all tokens
- [ ] `distributeToAllStrategies(token)` batch distribution
- [ ] If totalWeight == 0, revenue goes to treasury
- [ ] Index math matches original LSG pattern

**Effort**: 2 days
**Dependencies**: S2-T3

---

#### S2-T5: Strategy Management
**Description**: Implement addStrategy and killStrategy functions.

**Acceptance Criteria**:
- [ ] `addStrategy(strategy, bribe)` registers new strategy
- [ ] MAX_STRATEGIES limit enforced
- [ ] `killStrategy(strategy)` deactivates and sends pending to treasury
- [ ] Only owner can add/kill strategies
- [ ] Events: StrategyAdded, StrategyKilled

**Effort**: 1 day
**Dependencies**: S2-T4

---

#### S2-T6: LSGVoter Unit Tests
**Description**: Comprehensive unit tests for all Voter functions.

**Acceptance Criteria**:
- [ ] Test: getVotingPower returns correct NFT balance
- [ ] Test: vote allocates weights correctly
- [ ] Test: vote reverts if same epoch
- [ ] Test: reset clears votes
- [ ] Test: notifyRevenue updates index
- [ ] Test: distribute sends correct amounts
- [ ] Test: addStrategy/killStrategy work correctly
- [ ] Test: epoch calculations are calendar-aligned
- [ ] Coverage: >85% for LSGVoter

**Effort**: 2 days
**Dependencies**: S2-T5

---

### Sprint 2 Deliverables
- [ ] LSGVoter contract with voting and distribution
- [ ] Unit tests with >85% coverage
- [ ] Integration between Router and Voter verified

---

## Sprint 3: Bribe Contract & Emergency Controls
**Duration**: 1 week
**Goal**: Implement Bribe contract and emergency mechanisms

### Tasks

#### S3-T1: Bribe Contract Implementation
**Description**: Implement Synthetix-style reward distribution contract.

**Acceptance Criteria**:
- [ ] Virtual balance tracking (no actual token deposits)
- [ ] `_deposit(amount, account)` updates balance (voter-only)
- [ ] `_withdraw(amount, account)` updates balance (voter-only)
- [ ] Multi-token reward support
- [ ] `notifyRewardAmount(token, amount)` sets reward rate
- [ ] `getReward(account)` claims all rewards
- [ ] 7-day reward distribution period
- [ ] `rewardPerToken()` and `earned()` view functions

**Effort**: 2 days
**Dependencies**: S2-T6

---

#### S3-T2: Bribe Unit Tests
**Description**: Comprehensive tests for Bribe contract.

**Acceptance Criteria**:
- [ ] Test: deposit updates balance correctly
- [ ] Test: withdraw updates balance correctly
- [ ] Test: only voter can deposit/withdraw
- [ ] Test: reward distribution over 7 days
- [ ] Test: multiple reward tokens
- [ ] Test: earned calculation accuracy
- [ ] Test: getReward transfers correct amounts
- [ ] Coverage: >90% for Bribe

**Effort**: 1.5 days
**Dependencies**: S3-T1

---

#### S3-T3: Emergency Controls Implementation
**Description**: Add emergency pause and multisig controls to LSGVoter.

**Acceptance Criteria**:
- [ ] `emergencyPause()` callable by owner or emergencyMultisig
- [ ] `unpause()` callable by owner only
- [ ] All state-changing functions respect pause
- [ ] `setEmergencyMultisig()` owner-only
- [ ] Events: EmergencyPause

**Effort**: 0.5 days
**Dependencies**: S3-T1

---

#### S3-T4: Emergency Controls Tests
**Description**: Test emergency mechanisms.

**Acceptance Criteria**:
- [ ] Test: emergencyPause blocks operations
- [ ] Test: unpause resumes operations
- [ ] Test: both owner and multisig can pause
- [ ] Test: only owner can unpause

**Effort**: 0.5 days
**Dependencies**: S3-T3

---

#### S3-T5: Voter-Bribe Integration Test
**Description**: Integration test for voting → bribe → claim flow.

**Acceptance Criteria**:
- [ ] Test complete flow: vote → notify revenue → distribute → claim
- [ ] Verify reward amounts match vote weights
- [ ] Test multiple voters with different weights
- [ ] Test reward claiming after epoch change

**Effort**: 1 day
**Dependencies**: S3-T2, S3-T4

---

### Sprint 3 Deliverables
- [ ] Bribe contract with full test coverage
- [ ] Emergency controls implemented and tested
- [ ] Integration test for core flow

---

## Sprint 4: Strategy Contracts
**Duration**: 1.5 weeks
**Goal**: Implement 3 strategy contracts with Kodiak integration

### Tasks

#### S4-T1: Strategy Interface & Base
**Description**: Create IStrategy interface and base patterns.

**Acceptance Criteria**:
- [ ] IStrategy interface with execute() and rescueTokens()
- [ ] Common patterns documented
- [ ] Shared imports organized

**Effort**: 0.5 days
**Dependencies**: S3-T5

---

#### S4-T2: DirectDistributionStrategy
**Description**: Strategy that forwards all tokens to Bribe contract.

**Acceptance Criteria**:
- [ ] Receives tokens from Voter distribution
- [ ] `execute()` forwards all tokens to associated Bribe
- [ ] Calls `bribe.notifyRewardAmount()` for each token
- [ ] `rescueTokens()` for emergency recovery
- [ ] Events: Distributed

**Effort**: 1 day
**Dependencies**: S4-T1

---

#### S4-T3: GrowthTreasuryStrategy
**Description**: Strategy that forwards all tokens to Growth Treasury multisig.

**Acceptance Criteria**:
- [ ] Receives tokens from Voter distribution
- [ ] `execute()` forwards all tokens to growthTreasury address
- [ ] `setGrowthTreasury()` allows address update (owner-only)
- [ ] `rescueTokens()` for emergency recovery
- [ ] Events: Forwarded, TreasuryUpdated

**Effort**: 0.5 days
**Dependencies**: S4-T1

---

#### S4-T4: LBTBoostStrategy - Kodiak Integration
**Description**: Strategy that swaps tokens via Kodiak and deposits to LBT.

**Acceptance Criteria**:
- [ ] Configurable swap paths per token via `setSwapPath()`
- [ ] Integrates with Kodiak swap aggregator
- [ ] `execute()` swaps all tokens to target token (WETH)
- [ ] Deposits swapped tokens to LBT via `addBacking()`
- [ ] Handles swap failures gracefully
- [ ] `rescueTokens()` for emergency recovery
- [ ] Events: Executed, SwapPathSet

**Effort**: 2 days
**Dependencies**: S4-T1

---

#### S4-T5: Kodiak Integration Research
**Description**: Research and document Kodiak API/aggregator integration.

**Acceptance Criteria**:
- [ ] Document Kodiak router address on Berachain
- [ ] Document swap function signatures
- [ ] Example swap path encoding
- [ ] Test swap on testnet manually

**Effort**: 1 day
**Dependencies**: None (can run parallel)

---

#### S4-T6: Strategy Unit Tests
**Description**: Unit tests for all 3 strategy contracts.

**Acceptance Criteria**:
- [ ] DirectDistributionStrategy: forwards to bribe correctly
- [ ] GrowthTreasuryStrategy: forwards to treasury correctly
- [ ] LBTBoostStrategy: swaps and deposits correctly (mocked)
- [ ] All strategies: rescueTokens works
- [ ] All strategies: access control enforced
- [ ] Coverage: >85% per strategy

**Effort**: 2 days
**Dependencies**: S4-T2, S4-T3, S4-T4

---

#### S4-T7: Full Integration Test
**Description**: End-to-end test: Router → Voter → Strategy → Destination.

**Acceptance Criteria**:
- [ ] Test flow with DirectDistributionStrategy
- [ ] Test flow with GrowthTreasuryStrategy
- [ ] Test flow with LBTBoostStrategy (mocked LBT)
- [ ] Verify correct token amounts at each step

**Effort**: 1.5 days
**Dependencies**: S4-T6

---

### Sprint 4 Deliverables
- [ ] 3 strategy contracts implemented
- [ ] Kodiak integration documented and tested
- [ ] Full integration tests passing

---

## Sprint 5: Testnet Deployment & Documentation
**Duration**: 1 week
**Goal**: Deploy to Berachain testnet and complete documentation

### Tasks

#### S5-T1: Deployment Scripts
**Description**: Create Foundry deployment scripts for all contracts.

**Acceptance Criteria**:
- [ ] `script/Deploy.s.sol` with full deployment
- [ ] Correct deployment order enforced
- [ ] Configuration variables externalized
- [ ] Verification commands documented
- [ ] Testnet and mainnet configs separate

**Effort**: 1 day
**Dependencies**: S4-T7

---

#### S5-T2: Testnet Deployment
**Description**: Deploy full system to Berachain Bartio testnet.

**Acceptance Criteria**:
- [ ] All contracts deployed and verified
- [ ] Contracts configured correctly:
  - Router whitelisted tokens
  - Voter has strategies added
  - Strategies have correct destinations
- [ ] Deployment addresses documented
- [ ] Basic smoke test on testnet

**Effort**: 1 day
**Dependencies**: S5-T1

---

#### S5-T3: Testnet Integration Verification
**Description**: Manual testing on testnet with real transactions.

**Acceptance Criteria**:
- [ ] Successfully vote with test NFT
- [ ] Successfully flush revenue tokens
- [ ] Successfully distribute to strategies
- [ ] Successfully claim rewards from bribe
- [ ] Epoch transitions work correctly
- [ ] Emergency pause works

**Effort**: 1 day
**Dependencies**: S5-T2

---

#### S5-T4: NatSpec Documentation Review
**Description**: Ensure all contracts have complete NatSpec.

**Acceptance Criteria**:
- [ ] All public/external functions documented
- [ ] All events documented
- [ ] All custom errors documented
- [ ] Parameter descriptions complete
- [ ] Return value descriptions complete

**Effort**: 0.5 days
**Dependencies**: S5-T2

---

#### S5-T5: Technical Documentation
**Description**: Create deployment runbook and architecture docs.

**Acceptance Criteria**:
- [ ] Deployment runbook with step-by-step instructions
- [ ] Contract addresses document template
- [ ] Upgrade/maintenance procedures
- [ ] Emergency procedures documented
- [ ] Integration guide for Vase team

**Effort**: 1 day
**Dependencies**: S5-T3

---

#### S5-T6: Test Coverage Report
**Description**: Generate and review final test coverage.

**Acceptance Criteria**:
- [ ] `forge coverage` report generated
- [ ] Overall coverage >80%
- [ ] Critical paths (voting, distribution) >90%
- [ ] Any gaps documented with justification

**Effort**: 0.5 days
**Dependencies**: S5-T3

---

### Sprint 5 Deliverables
- [ ] Contracts deployed on Berachain testnet
- [ ] All contracts verified on explorer
- [ ] Complete NatSpec documentation
- [ ] Deployment runbook
- [ ] Coverage report

---

## Sprint 6: Audit Preparation
**Duration**: 1 week
**Goal**: Prepare codebase for Pashov Audit Group submission

### Tasks

#### S6-T1: Code Cleanup & Optimization
**Description**: Review and clean up all contracts.

**Acceptance Criteria**:
- [ ] Remove console.log and debug code
- [ ] Consistent code style (forge fmt)
- [ ] No commented-out code
- [ ] Optimize gas where obvious (no premature optimization)
- [ ] Final linting pass

**Effort**: 1 day
**Dependencies**: S5-T6

---

#### S6-T2: Security Self-Review
**Description**: Internal security review using checklist.

**Acceptance Criteria**:
- [ ] Reentrancy check on all external calls
- [ ] Access control verified on all admin functions
- [ ] Integer overflow/underflow considered
- [ ] Token handling (approve, transfer) reviewed
- [ ] Event emission complete
- [ ] Edge cases documented

**Effort**: 1 day
**Dependencies**: S6-T1

---

#### S6-T3: Known Issues Document
**Description**: Document any known limitations or design decisions.

**Acceptance Criteria**:
- [ ] List of intentional design decisions
- [ ] Known limitations documented
- [ ] Out-of-scope items listed
- [ ] Upgrade path considerations

**Effort**: 0.5 days
**Dependencies**: S6-T2

---

#### S6-T4: Audit Scope Document
**Description**: Prepare audit scope and context document.

**Acceptance Criteria**:
- [ ] Contract list with descriptions
- [ ] Lines of code count
- [ ] External dependencies listed
- [ ] Attack surface overview
- [ ] Key invariants documented
- [ ] Previous audit references (Heesho's LSG if applicable)

**Effort**: 0.5 days
**Dependencies**: S6-T3

---

#### S6-T5: Audit Submission Package
**Description**: Prepare complete package for Pashov Audit Group.

**Acceptance Criteria**:
- [ ] Clean repository with tagged version
- [ ] README with setup instructions
- [ ] Test suite runs successfully
- [ ] Deployment scripts work
- [ ] All documentation complete
- [ ] Contact information included

**Effort**: 0.5 days
**Dependencies**: S6-T4

---

#### S6-T6: Buffer for Fixes
**Description**: Reserved time for addressing any issues found during prep.

**Effort**: 1.5 days
**Dependencies**: S6-T1 through S6-T5

---

### Sprint 6 Deliverables
- [ ] Audit-ready codebase
- [ ] Security self-review completed
- [ ] Audit scope document
- [ ] Submission package ready

---

## Timeline Summary

| Sprint | Duration | Focus | End State |
|--------|----------|-------|-----------|
| Sprint 1 | 1 week | Foundation + Router | MultiTokenRouter complete |
| Sprint 2 | 1.5 weeks | LSGVoter Core | Voting + distribution working |
| Sprint 3 | 1 week | Bribe + Emergency | Rewards claimable |
| Sprint 4 | 1.5 weeks | Strategies | All 3 strategies working |
| Sprint 5 | 1 week | Testnet + Docs | Deployed and documented |
| Sprint 6 | 1 week | Audit Prep | Ready for submission |

**Total**: ~7 weeks of development

**Timeline**:
- Start: Immediately
- Testnet: ~Week 5
- Audit Submission: ~Week 7 (Q4 2025)
- Audit Duration: 2-4 weeks (depending on Pashov availability)
- Audit Remediation: 1-2 weeks
- Mainnet: January 2026

---

## Risk Mitigation

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| Kodiak integration issues | Medium | High | Research sprint (S4-T5), fallback to direct swaps |
| Berachain testnet instability | Low | Medium | Mock testing, retry logic |
| Scope creep | Medium | Medium | Strict MVP scope, defer to v1.1 |
| Single developer bottleneck | Medium | High | Clear documentation, modular design |
| Audit findings severe | Low | High | Thorough self-review, known issues doc |

---

## v1.1 Backlog (Post-Audit)

| Feature | Priority | Effort |
|---------|----------|--------|
| Delegation system | P1 | 1 week |
| PoL Reinvestment Strategy | P1 | 0.5 weeks |
| Fork tests against mainnet | P2 | 0.5 weeks |
| Gas optimization | P2 | 0.5 weeks |
| Delegate strategy restrictions | P3 | 0.5 weeks |

---

*Document Version: 1.0*
*Last Updated: December 2024*
*Author: Sprint Planner Agent*
*Status: Ready for Implementation*
