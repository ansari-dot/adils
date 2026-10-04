import React, { useEffect, useState } from 'react';
import { calculatorApi } from '../api/calculatorApi';
import { CalculatorConfig, CalculatorStats } from '../types';
import { useToast } from '../context/ToastContext';
import { ErrorState } from '../components/common/ErrorState';
import {
  Calculator,
  Save,
  TrendingUp,
  Percent,
  Clock,
  Box,
  Truck,
  Loader2,
  PieChart,
} from 'lucide-react';

export function CalculatorPage() {
  const { success, error: toastError } = useToast();

  const [config, setConfig] = useState<CalculatorConfig | null>(null);
  const [stats, setStats] = useState<CalculatorStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Form inputs
  const [laborCost, setLaborCost] = useState('45');
  const [packagingCost, setPackagingCost] = useState('18');
  const [profitMargin, setProfitMargin] = useState('35');
  const [taxRate, setTaxRate] = useState('5');
  const [deliveryFee, setDeliveryFee] = useState('20');
  const [currency, setCurrency] = useState('AED');

  const fetchCalculatorData = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const [configRes, statsRes] = await Promise.all([
        calculatorApi.getConfig(),
        calculatorApi.getStats(),
      ]);

      if (configRes.success && configRes.config) {
        setConfig(configRes.config);
        setLaborCost(String(configRes.config.defaultLaborCost));
        setPackagingCost(String(configRes.config.defaultPackagingCost));
        setProfitMargin(String(configRes.config.defaultProfitMargin));
        setTaxRate(String(configRes.config.taxRate));
        setDeliveryFee(String(configRes.config.deliveryFee));
        setCurrency(configRes.config.currency);
      }
      if (statsRes.success && statsRes.stats) {
        setStats(statsRes.stats);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to retrieve calculator configuration');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCalculatorData();
  }, []);

  const handleSaveConfig = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      const payload: Partial<CalculatorConfig> = {
        defaultLaborCost: parseFloat(laborCost) || 0,
        defaultPackagingCost: parseFloat(packagingCost) || 0,
        defaultProfitMargin: parseFloat(profitMargin) || 0,
        taxRate: parseFloat(taxRate) || 0,
        deliveryFee: parseFloat(deliveryFee) || 0,
        currency: currency.trim() || 'AED',
      };

      const res = await calculatorApi.updateConfig(payload);
      if (res.success && res.config) {
        setConfig(res.config);
        success('Bakery calculator rules and constants updated successfully.');
      }
    } catch (err: any) {
      toastError(err.message || 'Failed to update calculator parameters');
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="py-16 flex flex-col items-center justify-center gap-3">
        <Loader2 className="w-6 h-6 animate-spin text-amber-600" />
        <span className="text-xs text-stone-500">Loading calculator formulas & configuration...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="py-8">
        <ErrorState message={error} onRetry={fetchCalculatorData} />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-1">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-stone-900 dark:text-stone-100 font-sans">
            Bakery Cost & Recipe Pricing Calculator
          </h1>
          <p className="text-xs text-stone-600 dark:text-stone-400 mt-0.5 font-medium">
            Configure baseline hourly labor rates, packaging constants, margin multipliers, and view customer estimate volume
          </p>
        </div>
      </div>

      {/* Analytics KPI Row */}
      {stats && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="p-4 rounded-xl border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wider text-stone-500">
                Total Calculations
              </span>
              <Calculator className="w-4 h-4 text-amber-600" />
            </div>
            <p className="text-2xl font-bold font-mono text-stone-900 dark:text-stone-100 mt-2">
              {stats.totalCalculations.toLocaleString()}
            </p>
            <p className="text-[11px] text-stone-500 mt-0.5">Calculations submitted via customer mobile app</p>
          </div>

          <div className="p-4 rounded-xl border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wider text-stone-500">
                Calculations Today
              </span>
              <TrendingUp className="w-4 h-4 text-emerald-600" />
            </div>
            <p className="text-2xl font-bold font-mono text-stone-900 dark:text-stone-100 mt-2">
              {stats.calculationsToday}
            </p>
            <p className="text-[11px] text-stone-500 mt-0.5">Custom quotes explored in the last 24h</p>
          </div>

          <div className="p-4 rounded-xl border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wider text-stone-500">
                This Week's Activity
              </span>
              <Clock className="w-4 h-4 text-blue-600" />
            </div>
            <p className="text-2xl font-bold font-mono text-stone-900 dark:text-stone-100 mt-2">
              {stats.calculationsThisWeek}
            </p>
            <p className="text-[11px] text-stone-500 mt-0.5">Total quotes computed across recipes</p>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Configuration Form */}
        <div className="lg:col-span-2 space-y-6">
          <div className="rounded-xl border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900 p-6">
            <div className="pb-3 border-b border-stone-100 dark:border-stone-800/80 mb-5">
              <h2 className="text-sm font-semibold text-stone-900 dark:text-stone-100">
                Pricing Multipliers & Expense Defaults
              </h2>
              <p className="text-xs text-stone-500 mt-0.5">
                These values dynamically configure the bakery pricing calculator used in customer custom requests.
              </p>
            </div>

            <form onSubmit={handleSaveConfig} className="space-y-4 text-xs">
              {/* Labor Cost */}
              <div>
                <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1">
                  Default Labor Cost Rate (AED / hour)
                </label>
                <div className="relative max-w-sm">
                  <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-stone-400 font-mono">
                    AED
                  </span>
                  <input
                    type="number"
                    min="0"
                    step="1"
                    value={laborCost}
                    onChange={(e) => setLaborCost(e.target.value)}
                    className="w-full pl-12 pr-3 py-2 rounded-lg border border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-800 text-stone-900 dark:text-stone-100 font-mono font-semibold focus:outline-none focus:ring-1 focus:ring-amber-500"
                  />
                </div>
                <p className="text-[11px] text-stone-500 mt-1">
                  Applied based on estimated baking, decorating, and proofing hours.
                </p>
              </div>

              {/* Packaging Cost */}
              <div>
                <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1">
                  Default Luxury Packaging Cost (AED / cake box)
                </label>
                <div className="relative max-w-sm">
                  <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-stone-400 font-mono">
                    AED
                  </span>
                  <input
                    type="number"
                    min="0"
                    step="1"
                    value={packagingCost}
                    onChange={(e) => setPackagingCost(e.target.value)}
                    className="w-full pl-12 pr-3 py-2 rounded-lg border border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-800 text-stone-900 dark:text-stone-100 font-mono font-semibold focus:outline-none focus:ring-1 focus:ring-amber-500"
                  />
                </div>
                <p className="text-[11px] text-stone-500 mt-1">
                  Covers gold-embossed cake board, insulated box, satin ribbon, and allergen seal.
                </p>
              </div>

              {/* Default Profit Margin */}
              <div>
                <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1">
                  Target Profit Margin (%)
                </label>
                <div className="relative max-w-sm">
                  <input
                    type="number"
                    min="0"
                    max="100"
                    step="1"
                    value={profitMargin}
                    onChange={(e) => setProfitMargin(e.target.value)}
                    className="w-full pl-3 pr-8 py-2 rounded-lg border border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-800 text-stone-900 dark:text-stone-100 font-mono font-semibold focus:outline-none focus:ring-1 focus:ring-amber-500"
                  />
                  <span className="absolute inset-y-0 right-0 pr-3 flex items-center text-stone-400 font-mono">
                    %
                  </span>
                </div>
                <p className="text-[11px] text-stone-500 mt-1">
                  Baseline retail markup added on raw ingredient + labor totals.
                </p>
              </div>

              {/* Tax Rate & Delivery Fee */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1">
                    VAT Tax Rate (%)
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="0.5"
                    value={taxRate}
                    onChange={(e) => setTaxRate(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-800 text-stone-900 dark:text-stone-100 font-mono font-semibold focus:outline-none focus:ring-1 focus:ring-amber-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1">
                    Standard Delivery Fee (AED)
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="1"
                    value={deliveryFee}
                    onChange={(e) => setDeliveryFee(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-800 text-stone-900 dark:text-stone-100 font-mono font-semibold focus:outline-none focus:ring-1 focus:ring-amber-500"
                  />
                </div>
              </div>

              <div className="pt-4 border-t border-stone-100 dark:border-stone-800">
                <button
                  type="submit"
                  disabled={isSaving}
                  className="px-4 py-2 rounded-lg bg-stone-900 text-white dark:bg-stone-100 dark:text-stone-900 font-semibold hover:bg-stone-800 dark:hover:bg-stone-200 transition-colors flex items-center gap-2"
                >
                  {isSaving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
                  <span>Save Configuration Rules</span>
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* Right Col: Popular Inquiries Analytics */}
        <div className="space-y-6">
          <div className="rounded-xl border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900 p-5">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-stone-400 mb-3 flex items-center gap-2">
              <PieChart className="w-4 h-4" />
              <span>Most Calculated Recipes</span>
            </h3>

            {stats && stats.popularRecipes ? (
              <div className="divide-y divide-stone-100 dark:divide-stone-800/60 text-xs">
                {stats.popularRecipes.map((r, i) => (
                  <div key={i} className="py-2.5 flex items-center justify-between gap-3">
                    <div>
                      <p className="font-semibold text-stone-900 dark:text-stone-100">
                        {r.recipe}
                      </p>
                      <p className="text-[11px] text-stone-500">
                        Avg quote: <span className="font-mono font-medium">AED {r.avgEstimatedCost}</span>
                      </p>
                    </div>
                    <span className="font-mono font-bold text-stone-700 dark:text-stone-300 px-2 py-0.5 bg-stone-100 dark:bg-stone-800 rounded">
                      {r.count} inquiries
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-stone-400 py-4">No recipe statistics logged yet.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
