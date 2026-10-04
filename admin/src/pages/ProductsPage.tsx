import React, { useEffect, useState } from 'react';
import { productsApi } from '../api/productsApi';
import { Product, ProductCategory } from '../types';
import { ProductFormModal } from '../components/products/ProductFormModal';
import { ImageWithFallback } from '../components/common/ImageWithFallback';
import { ConfirmDialog } from '../components/common/ConfirmDialog';
import { EmptyState } from '../components/common/EmptyState';
import { ErrorState } from '../components/common/ErrorState';
import { useToast } from '../context/ToastContext';
import {
  Package,
  Plus,
  Search,
  Star,
  Edit2,
  Trash2,
  CheckCircle2,
  XCircle,
  Sparkles,
  Loader2,
} from 'lucide-react';

const CATEGORIES: ('all' | ProductCategory)[] = ['all', 'Cakes', 'Pastries', 'Keto', 'Cookies', 'Bread'];

export function ProductsPage() {
  const { success, error: toastError } = useToast();

  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filters & Search
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState<string>('all');
  const [stockFilter, setStockFilter] = useState<string>('all');
  const [popularFilter, setPopularFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState<string>('newest');

  // Modals
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  // Delete Confirm
  const [deleteProductCandidate, setDeleteProductCandidate] = useState<Product | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const fetchProducts = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await productsApi.getAll({
        search: search.trim() || undefined,
        category: category !== 'all' ? category : undefined,
        stock: stockFilter !== 'all' ? stockFilter : undefined,
        popular: popularFilter !== 'all' ? popularFilter : undefined,
        sort: sortBy,
      });
      if (res.success) {
        setProducts(res.products);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to retrieve bakery products');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchProducts();
    }, 200);
    return () => clearTimeout(timer);
  }, [search, category, stockFilter, popularFilter, sortBy]);

  // Quick toggle in-stock
  const handleToggleStock = async (product: Product) => {
    const updatedStock = !product.inStock;
    try {
      const res = await productsApi.update(product.id, { inStock: updatedStock });
      if (res.success) {
        success(`"${product.title}" marked as ${updatedStock ? 'In Stock' : 'Out of Stock'}`);
        setProducts((prev) =>
          prev.map((p) => (p.id === product.id ? { ...p, inStock: updatedStock } : p))
        );
      }
    } catch (err: any) {
      toastError(err.message || 'Failed to update stock');
    }
  };

  // Quick toggle popular
  const handleTogglePopular = async (product: Product) => {
    const updatedPopular = !product.isPopular;
    try {
      const res = await productsApi.update(product.id, { isPopular: updatedPopular });
      if (res.success) {
        success(
          `"${product.title}" ${updatedPopular ? 'featured as Popular' : 'removed from Popular'}`
        );
        setProducts((prev) =>
          prev.map((p) => (p.id === product.id ? { ...p, isPopular: updatedPopular } : p))
        );
      }
    } catch (err: any) {
      toastError(err.message || 'Failed to update popular status');
    }
  };

  // Confirm delete
  const handleDeleteConfirm = async () => {
    if (!deleteProductCandidate) return;
    setIsDeleting(true);
    try {
      const res = await productsApi.delete(deleteProductCandidate.id);
      if (res.success) {
        success(`Product "${deleteProductCandidate.title}" deleted.`);
        setProducts((prev) => prev.filter((p) => p.id !== deleteProductCandidate.id));
        setDeleteProductCandidate(null);
      }
    } catch (err: any) {
      toastError(err.message || 'Failed to delete product');
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="space-y-5">
      {/* Top Title Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-1">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-stone-900 dark:text-stone-100 font-sans">
            Bakery Products Catalog
          </h1>
          <p className="text-xs text-stone-600 dark:text-stone-400 mt-0.5 font-medium">
            Manage pricing, ingredients, stock availability, and featured pastry collections
          </p>
        </div>

        <button
          type="button"
          onClick={() => {
            setEditingProduct(null);
            setIsModalOpen(true);
          }}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-stone-900 text-white dark:bg-stone-100 dark:text-stone-900 text-xs font-semibold hover:bg-stone-800 dark:hover:bg-stone-200 transition-colors shadow-2xs self-start sm:self-auto"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Add New Product</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="p-4 rounded-xl border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900 space-y-3">
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
          {/* Search Field */}
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search product title or baker..."
              className="w-full pl-9 pr-3 py-1.5 text-xs rounded-lg border border-stone-200 dark:border-stone-700 bg-stone-50/50 dark:bg-stone-800 text-stone-900 dark:text-stone-100 placeholder:text-stone-400 focus:outline-none focus:ring-1 focus:ring-amber-500"
            />
          </div>

          {/* Quick Category Tabs (Anti-pill Segmented Control) */}
          <div className="flex items-center gap-1 overflow-x-auto p-1 bg-stone-100 dark:bg-stone-800/60 rounded-lg text-xs">
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setCategory(cat)}
                className={`px-3 py-1 rounded-md capitalize font-medium transition-colors whitespace-nowrap ${
                  category === cat
                    ? 'bg-white dark:bg-stone-700 text-stone-900 dark:text-stone-100 shadow-2xs font-semibold'
                    : 'text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-200'
                }`}
              >
                {cat === 'all' ? 'All Categories' : cat}
              </button>
            ))}
          </div>
        </div>

        {/* Secondary Filters & Sort Dropdowns */}
        <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-stone-100 dark:border-stone-800/80 text-xs text-stone-600 dark:text-stone-400">
          <span className="text-[11px] font-medium mr-1">Filter by:</span>

          <select
            value={stockFilter}
            onChange={(e) => setStockFilter(e.target.value)}
            className="px-2.5 py-1 rounded-md border border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-800 text-stone-800 dark:text-stone-200 focus:outline-none"
          >
            <option value="all">Stock: All</option>
            <option value="in_stock">In Stock</option>
            <option value="out_of_stock">Out of Stock</option>
          </select>

          <select
            value={popularFilter}
            onChange={(e) => setPopularFilter(e.target.value)}
            className="px-2.5 py-1 rounded-md border border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-800 text-stone-800 dark:text-stone-200 focus:outline-none"
          >
            <option value="all">Popularity: All</option>
            <option value="popular">Popular Only</option>
            <option value="not_popular">Standard Only</option>
          </select>

          <div className="ml-auto flex items-center gap-2">
            <span className="text-[11px] font-medium">Sort:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-2.5 py-1 rounded-md border border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-800 text-stone-800 dark:text-stone-200 focus:outline-none font-medium"
            >
              <option value="newest">Newest First</option>
              <option value="oldest">Oldest First</option>
              <option value="price_asc">Price: Low to High</option>
              <option value="price_desc">Price: High to Low</option>
              <option value="highest_rated">Highest Rated</option>
              <option value="most_popular">Popular First</option>
            </select>
          </div>
        </div>
      </div>

      {/* Product List / Table View */}
      <div className="rounded-xl border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900 overflow-hidden">
        {isLoading ? (
          <div className="p-12 flex flex-col items-center justify-center gap-2 text-stone-400">
            <Loader2 className="w-5 h-5 animate-spin text-amber-600" />
            <span className="text-xs">Loading bakery products...</span>
          </div>
        ) : error ? (
          <div className="p-8">
            <ErrorState message={error} onRetry={fetchProducts} />
          </div>
        ) : products.length === 0 ? (
          <div className="p-8">
            <EmptyState
              icon={Package}
              title="No products match your criteria"
              description="Try adjusting filters or create a new artisan product."
              actionLabel="Add Product"
              onAction={() => {
                setEditingProduct(null);
                setIsModalOpen(true);
              }}
            />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-stone-200 dark:border-stone-800 bg-stone-50/70 dark:bg-stone-900/60 text-[11px] text-stone-600 dark:text-stone-400 font-semibold uppercase tracking-wider">
                  <th className="py-3 px-4">Product</th>
                  <th className="py-3 px-4">Category</th>
                  <th className="py-3 px-4 text-right">Price</th>
                  <th className="py-3 px-4 text-center">Rating</th>
                  <th className="py-3 px-4 text-center">In Stock</th>
                  <th className="py-3 px-4 text-center">Popular</th>
                  <th className="py-3 px-4">Artisan Baker</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100 dark:divide-stone-800/60">
                {products.map((p) => (
                  <tr key={p.id} className="hover:bg-stone-50/60 dark:hover:bg-stone-800/40 transition-colors">
                    {/* Product & Image */}
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-lg overflow-hidden border border-stone-200 dark:border-stone-700 shrink-0">
                          <ImageWithFallback
                            src={p.image}
                            alt={p.title}
                            fallbackTitle={p.title}
                            aspectRatio="square"
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div className="min-w-0 max-w-xs">
                          <h3 className="font-semibold text-stone-900 dark:text-stone-100 truncate">
                            {p.title}
                          </h3>
                          <p className="text-[11px] text-stone-500 truncate mt-0.5">
                            {p.ingredients.join(', ')}
                          </p>
                        </div>
                      </div>
                    </td>

                    {/* Category */}
                    <td className="py-3 px-4 text-stone-700 dark:text-stone-300 font-medium">
                      {p.category}
                    </td>

                    {/* Price */}
                    <td className="py-3 px-4 font-mono font-bold text-stone-900 dark:text-stone-100 text-right tabular-nums">
                      AED {p.price.toFixed(2)}
                    </td>

                    {/* Rating */}
                    <td className="py-3 px-4 text-center">
                      <span className="inline-flex items-center gap-1 font-mono text-[11px] text-amber-700 dark:text-amber-400 font-semibold">
                        <Star className="w-3 h-3 fill-amber-500 text-amber-500" />
                        <span>{p.rating.toFixed(1)}</span>
                        <span className="text-stone-400">({p.reviewsCount})</span>
                      </span>
                    </td>

                    {/* Stock Status Toggle */}
                    <td className="py-3 px-4 text-center">
                      <button
                        type="button"
                        onClick={() => handleToggleStock(p)}
                        className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-medium transition-colors ${
                          p.inStock
                            ? 'text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 hover:bg-emerald-100'
                            : 'text-rose-700 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/60 hover:bg-rose-100'
                        }`}
                        title="Click to toggle availability"
                      >
                        {p.inStock ? (
                          <>
                            <CheckCircle2 className="w-3 h-3" />
                            <span>In Stock</span>
                          </>
                        ) : (
                          <>
                            <XCircle className="w-3 h-3" />
                            <span>Out of Stock</span>
                          </>
                        )}
                      </button>
                    </td>

                    {/* Popular Toggle */}
                    <td className="py-3 px-4 text-center">
                      <button
                        type="button"
                        onClick={() => handleTogglePopular(p)}
                        className={`p-1 rounded-md transition-colors ${
                          p.isPopular
                            ? 'text-amber-600 bg-amber-50 dark:bg-amber-950/60 hover:bg-amber-100'
                            : 'text-stone-300 dark:text-stone-600 hover:text-stone-500'
                        }`}
                        title={p.isPopular ? 'Featured in Popular section' : 'Click to feature in Popular'}
                      >
                        <Sparkles className="w-4 h-4" />
                      </button>
                    </td>

                    {/* Baker */}
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        <div className="w-5 h-5 rounded-full overflow-hidden border border-stone-200 dark:border-stone-700 shrink-0">
                          <ImageWithFallback
                            src={p.bakerAvatar}
                            alt={p.bakerName}
                            aspectRatio="square"
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div className="truncate max-w-[120px]">
                          <div className="text-stone-900 dark:text-stone-100 font-medium truncate">{p.bakerName}</div>
                          <div className="text-[10px] text-stone-400 truncate">{p.bakerTitle}</div>
                        </div>
                      </div>
                    </td>

                    {/* Actions */}
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          type="button"
                          onClick={() => {
                            setEditingProduct(p);
                            setIsModalOpen(true);
                          }}
                          className="p-1.5 rounded text-stone-500 hover:text-stone-900 dark:hover:text-stone-100 hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors"
                          title="Edit product"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => setDeleteProductCandidate(p)}
                          className="p-1.5 rounded text-stone-500 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
                          title="Delete product"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Create / Edit Modal */}
      <ProductFormModal
        isOpen={isModalOpen}
        product={editingProduct}
        onClose={() => setIsModalOpen(false)}
        onSuccess={() => fetchProducts()}
      />

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        isOpen={Boolean(deleteProductCandidate)}
        title="Delete Bakery Product?"
        message={`Are you sure you want to remove "${deleteProductCandidate?.title}" from the bakery catalog? This action affects menu availability. Historical orders will not be modified.`}
        confirmLabel="Delete Product"
        variant="danger"
        isLoading={isDeleting}
        onConfirm={handleDeleteConfirm}
        onCancel={() => setDeleteProductCandidate(null)}
      />
    </div>
  );
}
