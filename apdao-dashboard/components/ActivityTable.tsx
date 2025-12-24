'use client';

import { ExternalLink, TrendingUp, TrendingDown } from 'lucide-react';
import { WeeklyDetail } from '@/data/mockData';
import { formatDate, cn } from '@/lib/utils';

interface ActivityTableProps {
  weeklyDetails: WeeklyDetail[];
}

export default function ActivityTable({ weeklyDetails }: ActivityTableProps) {
  return (
    <div className="bg-card border border-border rounded-xl p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-lg font-semibold text-text-primary">
          Recent Reward Vault Activity
        </h2>
        <a
          href="https://dune.com/apdao/treasury"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-1 text-sm text-accent hover:text-accent/80 transition-colors"
        >
          View full history on Dune
          <ExternalLink className="w-4 h-4" />
        </a>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border">
              <th className="text-left py-3 px-4 text-text-secondary font-medium">
                Date
              </th>
              <th className="text-right py-3 px-4 text-text-secondary font-medium">
                xFATBERA Used
              </th>
              <th className="text-right py-3 px-4 text-text-secondary font-medium">
                BGT Received
              </th>
              <th className="text-right py-3 px-4 text-text-secondary font-medium">
                xFATBERA Value
              </th>
              <th className="text-right py-3 px-4 text-text-secondary font-medium">
                BGT Value Change
              </th>
              <th className="text-right py-3 px-4 text-text-secondary font-medium">
                Profit
              </th>
            </tr>
          </thead>
          <tbody>
            {weeklyDetails.map((detail, index) => (
              <tr
                key={detail.date}
                className={cn(
                  'border-b border-border/50 hover:bg-background/50 transition-colors',
                  index % 2 === 0 ? 'bg-background/20' : ''
                )}
              >
                <td className="py-3 px-4 text-text-primary font-medium">
                  {formatDate(detail.date)}
                </td>
                <td className="py-3 px-4 text-right text-text-secondary">
                  {detail.xFATBERA_used > 0 ? detail.xFATBERA_used.toFixed(1) : '-'}
                </td>
                <td className="py-3 px-4 text-right text-text-primary">
                  {detail.BGT_received > 0 ? detail.BGT_received.toFixed(1) : '-'}
                </td>
                <td className="py-3 px-4 text-right text-text-secondary">
                  ${detail.xFATBERA_value.toFixed(1)}
                </td>
                <td className="py-3 px-4 text-right">
                  {detail.BGT_value !== 0 ? (
                    <span
                      className={cn(
                        'flex items-center justify-end gap-1',
                        detail.BGT_value >= 0 ? 'text-success' : 'text-error'
                      )}
                    >
                      {detail.BGT_value >= 0 ? (
                        <TrendingUp className="w-3 h-3" />
                      ) : (
                        <TrendingDown className="w-3 h-3" />
                      )}
                      {detail.BGT_value >= 0 ? '+' : ''}
                      {detail.BGT_value.toFixed(1)}%
                    </span>
                  ) : (
                    <span className="text-text-secondary">-</span>
                  )}
                </td>
                <td className="py-3 px-4 text-right">
                  {detail.profit > 0 ? (
                    <span className="text-success font-medium flex items-center justify-end gap-1">
                      <TrendingUp className="w-3 h-3" />+{detail.profit.toFixed(1)}%
                    </span>
                  ) : (
                    <span className="text-text-secondary">-</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
