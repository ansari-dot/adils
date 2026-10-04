import React, { useState, useEffect } from 'react';
import { dashboardApi } from '../../api/dashboardApi';
import { RevenueDataPoint } from '../../types';
import { Loader2 } from 'lucide-react';

export function RevenueChart() {
  const [period, setPeriod] = useState<'7d' | '30d' | '90d' | '1y'>('7d');
  const [data, setData] = useState<RevenueDataPoint[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [hoveredPoint, setHoveredPoint] = useState<RevenueDataPoint | null>(null);

  useEffect(() => {
    async function load() {
      setIsLoading(true);
      try {
        const res = await dashboardApi.getRevenue(period);
        if (res.success) {
          setData(res.data);
        }
      } catch (err) {
        console.error('Failed to load revenue data:', err);
      } finally {
        setIsLoading(false);
      }
    }
    load();
  }, [period]);

  const totalPeriodRevenue = data.reduce((acc, d) => acc + d.revenue, 0);
  const maxVal = Math.max(...data.map((d) => d.revenue), 100);

  // SVG dimensions
  const svgWidth = 600;
  const svgHeight = 180;
  const paddingX = 20;
  const paddingY = 20;
  const chartW = svgWidth - paddingX * 2;
  const chartH = svgHeight - paddingY * 2;

  const points = data.map((d, index) => {
    const x = paddingX + (index / Math.max(data.length - 1, 1)) * chartW;
    const y = paddingY + chartH - (d.revenue / maxVal) * chartH;
    return { x, y, ...d };
  });

  const pathD = points.length > 0
    ? points.reduce((acc, p, i) => `${acc} ${i === 0 ? 'M' : 'L'} ${p.x.toFixed(1)} ${p.y.toFixed(1)}`, '')
    : '';

  const areaD = points.length > 0
    ? `${pathD} L ${points[points.length - 1].x.toFixed(1)} ${(paddingY + chartH).toFixed(1)} L ${points[0].x.toFixed(1)} ${(paddingY + chartH).toFixed(1)} Z`
    : '';

  return (
    <div className="p-5 rounded-xl border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900 flex flex-col h-full">
      {/* Chart Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-stone-100 dark:border-stone-800/80">
        <div>
          <span className="text-xs font-semibold uppercase tracking-wider text-stone-600 dark:text-stone-400">
            Revenue Over Time
          </span>
          <div className="flex items-baseline gap-2 mt-0.5">
            <span className="text-xl font-bold font-mono text-stone-900 dark:text-stone-100 tabular-nums">
              AED {totalPeriodRevenue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </span>
            <span className="text-[11px] text-stone-600 dark:text-stone-400">total in period</span>
          </div>
        </div>

        {/* Filter Segmented Control */}
        <div className="flex items-center gap-1 p-1 bg-stone-100 dark:bg-stone-800/60 rounded-lg self-start sm:self-auto">
          {(['7d', '30d', '90d', '1y'] as const).map((p) => (
            <button
              key={p}
              type="button"
              onClick={() => setPeriod(p)}
              className={`px-2.5 py-1 text-xs font-medium rounded-md transition-colors ${
                period === p
                  ? 'bg-white dark:bg-stone-700 text-stone-900 dark:text-stone-100 shadow-2xs font-semibold'
                  : 'text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-200'
              }`}
            >
              {p === '7d' ? '7D' : p === '30d' ? '30D' : p === '90d' ? '90D' : '1Y'}
            </button>
          ))}
        </div>
      </div>

      {/* SVG Canvas Area */}
      <div className="relative flex-1 mt-4 min-h-[190px] flex items-center justify-center">
        {isLoading ? (
          <div className="flex items-center gap-2 text-xs text-stone-400">
            <Loader2 className="w-4 h-4 animate-spin text-amber-600" />
            <span>Calculating financial intervals...</span>
          </div>
        ) : data.length === 0 ? (
          <div className="text-xs text-stone-400">No revenue data available for this range</div>
        ) : (
          <div className="w-full h-full flex flex-col justify-between">
            <svg
              viewBox={`0 0 ${svgWidth} ${svgHeight}`}
              className="w-full h-44 overflow-visible"
              preserveAspectRatio="none"
            >
              <defs>
                <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#d97706" stopOpacity="0.25" />
                  <stop offset="100%" stopColor="#d97706" stopOpacity="0.0" />
                </linearGradient>
              </defs>

              {/* Grid Lines */}
              <line
                x1={paddingX}
                y1={paddingY}
                x2={svgWidth - paddingX}
                y2={paddingY}
                className="stroke-stone-100 dark:stroke-stone-800"
                strokeDasharray="3 3"
              />
              <line
                x1={paddingX}
                y1={paddingY + chartH / 2}
                x2={svgWidth - paddingX}
                y2={paddingY + chartH / 2}
                className="stroke-stone-100 dark:stroke-stone-800"
                strokeDasharray="3 3"
              />
              <line
                x1={paddingX}
                y1={paddingY + chartH}
                x2={svgWidth - paddingX}
                y2={paddingY + chartH}
                className="stroke-stone-200 dark:stroke-stone-800"
              />

              {/* Area & Stroke */}
              <path d={areaD} fill="url(#revenueGradient)" />
              <path
                d={pathD}
                fill="none"
                stroke="#d97706"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />

              {/* Data Interactive Nodes */}
              {points.map((p, i) => (
                <circle
                  key={i}
                  cx={p.x}
                  cy={p.y}
                  r="3.5"
                  className="fill-white dark:fill-stone-900 stroke-amber-600 stroke-[2] cursor-pointer hover:r-5 transition-all"
                  onMouseEnter={() => setHoveredPoint(p)}
                  onMouseLeave={() => setHoveredPoint(null)}
                />
              ))}
            </svg>

            {/* X-axis date endpoints */}
            <div className="flex justify-between text-[10px] text-stone-600 dark:text-stone-400 font-mono pt-1">
              <span>{data[0]?.date}</span>
              {hoveredPoint && (
                <span className="font-semibold text-amber-700 dark:text-amber-400">
                  {hoveredPoint.date}: AED {hoveredPoint.revenue.toFixed(2)} ({hoveredPoint.ordersCount} orders)
                </span>
              )}
              <span>{data[data.length - 1]?.date}</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
