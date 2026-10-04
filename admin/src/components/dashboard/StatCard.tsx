import React from 'react';
import { LucideIcon } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: LucideIcon;
  badge?: {
    text: string;
    type?: 'positive' | 'warning' | 'neutral';
  };
  onClick?: () => void;
}

export function StatCard({ title, value, subtitle, icon: Icon, badge, onClick }: StatCardProps) {
  return (
    <div
      onClick={onClick}
      className={`p-5 rounded-xl border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900 transition-all ${
        onClick ? 'cursor-pointer hover:border-amber-400 dark:hover:border-amber-600 hover:shadow-xs' : ''
      }`}
    >
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium text-stone-500 dark:text-stone-400 tracking-wide">
          {title}
        </span>
        <div className="w-8 h-8 rounded-lg bg-stone-100 dark:bg-stone-800 flex items-center justify-center text-stone-600 dark:text-stone-300">
          <Icon className="w-4 h-4" />
        </div>
      </div>

      <div className="mt-2.5 flex items-baseline gap-2">
        <span className="text-2xl font-bold font-mono tracking-tight text-stone-900 dark:text-stone-100 tabular-nums">
          {value}
        </span>
        {badge && (
          <span
            className={`text-[10px] font-medium px-1.5 py-0.2 rounded font-mono ${
              badge.type === 'positive'
                ? 'text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/60'
                : badge.type === 'warning'
                ? 'text-amber-700 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/60'
                : 'text-stone-600 dark:text-stone-400 bg-stone-100 dark:bg-stone-800'
            }`}
          >
            {badge.text}
          </span>
        )}
      </div>

      {subtitle && (
        <p className="mt-1 text-[11px] text-stone-600 dark:text-stone-400 font-medium truncate">
          {subtitle}
        </p>
      )}
    </div>
  );
}
