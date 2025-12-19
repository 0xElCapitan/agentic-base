# apDAO Liquid Signal Governance (LSG)

Smart contracts for apDAO's NFT-gated governance and revenue allocation system on Berachain.

## Overview

LSG enables Seat NFT holders to vote on how protocol revenue is distributed across multiple strategies:

- **Direct Distribution** - Revenue distributed as voting rewards
- **Growth Treasury** - Revenue funds protocol growth initiatives
- **LBT Boost** - Revenue swapped and deposited as LBT backing

## Quick Start

### Prerequisites

- [Foundry](https://book.getfoundry.sh/getting-started/installation)
- Git

### Installation

```bash
# Clone repository
git clone https://github.com/0xElCapitan/agentic-base.git
cd agentic-base/contracts

# Install dependencies
forge install

# Build contracts
forge build

# Run tests
forge test -vvv

# Generate coverage report
forge coverage
```

### Running Tests

```bash
# All tests
forge test

# Verbose output
forge test -vvv

# Specific test file
forge test --match-path test/LSGVoter.t.sol

# Specific test function
forge test --match-test test_Vote_Success -vvv

# With gas reporting
forge test --gas-report
```

## Contract Architecture

```
┌─────────────────┐
│ MultiTokenRouter│ ← Revenue from Vase subvalidator
└────────┬────────┘
         │ flush()
         ▼
┌─────────────────┐
│    LSGVoter     │ ← Core governance (voting, delegation, epochs)
└────────┬────────┘
         │ distribute()
    ┌────┼────┐
    ▼    ▼    ▼
┌───────┐┌───────┐┌───────┐
│Direct ││Growth ││ LBT   │
│ Dist  ││ Treas ││ Boost │ ← Strategy contracts
└───┬───┘└───┬───┘└───┬───┘
    │        │        │
    ▼        ▼        ▼
┌───────┐┌───────┐┌───────┐
│ Bribe ││Treasury││  LBT  │
└───────┘│Multisig│└───────┘
         └───────┘
```

### Core Contracts

| Contract | Description | Lines |
|----------|-------------|-------|
| `LSGVoter` | Voting, delegation, revenue distribution | 584 |
| `Bribe` | Synthetix-style reward distribution | 285 |
| `MultiTokenRouter` | Revenue aggregation and forwarding | 171 |

### Strategy Contracts

| Contract | Description | Lines |
|----------|-------------|-------|
| `DirectDistributionStrategy` | Forwards tokens to Bribe | 138 |
| `GrowthTreasuryStrategy` | Forwards tokens to treasury | 144 |
| `LBTBoostStrategy` | Swaps via Kodiak, deposits to LBT | 336 |

## Development

### Code Style

```bash
# Format code
forge fmt

# Check formatting
forge fmt --check
```

### Gas Optimization

```bash
# Run gas snapshot
forge snapshot

# Compare with previous snapshot
forge snapshot --diff
```

## Deployment

### Testnet (Berachain Bartio)

```bash
# Copy and configure environment
cp script/config/testnet.env.example .env.testnet
# Edit .env.testnet with your values

# Source environment
source .env.testnet

# Dry run
forge script script/Deploy.s.sol --rpc-url $RPC_URL -vvvv

# Deploy
forge script script/Deploy.s.sol --rpc-url $RPC_URL --broadcast -vvvv
```

### Contract Verification

```bash
forge verify-contract \
  --chain-id 80084 \
  --compiler-version v0.8.19 \
  <CONTRACT_ADDRESS> \
  src/LSGVoter.sol:LSGVoter \
  --constructor-args $(cast abi-encode "constructor(address,address,address)" $SEAT_NFT $TREASURY $EMERGENCY_MULTISIG)
```

See `docs/deployment/DEPLOYMENT-RUNBOOK.md` for complete deployment instructions.

## Security

### Audit Status

**Pending Audit** - Pashov Audit Group

### Security Documentation

- `docs/deployment/SECURITY-SELF-REVIEW.md` - Internal security review
- `docs/deployment/KNOWN-ISSUES.md` - Known limitations and design decisions
- `docs/deployment/AUDIT-SCOPE.md` - Audit scope document

### Security Features

- ReentrancyGuard on all external mutating functions
- SafeERC20 for all token operations
- Access control via Ownable and custom modifiers
- Emergency pause capability
- Bounded loops (MAX_STRATEGIES=20, MAX_REWARD_TOKENS=10)

## Testing Summary

| Category | Tests |
|----------|-------|
| LSGVoter | 55 |
| Bribe | 44 |
| MultiTokenRouter | 29 |
| DirectDistributionStrategy | 23 |
| GrowthTreasuryStrategy | 26 |
| LBTBoostStrategy | 45 |
| Integration | 20 |
| **Total** | **242** |

## File Structure

```
contracts/
├── src/
│   ├── LSGVoter.sol
│   ├── Bribe.sol
│   ├── MultiTokenRouter.sol
│   ├── interfaces/
│   │   ├── IStrategy.sol
│   │   ├── IBribe.sol
│   │   └── IKodiakRouter.sol
│   └── strategies/
│       ├── DirectDistributionStrategy.sol
│       ├── GrowthTreasuryStrategy.sol
│       └── LBTBoostStrategy.sol
├── test/
│   ├── LSGVoter.t.sol
│   ├── Bribe.t.sol
│   └── ...
├── script/
│   ├── Deploy.s.sol
│   └── ConfigureTokens.s.sol
└── foundry.toml
```

## Dependencies

- [OpenZeppelin Contracts v4.x](https://github.com/OpenZeppelin/openzeppelin-contracts)
- [Foundry](https://github.com/foundry-rs/foundry)

## External Integrations

- **Kodiak DEX** - Token swaps for LBTBoostStrategy
- **LBT (Liquid Backing Token)** - Backing deposits
- **Seat NFT** - Voting power source (ERC721)

## License

MIT

## Contact

- Project: apDAO
- Lead: El Capitan
- Discord: apDAO Server
