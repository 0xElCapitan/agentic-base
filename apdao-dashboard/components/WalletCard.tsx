'use client';

import { useState } from 'react';
import { Copy, ExternalLink, ChevronDown, ChevronUp } from 'lucide-react';
import { Treasury } from '@/data/mockData';
import { formatUSD, formatNumber, truncateAddress, cn } from '@/lib/utils';

interface WalletCardProps {
  treasury: Treasury;
}

type SortKey = 'symbol' | 'amount' | 'usdValue' | 'percentage';
type SortOrder = 'asc' | 'desc';

export default function WalletCard({ treasury }: WalletCardProps) {
  const [copied, setCopied] = useState(false);
  const [sortKey, setSortKey] = useState<SortKey>('usdValue');
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc');

  const copyAddress = async () => {
    await navigator.clipboard.writeText(treasury.address);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortKey(key);
      setSortOrder('desc');
    }
  };

  const sortedAssets = [...treasury.assets].sort((a, b) => {
    const multiplier = sortOrder === 'asc' ? 1 : -1;
    if (sortKey === 'symbol') {
      return multiplier * a.symbol.localeCompare(b.symbol);
    }
    return multiplier * (a[sortKey] - b[sortKey]);
  });

  const SortIcon = ({ column }: { column: SortKey }) => {
    if (sortKey !== column) return null;
    return sortOrder === 'asc' ? (
      <ChevronUp className="w-3 h-3" />
    ) : (
      <ChevronDown className="w-3 h-3" />
    );
  };

  return (
    <div className="bg-card border border-border rounded-xl p-6 h-full flex flex-col">
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-text-primary">{treasury.name}</h3>
          <div className="flex items-center gap-2 mt-1">
            <span className="text-text-secondary text-sm">
              {truncateAddress(treasury.address)}
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
        <a
          href={`https://debank.com/profile/${treasury.address}`}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-1 text-sm text-accent hover:text-accent/80 transition-colors"
        >
          DeBank
          <ExternalLink className="w-3.5 h-3.5" />
        </a>
      </div>

      <p className="text-3xl font-bold text-text-primary mb-6">
        {formatUSD(treasury.usdValue)}
      </p>

      {/* Asset Composition Bar */}
      <div className="mb-6">
        <div className="flex h-3 rounded-full overflow-hidden bg-background">
          {treasury.assets.map((asset, index) => {
            const colors = ['bg-stables', 'bg-volatile', 'bg-validator', 'bg-lps', 'bg-accent'];
            return (
              <div
                key={asset.symbol}
                className={cn(colors[index % colors.length], 'transition-all')}
                style={{ width: `${asset.percentage}%` }}
                title={`${asset.symbol}: ${asset.percentage}%`}
              />
            );
          })}
        </div>
        <div className="flex flex-wrap gap-3 mt-3">
          {treasury.assets.map((asset, index) => {
            const colors = ['bg-stables', 'bg-volatile', 'bg-validator', 'bg-lps', 'bg-accent'];
            return (
              <div key={asset.symbol} className="flex items-center gap-1.5 text-xs">
                <div className={cn('w-2 h-2 rounded-full', colors[index % colors.length])} />
                <span className="text-text-secondary">
                  {asset.symbol}: {asset.percentage}%
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Asset Table */}
      <div className="flex-1 overflow-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border">
              <th
                className="text-left py-2 text-text-secondary font-medium cursor-pointer hover:text-text-primary"
                onClick={() => handleSort('symbol')}
              >
                <span className="flex items-center gap-1">
                  Symbol
                  <SortIcon column="symbol" />
                </span>
              </th>
              <th
                className="text-right py-2 text-text-secondary font-medium cursor-pointer hover:text-text-primary"
                onClick={() => handleSort('amount')}
              >
                <span className="flex items-center justify-end gap-1">
                  Amount
                  <SortIcon column="amount" />
                </span>
              </th>
              <th
                className="text-right py-2 text-text-secondary font-medium cursor-pointer hover:text-text-primary"
                onClick={() => handleSort('usdValue')}
              >
                <span className="flex items-center justify-end gap-1">
                  USD Value
                  <SortIcon column="usdValue" />
                </span>
              </th>
              <th
                className="text-right py-2 text-text-secondary font-medium cursor-pointer hover:text-text-primary"
                onClick={() => handleSort('percentage')}
              >
                <span className="flex items-center justify-end gap-1">
                  %
                  <SortIcon column="percentage" />
                </span>
              </th>
            </tr>
          </thead>
          <tbody>
            {sortedAssets.map((asset) => (
              <tr key={asset.symbol} className="border-b border-border/50 hover:bg-background/50">
                <td className="py-2 text-text-primary font-medium">{asset.symbol}</td>
                <td className="py-2 text-right text-text-secondary">
                  {formatNumber(asset.amount)}
                </td>
                <td className="py-2 text-right text-text-primary">
                  {formatUSD(asset.usdValue)}
                </td>
                <td className="py-2 text-right text-text-secondary">{asset.percentage}%</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
