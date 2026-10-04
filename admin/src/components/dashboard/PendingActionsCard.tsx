import React from 'react';
import { useNavigate } from 'react-router-dom';
import { AlertCircle, Clock, CakeSlice, ShoppingBag, PackageX, ArrowRight } from 'lucide-react';
import { DashboardStats } from '../../types';

interface PendingActionsCardProps {
  stats: DashboardStats;
}

export function PendingActionsCard({ stats }: PendingActionsCardProps) {
  const navigate = useNavigate();

  const actionItems = [
    {
      title: `${stats.pendingOrders} Orders Awaiting Kitchen Review`,
      desc: 'Customer payments confirmed. Requires preparation scheduling.',
      count: stats.pendingOrders,
      icon: ShoppingBag,
      variant: stats.pendingOrders > 0 ? 'warning' : 'neutral',
      path: '/admin/orders?status=pending',
    },
    {
      title: `${stats.pendingCustomRequests} Custom Cake Requests Pending Review`,
      desc: 'Review custom inscriptions, sponge flavors, and delivery dates.',
      count: stats.pendingCustomRequests,
      icon: CakeSlice,
      variant: stats.pendingCustomRequests > 0 ? 'warning' : 'neutral',
      path: '/admin/custom-requests?status=pending',
    },
    {
      title: `${stats.lowStockCount} Products Out of Stock`,
      desc: 'Restock bakery inventory or toggle availability status.',
      count: stats.lowStockCount,
      icon: PackageX,
      variant: stats.lowStockCount > 0 ? 'alert' : 'neutral',
      path: '/admin/products?stock=out_of_stock',
    },
  ];

  return (
    <div className="p-5 rounded-xl border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900">
      <div className="pb-3 border-b border-stone-100 dark:border-stone-800/80 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Clock className="w-4 h-4 text-amber-600 dark:text-amber-500" />
          <span className="text-xs font-semibold uppercase tracking-wider text-stone-600 dark:text-stone-400">
            Pending Operational Actions
          </span>
        </div>
        <span className="text-[11px] text-stone-600 dark:text-stone-400 font-medium">
          Requires immediate admin attention
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mt-4">
        {actionItems.map((item, idx) => {
          const Icon = item.icon;
          const isWarning = item.variant === 'warning' && item.count > 0;
          const isAlert = item.variant === 'alert' && item.count > 0;

          return (
            <button
              key={idx}
              type="button"
              onClick={() => navigate(item.path)}
              className={`p-3.5 rounded-lg border text-left transition-all group flex flex-col justify-between ${
                isWarning
                  ? 'border-amber-200 dark:border-amber-900/60 bg-amber-50/40 dark:bg-amber-950/20 hover:border-amber-400'
                  : isAlert
                  ? 'border-rose-200 dark:border-rose-900/60 bg-rose-50/40 dark:bg-rose-950/20 hover:border-rose-400'
                  : 'border-stone-200 dark:border-stone-800 bg-stone-50/30 dark:bg-stone-900/30 hover:border-stone-300'
              }`}
            >
              <div>
                <div className="flex items-center justify-between">
                  <div
                    className={`p-1.5 rounded-md ${
                      isWarning
                        ? 'bg-amber-100 dark:bg-amber-900 text-amber-800 dark:text-amber-200'
                        : isAlert
                        ? 'bg-rose-100 dark:bg-rose-900 text-rose-800 dark:text-rose-200'
                        : 'bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-400'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                  </div>
                  <span
                    className={`text-xs font-mono font-bold px-1.5 py-0.5 rounded ${
                      item.count > 0
                        ? 'bg-stone-900 text-white dark:bg-stone-100 dark:text-stone-900'
                        : 'bg-stone-100 text-stone-400 dark:bg-stone-800'
                    }`}
                  >
                    {item.count}
                  </span>
                </div>
                <h4 className="text-xs font-semibold text-stone-900 dark:text-stone-100 mt-2.5 line-clamp-1">
                  {item.title}
                </h4>
                <p className="text-[11px] text-stone-600 dark:text-stone-400 mt-1 line-clamp-2">
                  {item.desc}
                </p>
              </div>

              <div className="flex items-center gap-1 text-[11px] font-medium text-amber-700 dark:text-amber-400 mt-3 group-hover:translate-x-0.5 transition-transform">
                <span>Open module</span>
                <ArrowRight className="w-3 h-3" />
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
