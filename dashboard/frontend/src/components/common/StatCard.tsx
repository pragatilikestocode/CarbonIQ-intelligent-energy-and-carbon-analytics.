import React from 'react';
import { LucideIcon } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: string | number;
  unit?: string;
  icon: LucideIcon;
  change?: string;
  changeType?: 'positive' | 'negative' | 'neutral';
  description?: string;
  accentColor?: 'cyan' | 'neon' | 'violet' | 'amber';
  gaugePercent?: number;
}

export const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  unit,
  icon: Icon,
  change,
  changeType = 'neutral',
  description,
  accentColor = 'cyan',
  gaugePercent,
}) => {
  const getAccentStyles = () => {
    switch (accentColor) {
      case 'neon':
        return {
          iconBg: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
          borderHover: 'hover:border-emerald-500/40 hover:shadow-glow-neon',
          barColor: 'bg-emerald-400',
        };
      case 'violet':
        return {
          iconBg: 'bg-purple-500/10 text-purple-400 border-purple-500/20',
          borderHover: 'hover:border-purple-500/40 hover:shadow-glow-violet',
          barColor: 'bg-purple-400',
        };
      case 'amber':
        return {
          iconBg: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
          borderHover: 'hover:border-amber-500/40',
          barColor: 'bg-amber-400',
        };
      case 'cyan':
      default:
        return {
          iconBg: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20',
          borderHover: 'hover:border-cyan-500/40 hover:shadow-glow-cyan',
          barColor: 'bg-cyan-400',
        };
    }
  };

  const getChangeColor = () => {
    if (changeType === 'positive') return 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20';
    if (changeType === 'negative') return 'text-rose-400 bg-rose-500/10 border-rose-500/20';
    return 'text-slate-400 bg-slate-800/40 border-slate-700/30';
  };

  const styles = getAccentStyles();

  return (
    <div
      className={`glass-panel rounded-2xl p-5 transition-all duration-300 relative overflow-hidden group ${styles.borderHover}`}
    >
      {/* Background ambient gradient glow */}
      <div className="absolute top-0 right-0 -mt-4 -mr-4 w-28 h-28 bg-gradient-radial from-cyan-500/10 to-transparent blur-xl pointer-events-none group-hover:from-cyan-500/20 transition-all duration-500" />

      {/* Top row: Title & Icon */}
      <div className="flex items-start justify-between">
        <span className="text-xs font-mono font-medium tracking-wider text-slate-400 uppercase">
          {title}
        </span>
        <div className={`p-2.5 rounded-xl border ${styles.iconBg} transition-transform duration-300 group-hover:scale-110`}>
          <Icon className="w-4 h-4" />
        </div>
      </div>

      {/* Metric Value */}
      <div className="mt-3 flex items-baseline gap-1.5">
        <span className="text-3xl font-bold tracking-tight text-white font-mono">
          {value}
        </span>
        {unit && (
          <span className="text-xs font-mono font-medium text-slate-400 uppercase">
            {unit}
          </span>
        )}
      </div>

      {/* Progress / Gauge bar if supplied */}
      {typeof gaugePercent === 'number' && (
        <div className="mt-3 w-full bg-slate-800/70 h-1.5 rounded-full overflow-hidden">
          <div
            className={`h-full rounded-full transition-all duration-500 ${styles.barColor}`}
            style={{ width: `${Math.min(100, Math.max(0, gaugePercent))}%` }}
          />
        </div>
      )}

      {/* Bottom row: Change indicator & description */}
      <div className="mt-3.5 flex items-center justify-between text-xs">
        {change && (
          <span className={`inline-flex items-center px-2 py-0.5 rounded-md border font-mono text-[11px] ${getChangeColor()}`}>
            {change}
          </span>
        )}
        {description && (
          <span className="text-slate-400 text-[11px] truncate ml-auto" title={description}>
            {description}
          </span>
        )}
      </div>
    </div>
  );
};

