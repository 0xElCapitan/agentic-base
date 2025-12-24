'use client';

import { Copy, ExternalLink, Shield, TrendingUp } from 'lucide-react';
import { useState } from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { Validator } from '@/data/mockData';
import { formatNumber, truncateAddress, cn } from '@/lib/utils';

interface ValidatorCardProps {
  validator: Validator;
}

export default function ValidatorCard({ validator }: ValidatorCardProps) {
  const [copied, setCopied] = useState(false);

  const copyAddress = async () => {
    await navigator.clipboard.writeText(validator.address);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const chartData = validator.rewardHistory.slice().reverse().map((item) => ({
    epoch: item.epoch,
    amount: item.amount,
    date: item.date,
  }));

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-card border border-border rounded-lg p-2 shadow-lg">
          <p className="text-text-secondary text-xs">Epoch {payload[0].payload.epoch}</p>
          <p className="text-text-primary font-medium">
            {formatNumber(payload[0].value)} BERA
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="bg-card border border-border rounded-xl p-6">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-validator/10">
            <Shield className="w-5 h-5 text-validator" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-text-primary">{validator.name}</h3>
            <div className="flex items-center gap-2 mt-0.5">
              <span className="text-text-secondary text-sm">
                {truncateAddress(validator.address)}
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
        <span
          className={cn(
            'px-2 py-1 rounded-full text-xs font-medium',
            validator.validatorStatus === 'active'
              ? 'bg-success/10 text-success'
              : 'bg-warning/10 text-warning'
          )}
        >
          {validator.validatorStatus.charAt(0).toUpperCase() + validator.validatorStatus.slice(1)}
        </span>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-6">
        <div>
          <p className="text-text-secondary text-sm">Staked Amount</p>
          <p className="text-2xl font-bold text-text-primary">
            {formatNumber(validator.stakedAmount)}
            <span className="text-base text-text-secondary ml-1">BERA</span>
          </p>
        </div>
        <div>
          <p className="text-text-secondary text-sm">Current APY</p>
          <p className="text-2xl font-bold text-validator flex items-center gap-1">
            {validator.currentAPY}%
            <TrendingUp className="w-5 h-5" />
          </p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="bg-background rounded-lg p-3">
          <p className="text-text-secondary text-xs">Current Epoch Commission</p>
          <p className="text-lg font-semibold text-text-primary">
            {formatNumber(validator.currentEpochCommission)} BERA
          </p>
        </div>
        <div className="bg-background rounded-lg p-3">
          <p className="text-text-secondary text-xs">Total Rewards Earned</p>
          <p className="text-lg font-semibold text-success">
            {formatNumber(validator.totalRewardsEarned)} BERA
          </p>
        </div>
      </div>

      <div>
        <p className="text-text-secondary text-sm mb-3">Last 7 Days Rewards</p>
        <div className="h-24">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData}>
              <XAxis
                dataKey="epoch"
                stroke="#a0b0b5"
                fontSize={10}
                tickLine={false}
                axisLine={false}
              />
              <YAxis hide />
              <Tooltip content={<CustomTooltip />} />
              <Line
                type="monotone"
                dataKey="amount"
                stroke="#00C5E0"
                strokeWidth={2}
                dot={false}
                activeDot={{ r: 4, fill: '#00C5E0' }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      <a
        href={`/validator`}
        className="flex items-center justify-center gap-2 mt-4 py-2 text-sm text-accent hover:text-accent/80 transition-colors"
      >
        View Validator Details
        <ExternalLink className="w-4 h-4" />
      </a>
    </div>
  );
}
