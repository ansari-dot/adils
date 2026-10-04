import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { UserSummary } from '../../types';
import { StatusBadge } from '../common/StatusBadge';
import { ImageWithFallback } from '../common/ImageWithFallback';
import { ChevronRight, ArrowUpRight } from 'lucide-react';

interface RecentUsersTableProps {
  users: UserSummary[];
}

export function RecentUsersTable({ users }: RecentUsersTableProps) {
  const navigate = useNavigate();

  return (
    <div className="p-5 rounded-xl border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900 flex flex-col h-full">
      <div className="pb-3 border-b border-stone-100 dark:border-stone-800/80 flex items-center justify-between">
        <div>
          <span className="text-xs font-semibold uppercase tracking-wider text-stone-600 dark:text-stone-400">
            Recently Registered Users
          </span>
          <p className="text-[11px] text-stone-600 dark:text-stone-400">Customers & administrators onboarded</p>
        </div>
        <Link
          to="/admin/users"
          className="text-xs text-amber-600 dark:text-amber-400 font-medium hover:underline flex items-center gap-1"
        >
          <span>View All Users</span>
          <ChevronRight className="w-3 h-3" />
        </Link>
      </div>

      <div className="overflow-x-auto mt-3">
        <table className="w-full text-left border-collapse text-xs">
          <thead>
            <tr className="border-b border-stone-100 dark:border-stone-800/60 text-[11px] text-stone-600 dark:text-stone-400 font-semibold uppercase tracking-wider">
              <th className="py-2.5 px-3">User</th>
              <th className="py-2.5 px-3">Role</th>
              <th className="py-2.5 px-3">Orders</th>
              <th className="py-2.5 px-3">Status</th>
              <th className="py-2.5 px-3">Joined</th>
              <th className="py-2.5 px-3 text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-stone-100 dark:divide-stone-800/60">
            {(() => {
              const safeUsers = Array.isArray(users) ? users : (users as any)?.items || (users as any)?.users || [];
              if (safeUsers.length === 0) {
                return (
                  <tr>
                    <td colSpan={6} className="py-8 text-center text-stone-400">
                      No users found.
                    </td>
                  </tr>
                );
              }
              return safeUsers.map((u: any, idx: number) => {
                const userId = u.id || u._id || `usr_${idx}`;
                const name = u.name || 'Anonymous User';
                const email = u.email || 'N/A';
                const role = u.role || 'user';
                const status = u.status || 'active';
                const ordersCount = u.ordersCount ?? u.orders?.length ?? 0;
                const avatar = u.avatar || '';
                const joinedDate = u.createdAt ? new Date(u.createdAt).toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' }) : 'Recently';

                return (
                  <tr
                    key={userId}
                    onClick={() => navigate(`/admin/users/${userId}`)}
                    className="hover:bg-stone-50/80 dark:hover:bg-stone-800/40 cursor-pointer transition-colors group"
                  >
                    <td className="py-3 px-3">
                      <div className="flex items-center gap-2.5">
                        <div className="w-7 h-7 rounded-full overflow-hidden border border-stone-200 dark:border-stone-700 shrink-0">
                          <ImageWithFallback
                            src={avatar}
                            alt={name}
                            aspectRatio="square"
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div className="min-w-0">
                          <div className="font-semibold text-stone-900 dark:text-stone-100 truncate">{name}</div>
                          <div className="text-[10px] text-stone-600 dark:text-stone-400 truncate max-w-[150px]">{email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-3">
                      <span
                        className={`text-[11px] capitalize font-medium ${
                          role === 'admin'
                            ? 'text-purple-700 dark:text-purple-300 font-semibold'
                            : 'text-stone-600 dark:text-stone-400'
                        }`}
                      >
                        {role}
                      </span>
                    </td>
                    <td className="py-3 px-3 font-mono text-stone-700 dark:text-stone-300">
                      {ordersCount}
                    </td>
                    <td className="py-3 px-3">
                      <StatusBadge status={status} />
                    </td>
                    <td className="py-3 px-3 text-stone-600 dark:text-stone-400 whitespace-nowrap">
                      {joinedDate}
                    </td>
                    <td className="py-3 px-3 text-right">
                      <span className="inline-flex items-center gap-1 text-[11px] font-medium text-amber-700 dark:text-amber-400 group-hover:underline">
                        Inspect
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
