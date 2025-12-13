# Product Requirements Document: apDAO LSG (Liquid Signal Governance)

## Executive Summary

apDAO LSG is a fork of Heesho's Liquid Signal Governance system, adapted to work with apDAO's soulbound NFT membership model. It enables weekly governance of subvalidator revenue allocation through liquid democracy, allowing seat holders to vote on how Vase subvalidator revenue flows across different strategies.

**Key Innovation**: Instead of staking fungible tokens for voting power, apDAO LSG derives voting power from NFT seat ownership via the existing Station X governance token integration. Votes are automatically removed when seats enter auction queue or are liquidated through the LBT.

---

## Problem Statement

### Current State
- apDAO is launching a Vase subvalidator on Berachain that will earn dynamic revenue streams: $BGT emissions, $BERA block rewards, and PoL bribe payments
- Current governance (Honey Track) requires 7+ day proposal cycles to change revenue allocation
- Market conditions and opportunities change faster than governance can respond
- Seat holders own membership NFTs but lack direct, ongoing engagement mechanisms beyond governance votes

### Pain Points
1. **Slow Adaptation**: 7+ day governance cycles cannot respond to weekly market dynamics
2. **Passive Membership**: Nouns-style NFT governance incentivizes ownership but not consistent participation
3. **Single Value Source**: Seat value depends solely on LBT floor price, creating auction velocity pressure
4. **Missed Opportunities**: Cannot quickly pivot revenue strategy when new DeFi opportunities emerge

### Opportunity
Create a "fine-tuning layer" where seat holders vote weekly on subvalidator revenue allocation, earning rewards for participation while Honey Track maintains strategic control over which strategies exist.

---

## Goals & Success Metrics

### Primary Goals
1. Enable weekly tactical governance of subvalidator revenue
2. Create direct financial incentives for seat holder participation
3. Reduce auction queue velocity by adding passive income value to seats
4. Maintain decentralization without multisig dependency for revenue routing

### Success Metrics

| Metric | Target | Measurement |
|--------|--------|-------------|
| **Participation Rate** | >50% of active seats voting weekly | On-chain vote count vs total seats |
| **Auction Queue Reduction** | 20% decrease in queue velocity | Compare pre/post LSG launch |
| **Revenue Distribution** | 100% of subvalidator revenue routed via LSG | Smart contract verification |
| **Voter Satisfaction** | Positive community sentiment | Discord polls, governance discussions |

### Non-Goals (Out of Scope for v1)
- Modifying the existing 4-track governance system
- Changing seat NFT transfer restrictions
- Creating new NFT types or membership tiers
- Cross-chain revenue aggregation

---

## User Personas

### Primary: Active Seat Holder
- **Description**: apDAO member who actively participates in governance
- **Needs**: Easy way to express preferences on revenue allocation, earn rewards for participation
- **Behavior**: Checks in weekly, votes on strategies, claims rewards
- **Pain Points**: Current governance is slow, no direct financial reward for participation

### Secondary: Passive Seat Holder
- **Description**: apDAO member who holds seat but rarely participates
- **Needs**: Simple passive income without active management
- **Behavior**: May delegate voting power, claims rewards periodically
- **Pain Points**: Complexity of DeFi governance, no incentive to engage

### Tertiary: Partner/Institutional Holder
- **Description**: Protocol partners who received seats through partnerships
- **Needs**: Ability to delegate voting power to trusted operators
- **Behavior**: Delegates to Growth Treasury multisig, doesn't vote directly
- **Requirements**: Delegation mechanism, potentially restricted from certain strategies

### Stakeholder: Beekeepers (DAO Operators)
- **Description**: The Honey Jar team managing DAO operations
- **Needs**: Govern which strategies exist, manage delegated partner votes
- **Behavior**: Propose new strategies via Honey Track, vote on behalf of delegators
- **Constraints**: Must act in DAO's best interest when voting delegated power

---

## Functional Requirements

### FR-1: Voting Power from NFT Ownership

**Description**: Voting power in LSG derives from Station X governance token balance, which reflects seat ownership minus seats in auction queue or LBT.

