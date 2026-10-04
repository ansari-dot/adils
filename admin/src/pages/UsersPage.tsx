import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { usersApi } from '../api/usersApi';
import { UserSummary } from '../types';
import { StatusBadge } from '../components/common/StatusBadge';
import { ImageWithFallback } from '../components/common/ImageWithFallback';
import { TableSkeleton } from '../components/common/LoadingSkeleton';
import { EmptyState } from '../components/common/EmptyState';
import { ErrorState } from '../components/common/ErrorState';
import { Search, ChevronLeft, ChevronRight, Users as UsersIcon, Eye } from 'lucide-react';

export function UsersPage() {
  const navigate = useNavigate();
  const [users, setUsers] = useState<UserSummary[]>([]);
  const [totalUsers, setTotalUsers] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchUsers = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await usersApi.getAll({
        search: search.trim() || undefined,
        role: roleFilter !== 'all' ? roleFilter : undefined,
        status: statusFilter !== 'all' ? statusFilter : undefined,
        page,
        limit,
      });
      if (res.success) {
        const fetchedUsers = Array.isArray(res.users) ? res.users : (res as any)?.items || [];
        setUsers(fetchedUsers);
        setTotalUsers(res.pagination?.total ?? (res as any)?.count ?? fetchedUsers.length);
        setTotalPages(res.pagination?.totalPages ?? 1);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to retrieve bakery users');
    } finally {
      setIsLoading(false);
    }
  };

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(() => {
      setPage(1);
      fetchUsers();
    }, 250);
    return () => clearTimeout(timer);
  }, [search, roleFilter, statusFilter]);

  // Page change
  useEffect(() => {
    fetchUsers();
  }, [page]);

  return (
    <div className="space-y-5">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-1">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-stone-900 dark:text-stone-100 font-sans">
            User Accounts & Patrons
          </h1>
          <p className="text-xs text-stone-600 dark:text-stone-400 mt-0.5 font-medium">
            Manage customer accounts, permissions, and administrative staff
          </p>
        </div>
        <div className="text-xs font-mono font-medium text-stone-600 dark:text-stone-400 bg-stone-100 dark:bg-stone-800 px-3 py-1.5 rounded-lg w-fit">
          {totalUsers} {totalUsers === 1 ? 'Registered User' : 'Registered Users'}
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="p-4 rounded-xl border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        {/* Search Input */}
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by customer name or email..."
            className="w-full pl-9 pr-3 py-1.5 text-xs rounded-lg border border-stone-200 dark:border-stone-700 bg-stone-50/50 dark:bg-stone-800 text-stone-900 dark:text-stone-100 placeholder:text-stone-400 focus:outline-none focus:ring-1 focus:ring-amber-500"
          />
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Role Filter */}
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="px-3 py-1.5 text-xs rounded-lg border border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-800 text-stone-800 dark:text-stone-200 focus:outline-none focus:ring-1 focus:ring-amber-500"
          >
            <option value="all">All Roles</option>
            <option value="user">Customers (user)</option>
            <option value="admin">Administrators (admin)</option>
          </select>

          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-1.5 text-xs rounded-lg border border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-800 text-stone-800 dark:text-stone-200 focus:outline-none focus:ring-1 focus:ring-amber-500"
          >
            <option value="all">All Statuses</option>
            <option value="active">Active</option>
            <option value="suspended">Suspended</option>
          </select>
        </div>
      </div>

      {/* Main Table View */}
      <div className="rounded-xl border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900 overflow-hidden">
        {isLoading ? (
          <TableSkeleton rows={6} cols={7} />
        ) : error ? (
          <div className="p-8">
            <ErrorState message={error} onRetry={fetchUsers} />
          </div>
        ) : !Array.isArray(users) || users.length === 0 ? (
          <div className="p-8">
            <EmptyState
              icon={UsersIcon}
              title="No users found"
              description="Try adjusting your search query, role filter, or status selection."
              actionLabel="Clear Filters"
              onAction={() => {
                setSearch('');
                setRoleFilter('all');
                setStatusFilter('all');
              }}
            />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-stone-200 dark:border-stone-800 bg-stone-50/70 dark:bg-stone-900/60 text-[11px] text-stone-600 dark:text-stone-400 font-semibold uppercase tracking-wider">
                  <th className="py-3 px-4">Patron / User</th>
                  <th className="py-3 px-4">Email</th>
                  <th className="py-3 px-4">Role</th>
                  <th className="py-3 px-4 text-center">Orders</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Joined Date</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100 dark:divide-stone-800/60">
                {users.map((u) => (
                  <tr
                    key={u.id}
                    onClick={() => navigate(`/admin/users/${u.id}`)}
                    className="hover:bg-stone-50/80 dark:hover:bg-stone-800/40 cursor-pointer transition-colors group"
                  >
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full overflow-hidden border border-stone-200 dark:border-stone-700 shrink-0">
                          <ImageWithFallback
                            src={u.avatar}
                            alt={u.name}
                            aspectRatio="square"
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <span className="font-semibold text-stone-900 dark:text-stone-100">
                          {u.name}
                        </span>
                      </div>
                    </td>
                    <td className="py-3.5 px-4 text-stone-600 dark:text-stone-400 font-mono text-[11px]">
                      {u.email}
                    </td>
                    <td className="py-3.5 px-4">
                      <span
                        className={`text-[11px] capitalize font-medium ${
                          u.role === 'admin'
                            ? 'text-purple-700 dark:text-purple-300 font-semibold'
                            : 'text-stone-600 dark:text-stone-400'
                        }`}
                      >
                        {u.role}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-center font-mono font-medium text-stone-700 dark:text-stone-300">
                      {u.ordersCount}
                    </td>
                    <td className="py-3.5 px-4">
                      <StatusBadge status={u.status} />
                    </td>
                    <td className="py-3.5 px-4 text-stone-500 whitespace-nowrap">
                      {new Date(u.createdAt).toLocaleDateString([], {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                      })}
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          navigate(`/admin/users/${u.id}`);
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
        {!isLoading && totalUsers > 0 && (
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 p-4 border-t border-stone-200 dark:border-stone-800 text-xs text-stone-500">
            <div>
              Showing <span className="font-mono font-semibold text-stone-800 dark:text-stone-200">{(page - 1) * limit + 1}</span>–
              <span className="font-mono font-semibold text-stone-800 dark:text-stone-200">{Math.min(page * limit, totalUsers)}</span> of{' '}
              <span className="font-mono font-semibold text-stone-800 dark:text-stone-200">{totalUsers}</span> users
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
