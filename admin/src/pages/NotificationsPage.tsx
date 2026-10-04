import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { notificationsApi } from '../api/notificationsApi';
import { AdminNotification } from '../types';
import { useToast } from '../context/ToastContext';
import { EmptyState } from '../components/common/EmptyState';
import { ErrorState } from '../components/common/ErrorState';
import {
  Bell,
  CheckCircle2,
  ShoppingBag,
  CakeSlice,
  Package,
  GraduationCap,
  Info,
  Loader2,
  ExternalLink,
} from 'lucide-react';

export function NotificationsPage() {
  const navigate = useNavigate();
  const { success } = useToast();

  const [notifications, setNotifications] = useState<AdminNotification[]>([]);
  const [filter, setFilter] = useState<'all' | 'unread'>('all');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchNotifications = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await notificationsApi.getAll();
      if (res.success) {
        setNotifications(res.notifications);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to retrieve notifications');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  const handleMarkAsRead = async (id: string) => {
    try {
      await notificationsApi.markAsRead(id);
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, read: true } : n))
      );
    } catch {
      // quiet
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await notificationsApi.markAllAsRead();
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
      success('All operational notifications marked as read.');
    } catch {
      // quiet
    }
  };

  const getNotificationIcon = (type: AdminNotification['type']) => {
    switch (type) {
      case 'order':
        return <ShoppingBag className="w-4 h-4 text-blue-600 dark:text-blue-400" />;
      case 'custom_request':
        return <CakeSlice className="w-4 h-4 text-amber-600 dark:text-amber-400" />;
      case 'stock':
        return <Package className="w-4 h-4 text-rose-600 dark:text-rose-400" />;
      case 'course':
        return <GraduationCap className="w-4 h-4 text-purple-600 dark:text-purple-400" />;
      default:
        return <Info className="w-4 h-4 text-stone-600 dark:text-stone-400" />;
    }
  };

  const filtered = filter === 'unread' ? notifications.filter((n) => !n.read) : notifications;
  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <div className="space-y-5">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-1">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-stone-900 dark:text-stone-100 font-sans">
            Administrative Activity & Alerts
          </h1>
          <p className="text-xs text-stone-600 dark:text-stone-400 mt-0.5 font-medium">
            System dispatch alerts, new incoming transactions, custom requests, and kitchen stock notifications
          </p>
        </div>

        {unreadCount > 0 && (
          <button
            type="button"
            onClick={handleMarkAllAsRead}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-800 text-stone-800 dark:text-stone-200 hover:bg-stone-50 text-xs font-semibold transition-colors self-start sm:self-auto"
          >
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Mark All as Read ({unreadCount})</span>
          </button>
        )}
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-1 p-1 bg-stone-100 dark:bg-stone-800/60 rounded-lg text-xs w-fit">
        <button
          type="button"
          onClick={() => setFilter('all')}
          className={`px-3 py-1 rounded-md font-medium transition-colors ${
            filter === 'all'
              ? 'bg-white dark:bg-stone-700 text-stone-900 dark:text-stone-100 shadow-2xs font-semibold'
              : 'text-stone-600 dark:text-stone-400'
          }`}
        >
          All Alerts ({notifications.length})
        </button>
        <button
          type="button"
          onClick={() => setFilter('unread')}
          className={`px-3 py-1 rounded-md font-medium transition-colors ${
            filter === 'unread'
              ? 'bg-white dark:bg-stone-700 text-stone-900 dark:text-stone-100 shadow-2xs font-semibold'
              : 'text-stone-600 dark:text-stone-400'
          }`}
        >
          Unread Only ({unreadCount})
        </button>
      </div>

      {/* Notifications List */}
      <div className="rounded-xl border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900 overflow-hidden divide-y divide-stone-100 dark:divide-stone-800/60">
        {isLoading ? (
          <div className="py-16 flex flex-col items-center justify-center gap-2 text-stone-400">
            <Loader2 className="w-5 h-5 animate-spin text-amber-600" />
            <span className="text-xs">Loading operational alerts...</span>
          </div>
        ) : error ? (
          <div className="p-8">
            <ErrorState message={error} onRetry={fetchNotifications} />
          </div>
        ) : filtered.length === 0 ? (
          <div className="p-8">
            <EmptyState
              icon={Bell}
              title="No notifications"
              description={
                filter === 'unread'
                  ? 'All notifications have been reviewed and marked as read.'
                  : 'No administrative alerts currently registered.'
              }
            />
          </div>
        ) : (
          filtered.map((item) => (
            <div
              key={item.id}
              className={`p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 transition-colors ${
                !item.read
                  ? 'bg-amber-50/40 dark:bg-amber-950/20'
                  : 'hover:bg-stone-50/60 dark:hover:bg-stone-800/40'
              }`}
            >
              <div className="flex items-start gap-3.5">
                <div className="p-2 rounded-lg bg-stone-100 dark:bg-stone-800 shrink-0 mt-0.5">
                  {getNotificationIcon(item.type)}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-xs font-semibold text-stone-900 dark:text-stone-100">
                      {item.title}
                    </h3>
                    {!item.read && (
                      <span className="w-2 h-2 rounded-full bg-amber-600" />
                    )}
                  </div>
                  <p className="text-xs text-stone-600 dark:text-stone-400 mt-0.5 leading-relaxed">
                    {item.message}
                  </p>
                  <p className="text-[10px] text-stone-400 mt-1 font-mono">
                    {new Date(item.createdAt).toLocaleString()}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 self-end sm:self-auto shrink-0">
                {!item.read && (
                  <button
                    type="button"
                    onClick={() => handleMarkAsRead(item.id)}
                    className="px-2.5 py-1 text-xs text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-100 hover:bg-stone-100 dark:hover:bg-stone-800 rounded transition-colors"
                  >
                    Mark Read
                  </button>
                )}

                {item.link && (
                  <button
                    type="button"
                    onClick={() => {
                      if (!item.read) handleMarkAsRead(item.id);
                      navigate(item.link);
                    }}
                    className="inline-flex items-center gap-1 px-3 py-1 text-xs font-medium bg-stone-900 text-white dark:bg-stone-100 dark:text-stone-900 rounded-lg hover:bg-stone-800 transition-colors"
                  >
                    <span>View Record</span>
                    <ExternalLink className="w-3 h-3" />
                  </button>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