**Requirements**:
- FR-1.1: 1 seat = 1 vote per epoch
- FR-1.2: Voting power automatically removed when seat transfers to Auction House
- FR-1.3: Voting power automatically removed when seat transfers to LBT (loan default)
- FR-1.4: Voting power restored when seat transfers back from Auction House or LBT
- FR-1.5: System reads Station X governance token balance for voting power calculation

**Acceptance Criteria**:
- [ ] User with 3 seats and no auctions/loans has voting power of 3
- [ ] User who enters 1 seat into auction queue sees voting power drop to 2
- [ ] User who defaults on LBT loan sees voting power drop accordingly

### FR-2: Weekly Epoch Voting

**Description**: Seat holders vote weekly to allocate their voting power across available strategies.

**Requirements**:
- FR-2.1: Epochs are 7 days (Monday 00:00 UTC to Sunday 23:59 UTC)
- FR-2.2: Users can vote once per epoch (changing vote requires reset)
- FR-2.3: Votes are weighted - user can split voting power across multiple strategies
- FR-2.4: Total strategy weight determines proportional revenue distribution
- FR-2.5: Users must explicitly vote each epoch (no auto-rollover)

**Acceptance Criteria**:
- [ ] User can vote [60% Strategy A, 40% Strategy B] with their voting power
- [ ] User cannot vote twice in same epoch without resetting
- [ ] Revenue splits 60/40 when total votes are 60/40

### FR-3: Delegation System

**Description**: Seat holders can delegate their LSG voting power to another address.

**Requirements**:
- FR-3.1: Owner can delegate voting power to any address
- FR-3.2: Delegate can vote on behalf of delegator
- FR-3.3: Delegation is revocable at any time by owner
- FR-3.4: Delegated votes still count toward delegator's bribe rewards
- FR-3.5: (Optional v2) Certain strategies can be restricted for delegates

**Acceptance Criteria**:
- [ ] Partner can delegate 10 seats' voting power to Growth Treasury multisig
- [ ] Multisig can vote those 10 votes across strategies
- [ ] Partner still receives bribe rewards proportional to their delegated votes

### FR-4: Revenue Router (Multi-Token)

**Description**: Accumulates subvalidator revenue and distributes to Voter contract.

**Requirements**:
- FR-4.1: Accept multiple token types (stables, vBGT, BERA, bribe tokens)
- FR-4.2: Accumulate tokens until flush() is called
- FR-4.3: On flush(), transfer tokens to Voter for distribution
- FR-4.4: Anyone can call flush() (permissionless)
- FR-4.5: Support batch operations for gas efficiency

**Acceptance Criteria**:
- [ ] Router accumulates USDC, HONEY, vBGT, BERA from Vase
- [ ] flush() sends accumulated tokens to Voter
- [ ] Multiple token types distributed in same transaction

### FR-5: Strategy Contracts

**Description**: Four initial strategies that receive revenue based on vote weight.

**Requirements**:

#### FR-5.1: Liquid Backing Boost Strategy
- Receives proportional share of revenue
- Swaps tokens to WETH (or LBT-accepted token)
- Deposits to Liquid Backing Treasury
- Increases floor price for all seats

#### FR-5.2: Direct Distribution Strategy
- Receives proportional share of revenue
- Distributes tokens directly to voters via bribe mechanism
- Voters claim proportional to their vote weight on this strategy
- Immediate cashflow to participants

#### FR-5.3: PoL Reinvestment Strategy
- Receives proportional share of revenue
- Uses tokens to bribe other PoL gauges
- Meta-game play for additional BGT emissions
- Managed by designated operator (initially Beekeepers)

#### FR-5.4: Growth Treasury Allocation Strategy
- Receives proportional share of revenue
- Sends tokens to Growth Treasury multisig
- Funds ecosystem investments and initiatives
- Long-term value accrual over immediate yield

**Acceptance Criteria**:
- [ ] Each strategy receives revenue proportional to its vote weight
- [ ] LBT strategy successfully adds backing to treasury
- [ ] Direct Distribution allows voters to claim rewards
- [ ] PoL strategy executes bribes on external gauges
- [ ] Growth Treasury receives allocated funds

