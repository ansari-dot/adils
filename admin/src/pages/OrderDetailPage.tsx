import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ordersApi } from '../api/ordersApi';
import { Order, OrderStatus } from '../types';
import { StatusBadge } from '../components/common/StatusBadge';
import { ImageWithFallback } from '../components/common/ImageWithFallback';
import { ConfirmDialog } from '../components/common/ConfirmDialog';
import { ErrorState } from '../components/common/ErrorState';
import { useToast } from '../context/ToastContext';
import {
  ArrowLeft,
  ShoppingBag,
  User,
  MapPin,
  CreditCard,
  Clock,
  CheckCircle2,
  AlertTriangle,
  Loader2,
  Calendar,
  FileText,
} from 'lucide-react';

const STATUS_OPTIONS: OrderStatus[] = ['pending', 'processing', 'completed', 'cancelled'];

export function OrderDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { success, error: toastError } = useToast();

  const [order, setOrder] = useState<Order | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Status update
  const [selectedStatus, setSelectedStatus] = useState<OrderStatus>('pending');
  const [statusNote, setStatusNote] = useState('');
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);
  const [cancelConfirmOpen, setCancelConfirmOpen] = useState(false);

  const fetchOrder = async () => {
    if (!id) return;
    setIsLoading(true);
    setError(null);
    try {
      const res = await ordersApi.getById(id);
      if (res.success && res.order) {
        setOrder(res.order);
        setSelectedStatus(res.order.status);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to retrieve order details');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchOrder();
  }, [id]);

  const handleStatusChangeRequest = (newStatus: OrderStatus) => {
    if (newStatus === 'cancelled') {
      setCancelConfirmOpen(true);
    } else {
      performStatusUpdate(newStatus);
    }
  };

  const performStatusUpdate = async (newStatus: OrderStatus) => {
    if (!id || !order) return;
    setIsUpdatingStatus(true);
    try {
      const res = await ordersApi.updateStatus(id, newStatus, statusNote || undefined);
      if (res.success) {
        success(`Order status updated to ${newStatus}`);
        setOrder(res.order);
        setSelectedStatus(res.order.status);
        setStatusNote('');
        setCancelConfirmOpen(false);
      }
    } catch (err: any) {
      toastError(err.message || 'Failed to update order status');
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  if (isLoading) {
    return (
      <div className="py-16 flex flex-col items-center justify-center gap-3">
        <Loader2 className="w-6 h-6 animate-spin text-amber-600" />
        <span className="text-xs text-stone-500">Loading order invoice...</span>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="py-8">
        <ErrorState message={error || 'Order not found'} onRetry={fetchOrder} />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Top Navigation */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-stone-200 dark:border-stone-800">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => navigate('/admin/orders')}
            className="p-1.5 rounded-lg border border-stone-200 dark:border-stone-700 hover:bg-stone-100 dark:hover:bg-stone-800 text-stone-600 dark:text-stone-300 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg font-bold font-mono text-stone-900 dark:text-stone-100">
                {order.orderNumber}
              </h1>
              <StatusBadge status={order.status} />
            </div>
            <p className="text-[11px] text-stone-500 mt-0.5">
              Placed on {new Date(order.createdAt).toLocaleString()}
            </p>
          </div>
        </div>

        {/* Status Control Toolbar */}
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-stone-700 dark:text-stone-300">
            Fulfillment Status:
          </span>
          <select
            value={selectedStatus}
            disabled={isUpdatingStatus}
            onChange={(e) => handleStatusChangeRequest(e.target.value as OrderStatus)}
            className="px-3 py-1.5 rounded-lg text-xs font-medium border border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-800 text-stone-900 dark:text-stone-100 focus:outline-none capitalize"
          >
            {STATUS_OPTIONS.map((st) => (
              <option key={st} value={st}>
                {st.charAt(0).toUpperCase() + st.slice(1)}
              </option>
            ))}
          </select>
          {isUpdatingStatus && <Loader2 className="w-4 h-4 animate-spin text-amber-600" />}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Order Items & Financial Summary */}
        <div className="lg:col-span-2 space-y-6">
          {/* Items Card */}
          <div className="rounded-xl border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900 p-5">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-stone-400 mb-4">
              Ordered Bakery Items ({order.items.length})
            </h3>

            <div className="divide-y divide-stone-100 dark:divide-stone-800/60">
              {order.items.map((item, idx) => (
                <div key={idx} className="py-3 flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-lg overflow-hidden border border-stone-200 dark:border-stone-700 shrink-0">
                      <ImageWithFallback
                        src={item.image}
                        alt={item.title}
                        aspectRatio="square"
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div>
                      <h4 className="text-xs font-semibold text-stone-900 dark:text-stone-100">
                        {item.title}
                      </h4>
                      <p className="text-[11px] text-stone-500">Baker: {item.baker}</p>
                      <p className="text-[11px] text-stone-500 font-mono">
                        AED {item.price.toFixed(2)} × {item.quantity}
                      </p>
                    </div>
                  </div>

                  <div className="text-right font-mono font-bold text-xs text-stone-900 dark:text-stone-100 tabular-nums">
                    AED {item.subtotal.toFixed(2)}
                  </div>
                </div>
              ))}
            </div>

            {/* Financial Summary */}
            <div className="mt-6 pt-4 border-t border-stone-100 dark:border-stone-800 space-y-2 text-xs">
              <div className="flex justify-between text-stone-600 dark:text-stone-400">
                <span>Items Subtotal</span>
                <span className="font-mono">AED {order.subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-stone-600 dark:text-stone-400">
                <span>Standard Delivery Fee</span>
                <span className="font-mono">AED {order.deliveryFee.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-stone-600 dark:text-stone-400">
                <span>Value Added Tax (5% VAT)</span>
                <span className="font-mono">AED {order.tax.toFixed(2)}</span>
              </div>

              <div className="pt-3 border-t border-stone-200 dark:border-stone-700 flex justify-between items-baseline">
                <span className="text-sm font-bold text-stone-900 dark:text-stone-100">Grand Total</span>
                <span className="text-xl font-bold font-mono text-stone-900 dark:text-stone-100 tabular-nums">
                  AED {order.grandTotal.toFixed(2)}
                </span>
              </div>
            </div>
          </div>

          {/* Status Timeline History */}
          <div className="rounded-xl border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900 p-5">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-stone-400 mb-4">
              Status Progression History
            </h3>

            <div className="space-y-4">
              {order.statusHistory.map((step, idx) => (
                <div key={idx} className="flex items-start gap-3 relative">
                  {idx !== order.statusHistory.length - 1 && (
                    <div className="absolute left-2.5 top-6 bottom-0 w-0.5 bg-stone-200 dark:bg-stone-800 -mb-4" />
                  )}
                  <div className="w-5 h-5 rounded-full bg-amber-100 dark:bg-amber-950/80 text-amber-700 dark:text-amber-400 flex items-center justify-center shrink-0 mt-0.5">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-semibold uppercase text-stone-800 dark:text-stone-200">
                        {step.status}
                      </span>
                      <span className="text-[10px] font-mono text-stone-400">
                        {new Date(step.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                    {step.note && (
                      <p className="text-[11px] text-stone-500 mt-0.5">{step.note}</p>
                    )}
                    {step.adminName && (
                      <p className="text-[10px] text-stone-400 mt-0.5 font-medium">
                        By {step.adminName}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: Customer Info & Shipping Address */}
        <div className="space-y-6">
          {/* Customer Information */}
          <div className="rounded-xl border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900 p-5">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-stone-400 mb-3 flex items-center gap-1.5">
              <User className="w-3.5 h-3.5" />
              <span>Customer Details</span>
            </h3>

            <div className="space-y-2 text-xs">
              <div>
                <span className="text-[11px] text-stone-400">Customer Name</span>
                <p className="font-semibold text-stone-900 dark:text-stone-100">
                  {order.customerName}
                </p>
              </div>

              <div>
                <span className="text-[11px] text-stone-400">Email Address</span>
                <p className="font-mono text-stone-700 dark:text-stone-300 truncate">
                  {order.customerEmail}
                </p>
              </div>

              <div>
                <span className="text-[11px] text-stone-400">Contact Telephone</span>
                <p className="font-mono text-stone-700 dark:text-stone-300">
                  {order.customerPhone}
                </p>
              </div>

              <div className="pt-2">
                <Link
                  to={`/admin/users/${order.customerId}`}
                  className="text-[11px] text-amber-700 dark:text-amber-400 hover:underline font-medium"
                >
                  Inspect Full Patron Profile →
                </Link>
              </div>
            </div>
          </div>

          {/* Shipping Address */}
          <div className="rounded-xl border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900 p-5">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-stone-400 mb-3 flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5" />
              <span>Shipping Destination</span>
            </h3>

            <div className="space-y-1 text-xs text-stone-700 dark:text-stone-300 leading-relaxed">
              <p className="font-semibold text-stone-900 dark:text-stone-100">
                {order.shippingAddress.fullName}
              </p>
              <p>{order.shippingAddress.address}</p>
              <p>
                {order.shippingAddress.city}, {order.shippingAddress.state} {order.shippingAddress.postalCode}
              </p>
              <p className="font-medium text-stone-800 dark:text-stone-200">
                {order.shippingAddress.country}
              </p>
              <p className="font-mono text-[11px] text-stone-500 pt-1">
                Recipient Contact: {order.shippingAddress.phone}
              </p>
            </div>
          </div>

          {/* Payment Status */}
          <div className="rounded-xl border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900 p-5">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-stone-400 mb-3 flex items-center gap-1.5">
              <CreditCard className="w-3.5 h-3.5" />
              <span>Payment Information</span>
            </h3>

            <div className="space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-stone-500">Method</span>
                <span className="font-medium text-stone-900 dark:text-stone-100">
                  {order.paymentMethod}
                </span>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-stone-500">Payment Status</span>
                <span
                  className={`capitalize font-semibold text-[11px] px-2 py-0.5 rounded ${
                    order.paymentStatus === 'paid'
                      ? 'bg-emerald-50 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                      : 'bg-stone-100 text-stone-600 dark:bg-stone-800'
                  }`}
                >
                  {order.paymentStatus}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Cancellation Confirmation Dialog */}
      <ConfirmDialog
        isOpen={cancelConfirmOpen}
        title="Cancel Order Confirmation"
        message={`Are you sure you want to cancel ${order.orderNumber}? If payment has been settled, a refund must be processed according to store policy.`}
        confirmLabel="Confirm Cancellation"
        variant="danger"
        isLoading={isUpdatingStatus}
        onConfirm={() => performStatusUpdate('cancelled')}
        onCancel={() => {
          setSelectedStatus(order.status);
          setCancelConfirmOpen(false);
        }}
      />
    </div>
  );
}
