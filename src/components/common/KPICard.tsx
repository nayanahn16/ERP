import React from 'react';
import { LucideIcon, ArrowUpRight, ArrowDownRight } from 'lucide-react';
import { cn } from '../../lib/utils';

interface KPICardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: LucideIcon;
  badge?: string;
  badgeType?: 'success' | 'warning' | 'danger' | 'info';
  trend?: {
    value: string;
    isPositive?: boolean;
    label?: string;
  };
  onClick?: () => void;
  accentColor?: 'blue' | 'amber' | 'emerald' | 'rose' | 'purple';
}

export const KPICard: React.FC<KPICardProps> = ({
  title,
  value,
  subtitle,
  icon: Icon,
  badge,
  badgeType = 'info',
  trend,
  onClick,
  accentColor = 'blue'
}) => {
  const colorMap = {
    blue: 'border-blue-500/30 text-blue-400 bg-blue-500/10 group-hover:border-blue-500/50',
    amber: 'border-amber-500/30 text-amber-400 bg-amber-500/10 group-hover:border-amber-500/50',
    emerald: 'border-emerald-500/30 text-emerald-400 bg-emerald-500/10 group-hover:border-emerald-500/50',
    rose: 'border-rose-500/30 text-rose-400 bg-rose-500/10 group-hover:border-rose-500/50',
    purple: 'border-purple-500/30 text-purple-400 bg-purple-500/10 group-hover:border-purple-500/50'
  };

  const badgeColorMap = {
    success: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30',
    warning: 'bg-amber-500/10 text-amber-400 border-amber-500/30',
    danger: 'bg-rose-500/10 text-rose-400 border-rose-500/30',
    info: 'bg-blue-500/10 text-blue-400 border-blue-500/30'
  };

  return (
    <div
      onClick={onClick}
      className={cn(
        'group relative bg-slate-900/90 border border-slate-800 rounded-xl p-5 shadow-sm transition-all duration-200',
        onClick ? 'cursor-pointer hover:border-slate-700 hover:shadow-md hover:bg-slate-850' : ''
      )}
    >
      <div className="flex items-start justify-between">
        <div className="space-y-1">
          <p className="text-xs font-medium text-slate-400 uppercase tracking-wider">{title}</p>
          <div className="text-2xl font-bold text-white tracking-tight">{value}</div>
        </div>
        <div className={cn('p-2.5 rounded-lg border transition-colors', colorMap[accentColor])}>
          <Icon className="w-5 h-5" />
        </div>
      </div>

      <div className="mt-3 flex items-center justify-between text-xs">
        {subtitle && <span className="text-slate-400">{subtitle}</span>}
        {badge && (
          <span className={cn('px-2 py-0.5 rounded-full border text-[11px] font-medium ml-auto', badgeColorMap[badgeType])}>
            {badge}
          </span>
        )}
        {trend && (
          <div className={cn('flex items-center gap-1 font-medium', trend.isPositive ? 'text-emerald-400' : 'text-rose-400')}>
            {trend.isPositive ? <ArrowUpRight className="w-3.5 h-3.5" /> : <ArrowDownRight className="w-3.5 h-3.5" />}
            <span>{trend.value}</span>
            {trend.label && <span className="text-slate-400 font-normal">{trend.label}</span>}
          </div>
        )}
      </div>
    </div>
  );
};
