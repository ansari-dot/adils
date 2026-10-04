import React, { useEffect, useState } from 'react';
import { dashboardApi } from '../../api/dashboardApi';
import { Loader2 } from 'lucide-react';

export function OrdersStatusChart() {
  const [breakdown, setBreakdown] = useState<{
    pending: number;
    processing: number;
    completed: number;
    cancelled: number;
  } | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const res = await dashboardApi.getOrdersBreakdown();
        if (res.success) {
          setBreakdown(res.statusBreakdown);
        }
      } catch (err) {
        console.error('Failed to load status breakdown:', err);
      } finally {
        setIsLoading(false);
      }
    }
    load();
  }, []);

  if (isLoading || !breakdown) {
    return (
      <div className="p-5 rounded-xl border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900 flex items-center justify-center min-h-[260px]">
        <Loader2 className="w-5 h-5 animate-spin text-amber-600" />
      </div>
    );
  }

  const total = breakdown.pending + breakdown.processing + breakdown.completed + breakdown.cancelled;
  const items = [
    { label: 'Completed', count: breakdown.completed, color: '#10b981', textColor: 'text-emerald-700 dark:text-emerald-400' },
    { label: 'Processing', count: breakdown.processing, color: '#3b82f6', textColor: 'text-blue-700 dark:text-blue-400' },
    { label: 'Pending', count: breakdown.pending, color: '#f59e0b', textColor: 'text-amber-700 dark:text-amber-400' },
    { label: 'Cancelled', count: breakdown.cancelled, color: '#f43f5e', textColor: 'text-rose-700 dark:text-rose-400' },
  ];

  // SVG Donut calculation
  const radius = 38;
  const circumference = 2 * Math.PI * radius;
  let accumulatedOffset = 0;

  return (
    <div className="p-5 rounded-xl border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900 flex flex-col h-full">
      <div className="pb-3 border-b border-stone-100 dark:border-stone-800/80 flex items-center justify-between">
        <span className="text-xs font-semibold uppercase tracking-wider text-stone-600 dark:text-stone-400">
          Orders By Status
        </span>
        <span className="text-xs font-mono font-medium text-stone-600 dark:text-stone-400">
          {total} Total
        </span>
      </div>

      <div className="flex-1 flex flex-col sm:flex-row items-center justify-around gap-6 py-4">
        {/* SVG Donut */}
        <div className="relative w-32 h-32 flex items-center justify-center shrink-0">
          <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
            {/* Background ring */}
            <circle
              cx="50"
              cy="50"
              r={radius}
              className="stroke-stone-100 dark:stroke-stone-800"
              strokeWidth="12"
              fill="transparent"
            />
            {total > 0 &&
              items.map((item) => {
                const strokeDasharray = `${(item.count / total) * circumference} ${circumference}`;
                const strokeDashoffset = -accumulatedOffset;
                accumulatedOffset += (item.count / total) * circumference;

                return (
                  <circle
                    key={item.label}
                    cx="50"
                    cy="50"
                    r={radius}
                    stroke={item.color}
                    strokeWidth="12"
                    strokeDasharray={strokeDasharray}
                    strokeDashoffset={strokeDashoffset}
                    fill="transparent"
                    strokeLinecap="round"
                    className="transition-all duration-300"
                  />
                );
              })}
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
            <span className="text-lg font-bold font-mono text-stone-900 dark:text-stone-100 tabular-nums">
              {total}
            </span>
            <span className="text-[10px] text-stone-600 dark:text-stone-400 tracking-wider uppercase font-medium">
              Orders
            </span>
          </div>
        </div>

        {/* Legend */}
        <div className="flex-1 space-y-2 w-full">
          {items.map((item) => {
            const pct = total > 0 ? Math.round((item.count / total) * 100) : 0;
            return (
              <div key={item.label} className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: item.color }} />
                  <span className="font-medium text-stone-700 dark:text-stone-300">{item.label}</span>
                </div>
                <div className="flex items-center gap-2 font-mono">
                  <span className="text-stone-900 dark:text-stone-100 font-semibold">{item.count}</span>
                  <span className="text-[11px] text-stone-400 w-8 text-right">({pct}%)</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
