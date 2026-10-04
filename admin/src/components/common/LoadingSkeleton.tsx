import React from 'react';

export function StatCardSkeleton() {
  return (
    <div className="p-5 rounded-xl border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900 animate-pulse">
      <div className="flex items-center justify-between">
        <div className="h-3 w-24 bg-stone-200 dark:bg-stone-800 rounded" />
        <div className="w-8 h-8 rounded-lg bg-stone-100 dark:bg-stone-800" />
      </div>
      <div className="h-7 w-20 bg-stone-200 dark:bg-stone-800 rounded mt-3" />
      <div className="h-2.5 w-32 bg-stone-100 dark:bg-stone-800 rounded mt-2" />
    </div>
  );
}

export function TableRowSkeleton({ cols = 6 }: { cols?: number }) {
  return (
    <tr className="border-b border-stone-100 dark:border-stone-800/60 animate-pulse">
      {Array.from({ length: cols }).map((_, i) => (
        <td key={i} className="py-3.5 px-4">
          <div
            className="h-3.5 bg-stone-200 dark:bg-stone-800 rounded"
            style={{ width: `${Math.max(40, (i * 27 + 45) % 90)}%` }}
          />
        </td>
      ))}
    </tr>
  );
}

export function TableSkeleton({ rows = 5, cols = 6 }: { rows?: number; cols?: number }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left border-collapse">
        <thead>
          <tr className="border-b border-stone-200 dark:border-stone-800 bg-stone-50/50 dark:bg-stone-900/50">
            {Array.from({ length: cols }).map((_, i) => (
              <th key={i} className="py-3 px-4">
                <div className="h-3 w-16 bg-stone-200 dark:bg-stone-800 rounded" />
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {Array.from({ length: rows }).map((_, i) => (
            <TableRowSkeleton key={i} cols={cols} />
          ))}
        </tbody>
      </table>
    </div>
  );
}
