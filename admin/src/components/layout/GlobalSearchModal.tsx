import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, X, Users, Package, ShoppingBag, GraduationCap, CakeSlice, Loader2 } from 'lucide-react';
import { dashboardApi } from '../../api/dashboardApi';
import { GlobalSearchResults } from '../../types';

interface GlobalSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function GlobalSearchModal({ isOpen, onClose }: GlobalSearchModalProps) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<GlobalSearchResults | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
    } else {
      setQuery('');
      setResults(null);
    }
  }, [isOpen]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        if (isOpen) onClose();
      }
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  // Debounced search
  useEffect(() => {
    if (!query.trim()) {
      setResults(null);
      setIsLoading(false);
      return;
    }

    const timer = setTimeout(async () => {
      setIsLoading(true);
      try {
        const res = await dashboardApi.globalSearch(query.trim());
        if (res.success) {
          setResults(res.results);
        }
      } catch (err) {
        console.error('Search error:', err);
      } finally {
        setIsLoading(false);
      }
    }, 250);

    return () => clearTimeout(timer);
  }, [query]);

  if (!isOpen) return null;

  const handleSelect = (path: string) => {
    navigate(path);
    onClose();
  };

  const hasResults =
    results &&
    (results.users.length > 0 ||
      results.products.length > 0 ||
      results.orders.length > 0 ||
      results.courses.length > 0 ||
      results.customRequests.length > 0);

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center pt-16 sm:pt-24 px-4 bg-stone-900/60 backdrop-blur-xs animate-in fade-in duration-150"
      role="dialog"
      aria-modal="true"
    >
      <div className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-xl shadow-2xl max-w-xl w-full overflow-hidden flex flex-col max-h-[75vh]">
        {/* Search Input Bar */}
        <div className="flex items-center px-4 py-3.5 border-b border-stone-200 dark:border-stone-800 gap-3">
          <Search className="w-4 h-4 text-stone-400 shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search orders, customers, products, courses, custom cakes..."
            className="flex-1 bg-transparent text-sm text-stone-900 dark:text-stone-100 placeholder:text-stone-400 focus:outline-none"
          />
          {isLoading ? (
            <Loader2 className="w-4 h-4 text-amber-600 animate-spin shrink-0" />
          ) : query ? (
            <button
              type="button"
              onClick={() => setQuery('')}
              className="p-1 text-stone-400 hover:text-stone-600 dark:hover:text-stone-200"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          ) : (
            <kbd className="hidden sm:inline-block px-1.5 py-0.5 text-[10px] font-mono font-medium text-stone-400 bg-stone-100 dark:bg-stone-800 rounded border border-stone-200 dark:border-stone-700">
              ESC
            </kbd>
          )}
        </div>

        {/* Results List */}
        <div className="overflow-y-auto p-3 space-y-4">
          {!query.trim() && (
            <div className="py-8 text-center text-xs text-stone-400">
              Type at least 2 characters to search bakery records across all modules
            </div>
          )}

          {query.trim() && !isLoading && !hasResults && (
            <div className="py-8 text-center text-xs text-stone-500">
              No matching records found for "{query}"
            </div>
          )}

          {/* Orders Group */}
          {results && results.orders.length > 0 && (
            <div>
              <div className="flex items-center gap-1.5 px-2 py-1 text-[11px] font-semibold text-stone-400 uppercase tracking-wider">
                <ShoppingBag className="w-3 h-3" />
                <span>Orders</span>
              </div>
              <div className="space-y-1 mt-1">
                {results.orders.map((o) => (
                  <button
                    key={o.id}
                    type="button"
                    onClick={() => handleSelect(`/admin/orders/${o.id}`)}
                    className="w-full flex items-center justify-between p-2 rounded-lg hover:bg-stone-100 dark:hover:bg-stone-800 text-left transition-colors group"
                  >
                    <div>
                      <div className="text-xs font-semibold text-stone-900 dark:text-stone-100 font-mono">
                        {o.orderNumber}
                      </div>
                      <div className="text-[11px] text-stone-500">
                        {o.customerName} · {o.items.length} items
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="text-xs font-semibold text-stone-900 dark:text-stone-100 font-mono">
                        AED {o.grandTotal.toFixed(2)}
                      </span>
                      <div className="text-[10px] capitalize text-stone-400">{o.status}</div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Products Group */}
          {results && results.products.length > 0 && (
            <div>
              <div className="flex items-center gap-1.5 px-2 py-1 text-[11px] font-semibold text-stone-400 uppercase tracking-wider">
                <Package className="w-3 h-3" />
                <span>Products</span>
              </div>
              <div className="space-y-1 mt-1">
                {results.products.map((p) => (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => handleSelect(`/admin/products`)}
                    className="w-full flex items-center justify-between p-2 rounded-lg hover:bg-stone-100 dark:hover:bg-stone-800 text-left transition-colors"
                  >
                    <div>
                      <div className="text-xs font-medium text-stone-900 dark:text-stone-100">
                        {p.title}
                      </div>
                      <div className="text-[11px] text-stone-500">
                        {p.category} · Baker: {p.bakerName}
                      </div>
                    </div>
                    <span className="text-xs font-medium text-stone-900 dark:text-stone-100 font-mono">
                      AED {p.price}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Users Group */}
          {results && results.users.length > 0 && (
            <div>
              <div className="flex items-center gap-1.5 px-2 py-1 text-[11px] font-semibold text-stone-400 uppercase tracking-wider">
                <Users className="w-3 h-3" />
                <span>Users</span>
              </div>
              <div className="space-y-1 mt-1">
                {results.users.map((u) => (
                  <button
                    key={u.id}
                    type="button"
                    onClick={() => handleSelect(`/admin/users/${u.id}`)}
                    className="w-full flex items-center justify-between p-2 rounded-lg hover:bg-stone-100 dark:hover:bg-stone-800 text-left transition-colors"
                  >
                    <div>
                      <div className="text-xs font-medium text-stone-900 dark:text-stone-100">{u.name}</div>
                      <div className="text-[11px] text-stone-500">{u.email}</div>
                    </div>
                    <span className="text-[11px] capitalize text-stone-400">{u.role}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Custom Requests Group */}
          {results && results.customRequests.length > 0 && (
            <div>
              <div className="flex items-center gap-1.5 px-2 py-1 text-[11px] font-semibold text-stone-400 uppercase tracking-wider">
                <CakeSlice className="w-3 h-3" />
                <span>Custom Cake Requests</span>
              </div>
              <div className="space-y-1 mt-1">
                {results.customRequests.map((r) => (
                  <button
                    key={r.id}
                    type="button"
                    onClick={() => handleSelect(`/admin/custom-requests/${r.id}`)}
                    className="w-full flex items-center justify-between p-2 rounded-lg hover:bg-stone-100 dark:hover:bg-stone-800 text-left transition-colors"
                  >
                    <div>
                      <div className="text-xs font-medium text-stone-900 dark:text-stone-100 font-mono">
                        {r.requestNumber}
                      </div>
                      <div className="text-[11px] text-stone-500">
                        {r.customerName} · {r.baseProduct}
                      </div>
                    </div>
                    <span className="text-[10px] capitalize text-stone-400">{r.status}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Courses Group */}
          {results && results.courses.length > 0 && (
            <div>
              <div className="flex items-center gap-1.5 px-2 py-1 text-[11px] font-semibold text-stone-400 uppercase tracking-wider">
                <GraduationCap className="w-3 h-3" />
                <span>Courses</span>
              </div>
              <div className="space-y-1 mt-1">
                {results.courses.map((c) => (
                  <button
                    key={c.id}
                    type="button"
                    onClick={() => handleSelect(`/admin/courses/${c.id}`)}
                    className="w-full flex items-center justify-between p-2 rounded-lg hover:bg-stone-100 dark:hover:bg-stone-800 text-left transition-colors"
                  >
                    <div>
                      <div className="text-xs font-medium text-stone-900 dark:text-stone-100">{c.title}</div>
                      <div className="text-[11px] text-stone-500">{c.author} · {c.duration}</div>
                    </div>
                    <span className="text-[10px] text-stone-400">{c.category}</span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