### FR-6: Bribe/Reward Distribution

**Description**: Voters earn rewards proportional to their vote weight on each strategy.

**Requirements**:
- FR-6.1: Each strategy has associated Bribe contract
- FR-6.2: Voters accumulate rewards based on vote weight
- FR-6.3: Rewards claimable at any time
- FR-6.4: Support multiple reward token types per bribe
- FR-6.5: 7-day reward distribution period (aligned with epochs)

**Acceptance Criteria**:
- [ ] User voting 100% on Direct Distribution receives full share of that strategy's rewards
- [ ] User can claim accumulated rewards from multiple bribes in one transaction
- [ ] Rewards distribute over 7 days to prevent gaming

### FR-7: Strategy Management (Honey Track Integration)

**Description**: Honey Track governance controls which strategies exist in LSG.

**Requirements**:
- FR-7.1: Adding new strategies requires Honey Track proposal approval
- FR-7.2: Killing strategies requires Honey Track proposal approval
- FR-7.3: LSG contract owner = Honey Track Governor contract
- FR-7.4: Strategy parameters (payment receiver, etc.) set at creation
- FR-7.5: Killed strategies send pending revenue to treasury

**Acceptance Criteria**:
- [ ] New strategy cannot be added without governance approval
- [ ] Strategy cannot be killed without governance approval
- [ ] Owner is Governor contract, not EOA

---

## Non-Functional Requirements

### NFR-1: Security
- Smart contracts must pass professional security audit
- No admin keys that can drain funds
- Flash loan protection via non-transferable voting power
- Epoch delays prevent vote manipulation
- Revenue source whitelisting prevents unauthorized deposits

### NFR-2: Gas Efficiency
- Batch operations for revenue distribution
- Efficient vote weight calculations
- Minimize storage operations
- Target: <$1 in gas per weekly vote cycle on Berachain

### NFR-3: Upgradeability
- Core Voter contract should be immutable (trustless)
- Strategies can be added/killed via governance
- Revenue Router can be replaced via governance
- No proxy patterns for core contracts (simplicity over upgradeability)

### NFR-4: Transparency
- All votes visible on-chain
- Revenue distribution verifiable
- Strategy allocations publicly queryable
- Events emitted for all state changes

### NFR-5: Integration Compatibility
- Compatible with existing apDAO seat NFT contract
- Compatible with Station X governance tokens
- Compatible with Vase subvalidator revenue wallet
- Compatible with existing LBT and Auction House

---

## Technical Architecture

### Contract Overview

```
Vase Subvalidator
       │
       ▼ (auto-push or manual claim)
┌──────────────────────┐
│   Revenue Router     │ ← Accumulates mixed tokens
│   (Multi-Token)      │
└──────────┬───────────┘
           │ flush()
           ▼
┌──────────────────────┐
│       Voter          │ ← Core governance, reads Station X balance
│   (NFT-Adapted)      │
└──────────┬───────────┘
           │ distribute()
           ▼
    ┌──────┴──────┬──────────────┬──────────────┐
    ▼             ▼              ▼              ▼
┌────────┐  ┌────────┐    ┌────────┐    ┌────────┐
│  LBT   │  │ Direct │    │  PoL   │    │ Growth │
│ Boost  │  │ Distro │    │Reinvest│    │Treasury│
└───┬────┘  └───┬────┘    └───┬────┘    └───┬────┘
    │           │             │             │
    ▼           ▼             ▼             ▼
   LBT       Bribe         PoL Mgr      Growth
 Contract   Contract       Contract    Treasury
```

### Key Modifications from Original LSG

| Component | Original LSG | apDAO Fork |
|-----------|-------------|------------|
| Voting Power | GovernanceToken.balanceOf() | IERC721(seatNFT).balanceOf() |
| Staking | Stake ERC20 → get gToken | No staking; NFT ownership = votes |
| Unstaking Check | Must clear votes to unstake | N/A (NFT transfers to Auction/LBT auto-remove votes) |
| Revenue Token | Single (WETH) | Multiple (stables, vBGT, BERA, bribes) |
| Delegation | None | LSG-specific delegation mechanism |
| Strategy Logic | Dutch auction | Direct routing (no auction) |

