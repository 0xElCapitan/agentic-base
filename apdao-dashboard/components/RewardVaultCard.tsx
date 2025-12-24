'use client';

import { Copy, ExternalLink, Coins, TrendingUp, TrendingDown } from 'lucide-react';
import { useState } from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { RewardVault } from '@/data/mockData';
import { formatNumber, formatUSD, truncateAddress, formatDate } from '@/lib/utils';

interface RewardVaultCardProps {
  rewardVault: RewardVault;
}

export default function RewardVaultCard({ rewardVault }: RewardVaultCardProps) {
  const [copied, setCopied] = useState(false);

  const copyAddress = async () => {
    await navigator.clipboard.writeText(rewardVault.address);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const chartData = rewardVault.weeklyDetails.slice().reverse().map((item) => ({
    date: formatDate(item.date),
    bgt: item.BGT_received,
    xfatbera: item.xFATBERA_used,
  }));

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-card border border-border rounded-lg p-2 shadow-lg">
          <p className="text-text-secondary text-xs mb-1">{label}</p>
          {payload.map((entry: any, index: number) => (
            <p key={index} className="text-sm" style={{ color: entry.color }}>
              {entry.name}: {entry.value.toFixed(1)}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="bg-card border border-border rounded-xl p-6">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-volatile/10">
            <Coins className="w-5 h-5 text-volatile" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-text-primary">{rewardVault.name}</h3>
            <div className="flex items-center gap-2 mt-0.5">
              <span className="text-text-secondary text-sm">
                {truncateAddress(rewardVault.address)}
              </span>
              <button
                onClick={copyAddress}
                className="text-text-secondary hover:text-text-primary transition-colors"
              >
                {copied ? (
                  <span className="text-success text-xs">Copied!</span>
                ) : (
                  <Copy className="w-3.5 h-3.5" />
                )}
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-6">
        <div>
          <p className="text-text-secondary text-sm">Total BGT Received</p>
          <p className="text-2xl font-bold text-text-primary">
            {formatNumber(rewardVault.totalBGTReceived)}
          </p>
          <p className="text-sm text-text-secondary">
            {formatUSD(rewardVault.totalBGTValue)}
          </p>
        </div>
        <div>
          <p className="text-text-secondary text-sm">Total Incentives</p>
          <p className="text-2xl font-bold text-volatile">
            {formatNumber(rewardVault.totalXFATBERAReceived)}
          </p>
          <p className="text-sm text-text-secondary">
            {formatUSD(rewardVault.totalIncentivesValue)}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="bg-background rounded-lg p-3">
          <p className="text-text-secondary text-xs">Current Balance</p>
          <p className="text-lg font-semibold text-text-primary">
            {formatUSD(rewardVault.balance)}
          </p>
        </div>
        <div className="bg-background rounded-lg p-3">
          <p className="text-text-secondary text-xs">Unclaimed Rewards</p>
          <p className="text-lg font-semibold text-warning">
            {formatUSD(rewardVault.unclaimedRewards)}
          </p>
        </div>
      </div>

      <div>
        <p className="text-text-secondary text-sm mb-3">Weekly Incentives & BGT</p>
        <div className="h-24">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData}>
              <XAxis
                dataKey="date"
                stroke="#a0a0a0"
                fontSize={10}
                tickLine={false}
                axisLine={false}
              />
              <YAxis hide />
              <Tooltip content={<CustomTooltip />} />
              <Line
                type="monotone"
                dataKey="bgt"
                name="BGT"
                stroke="#a855f7"
                strokeWidth={2}
                dot={false}
                activeDot={{ r: 4, fill: '#a855f7' }}
              />
              <Line
                type="monotone"
                dataKey="xfatbera"
                name="xFATBERA"
                stroke="#3b82f6"
                strokeWidth={2}
                dot={false}
                activeDot={{ r: 4, fill: '#3b82f6' }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      <a
        href="/reward-vault"
        className="flex items-center justify-center gap-2 mt-4 py-2 text-sm text-accent hover:text-accent/80 transition-colors"
      >
        View Reward Details
        <ExternalLink className="w-4 h-4" />
      </a>
    </div>
  );
}
