import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Order } from '../../types';
import { StatusBadge } from '../common/StatusBadge';
import { ChevronRight, ArrowUpRight } from 'lucide-react';

interface RecentOrdersTableProps {
  orders: Order[];
}

export function RecentOrdersTable({ orders }: RecentOrdersTableProps) {
  const navigate = useNavigate();

  return (
    <div className="p-5 rounded-xl border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900 flex flex-col h-full">
      <div className="pb-3 border-b border-stone-100 dark:border-stone-800/80 flex items-center justify-between">
        <div>
          <span className="text-xs font-semibold uppercase tracking-wider text-stone-600 dark:text-stone-400">
            Recent Bakery Orders
          </span>
          <p className="text-[11px] text-stone-600 dark:text-stone-400">Latest transactions across mobile & web</p>
        </div>
        <Link
          to="/admin/orders"
          className="text-xs text-amber-600 dark:text-amber-400 font-medium hover:underline flex items-center gap-1"
        >
          <span>View All Orders</span>
          <ChevronRight className="w-3 h-3" />
        </Link>
      </div>

      <div className="overflow-x-auto mt-3">
        <table className="w-full text-left border-collapse text-xs">
          <thead>
            <tr className="border-b border-stone-100 dark:border-stone-800/60 text-[11px] text-stone-600 dark:text-stone-400 font-semibold uppercase tracking-wider">
              <th className="py-2.5 px-3">Order ID</th>
              <th className="py-2.5 px-3">Customer</th>
              <th className="py-2.5 px-3">Items</th>
              <th className="py-2.5 px-3 text-right">Amount</th>
              <th className="py-2.5 px-3">Status</th>
              <th className="py-2.5 px-3">Date</th>
              <th className="py-2.5 px-3 text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-stone-100 dark:divide-stone-800/60">
            {(() => {
              const safeOrders = Array.isArray(orders) ? orders : (orders as any)?.items || (orders as any)?.orders || [];
              if (safeOrders.length === 0) {
                return (
                  <tr>
                    <td colSpan={7} className="py-8 text-center text-stone-400">
                      No orders recorded yet.
                    </td>
                  </tr>
                );
              }
              return safeOrders.map((o: any, idx: number) => {
                const orderId = o.id || o._id || `ord_${idx}`;
                const orderNumber = o.orderNumber || (o._id ? `#${String(o._id).substring(18).toUpperCase()}` : `ORD-${idx + 1}`);
                const customerName = o.customerName || o.user?.name || o.shippingAddress?.fullName || 'Patron';
                const customerEmail = o.customerEmail || o.user?.email || 'N/A';
                const itemsCount = Array.isArray(o.items) ? o.items.length : 0;
                const grandTotal = typeof o.grandTotal === 'number' ? o.grandTotal : typeof o.totalAmount === 'number' ? o.totalAmount : 0;
                const status = o.status || 'pending';
                const dateStr = o.createdAt ? new Date(o.createdAt).toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' }) : 'Today';

                return (
                  <tr
                    key={orderId}
                    onClick={() => navigate(`/admin/orders/${orderId}`)}
                    className="hover:bg-stone-50/80 dark:hover:bg-stone-800/40 cursor-pointer transition-colors group"
                  >
                    <td className="py-3 px-3 font-mono font-semibold text-stone-900 dark:text-stone-100">
                      {orderNumber}
                    </td>
                    <td className="py-3 px-3">
                      <div className="font-medium text-stone-900 dark:text-stone-100">{customerName}</div>
                      <div className="text-[10px] text-stone-600 dark:text-stone-400 truncate max-w-[140px]">
                        {customerEmail}
                      </div>
                    </td>
                    <td className="py-3 px-3 text-stone-600 dark:text-stone-400">
                      {itemsCount} {itemsCount === 1 ? 'item' : 'items'}
                    </td>
                    <td className="py-3 px-3 font-mono font-semibold text-stone-900 dark:text-stone-100 text-right tabular-nums">
                      AED {grandTotal.toFixed(2)}
                    </td>
                    <td className="py-3 px-3">
                      <StatusBadge status={status} />
                    </td>
                    <td className="py-3 px-3 text-stone-600 dark:text-stone-400 whitespace-nowrap">
                      {dateStr}
                    </td>
                    <td className="py-3 px-3 text-right">
                      <span className="inline-flex items-center gap-1 text-[11px] font-medium text-amber-700 dark:text-amber-400 group-hover:underline">
                        View
                        <ArrowUpRight className="w-3 h-3" />
                      </span>
                    </td>
                  </tr>
                );
              });
            })()}
          </tbody>
        </table>
      </div>
    </div>
  );
}
