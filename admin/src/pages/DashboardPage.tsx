import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { dashboardApi } from '../api/dashboardApi';
import { ordersApi } from '../api/ordersApi';
import { usersApi } from '../api/usersApi';
import { DashboardStats, Order, UserSummary } from '../types';
import { StatCard } from '../components/dashboard/StatCard';
import { RevenueChart } from '../components/dashboard/RevenueChart';
import { OrdersStatusChart } from '../components/dashboard/OrdersStatusChart';
import { PopularProductsList } from '../components/dashboard/PopularProductsList';
import { PendingActionsCard } from '../components/dashboard/PendingActionsCard';
import { RecentOrdersTable } from '../components/dashboard/RecentOrdersTable';
import { RecentUsersTable } from '../components/dashboard/RecentUsersTable';
import { ProductFormModal } from '../components/products/ProductFormModal';
import { CourseFormModal } from '../components/courses/CourseFormModal';
import { StatCardSkeleton } from '../components/common/LoadingSkeleton';
import { ErrorState } from '../components/common/ErrorState';
import {
  Users,
  Package,
  ShoppingBag,
  Clock,
  CheckCircle2,
  CakeSlice,
  GraduationCap,
  BookOpenCheck,
  TrendingUp,
  Plus,
  RefreshCw,
  Upload,
} from 'lucide-react';