**Note**: Station X governance tokens were never activated on Berachain (`stationXTokens.length == 0`). Direct NFT balance provides equivalent functionality since transfer restrictions already handle auction queue and LBT scenarios.

### Contract Addresses (Placeholders)

| Contract | Address | Notes |
|----------|---------|-------|
| apDAO Seat NFT | `0xfc2d7ebfeb2714fce13caf234a95db129ecc43da` | Existing |
| Station X Token | `TBD` | Existing, need to identify |
| Liquid Backing Treasury | `TBD` | Existing |
| Auction House | `TBD` | Existing |
| Growth Treasury | `TBD` | Existing multisig |
| Vase Revenue Wallet | `TBD` | To be created by Vase |
| LSG Voter | `TBD` | New deployment |
| LSG Revenue Router | `TBD` | New deployment |
| LSG Strategies (4x) | `TBD` | New deployments |

---

## Scope & Prioritization

### MVP (v1.0) - Must Have

| Feature | Priority | Notes |
|---------|----------|-------|
| NFT-based voting power | P0 | Core functionality |
| Weekly epoch voting | P0 | Core functionality |
| Revenue Router (multi-token) | P0 | Required for Vase integration |
| 4 initial strategies | P0 | LBT, Direct, PoL, Growth |
| Bribe rewards for voters | P0 | Key incentive mechanism |
| Honey Track strategy management | P0 | Governance integration |

### v1.1 - Should Have

| Feature | Priority | Notes |
|---------|----------|-------|
| Basic delegation | P1 | Partner requirement |
| Batch claim for bribes | P1 | UX improvement |
| Strategy-specific token handling | P1 | Each strategy swaps as needed |

### v2.0 - Nice to Have

| Feature | Priority | Notes |
|---------|----------|-------|
| Delegate strategy restrictions | P2 | Prevent delegates from Direct Distro |
| Auto-compound option | P2 | Reinvest rewards automatically |
| Multiple subvalidator support | P2 | If apDAO runs 2+ subvalidators |
| Cross-epoch vote persistence | P2 | Optional vote rollover |

### Out of Scope

- Modifications to existing 4-track governance
- Changes to seat NFT contract
- New NFT types or tiers
- Cross-chain functionality
- Mobile app or custom frontend (use existing tools)

---

## Risks & Mitigations

### Technical Risks

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| Smart contract vulnerability | Medium | Critical | Professional audit required |
| Station X token integration issues | Low | High | Test on testnet first |
| Gas costs too high | Low | Medium | Batch operations, Berachain is cheap |
| Vase integration delays | Medium | High | Design for placeholder revenue source |

### Business Risks

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| Low participation rate | Medium | High | Strong incentive design, education |
| Revenue lower than expected | Medium | Medium | Set realistic expectations |
| Strategy gaming | Low | Medium | Epoch delays, vote restrictions |
| Governance capture | Low | High | Honey Track controls strategies |

### Operational Risks

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| Beekeeper key compromise | Low | Critical | Multisig, timelock |
| Revenue router misconfiguration | Low | High | Extensive testing, monitoring |
| Strategy contract bugs | Medium | High | Per-strategy audits, kill switch |

---

## Dependencies

### External Dependencies

| Dependency | Owner | Status | Risk |
|------------|-------|--------|------|
| Vase Subvalidator | Vase Finance | In development | Q1 2026 launch |
| Berachain Mainnet | Berachain | Live | Stable |
| Station X Governance | apDAO/THJ | Deployed | Need address |
| Honey Track Governor | apDAO | Deployed | Integration needed |

### Internal Dependencies

| Dependency | Notes |
|------------|-------|
| apDAO Seat NFT Contract | Already deployed, no changes needed |
| LBT Contract | Already deployed, LSG strategy deposits to it |
| Auction House | Already deployed, NFT transfers trigger vote removal |
| Growth Treasury Multisig | Already exists, receives Growth strategy funds |

