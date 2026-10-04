import React, { useState, useRef, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import {
  Menu,
  Search,
  Bell,
  Sun,
  Moon,
  Laptop,
  LogOut,
  User,
  Settings,
  FileText,
  ChevronRight,
  CheckCircle2,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { notificationsApi } from '../../api/notificationsApi';
import { AdminNotification } from '../../types';
import { ImageWithFallback } from '../common/ImageWithFallback';

interface HeaderProps {
  onOpenMobileSidebar: () => void;
  onOpenSearch: () => void;
}

export function Header({ onOpenMobileSidebar, onOpenSearch }: HeaderProps) {
  const { user, logout, theme, setTheme } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [profileOpen, setProfileOpen] = useState(false);
  const [themeOpen, setThemeOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [notifications, setNotifications] = useState<AdminNotification[]>([]);

  const profileRef = useRef<HTMLDivElement>(null);
  const themeRef = useRef<HTMLDivElement>(null);
  const notifRef = useRef<HTMLDivElement>(null);

  // Close popups on click outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (profileRef.current && !profileRef.current.contains(event.target as Node)) {
        setProfileOpen(false);
      }
      if (themeRef.current && !themeRef.current.contains(event.target as Node)) {
        setThemeOpen(false);
      }
      if (notifRef.current && !notifRef.current.contains(event.target as Node)) {
        setNotifOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Fetch notifications
  useEffect(() => {
    async function loadNotifications() {
      try {
        const res = await notificationsApi.getAll();
        if (res.success) {
          setNotifications(res.notifications);
        }
      } catch {
        // quiet
      }
    }
    loadNotifications();
  }, []);

  const unreadCount = notifications.filter((n) => !n.read).length;

  const handleMarkAllRead = async () => {
    try {
      await notificationsApi.markAllAsRead();
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    } catch {
      // quiet
    }
  };

  const handleNotificationClick = async (notif: AdminNotification) => {
    if (!notif.read) {
      try {
        await notificationsApi.markAsRead(notif.id);
        setNotifications((prev) =>
          prev.map((n) => (n.id === notif.id ? { ...n, read: true } : n))
        );
      } catch {
        // quiet
      }
    }
    setNotifOpen(false);
    if (notif.link) {
      navigate(notif.link);
    }
  };

  // Generate breadcrumb items from location.pathname
  const generateBreadcrumbs = () => {
    const segments = location.pathname.split('/').filter(Boolean);
    if (segments.length === 0) return [{ label: 'Admin', path: '/admin/dashboard', isLast: true }];

    const breadcrumbs: { label: string; path: string; isLast: boolean }[] = [];
    let currentPath = '';

    segments.forEach((seg, index) => {
      currentPath += `/${seg}`;
      let label = seg.charAt(0).toUpperCase() + seg.slice(1).replace(/-/g, ' ');

      if (seg === 'admin') {
        label = 'Admin';
      } else if (seg.startsWith('ord_') || seg.startsWith('req_') || seg.startsWith('crs_') || seg.startsWith('usr_') || seg.startsWith('prod_')) {
        label = seg.toUpperCase();
      }

      breadcrumbs.push({
        label,
        path: currentPath === '/admin' ? '/admin/dashboard' : currentPath,
        isLast: index === segments.length - 1,
      });
    });

    return breadcrumbs;
  };

  const breadcrumbs = generateBreadcrumbs();

  return (
    <header className="sticky top-0 z-20 h-14 bg-white/95 dark:bg-stone-950/95 backdrop-blur-xs border-b border-stone-200 dark:border-stone-800 px-4 sm:px-6 flex items-center justify-between transition-colors">
      {/* Left Zone: Mobile toggle + Breadcrumb trail */}
      <div className="flex items-center gap-3 min-w-0">
        <button
          type="button"
          onClick={onOpenMobileSidebar}
          className="p-1.5 -ml-1 text-stone-500 hover:text-stone-900 dark:hover:text-stone-100 rounded-lg md:hidden hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors"
          aria-label="Open sidebar navigation"
        >
          <Menu className="w-5 h-5" />
        </button>

        {/* Breadcrumb Trail */}
        <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 text-xs text-stone-500 overflow-hidden">
          {breadcrumbs.map((crumb, idx) => (
            <React.Fragment key={`${crumb.path}_${idx}`}>
              {idx > 0 && <ChevronRight className="w-3.5 h-3.5 text-stone-400 shrink-0" />}
              {crumb.isLast ? (
                <span className="font-semibold text-stone-900 dark:text-stone-100 truncate">
                  {crumb.label}
                </span>
              ) : (
                <Link
                  to={crumb.path}
                  className="hover:text-stone-900 dark:hover:text-stone-100 transition-colors truncate"
                >
                  {crumb.label}
                </Link>
              )}
            </React.Fragment>
          ))}
        </nav>
      </div>

      {/* Right Zone: Search, Notifications, Theme, Profile */}
      <div className="flex items-center gap-2 sm:gap-3 shrink-0">
        {/* Quick Search Button */}
        <button
          type="button"
          onClick={onOpenSearch}
          className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg border border-stone-200 dark:border-stone-800 text-stone-500 hover:text-stone-900 dark:hover:text-stone-100 hover:border-stone-300 dark:hover:border-stone-700 bg-stone-50 dark:bg-stone-900 text-xs transition-colors shadow-2xs"
          title="Search bakery applet records (Cmd+K)"
        >
          <Search className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Search...</span>
          <kbd className="hidden sm:inline-block px-1 py-0.2 text-[9px] font-mono text-stone-400 bg-stone-200/60 dark:bg-stone-800 rounded">
            ⌘K
          </kbd>
        </button>

        {/* Notifications Dropdown */}
        <div className="relative" ref={notifRef}>
          <button
            type="button"
            onClick={() => setNotifOpen(!notifOpen)}
            className="relative p-1.5 text-stone-500 hover:text-stone-900 dark:hover:text-stone-100 rounded-lg hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors"
            aria-label="View notifications"
          >
            <Bell className="w-4 h-4" />
            {unreadCount > 0 && (
              <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-amber-600 ring-2 ring-white dark:ring-stone-950" />
            )}
          </button>

          {notifOpen && (
            <div className="absolute right-0 mt-2 w-80 sm:w-96 rounded-xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 shadow-xl p-3 z-50 animate-in fade-in duration-100">
              <div className="flex items-center justify-between pb-2 border-b border-stone-100 dark:border-stone-800">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-semibold text-stone-900 dark:text-stone-100">Notifications</span>
                  {unreadCount > 0 && (
                    <span className="px-1.5 py-0.2 text-[10px] font-mono bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 rounded font-semibold">
                      {unreadCount} unread
                    </span>
                  )}
                </div>
                {unreadCount > 0 && (
                  <button
                    type="button"
                    onClick={handleMarkAllRead}
                    className="text-[11px] text-amber-600 dark:text-amber-400 hover:underline"
                  >
                    Mark all read
                  </button>
                )}
              </div>

              <div className="max-h-72 overflow-y-auto divide-y divide-stone-100 dark:divide-stone-800/60 mt-1">
                {notifications.length === 0 ? (
                  <div className="py-6 text-center text-xs text-stone-400">No notifications</div>
                ) : (
                  notifications.map((n) => (
                    <button
                      key={n.id}
                      type="button"
                      onClick={() => handleNotificationClick(n)}
                      className={`w-full text-left py-2.5 px-2 rounded-lg text-xs transition-colors flex items-start gap-2.5 ${
                        !n.read
                          ? 'bg-amber-50/50 dark:bg-amber-950/20 font-medium'
                          : 'hover:bg-stone-50 dark:hover:bg-stone-800/50 text-stone-600 dark:text-stone-400'
                      }`}
                    >
                      <div className="mt-0.5">
                        <CheckCircle2
                          className={`w-3.5 h-3.5 ${
                            !n.read ? 'text-amber-600 dark:text-amber-400' : 'text-stone-300 dark:text-stone-600'
                          }`}
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-stone-900 dark:text-stone-100 font-semibold truncate text-[11.5px]">
                          {n.title}
                        </div>
                        <div className="text-[11px] text-stone-500 dark:text-stone-400 line-clamp-2 mt-0.5">
                          {n.message}
                        </div>
                        <div className="text-[10px] text-stone-400 mt-1">
                          {new Date(n.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </div>
                      </div>
                    </button>
                  ))
                )}
              </div>

              <div className="pt-2 border-t border-stone-100 dark:border-stone-800 text-center">
                <Link
                  to="/admin/notifications"
                  onClick={() => setNotifOpen(false)}
                  className="text-xs text-amber-600 dark:text-amber-400 font-medium hover:underline"
                >
                  View all notifications
                </Link>
              </div>
            </div>
          )}
        </div>

        {/* Theme Selector Toggle */}
        <div className="relative" ref={themeRef}>
          <button
            type="button"
            onClick={() => setThemeOpen(!themeOpen)}
            className="p-1.5 text-stone-500 hover:text-stone-900 dark:hover:text-stone-100 rounded-lg hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors"
            title="Appearance mode"
            aria-label="Appearance mode"
          >
            {theme === 'dark' ? (
              <Moon className="w-4 h-4" />
            ) : theme === 'light' ? (
              <Sun className="w-4 h-4" />
            ) : (
              <Laptop className="w-4 h-4" />
            )}
          </button>

          {themeOpen && (
            <div className="absolute right-0 mt-2 w-36 rounded-lg bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 shadow-lg p-1 z-50 text-xs">
              <button
                type="button"
                onClick={() => {
                  setTheme('light');
                  setThemeOpen(false);
                }}
                className={`w-full flex items-center gap-2 px-2.5 py-1.5 rounded-md text-left transition-colors ${
                  theme === 'light'
                    ? 'bg-amber-50 dark:bg-amber-950/60 text-amber-800 dark:text-amber-200 font-semibold'
                    : 'text-stone-700 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-800'
                }`}
              >
                <Sun className="w-3.5 h-3.5" />
                <span>Light</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  setTheme('dark');
                  setThemeOpen(false);
                }}
                className={`w-full flex items-center gap-2 px-2.5 py-1.5 rounded-md text-left transition-colors ${
                  theme === 'dark'
                    ? 'bg-amber-50 dark:bg-amber-950/60 text-amber-800 dark:text-amber-200 font-semibold'
                    : 'text-stone-700 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-800'
                }`}
              >
                <Moon className="w-3.5 h-3.5" />
                <span>Dark</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  setTheme('system');
                  setThemeOpen(false);
                }}
                className={`w-full flex items-center gap-2 px-2.5 py-1.5 rounded-md text-left transition-colors ${
                  theme === 'system'
                    ? 'bg-amber-50 dark:bg-amber-950/60 text-amber-800 dark:text-amber-200 font-semibold'
                    : 'text-stone-700 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-800'
                }`}
              >
                <Laptop className="w-3.5 h-3.5" />
                <span>System</span>
              </button>
            </div>
          )}
        </div>

        {/* Admin Profile Dropdown */}
        <div className="relative" ref={profileRef}>
          <button
            type="button"
            onClick={() => setProfileOpen(!profileOpen)}
            className="flex items-center gap-2 p-1 rounded-lg hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors focus:outline-none"
            aria-label="Admin profile menu"
          >
            <div className="w-7 h-7 rounded-full overflow-hidden border border-stone-200 dark:border-stone-700">
              <ImageWithFallback
                src={user?.avatar}
                alt={user?.name || 'Admin'}
                className="w-full h-full object-cover"
                aspectRatio="square"
              />
            </div>
            <div className="hidden lg:flex flex-col text-left">
              <span className="text-xs font-semibold text-stone-900 dark:text-stone-100 leading-none">
                {user?.name || 'Administrator'}
              </span>
              <span className="text-[10px] text-stone-600 dark:text-stone-400 capitalize mt-0.5">
                {user?.role || 'admin'}
              </span>
            </div>
          </button>

          {profileOpen && (
            <div className="absolute right-0 mt-2 w-52 rounded-xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 shadow-xl p-1.5 z-50 text-xs">
              <div className="px-3 py-2 border-b border-stone-100 dark:border-stone-800 mb-1">
                <div className="font-semibold text-stone-900 dark:text-stone-100 truncate">{user?.name}</div>
                <div className="text-[11px] text-stone-500 truncate">{user?.email}</div>
              </div>

              <Link
                to="/admin/profile"
                onClick={() => setProfileOpen(false)}
                className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-stone-700 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors"
              >
                <User className="w-3.5 h-3.5 text-stone-500" />
                <span>Admin Profile</span>
              </Link>

              <Link
                to="/admin/settings"
                onClick={() => setProfileOpen(false)}
                className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-stone-700 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors"
              >
                <Settings className="w-3.5 h-3.5 text-stone-500" />
                <span>Application Settings</span>
              </Link>

              <Link
                to="/admin/audit-logs"
                onClick={() => setProfileOpen(false)}
                className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-stone-700 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors"
              >
                <FileText className="w-3.5 h-3.5 text-stone-500" />
                <span>Audit Logs</span>
              </Link>

              <div className="my-1 border-t border-stone-100 dark:border-stone-800" />

              <button
                type="button"
                onClick={() => {
                  setProfileOpen(false);
                  logout('You have been logged out.');
                }}
                className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors text-left"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Log Out</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
