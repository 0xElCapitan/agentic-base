# apDAO Treasury Dashboard

A Next.js dashboard for apDAO that aggregates treasury, validator, and reward vault data in one place.

## Phase 1: Static Mockup

This is Phase 1 of the dashboard - a static mockup with mock data. No API integration yet.

## Features

- **Dark Theme**: Inspired by Olympus DAO and Furthermore
- **Key Metrics**: 4 cards showing total treasury, validator stake, reward vault, and DAO health
- **Treasury Composition Chart**: Stacked area chart showing portfolio breakdown over time
- **Multi-Wallet Breakdown**: 3-column layout with asset tables
- **Validator & Reward Vault Cards**: Real-time status and mini charts
- **Recent Activity Table**: Latest reward vault activity

## Tech Stack

- **Framework**: Next.js 14+ (App Router)
- **Styling**: Tailwind CSS
- **Charts**: Recharts
- **Icons**: Lucide React
- **Language**: TypeScript

## Getting Started

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build

# Start production server
npm start
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the dashboard.

## Project Structure

```
apdao-dashboard/
├── app/
│   ├── layout.tsx          # Root layout
│   ├── page.tsx            # Main dashboard
│   ├── globals.css         # Global styles
│   ├── validator/
│   │   └── page.tsx        # Validator detail page (placeholder)
│   └── reward-vault/
│       └── page.tsx        # Reward vault detail page (placeholder)
├── components/
│   ├── Header.tsx          # Page header with logo and donation button
│   ├── MetricCard.tsx      # Key metric cards
│   ├── TreasuryChart.tsx   # Stacked area chart
│   ├── WalletCard.tsx      # Wallet breakdown with asset table
│   ├── ValidatorCard.tsx   # Validator status and rewards
│   ├── RewardVaultCard.tsx # Reward vault status
│   └── ActivityTable.tsx   # Recent activity table
├── data/
│   └── mockData.ts         # Mock data structure
└── lib/
    └── utils.ts            # Utility functions
```

## Color Scheme

```
Background: #0f0f0f
Card Background: #1a1a1a
Text Primary: #e0e0e0
Text Secondary: #a0a0a0
Borders: #2a2a2a

Chart Colors:
- Stables: #3b82f6 (blue)
- Volatile: #a855f7 (purple)
- Validator: #22c55e (green)
- LPs: #f59e0b (amber/orange)

Accent: #fbbf24 (yellow/gold)
```

## Phase 2 Roadmap

- [ ] API integration with DeBank
- [ ] API integration with Dune Analytics
- [ ] RPC connections for real-time data
- [ ] Validator detail page
- [ ] Reward vault detail page
- [ ] Historical data tracking
