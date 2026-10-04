import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { dashboardApi } from '../../api/dashboardApi';
import { PopularProduct } from '../../types';
import { ImageWithFallback } from '../common/ImageWithFallback';
import { ChevronRight, Loader2 } from 'lucide-react';

export function PopularProductsList() {
  const [products, setProducts] = useState<PopularProduct[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const res = await dashboardApi.getPopularProducts();
        if (res.success) {
          setProducts(res.popular);
        }
      } catch (err) {
        console.error('Failed to load popular products:', err);
      } finally {
        setIsLoading(false);
      }
    }
    load();
  }, []);

  return (
    <div className="p-5 rounded-xl border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900 flex flex-col h-full">
      <div className="pb-3 border-b border-stone-100 dark:border-stone-800/80 flex items-center justify-between">
        <span className="text-xs font-semibold uppercase tracking-wider text-stone-600 dark:text-stone-400">
          Popular Bakery Products
        </span>
        <Link
          to="/admin/products"
          className="text-xs text-amber-600 dark:text-amber-400 font-medium hover:underline flex items-center gap-1"
        >
          <span>All Products</span>
          <ChevronRight className="w-3 h-3" />
        </Link>
      </div>

      <div className="flex-1 mt-3">
        {isLoading ? (
          <div className="py-8 flex items-center justify-center text-xs text-stone-400">
            <Loader2 className="w-4 h-4 animate-spin text-amber-600 mr-2" />
            <span>Loading popular selections...</span>
          </div>
        ) : products.length === 0 ? (
          <div className="py-8 text-center text-xs text-stone-400">No popular product data recorded</div>
        ) : (
          <div className="divide-y divide-stone-100 dark:divide-stone-800/60">
            {products.map((p: any, index) => {
              const productId = p.id || p._id || `pop_${index}`;
              const title = p.title || p.name || 'Bakery Selection';
              const category = p.category || 'General';
              const price = typeof p.price === 'number' ? p.price : 0;
              const ordersCount = p.orders ?? p.ordersCount ?? 0;
              const revenue = typeof p.revenue === 'number' ? p.revenue : ordersCount * price;

              return (
                <div key={productId} className="py-2.5 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3 min-w-0">
                    <span className="text-xs font-mono font-bold text-stone-600 dark:text-stone-400 w-4 text-center">
                      0{index + 1}
                    </span>
                    <div className="w-10 h-10 rounded-lg overflow-hidden shrink-0 border border-stone-200 dark:border-stone-800">
                      <ImageWithFallback
                        src={p.image}
                        alt={title}
                        fallbackTitle={title}
                        aspectRatio="square"
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs font-medium text-stone-900 dark:text-stone-100 truncate">
                        {title}
                      </p>
                      <p className="text-[11px] text-stone-600 dark:text-stone-400">
                        {category} · AED {price.toFixed(2)}
                      </p>
                    </div>
                  </div>

                  <div className="text-right shrink-0">
                    <p className="text-xs font-bold font-mono text-stone-900 dark:text-stone-100 tabular-nums">
                      AED {revenue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </p>
                    <p className="text-[10px] text-stone-600 dark:text-stone-400 font-mono">
                      {ordersCount} sold
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