export function DashboardPage() {
  const navigate = useNavigate();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [recentOrders, setRecentOrders] = useState<Order[]>([]);
  const [recentUsers, setRecentUsers] = useState<UserSummary[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Quick action modals
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [isCourseModalOpen, setIsCourseModalOpen] = useState(false);

  const loadDashboardData = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const [statsRes, ordersRes, usersRes] = await Promise.all([
        dashboardApi.getStats(),
        ordersApi.getAll({ limit: 5 }),
        usersApi.getAll({ limit: 5 }),
      ]);

      if (statsRes.success) setStats(statsRes.stats);
      if (ordersRes.success) setRecentOrders(ordersRes.orders);
      if (usersRes.success) setRecentUsers(usersRes.users);
    } catch (err: any) {
      setError(err.message || 'Failed to retrieve dashboard analytics');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadDashboardData();
  }, []);

  if (error) {
    return (
      <div className="py-12">
        <ErrorState message={error} onRetry={loadDashboardData} />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Top Header Overview & Quick Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-stone-900 dark:text-stone-100 font-sans">
            Bakery Operations Dashboard
          </h1>
          <p className="text-xs text-stone-600 dark:text-stone-400 mt-0.5 font-medium">
            Real-time business telemetry, sales aggregation, and fulfillment queue
          </p>
        </div>

        {/* Quick Action Buttons */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={loadDashboardData}
            className="p-2 rounded-lg border border-stone-200 dark:border-stone-800 text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-100 hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors"
            title="Refresh dashboard metrics"
            aria-label="Refresh dashboard metrics"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
          </button>

          <button
            type="button"
            onClick={() => setIsProductModalOpen(true)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-stone-900 text-white dark:bg-stone-100 dark:text-stone-900 text-xs font-semibold hover:bg-stone-800 dark:hover:bg-stone-200 transition-colors shadow-2xs"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Product</span>
          </button>

          <button
            type="button"
            onClick={() => setIsCourseModalOpen(true)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-stone-200 dark:border-stone-800 text-stone-800 dark:text-stone-200 hover:bg-stone-100 dark:hover:bg-stone-800 text-xs font-medium transition-colors"
          >
            <GraduationCap className="w-3.5 h-3.5 text-stone-500" />
            <span>Create Course</span>
          </button>

          <button
            type="button"
            onClick={() => navigate('/admin/media')}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-stone-200 dark:border-stone-800 text-stone-800 dark:text-stone-200 hover:bg-stone-100 dark:hover:bg-stone-800 text-xs font-medium transition-colors"
          >
            <Upload className="w-3.5 h-3.5 text-stone-500" />
            <span>Media</span>
          </button>
        </div>
      </div>

      {/* KPI Section */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {isLoading || !stats ? (
          <>
            <StatCardSkeleton />
            <StatCardSkeleton />
            <StatCardSkeleton />
            <StatCardSkeleton />
          </>
        ) : (
          <>
            <StatCard
              title="Total Revenue"
              value={`AED ${Number(stats?.totalRevenue || stats?.revenue || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
              subtitle={`AED ${Number(stats?.todayRevenue || 0).toFixed(2)} recorded today`}
              icon={TrendingUp}
              badge={{ text: 'Live Financials', type: 'positive' }}
            />
            <StatCard
              title="Total Orders"
              value={stats.totalOrders ?? 0}
              subtitle={`${stats.ordersToday ?? 0} today · ${stats.ordersThisWeek ?? 0} this week`}
              icon={ShoppingBag}
              onClick={() => navigate('/admin/orders')}
            />
            <StatCard
              title="Pending Orders"
              value={stats.pendingOrders ?? 0}
              subtitle={`${stats.processingOrders ?? 0} in production`}
              icon={Clock}
              badge={(stats.pendingOrders ?? 0) > 0 ? { text: 'Action required', type: 'warning' } : undefined}
              onClick={() => navigate('/admin/orders?status=pending')}
            />
            <StatCard
              title="Custom Cake Requests"
              value={stats.pendingCustomRequests ?? 0}
              subtitle="Pending review & estimates"
              icon={CakeSlice}
              badge={(stats.pendingCustomRequests ?? 0) > 0 ? { text: 'Unreviewed', type: 'warning' } : undefined}
              onClick={() => navigate('/admin/custom-requests')}
            />
          </>
        )}
      </div>

      {/* Secondary KPI Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
        {isLoading || !stats ? (
          <>
            <StatCardSkeleton />
            <StatCardSkeleton />
            <StatCardSkeleton />
            <StatCardSkeleton />
          </>
        ) : (
          <>
            <StatCard
              title="Total Products"
              value={stats.totalProducts ?? 0}
              subtitle={`${stats.lowStockCount ?? 0} out of stock`}
              icon={Package}
              onClick={() => navigate('/admin/products')}
            />
            <StatCard
              title="Total Registered Users"
              value={stats.totalUsers ?? 0}
              subtitle="Active mobile & web patrons"
              icon={Users}
              onClick={() => navigate('/admin/users')}
            />
            <StatCard
              title="Culinary Courses"
              value={stats.totalCourses ?? 0}
              subtitle="Viennoiserie & baking masterclasses"
              icon={GraduationCap}
              onClick={() => navigate('/admin/courses')}
            />
            <StatCard
              title="Active Enrollments"
              value={stats.totalEnrollments ?? 0}
              subtitle="Students progressing through courses"
              icon={BookOpenCheck}
              onClick={() => navigate('/admin/enrollments')}
            />
          </>
        )}
      </div>

      {/* Pending Actions Callout */}
      {stats && <PendingActionsCard stats={stats} />}

      {/* Interactive Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <RevenueChart />
        </div>
        <div className="lg:col-span-1">
          <OrdersStatusChart />
        </div>
      </div>

      {/* Popular Products & Recent Orders Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1">
          <PopularProductsList />
        </div>
        <div className="lg:col-span-2">
          <RecentOrdersTable orders={recentOrders} />
        </div>
      </div>

      {/* Recent Users Section */}
      <div>
        <RecentUsersTable users={recentUsers} />
      </div>

      {/* Modals for Quick Actions */}
      <ProductFormModal
        isOpen={isProductModalOpen}
        onClose={() => setIsProductModalOpen(false)}
        onSuccess={() => loadDashboardData()}
      />

      <CourseFormModal
        isOpen={isCourseModalOpen}
        onClose={() => setIsCourseModalOpen(false)}
        onSuccess={() => loadDashboardData()}
      />
    </div>
  );
}
