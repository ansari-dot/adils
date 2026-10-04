import React, { useEffect, useState } from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  Users,
  Package,
  ShoppingBag,
  CakeSlice,
  GraduationCap,
  BookOpenCheck,
  Calculator,
  Image as ImageIcon,
  Bell,
  Settings,
  User,
  FileText,
  ChevronLeft,
  ChevronRight,
  Sparkles,
} from 'lucide-react';
import { dashboardApi } from '../../api/dashboardApi';
import { notificationsApi } from '../../api/notificationsApi';

interface SidebarProps {
  isCollapsed: boolean;
  onToggleCollapse: () => void;
  isMobileOpen: boolean;
  onCloseMobile: () => void;
}

export function Sidebar({
  isCollapsed,
  onToggleCollapse,
  isMobileOpen,
  onCloseMobile,
}: SidebarProps) {
  const [badges, setBadges] = useState<{ pendingOrders: number; pendingRequests: number; unreadNotifs: number }>({
    pendingOrders: 0,
    pendingRequests: 0,
    unreadNotifs: 0,
  });

  useEffect(() => {
    async function fetchBadges() {
      try {
        const [statsRes, notifRes] = await Promise.all([
          dashboardApi.getStats(),
          notificationsApi.getAll(),
        ]);
        const pendingOrders = statsRes.success ? statsRes.stats.pendingOrders : 0;
        const pendingRequests = statsRes.success ? statsRes.stats.pendingCustomRequests : 0;
        const unreadNotifs = notifRes.success ? notifRes.notifications.filter((n) => !n.read).length : 0;

        setBadges({ pendingOrders, pendingRequests, unreadNotifs });
      } catch {
        // quiet fallback
      }
    }
    fetchBadges();
    const interval = setInterval(fetchBadges, 30000);
    return () => clearInterval(interval);
  }, []);

  const navItemClass = ({ isActive }: { isActive: boolean }) =>
    `flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-medium transition-all group ${
      isActive
        ? 'bg-amber-600 text-white font-semibold shadow-xs'
        : 'text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-100 hover:bg-stone-100/80 dark:hover:bg-stone-800/60'
    } ${isCollapsed ? 'justify-center px-2' : ''}`;

  const renderBadge = (count: number, isActive: boolean) => {
    if (!count || count <= 0) return null;
    return (
      <span
        className={`ml-auto px-1.5 py-0.2 rounded text-[10px] font-mono font-semibold ${
          isActive
            ? 'bg-white/25 text-white'
            : 'bg-amber-100 text-amber-800 dark:bg-amber-900/60 dark:text-amber-300'
        }`}
      >
        {count}
      </span>
    );
  };

  const content = (
    <div className="flex flex-col h-full bg-white dark:bg-stone-950 border-r border-stone-200 dark:border-stone-800 select-none">
      {/* Brand Header */}
      <div className="flex items-center justify-between h-14 px-4 border-b border-stone-200 dark:border-stone-800 shrink-0">
        <NavLink
          to="/admin/dashboard"
          onClick={onCloseMobile}
          className="flex items-center gap-2.5 overflow-hidden focus:outline-none"
        >
          <div className="w-8 h-8 rounded-lg bg-amber-600 flex items-center justify-center text-white shrink-0 shadow-xs">
            <CakeSlice className="w-4 h-4 stroke-[2.2]" />
          </div>
          {!isCollapsed && (
            <div className="flex flex-col">
              <span className="font-bold text-sm tracking-tight text-stone-900 dark:text-stone-100 font-sans">
                Pâtisserie Admin
              </span>
              <span className="text-[10px] text-stone-600 dark:text-stone-400 tracking-wide font-medium">
                Operations & Commerce
              </span>
            </div>
          )}
        </NavLink>

        <button
          type="button"
          onClick={onToggleCollapse}
          className="hidden md:flex p-1 rounded-md text-stone-400 hover:text-stone-700 dark:hover:text-stone-200 hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors"
          title={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          aria-label={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {isCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
        </button>
      </div>

      {/* Nav List */}
      <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-6 text-xs" aria-label="Sidebar Navigation">
        {/* Core Overview */}
        <div>
          <NavLink
            to="/admin/dashboard"
            onClick={onCloseMobile}
            className={navItemClass}
            title={isCollapsed ? 'Dashboard' : undefined}
          >
            {({ isActive }) => (
              <>
                <LayoutDashboard className="w-4 h-4 shrink-0" />
                {!isCollapsed && <span>Dashboard</span>}
              </>
            )}
          </NavLink>
        </div>

        {/* Management Section */}
        <div>
          {!isCollapsed && (
            <div className="px-3 pb-2 text-[10px] font-semibold uppercase tracking-wider text-stone-600 dark:text-stone-400">
              Management
            </div>
          )}
          <div className="space-y-1">
            <NavLink to="/admin/users" onClick={onCloseMobile} className={navItemClass} title={isCollapsed ? 'Users' : undefined}>
              <Users className="w-4 h-4 shrink-0" />
              {!isCollapsed && <span>Users</span>}
            </NavLink>

            <NavLink to="/admin/products" onClick={onCloseMobile} className={navItemClass} title={isCollapsed ? 'Products' : undefined}>
              <Package className="w-4 h-4 shrink-0" />
              {!isCollapsed && <span>Products</span>}
            </NavLink>

            <NavLink to="/admin/orders" onClick={onCloseMobile} className={navItemClass} title={isCollapsed ? 'Orders' : undefined}>
              {({ isActive }) => (
                <>
                  <ShoppingBag className="w-4 h-4 shrink-0" />
                  {!isCollapsed && (
                    <>
                      <span>Orders</span>
                      {renderBadge(badges.pendingOrders, isActive)}
                    </>
                  )}
                </>
              )}
            </NavLink>

            <NavLink to="/admin/custom-requests" onClick={onCloseMobile} className={navItemClass} title={isCollapsed ? 'Custom Requests' : undefined}>
              {({ isActive }) => (
                <>
                  <CakeSlice className="w-4 h-4 shrink-0" />
                  {!isCollapsed && (
                    <>
                      <span>Custom Requests</span>
                      {renderBadge(badges.pendingRequests, isActive)}
                    </>
                  )}
                </>
              )}
            </NavLink>

            <NavLink to="/admin/courses" onClick={onCloseMobile} className={navItemClass} title={isCollapsed ? 'Courses' : undefined}>
              <GraduationCap className="w-4 h-4 shrink-0" />
              {!isCollapsed && <span>Courses</span>}
            </NavLink>

            <NavLink to="/admin/enrollments" onClick={onCloseMobile} className={navItemClass} title={isCollapsed ? 'Enrollments' : undefined}>
              <BookOpenCheck className="w-4 h-4 shrink-0" />
              {!isCollapsed && <span>Enrollments</span>}
            </NavLink>
          </div>
        </div>

        {/* Tools Section */}
        <div>
          {!isCollapsed && (
            <div className="px-3 pb-2 text-[10px] font-semibold uppercase tracking-wider text-stone-600 dark:text-stone-400">
              Tools
            </div>
          )}
          <div className="space-y-1">
            <NavLink to="/admin/calculator" onClick={onCloseMobile} className={navItemClass} title={isCollapsed ? 'Calculator' : undefined}>
              <Calculator className="w-4 h-4 shrink-0" />
              {!isCollapsed && <span>Calculator</span>}
            </NavLink>

            <NavLink to="/admin/media" onClick={onCloseMobile} className={navItemClass} title={isCollapsed ? 'Media' : undefined}>
              <ImageIcon className="w-4 h-4 shrink-0" />
              {!isCollapsed && <span>Media</span>}
            </NavLink>
          </div>
        </div>

        {/* System Section */}
        <div>
          {!isCollapsed && (
            <div className="px-3 pb-2 text-[10px] font-semibold uppercase tracking-wider text-stone-600 dark:text-stone-400">
              System
            </div>
          )}
          <div className="space-y-1">
            <NavLink to="/admin/notifications" onClick={onCloseMobile} className={navItemClass} title={isCollapsed ? 'Notifications' : undefined}>
              {({ isActive }) => (
                <>
                  <Bell className="w-4 h-4 shrink-0" />
                  {!isCollapsed && (
                    <>
                      <span>Notifications</span>
                      {renderBadge(badges.unreadNotifs, isActive)}
                    </>
                  )}
                </>
              )}
            </NavLink>

            <NavLink to="/admin/audit-logs" onClick={onCloseMobile} className={navItemClass} title={isCollapsed ? 'Audit Logs' : undefined}>
              <FileText className="w-4 h-4 shrink-0" />
              {!isCollapsed && <span>Audit Logs</span>}
            </NavLink>

            <NavLink to="/admin/settings" onClick={onCloseMobile} className={navItemClass} title={isCollapsed ? 'Settings' : undefined}>
              <Settings className="w-4 h-4 shrink-0" />
              {!isCollapsed && <span>Settings</span>}
            </NavLink>

            <NavLink to="/admin/profile" onClick={onCloseMobile} className={navItemClass} title={isCollapsed ? 'Admin Profile' : undefined}>
              <User className="w-4 h-4 shrink-0" />
              {!isCollapsed && <span>Admin Profile</span>}
            </NavLink>
          </div>
        </div>
      </nav>

      {/* Footer Info Box */}
      {!isCollapsed && (
        <div className="p-3 border-t border-stone-200 dark:border-stone-800 text-[11px] text-stone-600 dark:text-stone-400 flex items-center gap-2">
          <Sparkles className="w-3.5 h-3.5 text-amber-500 shrink-0" />
          <span className="truncate">Bakery Production v2.4</span>
        </div>
      )}
    </div>
  );

  return (
    <>
      {/* Desktop Sidebar */}
      <aside
        className={`hidden md:block shrink-0 sticky top-0 h-screen transition-all duration-200 z-30 ${
          isCollapsed ? 'w-16' : 'w-60'
        }`}
      >
        {content}
      </aside>

      {/* Mobile Drawer Backdrop */}
      {isMobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-stone-900/60 backdrop-blur-xs md:hidden"
          onClick={onCloseMobile}
        />
      )}

      {/* Mobile Drawer */}
      <div
        className={`fixed inset-y-0 left-0 z-50 w-64 transform transition-transform duration-200 ease-in-out md:hidden ${
          isMobileOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {content}
      </div>
    </>
  );
}
