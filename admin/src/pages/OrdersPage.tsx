import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ordersApi } from '../api/ordersApi';
import { Order, OrderStatus } from '../types';
import { StatusBadge } from '../components/common/StatusBadge';
import { TableSkeleton } from '../components/common/LoadingSkeleton';
import { EmptyState } from '../components/common/EmptyState';
import { ErrorState } from '../components/common/ErrorState';
import { Search, ShoppingBag, Eye, ChevronLeft, ChevronRight } from 'lucide-react';

const STATUS_FILTERS: ('all' | OrderStatus)[] = ['all', 'pending', 'processing', 'completed', 'cancelled'];
const DATE_FILTERS = [
  { label: 'All Time', value: 'all' },
  { label: 'Today', value: 'today' },
  { label: 'Last 7 Days', value: '7d' },
  { label: 'Last 30 Days', value: '30d' },
];

export function OrdersPage() {
  const navigate = useNavigate();

  const [orders, setOrders] = useState<Order[]>([]);
  const [totalOrders, setTotalOrders] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [dateFilter, setDateFilter] = useState<string>('all');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchOrders = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await ordersApi.getAll({
        search: search.trim() || undefined,
        status: statusFilter !== 'all' ? statusFilter : undefined,
        dateRange: dateFilter !== 'all' ? dateFilter : undefined,
        page,
        limit,
      });
      if (res.success) {
        setOrders(res.orders);
        setTotalOrders(res.pagination.total);
        setTotalPages(res.pagination.totalPages);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to retrieve bakery orders');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      setPage(1);
      fetchOrders();
    }, 200);
    return () => clearTimeout(timer);
  }, [search, statusFilter, dateFilter]);

  useEffect(() => {
    fetchOrders();
  }, [page]);

  return (
    <div className="space-y-5">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-1">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-stone-900 dark:text-stone-100 font-sans">
            Orders Fulfillment & Transactions
          </h1>
          <p className="text-xs text-stone-600 dark:text-stone-400 mt-0.5 font-medium">
            Track kitchen preparation, delivery status, invoices, and customer orders
          </p>
        </div>
        <div className="text-xs font-mono font-medium text-stone-600 dark:text-stone-400 bg-stone-100 dark:bg-stone-800 px-3 py-1.5 rounded-lg w-fit">
          {totalOrders} {totalOrders === 1 ? 'Order Logged' : 'Orders Logged'}
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="p-4 rounded-xl border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900 space-y-3">
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
          {/* Search Bar */}
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by order #, customer name, email..."
              className="w-full pl-9 pr-3 py-1.5 text-xs rounded-lg border border-stone-200 dark:border-stone-700 bg-stone-50/50 dark:bg-stone-800 text-stone-900 dark:text-stone-100 placeholder:text-stone-400 focus:outline-none focus:ring-1 focus:ring-amber-500 font-sans"
            />
          </div>

          {/* Status Segmented Control (Anti-pill tabs) */}
          <div className="flex items-center gap-1 overflow-x-auto p-1 bg-stone-100 dark:bg-stone-800/60 rounded-lg text-xs">
            {STATUS_FILTERS.map((st) => (
              <button
                key={st}
                type="button"
                onClick={() => setStatusFilter(st)}
                className={`px-3 py-1 rounded-md capitalize font-medium transition-colors whitespace-nowrap ${
                  statusFilter === st
                    ? 'bg-white dark:bg-stone-700 text-stone-900 dark:text-stone-100 shadow-2xs font-semibold'
                    : 'text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-200'
                }`}
              >
                {st === 'all' ? 'All Orders' : st}
              </button>
            ))}
          </div>
        </div>

        {/* Date Filter Bar */}
        <div className="flex items-center gap-2 pt-2 border-t border-stone-100 dark:border-stone-800/80 text-xs text-stone-600 dark:text-stone-400">
          <span className="text-[11px] font-medium mr-1">Time period:</span>
          {DATE_FILTERS.map((df) => (
            <button
              key={df.value}
              type="button"
              onClick={() => setDateFilter(df.value)}
              className={`px-2.5 py-0.5 rounded text-[11px] font-medium transition-colors ${
                dateFilter === df.value
                  ? 'bg-amber-100 text-amber-900 dark:bg-amber-950/80 dark:text-amber-200 font-semibold'
                  : 'text-stone-500 hover:text-stone-800 dark:hover:text-stone-300'
              }`}
            >
              {df.label}
            </button>
          ))}
        </div>
      </div>

      {/* Orders Table */}
      <div className="rounded-xl border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900 overflow-hidden">
        {isLoading ? (
          <TableSkeleton rows={6} cols={8} />
        ) : error ? (
          <div className="p-8">
            <ErrorState message={error} onRetry={fetchOrders} />
          </div>
        ) : orders.length === 0 ? (
          <div className="p-8">
            <EmptyState
              icon={ShoppingBag}
              title="No orders found"
              description="No orders correspond to current search and status constraints."
              actionLabel="Clear Filters"
              onAction={() => {
                setSearch('');
                setStatusFilter('all');
                setDateFilter('all');
              }}
            />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-stone-200 dark:border-stone-800 bg-stone-50/70 dark:bg-stone-900/60 text-[11px] text-stone-600 dark:text-stone-400 font-semibold uppercase tracking-wider">
                  <th className="py-3 px-4">Order ID</th>
                  <th className="py-3 px-4">Customer</th>
                  <th className="py-3 px-4">Items Summary</th>
                  <th className="py-3 px-4 text-right">Subtotal</th>
                  <th className="py-3 px-4 text-right">Delivery</th>
                  <th className="py-3 px-4 text-right">Tax (5%)</th>
                  <th className="py-3 px-4 text-right">Grand Total</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Date</th>
                  <th className="py-3 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100 dark:divide-stone-800/60">
                {orders.map((o) => (
                  <tr
                    key={o.id}
                    onClick={() => navigate(`/admin/orders/${o.id}`)}
                    className="hover:bg-stone-50/80 dark:hover:bg-stone-800/40 cursor-pointer transition-colors group"
                  >
                    <td className="py-3.5 px-4 font-mono font-semibold text-stone-900 dark:text-stone-100 whitespace-nowrap">
                      {o.orderNumber}
                    </td>

                    <td className="py-3.5 px-4">
                      <div className="font-semibold text-stone-900 dark:text-stone-100 truncate max-w-[140px]">
                        {o.customerName}
                      </div>
                      <div className="text-[10px] text-stone-600 dark:text-stone-400 font-mono truncate max-w-[140px]">
                        {o.customerEmail}
                      </div>
                    </td>

                    <td className="py-3.5 px-4 text-stone-600 dark:text-stone-400 max-w-[200px] truncate">
                      {o.items.map((i) => `${i.quantity}x ${i.title}`).join(', ')}
                    </td>

                    <td className="py-3.5 px-4 text-right font-mono text-stone-600 dark:text-stone-400">
                      AED {o.subtotal.toFixed(2)}
                    </td>

                    <td className="py-3.5 px-4 text-right font-mono text-stone-600 dark:text-stone-400">
                      AED {o.deliveryFee.toFixed(2)}
                    </td>

                    <td className="py-3.5 px-4 text-right font-mono text-stone-600 dark:text-stone-400">
                      AED {o.tax.toFixed(2)}
                    </td>

                    <td className="py-3.5 px-4 text-right font-mono font-bold text-stone-900 dark:text-stone-100 tabular-nums">
                      AED {o.grandTotal.toFixed(2)}
                    </td>

                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <StatusBadge status={o.status} />
                    </td>

                    <td className="py-3.5 px-4 text-stone-600 dark:text-stone-400 whitespace-nowrap">
                      {new Date(o.createdAt).toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' })}
                    </td>

                    <td className="py-3.5 px-4 text-right">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          navigate(`/admin/orders/${o.id}`);
                        }}
                        className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-amber-700 dark:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-950/60 font-medium transition-colors"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>Inspect</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination Toolbar */}
        {!isLoading && totalOrders > 0 && (
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 p-4 border-t border-stone-200 dark:border-stone-800 text-xs text-stone-500">
            <div>
              Showing <span className="font-mono font-semibold text-stone-800 dark:text-stone-200">{(page - 1) * limit + 1}</span>–
              <span className="font-mono font-semibold text-stone-800 dark:text-stone-200">{Math.min(page * limit, totalOrders)}</span> of{' '}
              <span className="font-mono font-semibold text-stone-800 dark:text-stone-200">{totalOrders}</span> orders
            </div>

            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page <= 1}
                className="p-1.5 rounded-md border border-stone-200 dark:border-stone-700 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors"
                aria-label="Previous page"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>

              <span className="px-2 font-mono font-medium text-stone-700 dark:text-stone-300">
                Page {page} of {totalPages}
              </span>

              <button
                type="button"
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page >= totalPages}
                className="p-1.5 rounded-md border border-stone-200 dark:border-stone-700 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors"
                aria-label="Next page"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
