import React, { useEffect, useState } from 'react';
import { auditLogsApi } from '../api/auditLogsApi';
import { AuditLog } from '../types';
import { EmptyState } from '../components/common/EmptyState';
import { ErrorState } from '../components/common/ErrorState';
import {
  FileText,
  ShieldCheck,
  Search,
  Package,
  ShoppingBag,
  CakeSlice,
  GraduationCap,
  Users,
  Calculator,
  ImageIcon,
  Settings,
  Loader2,
} from 'lucide-react';

export function AuditLogsPage() {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [resourceFilter, setResourceFilter] = useState('all');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchLogs = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await auditLogsApi.getAll({
        resourceType: resourceFilter !== 'all' ? resourceFilter : undefined,
      });
      if (res.success) {
        setLogs(res.logs);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to retrieve administrative audit logs');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, [resourceFilter]);

  const getResourceIcon = (type: AuditLog['resourceType']) => {
    switch (type) {
      case 'product':
        return <Package className="w-4 h-4 text-amber-600" />;
      case 'order':
        return <ShoppingBag className="w-4 h-4 text-blue-600" />;
      case 'custom_request':
        return <CakeSlice className="w-4 h-4 text-rose-600" />;
      case 'course':
        return <GraduationCap className="w-4 h-4 text-purple-600" />;
      case 'user':
        return <Users className="w-4 h-4 text-emerald-600" />;
      case 'calculator':
        return <Calculator className="w-4 h-4 text-amber-600" />;
      case 'media':
        return <ImageIcon className="w-4 h-4 text-stone-600" />;
      default:
        return <Settings className="w-4 h-4 text-stone-600" />;
    }
  };

  return (
    <div className="space-y-5">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-1">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-stone-900 dark:text-stone-100 font-sans">
            Administrative Audit Logs & Compliance Ledger
          </h1>
          <p className="text-xs text-stone-600 dark:text-stone-400 mt-0.5 font-medium">
            Immutable operational activity log tracking catalog updates, order transitions, approvals, and mutations
          </p>
        </div>
        <div className="text-xs font-mono font-medium text-stone-600 dark:text-stone-400 bg-stone-100 dark:bg-stone-800 px-3 py-1.5 rounded-lg w-fit">
          {logs.length} {logs.length === 1 ? 'Action Logged' : 'Actions Logged'}
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-1 overflow-x-auto p-1 bg-stone-100 dark:bg-stone-800/60 rounded-lg text-xs w-fit">
        {[
          { label: 'All Modules', value: 'all' },
          { label: 'Orders', value: 'order' },
          { label: 'Products', value: 'product' },
          { label: 'Custom Requests', value: 'custom_request' },
          { label: 'Courses', value: 'course' },
          { label: 'Users', value: 'user' },
          { label: 'Calculator', value: 'calculator' },
          { label: 'Media', value: 'media' },
          { label: 'Settings', value: 'settings' },
        ].map((f) => (
          <button
            key={f.value}
            type="button"
            onClick={() => setResourceFilter(f.value)}
            className={`px-3 py-1 rounded-md capitalize font-medium transition-colors whitespace-nowrap ${
              resourceFilter === f.value
                ? 'bg-white dark:bg-stone-700 text-stone-900 dark:text-stone-100 shadow-2xs font-semibold'
                : 'text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-200'
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* Audit Log Table */}
      <div className="rounded-xl border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900 overflow-hidden">
        {isLoading ? (
          <div className="py-16 flex flex-col items-center justify-center gap-2 text-stone-400">
            <Loader2 className="w-5 h-5 animate-spin text-amber-600" />
            <span className="text-xs">Loading immutable audit trail...</span>
          </div>
        ) : error ? (
          <div className="p-8">
            <ErrorState message={error} onRetry={fetchLogs} />
          </div>
        ) : logs.length === 0 ? (
          <div className="p-8">
            <EmptyState
              icon={FileText}
              title="No audit events found"
              description="No administrative operations recorded under this filter."
            />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-stone-200 dark:border-stone-800 bg-stone-50/70 dark:bg-stone-900/60 text-[11px] text-stone-600 dark:text-stone-400 font-semibold uppercase tracking-wider">
                  <th className="py-3 px-4">Timestamp</th>
                  <th className="py-3 px-4">Administrator</th>
                  <th className="py-3 px-4">Resource Scope</th>
                  <th className="py-3 px-4">Action Summary</th>
                  <th className="py-3 px-4">Metadata Context</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100 dark:divide-stone-800/60">
                {logs.map((log) => (
                  <tr key={log.id} className="hover:bg-stone-50/60 dark:hover:bg-stone-800/40 transition-colors">
                    {/* Timestamp */}
                    <td className="py-3.5 px-4 text-stone-600 dark:text-stone-400 font-mono text-[11px] whitespace-nowrap">
                      {new Date(log.createdAt).toLocaleString([], {
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                        second: '2-digit',
                      })}
                    </td>

                    {/* Administrator */}
                    <td className="py-3.5 px-4">
                      <div className="font-semibold text-stone-900 dark:text-stone-100">{log.adminName}</div>
                      <div className="text-[10px] text-stone-500 font-mono">{log.adminEmail}</div>
                    </td>

                    {/* Resource Scope */}
                    <td className="py-3.5 px-4">
                      <div className="inline-flex items-center gap-1.5 text-[11px] font-medium capitalize text-stone-700 dark:text-stone-300">
                        {getResourceIcon(log.resourceType)}
                        <span>{log.resourceType.replace(/_/g, ' ')}</span>
                      </div>
                    </td>

                    {/* Action Summary */}
                    <td className="py-3.5 px-4 font-medium text-stone-900 dark:text-stone-100">
                      {log.action}
                    </td>

                    {/* Metadata Context */}
                    <td className="py-3.5 px-4 font-mono text-[11px] text-stone-500 max-w-xs truncate">
                      {log.metadata ? JSON.stringify(log.metadata) : '—'}
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
