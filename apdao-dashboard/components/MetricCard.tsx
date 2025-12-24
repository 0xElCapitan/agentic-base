'use client';

import { TrendingUp, TrendingDown, DollarSign, Shield, Coins, Activity } from 'lucide-react';
import { cn } from '@/lib/utils';

interface MetricCardProps {
  title: string;
  value: string;
  subtitle: string;
  trend?: number;
  icon: 'treasury' | 'validator' | 'vault' | 'health';
  healthScore?: number;
}

const iconMap = {
  treasury: DollarSign,
  validator: Shield,
  vault: Coins,
  health: Activity,
};

const iconColorMap = {
  treasury: 'text-stables',
  validator: 'text-validator',
  vault: 'text-volatile',
  health: 'text-accent',
};

export default function MetricCard({
  title,
  value,
  subtitle,
  trend,
  icon,
  healthScore,
}: MetricCardProps) {
  const Icon = iconMap[icon];
  const iconColor = iconColorMap[icon];

  const getHealthColor = (score: number) => {
    if (score >= 8) return 'text-success';
    if (score >= 6) return 'text-warning';
    return 'text-error';
  };

  const getHealthLabel = (score: number) => {
    if (score >= 8) return 'Good';
    if (score >= 6) return 'Moderate';
    return 'At Risk';
  };

  return (
    <div className="bg-card border border-border rounded-xl p-6 hover:border-border/80 transition-colors">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-text-secondary text-sm mb-1">{title}</p>
          <p className="text-2xl font-bold text-text-primary">{value}</p>
          <div className="flex items-center gap-2 mt-2">
            {trend !== undefined && (
              <span
                className={cn(
                  'flex items-center gap-1 text-sm',
                  trend >= 0 ? 'text-success' : 'text-error'
                )}
              >
                {trend >= 0 ? (
                  <TrendingUp className="w-3 h-3" />
                ) : (
                  <TrendingDown className="w-3 h-3" />
                )}
                {Math.abs(trend).toFixed(1)}%
              </span>
            )}
            {healthScore !== undefined && (
              <span className={cn('text-sm font-medium', getHealthColor(healthScore))}>
                {getHealthLabel(healthScore)}
              </span>
            )}
            <span className="text-text-secondary text-sm">{subtitle}</span>
          </div>
        </div>
        <div className={cn('p-3 rounded-lg bg-background', iconColor)}>
          <Icon className="w-5 h-5" />
        </div>
      </div>
    </div>
  );
}
