import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { customRequestsApi } from '../api/customRequestsApi';
import { CustomCakeRequest, CustomRequestStatus } from '../types';
import { StatusBadge } from '../components/common/StatusBadge';
import { ImageWithFallback } from '../components/common/ImageWithFallback';
import { EmptyState } from '../components/common/EmptyState';
import { ErrorState } from '../components/common/ErrorState';
import { Search, CakeSlice, Eye, Loader2 } from 'lucide-react';

const STATUS_FILTERS: ('all' | CustomRequestStatus)[] = ['all', 'pending', 'approved', 'completed', 'rejected'];

export function CustomRequestsPage() {
  const navigate = useNavigate();

  const [requests, setRequests] = useState<CustomCakeRequest[]>([]);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchRequests = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await customRequestsApi.getAll({
        search: search.trim() || undefined,
        status: statusFilter !== 'all' ? statusFilter : undefined,
      });
      if (res.success) {
        setRequests(res.requests);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to retrieve custom cake requests');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchRequests();
    }, 200);
    return () => clearTimeout(timer);
  }, [search, statusFilter]);

  return (
    <div className="space-y-5">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-1">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-stone-900 dark:text-stone-100 font-sans">
            Custom Cake Inquiries & Commissions
          </h1>
          <p className="text-xs text-stone-600 dark:text-stone-400 mt-0.5 font-medium">
            Review custom tier architectures, special flavor profiles, inscriptions, and pricing quotes
          </p>
        </div>
        <div className="text-xs font-mono font-medium text-stone-600 dark:text-stone-400 bg-stone-100 dark:bg-stone-800 px-3 py-1.5 rounded-lg w-fit">
          {requests.length} {requests.length === 1 ? 'Request Logged' : 'Requests Logged'}
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="p-4 rounded-xl border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search request #, customer, flavor..."
            className="w-full pl-9 pr-3 py-1.5 text-xs rounded-lg border border-stone-200 dark:border-stone-700 bg-stone-50/50 dark:bg-stone-800 text-stone-900 dark:text-stone-100 placeholder:text-stone-400 focus:outline-none focus:ring-1 focus:ring-amber-500 font-sans"
          />
        </div>

        {/* Status Tabs */}
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
              {st === 'all' ? 'All Inquiries' : st}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="rounded-xl border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900 overflow-hidden">
        {isLoading ? (
          <div className="p-12 flex flex-col items-center justify-center gap-2 text-stone-400">
            <Loader2 className="w-5 h-5 animate-spin text-amber-600" />
            <span className="text-xs">Loading custom requests...</span>
          </div>
        ) : error ? (
          <div className="p-8">
            <ErrorState message={error} onRetry={fetchRequests} />
          </div>
        ) : requests.length === 0 ? (
          <div className="p-8">
            <EmptyState
              icon={CakeSlice}
              title="No custom cake requests found"
              description="No cake inquiries match your criteria."
              actionLabel="Clear Filters"
              onAction={() => {
                setSearch('');
                setStatusFilter('all');
              }}
            />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-stone-200 dark:border-stone-800 bg-stone-50/70 dark:bg-stone-900/60 text-[11px] text-stone-600 dark:text-stone-400 font-semibold uppercase tracking-wider">
                  <th className="py-3 px-4">Request ID</th>
                  <th className="py-3 px-4">Customer</th>
                  <th className="py-3 px-4">Base Cake & Flavor</th>
                  <th className="py-3 px-4">Size & Scale</th>
                  <th className="py-3 px-4">Selected Toppings</th>
                  <th className="py-3 px-4 text-right">Quote Estimate</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Submitted</th>
                  <th className="py-3 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100 dark:divide-stone-800/60">
                {requests.map((r) => (
                  <tr
                    key={r.id}
                    onClick={() => navigate(`/admin/custom-requests/${r.id}`)}
                    className="hover:bg-stone-50/80 dark:hover:bg-stone-800/40 cursor-pointer transition-colors group"
                  >
                    <td className="py-3.5 px-4 font-mono font-semibold text-stone-900 dark:text-stone-100 whitespace-nowrap">
                      {r.requestNumber}
                    </td>

                    <td className="py-3.5 px-4">
                      <div className="font-semibold text-stone-900 dark:text-stone-100">{r.customerName}</div>
                      <div className="text-[10px] text-stone-500 font-mono">{r.customerEmail}</div>
                    </td>

                    <td className="py-3.5 px-4">
                      <div className="font-medium text-stone-900 dark:text-stone-100">{r.baseProduct}</div>
                      <div className="text-[11px] text-stone-500">{r.flavor}</div>
                    </td>

                    <td className="py-3.5 px-4 text-stone-700 dark:text-stone-300 font-medium">
                      {r.size}
                    </td>

                    <td className="py-3.5 px-4 text-stone-500 max-w-[160px] truncate">
                      {r.toppings.join(', ')}
                    </td>

                    <td className="py-3.5 px-4 text-right font-mono font-bold text-stone-900 dark:text-stone-100 tabular-nums">
                      {r.estimatedCost ? `AED ${r.estimatedCost}` : '—'}
                    </td>

                    <td className="py-3.5 px-4">
                      <StatusBadge status={r.status} />
                    </td>

                    <td className="py-3.5 px-4 text-stone-500 whitespace-nowrap">
                      {new Date(r.createdAt).toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' })}
                    </td>

                    <td className="py-3.5 px-4 text-right">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          navigate(`/admin/custom-requests/${r.id}`);
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
      </div>
    </div>
  );
}
