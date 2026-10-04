import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { usersApi } from '../api/usersApi';
import { UserDetail, AccountStatus } from '../types';
import { StatusBadge } from '../components/common/StatusBadge';
import { ImageWithFallback } from '../components/common/ImageWithFallback';
import { ErrorState } from '../components/common/ErrorState';
import { ConfirmDialog } from '../components/common/ConfirmDialog';
import { useToast } from '../context/ToastContext';
import {
  ArrowLeft,
  Mail,
  Phone,
  Calendar,
  Shield,
  ShoppingBag,
  Heart,
  GraduationCap,
  CakeSlice,
  CheckCircle2,
  Ban,
  ArrowUpRight,
  Loader2,
} from 'lucide-react';

export function UserDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { success, error: toastError } = useToast();

  const [detail, setDetail] = useState<UserDetail | null>(null);
  const [activeTab, setActiveTab] = useState<'orders' | 'wishlist' | 'courses' | 'requests'>('orders');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Status toggle confirmation
  const [statusConfirmOpen, setStatusConfirmOpen] = useState(false);
  const [pendingStatus, setPendingStatus] = useState<AccountStatus>('active');
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);

  const fetchUserDetail = async () => {
    if (!id) return;
    setIsLoading(true);
    setError(null);
    try {
      const res = await usersApi.getById(id);
      if (res.success) {
        setDetail(res);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to retrieve patron record');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchUserDetail();
  }, [id]);

  const handleToggleStatus = (target: AccountStatus) => {
    setPendingStatus(target);
    setStatusConfirmOpen(true);
  };

  const confirmStatusUpdate = async () => {
    if (!id || !detail) return;
    setIsUpdatingStatus(true);
    try {
      const res = await usersApi.updateStatus(id, pendingStatus);
      if (res.success) {
        success(`User account status updated to ${pendingStatus}`);
        setDetail({
          ...detail,
          user: { ...detail.user, status: pendingStatus },
        });
        setStatusConfirmOpen(false);
      }
    } catch (err: any) {
      toastError(err.message || 'Failed to change account status');
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  if (isLoading) {
    return (
      <div className="py-16 flex flex-col items-center justify-center gap-3">
        <Loader2 className="w-6 h-6 animate-spin text-amber-600" />
        <span className="text-xs text-stone-500">Loading patron profile...</span>
      </div>
    );
  }

  if (error || !detail) {
    return (
      <div className="py-8">
        <ErrorState message={error || 'User not found'} onRetry={fetchUserDetail} />
      </div>
    );
  }

  const { user, orders, wishlist, enrollments, customRequests } = detail;

  return (
    <div className="space-y-6">
      {/* Back button */}
      <div>
        <button
          type="button"
          onClick={() => navigate('/admin/users')}
          className="inline-flex items-center gap-1.5 text-xs text-stone-500 hover:text-stone-900 dark:hover:text-stone-100 transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Users</span>
        </button>
      </div>

      {/* User Profile Summary Card */}
      <div className="p-6 rounded-xl border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900 shadow-2xs">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-stone-200 dark:border-stone-700 shrink-0">
              <ImageWithFallback
                src={user.avatar}
                alt={user.name}
                aspectRatio="square"
                className="w-full h-full object-cover"
              />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-lg font-bold text-stone-900 dark:text-stone-100 font-sans">
                  {user.name}
                </h1>
                <StatusBadge status={user.status} />
              </div>
              <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-1 text-xs text-stone-500 font-mono">
                <span className="flex items-center gap-1">
                  <Mail className="w-3.5 h-3.5 text-stone-400" />
                  {user.email}
                </span>
                {user.phone && (
                  <span className="flex items-center gap-1">
                    <Phone className="w-3.5 h-3.5 text-stone-400" />
                    {user.phone}
                  </span>
                )}
              </div>
              <div className="flex items-center gap-3 mt-2 text-[11px] text-stone-400">
                <span className="capitalize font-medium text-stone-600 dark:text-stone-400">
                  Role: {user.role}
                </span>
                <span>·</span>
                <span>
                  Member since{' '}
                  {new Date(user.createdAt).toLocaleDateString([], {
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric',
                  })}
                </span>
              </div>
            </div>
          </div>

          {/* Account Status Actions */}
          <div className="flex items-center gap-2 self-stretch sm:self-auto">
            {user.status === 'active' ? (
              <button
                type="button"
                onClick={() => handleToggleStatus('suspended')}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-rose-200 dark:border-rose-900 text-rose-700 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/60 text-xs font-medium transition-colors"
              >
                <Ban className="w-3.5 h-3.5" />
                <span>Suspend Account</span>
              </button>
            ) : (
              <button
                type="button"
                onClick={() => handleToggleStatus('active')}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-emerald-200 dark:border-emerald-900 text-emerald-700 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-950/60 text-xs font-medium transition-colors"
              >
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Reactivate Account</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="border-b border-stone-200 dark:border-stone-800 flex items-center gap-2 overflow-x-auto text-xs font-medium">
        <button
          type="button"
          onClick={() => setActiveTab('orders')}
          className={`flex items-center gap-2 px-4 py-2.5 border-b-2 font-medium transition-colors whitespace-nowrap ${
            activeTab === 'orders'
              ? 'border-amber-600 text-amber-700 dark:text-amber-400 font-semibold'
              : 'border-transparent text-stone-500 hover:text-stone-900 dark:hover:text-stone-200'
          }`}
        >
          <ShoppingBag className="w-3.5 h-3.5" />
          <span>Order History ({orders.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('requests')}
          className={`flex items-center gap-2 px-4 py-2.5 border-b-2 font-medium transition-colors whitespace-nowrap ${
            activeTab === 'requests'
              ? 'border-amber-600 text-amber-700 dark:text-amber-400 font-semibold'
              : 'border-transparent text-stone-500 hover:text-stone-900 dark:hover:text-stone-200'
          }`}
        >
          <CakeSlice className="w-3.5 h-3.5" />
          <span>Custom Cake Requests ({customRequests.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('courses')}
          className={`flex items-center gap-2 px-4 py-2.5 border-b-2 font-medium transition-colors whitespace-nowrap ${
            activeTab === 'courses'
              ? 'border-amber-600 text-amber-700 dark:text-amber-400 font-semibold'
              : 'border-transparent text-stone-500 hover:text-stone-900 dark:hover:text-stone-200'
          }`}
        >
          <GraduationCap className="w-3.5 h-3.5" />
          <span>Course Enrollments ({enrollments.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('wishlist')}
          className={`flex items-center gap-2 px-4 py-2.5 border-b-2 font-medium transition-colors whitespace-nowrap ${
            activeTab === 'wishlist'
              ? 'border-amber-600 text-amber-700 dark:text-amber-400 font-semibold'
              : 'border-transparent text-stone-500 hover:text-stone-900 dark:hover:text-stone-200'
          }`}
        >
          <Heart className="w-3.5 h-3.5" />
          <span>Saved Wishlist ({wishlist.length})</span>
        </button>
      </div>

      {/* Tab Panels */}
      <div className="rounded-xl border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900 p-5">
        {/* Orders Tab */}
        {activeTab === 'orders' && (
          <div>
            <h3 className="text-xs font-semibold uppercase tracking-wider text-stone-400 mb-3">
              Order Transactions
            </h3>
            {orders.length === 0 ? (
              <p className="text-xs text-stone-400 py-6 text-center">No orders placed by this customer yet.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="border-b border-stone-100 dark:border-stone-800 text-[11px] text-stone-400 uppercase">
                      <th className="py-2.5 px-3">Order ID</th>
                      <th className="py-2.5 px-3">Date</th>
                      <th className="py-2.5 px-3">Items</th>
                      <th className="py-2.5 px-3 text-right">Total</th>
                      <th className="py-2.5 px-3">Status</th>
                      <th className="py-2.5 px-3 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-stone-100 dark:divide-stone-800/60">
                    {orders.map((o) => (
                      <tr key={o.id} className="hover:bg-stone-50/60 dark:hover:bg-stone-800/40">
                        <td className="py-3 px-3 font-mono font-semibold text-stone-900 dark:text-stone-100">
                          {o.orderNumber}
                        </td>
                        <td className="py-3 px-3 text-stone-500">
                          {new Date(o.createdAt).toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' })}
                        </td>
                        <td className="py-3 px-3 text-stone-600 dark:text-stone-400">
                          {o.items.map((it) => it.title).join(', ')}
                        </td>
                        <td className="py-3 px-3 font-mono font-semibold text-stone-900 dark:text-stone-100 text-right tabular-nums">
                          AED {o.grandTotal.toFixed(2)}
                        </td>
                        <td className="py-3 px-3">
                          <StatusBadge status={o.status} />
                        </td>
                        <td className="py-3 px-3 text-right">
                          <Link
                            to={`/admin/orders/${o.id}`}
                            className="inline-flex items-center gap-1 text-[11px] text-amber-700 dark:text-amber-400 hover:underline font-medium"
                          >
                            <span>Inspect</span>
                            <ArrowUpRight className="w-3 h-3" />
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* Custom Cake Requests Tab */}
        {activeTab === 'requests' && (
          <div>
            <h3 className="text-xs font-semibold uppercase tracking-wider text-stone-400 mb-3">
              Custom Cake Inquiries
            </h3>
            {customRequests.length === 0 ? (
              <p className="text-xs text-stone-400 py-6 text-center">No custom cake requests submitted by this customer.</p>
            ) : (
              <div className="space-y-3">
                {customRequests.map((r) => (
                  <div
                    key={r.id}
                    className="p-4 rounded-lg border border-stone-200 dark:border-stone-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-semibold text-xs text-stone-900 dark:text-stone-100">
                          {r.requestNumber}
                        </span>
                        <StatusBadge status={r.status} />
                      </div>
                      <p className="text-xs font-medium text-stone-800 dark:text-stone-200 mt-1">
                        {r.baseProduct} · {r.flavor} ({r.size})
                      </p>
                      <p className="text-[11px] text-stone-500 mt-0.5">
                        Toppings: {r.toppings.join(', ')}
                      </p>
                    </div>
                    <Link
                      to={`/admin/custom-requests/${r.id}`}
                      className="px-3 py-1.5 text-xs font-medium rounded-lg border border-stone-200 dark:border-stone-700 hover:bg-stone-50 dark:hover:bg-stone-800 transition-colors"
                    >
                      View Request
                    </Link>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Course Enrollments Tab */}
        {activeTab === 'courses' && (
          <div>
            <h3 className="text-xs font-semibold uppercase tracking-wider text-stone-400 mb-3">
              Culinary School Enrollments
            </h3>
            {enrollments.length === 0 ? (
              <p className="text-xs text-stone-400 py-6 text-center">Not enrolled in any culinary masterclasses.</p>
            ) : (
              <div className="space-y-3">
                {enrollments.map((e) => (
                  <div
                    key={e.id}
                    className="p-4 rounded-lg border border-stone-200 dark:border-stone-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-10 rounded-md overflow-hidden shrink-0 border border-stone-200 dark:border-stone-700">
                        <ImageWithFallback
                          src={e.courseThumbnail}
                          alt={e.courseTitle}
                          aspectRatio="4/3"
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div>
                        <h4 className="text-xs font-semibold text-stone-900 dark:text-stone-100">
                          {e.courseTitle}
                        </h4>
                        <p className="text-[11px] text-stone-500">
                          Enrolled on {new Date(e.enrollmentDate).toLocaleDateString()}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-4 w-full sm:w-auto">
                      <div className="w-full sm:w-36">
                        <div className="flex justify-between text-[10px] font-mono text-stone-500 mb-1">
                          <span>Progress</span>
                          <span>{e.progress}%</span>
                        </div>
                        <div className="w-full h-1.5 bg-stone-100 dark:bg-stone-800 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-amber-600 rounded-full transition-all duration-300"
                            style={{ width: `${e.progress}%` }}
                          />
                        </div>
                      </div>
                      <StatusBadge status={e.status} />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Wishlist Tab */}
        {activeTab === 'wishlist' && (
          <div>
            <h3 className="text-xs font-semibold uppercase tracking-wider text-stone-400 mb-3">
              Saved Products & Favorites
            </h3>
            {wishlist.length === 0 ? (
              <p className="text-xs text-stone-400 py-6 text-center">Wishlist is currently empty.</p>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {wishlist.map((p) => (
                  <div
                    key={p.id}
                    className="p-3 rounded-lg border border-stone-200 dark:border-stone-800 flex items-center gap-3"
                  >
                    <div className="w-12 h-12 rounded-lg overflow-hidden border border-stone-200 dark:border-stone-700 shrink-0">
                      <ImageWithFallback
                        src={p.image}
                        alt={p.title}
                        aspectRatio="square"
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="min-w-0">
                      <h4 className="text-xs font-semibold text-stone-900 dark:text-stone-100 truncate">
                        {p.title}
                      </h4>
                      <p className="text-[11px] text-stone-500">{p.category}</p>
                      <p className="text-xs font-mono font-bold text-stone-900 dark:text-stone-100 mt-0.5">
                        AED {p.price}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Confirmation Dialog for status update */}
      <ConfirmDialog
        isOpen={statusConfirmOpen}
        title={pendingStatus === 'suspended' ? 'Suspend Patron Account?' : 'Reactivate Patron Account?'}
        message={
          pendingStatus === 'suspended'
            ? 'Suspended accounts cannot place orders or enroll in courses. Existing historical orders will remain intact.'
            : 'Reactivating this account restores active purchasing and course participation privileges.'
        }
        confirmLabel={pendingStatus === 'suspended' ? 'Suspend Account' : 'Reactivate Account'}
        variant={pendingStatus === 'suspended' ? 'danger' : 'primary'}
        isLoading={isUpdatingStatus}
        onConfirm={confirmStatusUpdate}
        onCancel={() => setStatusConfirmOpen(false)}
      />
    </div>
  );
}
