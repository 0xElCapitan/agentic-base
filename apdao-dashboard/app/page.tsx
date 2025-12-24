'use client';

import Header from '@/components/Header';
import MetricCard from '@/components/MetricCard';
import TreasuryChart from '@/components/TreasuryChart';
import WalletCard from '@/components/WalletCard';
import ValidatorCard from '@/components/ValidatorCard';
import RewardVaultCard from '@/components/RewardVaultCard';
import ActivityTable from '@/components/ActivityTable';
import { mockData } from '@/data/mockData';
import { formatUSD, formatNumber } from '@/lib/utils';

export default function Dashboard() {
  return (
    <div className="min-h-screen bg-background">
      <Header lastUpdated={mockData.summary.lastUpdated} />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Section 1: Key Metrics Cards */}
        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <MetricCard
            title="Total Treasury"
            value={formatUSD(mockData.summary.totalTreasuryUSD)}
            subtitle="this month"
            trend={2.3}
            icon="treasury"
          />
          <MetricCard
            title="Validator Stake"
            value={`${formatNumber(mockData.validator.stakedAmount)} BERA`}
            subtitle={`${mockData.validator.currentAPY}% APY`}
            icon="validator"
          />
          <MetricCard
            title="Reward Vault"
            value={formatUSD(mockData.rewardVault.balance)}
            subtitle={`${formatNumber(mockData.rewardVault.totalBGTReceived)} BGT received`}
            icon="vault"
          />
          <MetricCard
            title="Treasury Health"
            value="8.2/10"
            subtitle=""
            healthScore={8.2}
            icon="health"
          />
        </section>

        {/* Section 2: Treasury Composition Chart */}
        <section className="mb-8">
          <TreasuryChart data={mockData.treasuryHistory} />
        </section>

        {/* Section 3: Multi-Wallet Breakdown */}
        <section className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {/* Column 1: Liquid Backing Treasury */}
          <WalletCard treasury={mockData.treasuries.liquidBacking} />

          {/* Column 2: Growth Treasury Wallet */}
          <WalletCard treasury={mockData.treasuries.growth} />

          {/* Column 3: Validator + Reward Vault */}
          <div className="flex flex-col gap-6">
            <ValidatorCard validator={mockData.validator} />
            <RewardVaultCard rewardVault={mockData.rewardVault} />
          </div>
        </section>

        {/* Section 4: Recent Activity */}
        <section>
          <ActivityTable weeklyDetails={mockData.rewardVault.weeklyDetails} />
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-border py-6 mt-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <p className="text-center text-text-secondary text-sm">
            apDAO Treasury Dashboard - Phase 1 Mockup
          </p>
        </div>
      </footer>
    </div>
  );
}