---

## Timeline Considerations

### Development Phases

**Phase 1: Core Contracts**
- Fork and modify Voter.sol for NFT voting
- Implement multi-token Revenue Router
- Create 4 strategy contracts
- Unit tests and integration tests

**Phase 2: Integration**
- Integrate with Station X token
- Test vote removal on auction/LBT transfers
- Integrate with Honey Track Governor
- Testnet deployment

**Phase 3: Audit & Launch**
- Security audit (scope TBD based on audit provider)
- Audit remediation
- Mainnet deployment
- Documentation and education

### Alignment with Vase Launch
- Vase expected Q1 2026
- LSG should be ready before Vase launch
- Can deploy LSG with mock revenue source for testing
- Switch to real Vase revenue wallet at launch

---

## Resolved Questions

1. **Station X Token Address**: **N/A - Station X tokens were never activated on Berachain**. Investigation revealed that `stationXTokens.length == 0` on the deployed seat NFT contract. The governance token infrastructure exists in code but was never populated with actual ERC20DAO token addresses.

   **Impact on LSG**: Instead of reading Station X token balance, LSG will use **direct NFT balance** (`IERC721(seatNFT).balanceOf(account)`). This works because:
   - Seat enters auction queue → transferred to Auction House → owner's balance decreases
   - Seat defaults on loan → transferred to LBT → owner's balance decreases
   - No additional hooks needed - existing transfer mechanics handle vote removal automatically

2. **Delegation Implementation**: **LSG-specific delegation**. Create new delegation mechanism within LSG contracts, separate from existing NFT-level delegation.

3. **PoL Strategy Operator**: **Beekeepers via Growth Treasury**. PoL Reinvestment strategy routes funds to Growth Treasury wallet. Beekeepers use these funds to bribe partner gauges and execute PoL meta-game strategies.

4. **Audit Scope**: **Full audit required**. Even though forking audited LSG code, a complete audit is necessary due to:
   - Significant modifications for NFT-based voting
   - Multi-token revenue handling
   - New delegation system
   - Integration with apDAO's existing contracts

5. **Emergency Procedures**: **Full winddown with kill switches**. If a strategy is compromised:
   - Kill switch immediately stops revenue flow to affected strategy
   - Pending funds route to treasury
   - User funds must be protected at all costs to maintain trust
   - No partial measures - full protection or nothing

6. **Revenue Flow**: **Auto-pushed to RevenueRouter**. Vase subvalidator automatically pushes revenue to a designated wallet, which will be the LSG RevenueRouter contract address.

## Open Questions

All critical questions have been resolved. No blockers for proceeding to architecture phase.

---

## Appendix

### A. Original LSG Reference
- Repository: https://github.com/Heesho/liquid-signal-governance
- Deployed for: $DONUT on Base
- License: Open source (Heesho granted permission to fork)

### B. apDAO Contracts Reference
- Seat NFT: `0xfc2d7ebfeb2714fce13caf234a95db129ecc43da`
- Documentation: https://docs.apiologydao.xyz/

### C. Glossary

| Term | Definition |
|------|------------|
| **LSG** | Liquid Signal Governance - the voting system for revenue allocation |
| **Epoch** | 7-day voting period (Monday-Sunday) |
| **Strategy** | Contract that receives revenue and executes specific action |
| **Bribe** | Reward contract that distributes tokens to voters |
| **LBT** | Liquid Backing Treasury - provides floor price for seats |
| **Station X Token** | ERC20 governance token minted/burned with seat ownership |
| **Honey Track** | apDAO's governance track for strategic decisions |
| **Vase** | Berachain subvalidator platform |
| **BGT** | Berachain Governance Token (validator emissions) |
| **PoL** | Proof of Liquidity - Berachain's consensus mechanism |

---

*Document Version: 1.2*
*Last Updated: December 2024*
*Author: PRD Architect Agent*
*Status: Ready for Architecture Phase - All Questions Resolved*
