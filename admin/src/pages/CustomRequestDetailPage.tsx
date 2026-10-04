import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { customRequestsApi } from '../api/customRequestsApi';
import { CustomCakeRequest, CustomRequestStatus } from '../types';
import { StatusBadge } from '../components/common/StatusBadge';
import { ImageWithFallback } from '../components/common/ImageWithFallback';
import { ConfirmDialog } from '../components/common/ConfirmDialog';
import { ErrorState } from '../components/common/ErrorState';
import { useToast } from '../context/ToastContext';
import {
  ArrowLeft,
  CakeSlice,
  User,
  CheckCircle2,
  XCircle,
  FileText,
  DollarSign,
  Loader2,
} from 'lucide-react';

export function CustomRequestDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { success, error: toastError } = useToast();

  const [request, setRequest] = useState<CustomCakeRequest | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Editable fields
  const [adminNotes, setAdminNotes] = useState('');
  const [estimatedCost, setEstimatedCost] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  // Status transitions
  const [confirmStatus, setConfirmStatus] = useState<CustomRequestStatus | null>(null);

  const fetchRequest = async () => {
    if (!id) return;
    setIsLoading(true);
    setError(null);
    try {
      const res = await customRequestsApi.getById(id);
      if (res.success && res.request) {
        setRequest(res.request);
        setAdminNotes(res.request.adminNotes || '');
        setEstimatedCost(res.request.estimatedCost ? String(res.request.estimatedCost) : '');
      }
    } catch (err: any) {
      setError(err.message || 'Failed to retrieve custom cake request');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchRequest();
  }, [id]);

  const handleUpdateStatus = async (newStatus: CustomRequestStatus) => {
    if (!id || !request) return;
    setIsSaving(true);
    try {
      const res = await customRequestsApi.updateStatus(
        id,
        newStatus,
        adminNotes.trim() || undefined,
        estimatedCost ? parseFloat(estimatedCost) : undefined
      );
      if (res.success) {
        success(`Request status updated to ${newStatus}`);
        setRequest(res.request);
        setConfirmStatus(null);
      }
    } catch (err: any) {
      toastError(err.message || 'Failed to update request');
    } finally {
      setIsSaving(false);
    }
  };

  const handleSaveNotesAndCost = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id || !request) return;
    setIsSaving(true);
    try {
      const res = await customRequestsApi.updateStatus(
        id,
        request.status,
        adminNotes.trim() || undefined,
        estimatedCost ? parseFloat(estimatedCost) : undefined
      );
      if (res.success) {
        success('Quote estimate and admin notes saved.');
        setRequest(res.request);
      }
    } catch (err: any) {
      toastError(err.message || 'Failed to save notes');
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="py-16 flex flex-col items-center justify-center gap-3">
        <Loader2 className="w-6 h-6 animate-spin text-amber-600" />
        <span className="text-xs text-stone-500">Loading custom cake specifications...</span>
      </div>
    );
  }

  if (error || !request) {
    return (
      <div className="py-8">
        <ErrorState message={error || 'Request not found'} onRetry={fetchRequest} />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-stone-200 dark:border-stone-800">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => navigate('/admin/custom-requests')}
            className="p-1.5 rounded-lg border border-stone-200 dark:border-stone-700 hover:bg-stone-100 dark:hover:bg-stone-800 text-stone-600 dark:text-stone-300 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg font-bold font-mono text-stone-900 dark:text-stone-100">
                {request.requestNumber}
              </h1>
              <StatusBadge status={request.status} />
            </div>
            <p className="text-[11px] text-stone-500 mt-0.5">
              Submitted on {new Date(request.createdAt).toLocaleString()}
            </p>
          </div>
        </div>

        {/* Workflow Action Buttons */}
        <div className="flex flex-wrap items-center gap-2">
          {request.status === 'pending' && (
            <>
              <button
                type="button"
                onClick={() => setConfirmStatus('approved')}
                disabled={isSaving}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold transition-colors"
              >
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Approve Request</span>
              </button>

              <button
                type="button"
                onClick={() => setConfirmStatus('rejected')}
                disabled={isSaving}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-rose-300 dark:border-rose-800 text-rose-700 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 text-xs font-semibold transition-colors"
              >
                <XCircle className="w-3.5 h-3.5" />
                <span>Decline Request</span>
              </button>
            </>
          )}

          {request.status === 'approved' && (
            <button
              type="button"
              onClick={() => setConfirmStatus('completed')}
              disabled={isSaving}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-stone-900 text-white dark:bg-stone-100 dark:text-stone-900 text-xs font-semibold hover:bg-stone-800 dark:hover:bg-stone-200 transition-colors"
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Mark as Delivered & Completed</span>
            </button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Cake Customization Details */}
        <div className="lg:col-span-2 space-y-6">
          {/* Cake Specs Card */}
          <div className="rounded-xl border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900 p-6 space-y-5">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-stone-400">
              Cake Architecture & Specifications
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div>
                <span className="text-[11px] text-stone-500">Base Product Model</span>
                <p className="font-semibold text-stone-900 dark:text-stone-100 mt-0.5">
                  {request.baseProduct}
                </p>
              </div>

              <div>
                <span className="text-[11px] text-stone-500">Sponge & Filling Flavor</span>
                <p className="font-semibold text-stone-900 dark:text-stone-100 mt-0.5">
                  {request.flavor}
                </p>
              </div>

              <div>
                <span className="text-[11px] text-stone-500">Tier Scale & Serving Estimate</span>
                <p className="font-semibold text-stone-900 dark:text-stone-100 mt-0.5">
                  {request.size}
                </p>
              </div>

              <div>
                <span className="text-[11px] text-stone-500">Current Lifecycle Status</span>
                <div className="mt-0.5">
                  <StatusBadge status={request.status} />
                </div>
              </div>
            </div>

            {/* Toppings List */}
            <div>
              <span className="text-[11px] text-stone-500 block mb-1.5">
                Requested Toppings & Botanical Accents
              </span>
              <div className="flex flex-wrap gap-2 text-xs">
                {request.toppings.map((top, idx) => (
                  <span
                    key={idx}
                    className="px-2.5 py-1 rounded-md bg-stone-100 dark:bg-stone-800 text-stone-800 dark:text-stone-200 font-medium"
                  >
                    {top}
                  </span>
                ))}
              </div>
            </div>

            {/* Special Inscriptions & Dietary notes */}
            <div>
              <span className="text-[11px] text-stone-500 block mb-1">
                Custom Inscriptions & Dietary Constraints
              </span>
              <div className="p-3.5 rounded-lg bg-amber-50/50 dark:bg-amber-950/20 border border-amber-200/60 dark:border-amber-900/40 text-xs text-stone-800 dark:text-stone-200 leading-relaxed font-sans">
                {request.specialInstructions || 'No custom inscription specified.'}
              </div>
            </div>

            {/* Reference Image Preview */}
            {request.referenceImage && (
              <div>
                <span className="text-[11px] text-stone-500 block mb-2">
                  Customer Reference Image
                </span>
                <div className="max-w-md h-56 rounded-xl overflow-hidden border border-stone-200 dark:border-stone-700 bg-stone-50 dark:bg-stone-800">
                  <ImageWithFallback
                    src={request.referenceImage}
                    alt="Customer inspiration reference"
                    fallbackTitle="Reference design inspiration"
                    aspectRatio="video"
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Pricing Quote & Admin Notes Form */}
          <div className="rounded-xl border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900 p-6">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-stone-400 mb-4">
              Quote Calculation & Production Notes
            </h3>

            <form onSubmit={handleSaveNotesAndCost} className="space-y-4 text-xs">
              <div>
                <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1">
                  Estimated Cost / Quote (AED)
                </label>
                <div className="relative max-w-xs">
                  <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-stone-400 font-mono text-xs">
                    AED
                  </span>
                  <input
                    type="number"
                    min="0"
                    step="5"
                    value={estimatedCost}
                    onChange={(e) => setEstimatedCost(e.target.value)}
                    placeholder="420"
                    className="w-full pl-12 pr-3 py-2 rounded-lg border border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-800 text-stone-900 dark:text-stone-100 font-mono font-bold focus:outline-none focus:ring-1 focus:ring-amber-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1">
                  Kitchen Notes & Schedule Confirmation
                </label>
                <textarea
                  rows={3}
                  value={adminNotes}
                  onChange={(e) => setAdminNotes(e.target.value)}
                  placeholder="e.g. Inscription stencil prepared; sponge base bake scheduled for Thursday morning."
                  className="w-full px-3 py-2 rounded-lg border border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-800 text-stone-900 dark:text-stone-100 focus:outline-none focus:ring-1 focus:ring-amber-500"
                />
              </div>

              <button
                type="submit"
                disabled={isSaving}
                className="px-4 py-2 rounded-lg bg-stone-900 text-white dark:bg-stone-100 dark:text-stone-900 font-semibold hover:bg-stone-800 dark:hover:bg-stone-200 transition-colors flex items-center gap-2"
              >
                {isSaving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : null}
                <span>Save Quote & Notes</span>
              </button>
            </form>
          </div>
        </div>

        {/* Right Column: Customer Information */}
        <div className="space-y-6">
          <div className="rounded-xl border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900 p-5 space-y-3">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-stone-400 flex items-center gap-1.5">
              <User className="w-3.5 h-3.5" />
              <span>Customer Patron</span>
            </h3>

            <div className="text-xs space-y-2">
              <div>
                <span className="text-[11px] text-stone-500">Full Name</span>
                <p className="font-semibold text-stone-900 dark:text-stone-100">{request.customerName}</p>
              </div>

              <div>
                <span className="text-[11px] text-stone-500">Email</span>
                <p className="font-mono text-stone-700 dark:text-stone-300">{request.customerEmail}</p>
              </div>

              <div>
                <span className="text-[11px] text-stone-500">Phone</span>
                <p className="font-mono text-stone-700 dark:text-stone-300">{request.customerPhone}</p>
              </div>

              <div className="pt-2">
                <Link
                  to={`/admin/users/${request.customerId}`}
                  className="text-[11px] text-amber-700 dark:text-amber-400 hover:underline font-medium"
                >
                  View Patron Profile →
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Confirmation Dialog */}
      <ConfirmDialog
        isOpen={Boolean(confirmStatus)}
        title={
          confirmStatus === 'approved'
            ? 'Approve Custom Cake Commission?'
            : confirmStatus === 'rejected'
            ? 'Decline Custom Cake Inquiry?'
            : 'Mark Request as Completed?'
        }
        message={
          confirmStatus === 'approved'
            ? `Customer ${request.customerName} will be notified of quote approval (AED ${estimatedCost || 'TBD'}).`
            : confirmStatus === 'rejected'
            ? 'The inquiry will be rejected and customer notified that kitchen capacity is unavailable.'
            : 'This indicates the custom cake was crafted, iced, and delivered.'
        }
        confirmLabel={
          confirmStatus === 'approved'
            ? 'Approve Cake'
            : confirmStatus === 'rejected'
            ? 'Decline'
            : 'Complete'
        }
        variant={confirmStatus === 'rejected' ? 'danger' : 'primary'}
        isLoading={isSaving}
        onConfirm={() => confirmStatus && handleUpdateStatus(confirmStatus)}
        onCancel={() => setConfirmStatus(null)}
      />
    </div>
  );
}
