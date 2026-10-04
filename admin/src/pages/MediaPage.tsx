import React, { useEffect, useState } from 'react';
import { mediaApi } from '../api/mediaApi';
import { MediaItem } from '../types';
import { ImageWithFallback } from '../components/common/ImageWithFallback';
import { ConfirmDialog } from '../components/common/ConfirmDialog';
import { EmptyState } from '../components/common/EmptyState';
import { ErrorState } from '../components/common/ErrorState';
import { useToast } from '../context/ToastContext';
import {
  Image as ImageIcon,
  Upload,
  Copy,
  Trash2,
  Check,
  Plus,
  Loader2,
  X,
} from 'lucide-react';

export function MediaPage() {
  const { success, error: toastError } = useToast();

  const [media, setMedia] = useState<MediaItem[]>([]);
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Upload modal
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [mediaName, setMediaName] = useState('');
  const [mediaUrl, setMediaUrl] = useState('');
  const [mediaCategory, setMediaCategory] = useState<'product' | 'course' | 'avatar' | 'banner'>('product');
  const [isUploading, setIsUploading] = useState(false);

  // Copied state
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Delete modal
  const [deleteCandidate, setDeleteCandidate] = useState<MediaItem | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const fetchMedia = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await mediaApi.getAll({
        category: categoryFilter !== 'all' ? categoryFilter : undefined,
      });
      if (res.success && Array.isArray(res.media)) {
        setMedia(res.media.filter((item): item is MediaItem => Boolean(item && (item.url || item.id))));
      } else {
        setMedia([]);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to retrieve media library');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchMedia();
  }, [categoryFilter]);

  const handleCopy = (item: MediaItem) => {
    if (!item?.url) return;
    navigator.clipboard.writeText(item.url);
    setCopiedId(item.id);
    success('Media URL copied to clipboard');
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleUploadSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!mediaName.trim() || !mediaUrl.trim()) {
      toastError('Name and URL are required.');
      return;
    }

    setIsUploading(true);
    try {
      const res = await mediaApi.upload({
        name: mediaName.trim(),
        url: mediaUrl.trim(),
        category: mediaCategory,
      });
      if (res.success && res.media) {
        success('Media asset registered successfully.');
        setMedia((prev) => [res.media, ...prev]);
        setIsUploadModalOpen(false);
        setMediaName('');
        setMediaUrl('');
      }
    } catch (err: any) {
      toastError(err.message || 'Failed to upload media');
    } finally {
      setIsUploading(false);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deleteCandidate) return;
    setIsDeleting(true);
    try {
      const res = await mediaApi.delete(deleteCandidate.id);
      if (res.success) {
        success('Media asset removed.');
        setMedia((prev) => prev.filter((m) => m.id !== deleteCandidate.id));
        setDeleteCandidate(null);
      }
    } catch (err: any) {
      toastError(err.message || 'Failed to delete media');
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="space-y-5">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-1">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-stone-900 dark:text-stone-100 font-sans">
            Media & Asset Storage Library
          </h1>
          <p className="text-xs text-stone-600 dark:text-stone-400 mt-0.5 font-medium">
            Central repository for pastry photography, instructor avatars, course graphics, and brand banners
          </p>
        </div>

        <button
          type="button"
          onClick={() => setIsUploadModalOpen(true)}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-stone-900 text-white dark:bg-stone-100 dark:text-stone-900 text-xs font-semibold hover:bg-stone-800 dark:hover:bg-stone-200 transition-colors shadow-2xs self-start sm:self-auto"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Upload Media Asset</span>
        </button>
      </div>

      {/* Filter Bar */}
      <div className="flex items-center gap-1 p-1 bg-stone-100 dark:bg-stone-800/60 rounded-lg text-xs w-fit">
        {[
          { label: 'All Assets', value: 'all' },
          { label: 'Products', value: 'product' },
          { label: 'Courses', value: 'course' },
          { label: 'Avatars', value: 'avatar' },
          { label: 'Banners', value: 'banner' },
        ].map((f) => (
          <button
            key={f.value}
            type="button"
            onClick={() => setCategoryFilter(f.value)}
            className={`px-3 py-1 rounded-md font-medium transition-colors ${
              categoryFilter === f.value
                ? 'bg-white dark:bg-stone-700 text-stone-900 dark:text-stone-100 shadow-2xs font-semibold'
                : 'text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-200'
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* Media Grid */}
      <div className="rounded-xl border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900 p-5">
        {isLoading ? (
          <div className="py-16 flex flex-col items-center justify-center gap-2 text-stone-400">
            <Loader2 className="w-5 h-5 animate-spin text-amber-600" />
            <span className="text-xs">Loading media gallery...</span>
          </div>
        ) : error ? (
          <div className="p-8">
            <ErrorState message={error} onRetry={fetchMedia} />
          </div>
        ) : media.length === 0 ? (
          <div className="p-8">
            <EmptyState
              icon={ImageIcon}
              title="No media assets in this category"
              description="Upload photography or course thumbnails to store them in the centralized bakery library."
              actionLabel="Add Asset"
              onAction={() => setIsUploadModalOpen(true)}
            />
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {media.map((item) => {
              if (!item) return null;
              const itemUrl = item.url || '';
              const itemName = item.name || 'Untitled Asset';
              const itemCategory = item.category || 'general';
              const itemSize = item.sizeBytes ? (item.sizeBytes / 1024).toFixed(0) : '0';
              const itemDate = item.uploadedAt ? new Date(item.uploadedAt).toLocaleDateString() : new Date().toLocaleDateString();

              return (
                <div
                  key={item.id || itemUrl || Math.random()}
                  className="group rounded-lg border border-stone-200 dark:border-stone-800 overflow-hidden bg-stone-50/50 dark:bg-stone-900/50 flex flex-col justify-between"
                >
                  {/* Media Preview */}
                  <div className="h-40 overflow-hidden bg-stone-100 dark:bg-stone-800 relative">
                    <ImageWithFallback
                      src={itemUrl}
                      alt={itemName}
                      fallbackTitle={itemName}
                      aspectRatio="video"
                      className="w-full h-full object-cover group-hover:scale-102 transition-transform duration-200"
                    />
                    <span className="absolute top-2 left-2 px-2 py-0.5 rounded text-[10px] font-semibold uppercase tracking-wider bg-black/60 text-white backdrop-blur-xs">
                      {itemCategory}
                    </span>
                  </div>

                  {/* Info & Actions */}
                  <div className="p-3">
                    <h4 className="text-xs font-semibold text-stone-900 dark:text-stone-100 truncate">
                      {itemName}
                    </h4>
                    <p className="text-[10px] font-mono text-stone-400 mt-0.5 truncate">
                      {itemSize} KB · {itemDate}
                    </p>

                    <div className="flex items-center justify-between gap-2 mt-3 pt-2.5 border-t border-stone-100 dark:border-stone-800">
                      <button
                        type="button"
                        onClick={() => handleCopy(item)}
                        className="inline-flex items-center gap-1 text-[11px] font-medium text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-200 transition-colors"
                        title="Copy public URL"
                      >
                        {copiedId === item.id ? (
                          <>
                            <Check className="w-3.5 h-3.5 text-emerald-600" />
                            <span className="text-emerald-600">Copied</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-3.5 h-3.5" />
                            <span>Copy URL</span>
                          </>
                        )}
                      </button>

                      <button
                        type="button"
                        onClick={() => setDeleteCandidate(item)}
                        className="p-1 text-stone-400 hover:text-rose-600 dark:hover:text-rose-400 transition-colors"
                        title="Delete asset"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Upload Modal */}
      {isUploadModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-xs animate-in fade-in duration-150"
          role="dialog"
          aria-modal="true"
        >
          <div className="bg-white dark:bg-stone-900 rounded-xl border border-stone-200 dark:border-stone-800 shadow-xl max-w-md w-full p-6 text-xs">
            <div className="flex items-center justify-between pb-3 border-b border-stone-100 dark:border-stone-800">
              <h3 className="text-sm font-semibold text-stone-900 dark:text-stone-100">
                Register New Media Asset
              </h3>
              <button
                type="button"
                onClick={() => setIsUploadModalOpen(false)}
                className="p-1 text-stone-400 hover:text-stone-600"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleUploadSubmit} className="space-y-4 mt-4">
              <div>
                <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1">
                  Asset File Name
                </label>
                <input
                  type="text"
                  value={mediaName}
                  onChange={(e) => setMediaName(e.target.value)}
                  placeholder="e.g. pistachio_croissant_hero.jpg"
                  className="w-full px-3 py-2 rounded-lg border border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-800 text-stone-900 dark:text-stone-100 focus:outline-none focus:ring-1 focus:ring-amber-500"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1">
                  Asset Image URL
                </label>
                <input
                  type="url"
                  value={mediaUrl}
                  onChange={(e) => setMediaUrl(e.target.value)}
                  placeholder="https://... image url"
                  className="w-full px-3 py-2 rounded-lg border border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-800 text-stone-900 dark:text-stone-100 focus:outline-none focus:ring-1 focus:ring-amber-500 font-mono text-[11px]"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1">
                  Category
                </label>
                <select
                  value={mediaCategory}
                  onChange={(e) => setMediaCategory(e.target.value as any)}
                  className="w-full px-3 py-2 rounded-lg border border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-800 text-stone-900 dark:text-stone-100 focus:outline-none capitalize"
                >
                  <option value="product">Product Photography</option>
                  <option value="course">Course Thumbnail / Video Graphic</option>
                  <option value="avatar">Chef / Staff Avatar</option>
                  <option value="banner">Store Banner / Brand Visual</option>
                </select>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-stone-100 dark:border-stone-800">
                <button
                  type="button"
                  onClick={() => setIsUploadModalOpen(false)}
                  className="px-3.5 py-1.5 rounded-lg text-stone-600 dark:text-stone-400 hover:bg-stone-100 dark:hover:bg-stone-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isUploading}
                  className="px-4 py-1.5 rounded-lg bg-stone-900 text-white dark:bg-stone-100 dark:text-stone-900 font-semibold hover:bg-stone-800 dark:hover:bg-stone-200"
                >
                  {isUploading ? 'Registering...' : 'Register Asset'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation */}
      <ConfirmDialog
        isOpen={Boolean(deleteCandidate)}
        title="Delete Media Asset?"
        message={`Are you sure you want to remove "${deleteCandidate?.name}" from the media gallery? Ensure this image is not linked to active products or courses.`}
        confirmLabel="Confirm Delete"
        variant="danger"
        isLoading={isDeleting}
        onConfirm={handleDeleteConfirm}
        onCancel={() => setDeleteCandidate(null)}
      />
    </div>
  );
}
