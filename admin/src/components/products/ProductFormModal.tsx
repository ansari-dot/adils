import React, { useState, useEffect } from 'react';
import { Product, ProductCategory } from '../../types';
import { productsApi } from '../../api/productsApi';
import { useToast } from '../../context/ToastContext';
import { X, Upload, Loader2, Image as ImageIcon } from 'lucide-react';
import { ImageWithFallback } from '../common/ImageWithFallback';

interface ProductFormModalProps {
  isOpen: boolean;
  product?: Product | null; // if set, edit mode; else create
  onClose: () => void;
  onSuccess: (product: Product) => void;
}

const CATEGORIES: ProductCategory[] = ['Cakes', 'Pastries', 'Keto', 'Cookies', 'Bread'];

export function ProductFormModal({ isOpen, product, onClose, onSuccess }: ProductFormModalProps) {
  const { success, error } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form fields
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState<string>('');
  const [category, setCategory] = useState<ProductCategory>('Cakes');
  const [bakerName, setBakerName] = useState('Chef Isabella Vance');
  const [bakerTitle, setBakerTitle] = useState('Master Pastry Chef');
  const [bakerAvatar, setBakerAvatar] = useState('https://images.unsplash.com/photo-1577219491135-ce391730fb2c?auto=format&fit=crop&w=400&q=80');
  const [ingredientsStr, setIngredientsStr] = useState('');
  const [rating, setRating] = useState('4.9');
  const [reviewsCount, setReviewsCount] = useState('24');
  const [isPopular, setIsPopular] = useState(false);
  const [inStock, setInStock] = useState(true);
  const [image, setImage] = useState('');
  const [imageTab, setImageTab] = useState<'url' | 'upload'>('url');

  // Inline validation errors
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (product) {
      setTitle(product.title);
      setDescription(product.description || '');
      setPrice(String(product.price));
      setCategory(product.category);
      setBakerName(product.bakerName);
      setBakerTitle(product.bakerTitle);
      setBakerAvatar(product.bakerAvatar);
      setIngredientsStr(product.ingredients.join(', '));
      setRating(String(product.rating));
      setReviewsCount(String(product.reviewsCount));
      setIsPopular(product.isPopular);
      setInStock(product.inStock);
      setImage(product.image);
    } else {
      setTitle('');
      setDescription('');
      setPrice('');
      setCategory('Cakes');
      setBakerName('Chef Isabella Vance');
      setBakerTitle('Master Pastry Chef');
      setBakerAvatar('https://images.unsplash.com/photo-1577219491135-ce391730fb2c?auto=format&fit=crop&w=400&q=80');
      setIngredientsStr('Madagascar Vanilla, French Butter, Organic Cane Sugar');
      setRating('5.0');
      setReviewsCount('0');
      setIsPopular(false);
      setInStock(true);
      setImage('https://images.unsplash.com/photo-1565958011703-44f9829ba187?auto=format&fit=crop&w=800&q=80');
    }
    setErrors({});
  }, [product, isOpen]);

  if (!isOpen) return null;

  const validate = () => {
    const errs: Record<string, string> = {};
    if (!title.trim()) errs.title = 'Product title is required';
    if (!price || isNaN(Number(price)) || Number(price) < 0) errs.price = 'Valid price is required (>= 0)';
    if (!category) errs.category = 'Category is required';
    if (!bakerName.trim()) errs.bakerName = 'Baker name is required';
    if (!image.trim()) errs.image = 'Product image is required';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        error('File exceeds 5MB limit');
        return;
      }
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          setImage(event.target.result as string);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setIsSubmitting(true);
    const ingredients = ingredientsStr
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);

    const payload = {
      title: title.trim(),
      description: description.trim(),
      price: parseFloat(price),
      category,
      bakerName: bakerName.trim(),
      bakerTitle: bakerTitle.trim(),
      bakerAvatar: bakerAvatar.trim(),
      ingredients,
      rating: parseFloat(rating) || 5.0,
      reviewsCount: parseInt(reviewsCount, 10) || 0,
      isPopular,
      inStock,
      image: image.trim(),
    };

    try {
      if (product) {
        const res = await productsApi.update(product.id, payload);
        if (res.success) {
          success(`Product "${res.product.title}" updated successfully`);
          onSuccess(res.product);
          onClose();
        }
      } else {
        const res = await productsApi.create(payload);
        if (res.success) {
          success(`Product "${res.product.title}" created successfully`);
          onSuccess(res.product);
          onClose();
        }
      }
    } catch (err: any) {
      error(err.message || 'Failed to save product');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-xs animate-in fade-in duration-150 overflow-y-auto"
      role="dialog"
      aria-modal="true"
    >
      <div className="bg-white dark:bg-stone-900 rounded-xl border border-stone-200 dark:border-stone-800 shadow-2xl max-w-2xl w-full my-8 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-stone-200 dark:border-stone-800">
          <div>
            <h3 className="text-base font-semibold text-stone-900 dark:text-stone-100">
              {product ? 'Edit Bakery Product' : 'Create New Bakery Product'}
            </h3>
            <p className="text-xs text-stone-500 mt-0.5">
              Configure catalog pricing, ingredients, and artisan baker details
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-md text-stone-400 hover:text-stone-600 dark:hover:text-stone-200"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-5 text-xs">
          {/* Product Image Section */}
          <div>
            <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-2">
              Product Image <span className="text-rose-500">*</span>
            </label>

            <div className="flex flex-col sm:flex-row gap-4 items-start">
              {/* Preview Box */}
              <div className="w-32 h-32 rounded-lg border border-stone-200 dark:border-stone-700 overflow-hidden shrink-0 bg-stone-50 dark:bg-stone-800 flex items-center justify-center">
                {image ? (
                  <ImageWithFallback
                    src={image}
                    alt="Preview"
                    fallbackTitle="Product preview"
                    className="w-full h-full object-cover"
                    aspectRatio="square"
                  />
                ) : (
                  <div className="flex flex-col items-center text-stone-400">
                    <ImageIcon className="w-6 h-6" />
                    <span className="text-[10px] mt-1">No image</span>
                  </div>
                )}
              </div>

              {/* Upload or URL Controls */}
              <div className="flex-1 w-full space-y-2">
                <div className="flex items-center gap-1 p-0.5 bg-stone-100 dark:bg-stone-800 rounded-lg w-fit">
                  <button
                    type="button"
                    onClick={() => setImageTab('url')}
                    className={`px-3 py-1 rounded text-xs font-medium transition-colors ${
                      imageTab === 'url'
                        ? 'bg-white dark:bg-stone-700 text-stone-900 dark:text-stone-100 shadow-2xs font-semibold'
                        : 'text-stone-600 dark:text-stone-400'
                    }`}
                  >
                    Image URL
                  </button>
                  <button
                    type="button"
                    onClick={() => setImageTab('upload')}
                    className={`px-3 py-1 rounded text-xs font-medium transition-colors ${
                      imageTab === 'upload'
                        ? 'bg-white dark:bg-stone-700 text-stone-900 dark:text-stone-100 shadow-2xs font-semibold'
                        : 'text-stone-600 dark:text-stone-400'
                    }`}
                  >
                    Upload File
                  </button>
                </div>

                {imageTab === 'url' ? (
                  <div>
                    <input
                      type="url"
                      value={image}
                      onChange={(e) => setImage(e.target.value)}
                      placeholder="https://... image url"
                      className="w-full px-3 py-2 rounded-lg border border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-800 text-stone-900 dark:text-stone-100 focus:outline-none focus:ring-1 focus:ring-amber-500"
                    />
                  </div>
                ) : (
                  <div className="border border-dashed border-stone-300 dark:border-stone-700 rounded-lg p-3 text-center hover:bg-stone-50/50 dark:hover:bg-stone-800/50 cursor-pointer">
                    <input
                      type="file"
                      accept="image/png, image/jpeg, image/webp"
                      onChange={handleFileUpload}
                      className="hidden"
                      id="product-file-input"
                    />
                    <label htmlFor="product-file-input" className="cursor-pointer flex flex-col items-center">
                      <Upload className="w-4 h-4 text-stone-400 mb-1" />
                      <span className="text-xs font-medium text-stone-700 dark:text-stone-300">
                        Click to select image file
                      </span>
                      <span className="text-[10px] text-stone-400">JPG, PNG, WEBP up to 5MB</span>
                    </label>
                  </div>
                )}
                {errors.image && <p className="text-rose-500 text-[11px] mt-1">{errors.image}</p>}
              </div>
            </div>
          </div>

          {/* Title & Category */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1">
                Title <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Strawberry Chiffon Dream Cake"
                className="w-full px-3 py-2 rounded-lg border border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-800 text-stone-900 dark:text-stone-100 focus:outline-none focus:ring-1 focus:ring-amber-500"
              />
              {errors.title && <p className="text-rose-500 text-[11px] mt-1">{errors.title}</p>}
            </div>

            <div>
              <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1">
                Category <span className="text-rose-500">*</span>
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as ProductCategory)}
                className="w-full px-3 py-2 rounded-lg border border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-800 text-stone-900 dark:text-stone-100 focus:outline-none focus:ring-1 focus:ring-amber-500"
              >
                {CATEGORIES.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1">
              Description
            </label>
            <textarea
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Sensory pastry description, crumb notes, layers and tasting profile..."
              className="w-full px-3 py-2 rounded-lg border border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-800 text-stone-900 dark:text-stone-100 focus:outline-none focus:ring-1 focus:ring-amber-500"
            />
          </div>

          {/* Pricing, Rating, Reviews */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1">
                Price (AED) <span className="text-rose-500">*</span>
              </label>
              <input
                type="number"
                step="0.5"
                min="0"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                placeholder="185"
                className="w-full px-3 py-2 rounded-lg border border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-800 text-stone-900 dark:text-stone-100 focus:outline-none focus:ring-1 focus:ring-amber-500 font-mono"
              />
              {errors.price && <p className="text-rose-500 text-[11px] mt-1">{errors.price}</p>}
            </div>

            <div>
              <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1">
                Rating (0.0 - 5.0)
              </label>
              <input
                type="number"
                step="0.1"
                min="0"
                max="5"
                value={rating}
                onChange={(e) => setRating(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-800 text-stone-900 dark:text-stone-100 focus:outline-none focus:ring-1 focus:ring-amber-500 font-mono"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1">
                Reviews Count
              </label>
              <input
                type="number"
                min="0"
                value={reviewsCount}
                onChange={(e) => setReviewsCount(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-800 text-stone-900 dark:text-stone-100 focus:outline-none focus:ring-1 focus:ring-amber-500 font-mono"
              />
            </div>
          </div>

          {/* Baker Info */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1">
                Baker Name <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                value={bakerName}
                onChange={(e) => setBakerName(e.target.value)}
                placeholder="Chef Isabella Vance"
                className="w-full px-3 py-2 rounded-lg border border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-800 text-stone-900 dark:text-stone-100 focus:outline-none focus:ring-1 focus:ring-amber-500"
              />
              {errors.bakerName && <p className="text-rose-500 text-[11px] mt-1">{errors.bakerName}</p>}
            </div>

            <div>
              <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1">
                Baker Title
              </label>
              <input
                type="text"
                value={bakerTitle}
                onChange={(e) => setBakerTitle(e.target.value)}
                placeholder="Master Pastry Chef"
                className="w-full px-3 py-2 rounded-lg border border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-800 text-stone-900 dark:text-stone-100 focus:outline-none focus:ring-1 focus:ring-amber-500"
              />
            </div>
          </div>

          {/* Ingredients */}
          <div>
            <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1">
              Ingredients (comma-separated)
            </label>
            <input
              type="text"
              value={ingredientsStr}
              onChange={(e) => setIngredientsStr(e.target.value)}
              placeholder="e.g. French Butter, Madagascar Vanilla, Cane Sugar, Eggs"
              className="w-full px-3 py-2 rounded-lg border border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-800 text-stone-900 dark:text-stone-100 focus:outline-none focus:ring-1 focus:ring-amber-500"
            />
          </div>

          {/* Stock & Popular Toggles */}
          <div className="flex items-center gap-6 pt-2">
            <label className="flex items-center gap-2 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={inStock}
                onChange={(e) => setInStock(e.target.checked)}
                className="w-4 h-4 rounded text-amber-600 focus:ring-amber-500 border-stone-300"
              />
              <span className="font-medium text-stone-800 dark:text-stone-200">In Stock (Available to Order)</span>
            </label>

            <label className="flex items-center gap-2 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={isPopular}
                onChange={(e) => setIsPopular(e.target.checked)}
                className="w-4 h-4 rounded text-amber-600 focus:ring-amber-500 border-stone-300"
              />
              <span className="font-medium text-stone-800 dark:text-stone-200">Feature as Popular (Hero Showcase)</span>
            </label>
          </div>

          {/* Footer Actions */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-stone-200 dark:border-stone-800">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="px-4 py-2 rounded-lg text-stone-700 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors font-medium"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-4 py-2 rounded-lg bg-stone-900 text-white dark:bg-stone-100 dark:text-stone-900 font-semibold hover:bg-stone-800 dark:hover:bg-stone-200 transition-colors flex items-center gap-2"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Saving...</span>
                </>
              ) : (
                <span>{product ? 'Update Product' : 'Create Product'}</span>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
