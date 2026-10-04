import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { calculatorApi } from '../api/calculatorApi';
import { useToast } from '../context/ToastContext';
import {
  Settings,
  Sun,
  Moon,
  Laptop,
  Save,
  Shield,
  Clock,
  Store,
  Loader2,
  CheckCircle2,
} from 'lucide-react';

export function SettingsPage() {
  const { theme, setTheme, user } = useAuth();
  const { success, error: toastError } = useToast();

  const [appName, setAppName] = useState('Pâtisserie Artisan Bakery & Academy');
  const [currency, setCurrency] = useState('AED');
  const [taxRate, setTaxRate] = useState('5.0');
  const [deliveryFee, setDeliveryFee] = useState('20.0');
  const [isSaving, setIsSaving] = useState(false);

  const handleSaveAppSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      await calculatorApi.updateConfig({
        taxRate: parseFloat(taxRate) || 5.0,
        deliveryFee: parseFloat(deliveryFee) || 20.0,
        currency: currency.trim() || 'AED',
      });
      success('Bakery application settings saved.');
    } catch (err: any) {
      toastError(err.message || 'Failed to save settings');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Top Header */}
      <div className="pb-1 border-b border-stone-200 dark:border-stone-800">
        <h1 className="text-xl font-bold tracking-tight text-stone-900 dark:text-stone-100 font-sans">
          Application & System Settings
        </h1>
        <p className="text-xs text-stone-600 dark:text-stone-400 mt-0.5 font-medium">
          Global storefront configurations, monetary standards, appearance themes, and active session telemetry
        </p>
      </div>

      {/* Appearance Settings */}
      <div className="rounded-xl border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900 p-6 space-y-4">
        <div>
          <h2 className="text-sm font-semibold text-stone-900 dark:text-stone-100">
            Interface Appearance & Theme
          </h2>
          <p className="text-xs text-stone-500 mt-0.5">
            Select light, dark, or system mode. Applies optical compensation and tailored tabular numeral contrast.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <button
            type="button"
            onClick={() => setTheme('light')}
            className={`p-3.5 rounded-lg border text-left flex items-center gap-3 transition-colors ${
              theme === 'light'
                ? 'border-amber-600 bg-amber-50/50 dark:bg-amber-950/20 text-stone-900 dark:text-stone-100'
                : 'border-stone-200 dark:border-stone-800 hover:border-stone-300'
            }`}
          >
            <div className="p-2 rounded-md bg-amber-100 dark:bg-amber-900/60 text-amber-700 dark:text-amber-300">
              <Sun className="w-4 h-4" />
            </div>
            <div>
              <div className="text-xs font-semibold">Light Mode</div>
              <div className="text-[11px] text-stone-500">Crisp off-white canvas</div>
            </div>
          </button>

          <button
            type="button"
            onClick={() => setTheme('dark')}
            className={`p-3.5 rounded-lg border text-left flex items-center gap-3 transition-colors ${
              theme === 'dark'
                ? 'border-amber-600 bg-amber-50/50 dark:bg-amber-950/20 text-stone-900 dark:text-stone-100'
                : 'border-stone-200 dark:border-stone-800 hover:border-stone-300'
            }`}
          >
            <div className="p-2 rounded-md bg-amber-100 dark:bg-amber-900/60 text-amber-700 dark:text-amber-300">
              <Moon className="w-4 h-4" />
            </div>
            <div>
              <div className="text-xs font-semibold">Dark Mode</div>
              <div className="text-[11px] text-stone-500">Deep obsidian slate</div>
            </div>
          </button>

          <button
            type="button"
            onClick={() => setTheme('system')}
            className={`p-3.5 rounded-lg border text-left flex items-center gap-3 transition-colors ${
              theme === 'system'
                ? 'border-amber-600 bg-amber-50/50 dark:bg-amber-950/20 text-stone-900 dark:text-stone-100'
                : 'border-stone-200 dark:border-stone-800 hover:border-stone-300'
            }`}
          >
            <div className="p-2 rounded-md bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-300">
              <Laptop className="w-4 h-4" />
            </div>
            <div>
              <div className="text-xs font-semibold">System Default</div>
              <div className="text-[11px] text-stone-500">Matches OS preference</div>
            </div>
          </button>
        </div>
      </div>

      {/* Global Bakery Parameters Form */}
      <div className="rounded-xl border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900 p-6">
        <div className="pb-3 border-b border-stone-100 dark:border-stone-800 mb-4 flex items-center gap-2">
          <Store className="w-4 h-4 text-stone-500" />
          <h2 className="text-sm font-semibold text-stone-900 dark:text-stone-100">
            Bakery Storefront & Commerce Parameters
          </h2>
        </div>

        <form onSubmit={handleSaveAppSettings} className="space-y-4 text-xs">
          <div>
            <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1">
              Storefront Display Name
            </label>
            <input
              type="text"
              value={appName}
              onChange={(e) => setAppName(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-800 text-stone-900 dark:text-stone-100 focus:outline-none focus:ring-1 focus:ring-amber-500"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1">
                Standard Currency ISO
              </label>
              <input
                type="text"
                value={currency}
                onChange={(e) => setCurrency(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-800 text-stone-900 dark:text-stone-100 focus:outline-none focus:ring-1 focus:ring-amber-500 font-mono"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1">
                Standard VAT Tax Rate (%)
              </label>
              <input
                type="number"
                step="0.1"
                value={taxRate}
                onChange={(e) => setTaxRate(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-800 text-stone-900 dark:text-stone-100 focus:outline-none focus:ring-1 focus:ring-amber-500 font-mono"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1">
                Standard Delivery Charge (AED)
              </label>
              <input
                type="number"
                step="0.5"
                value={deliveryFee}
                onChange={(e) => setDeliveryFee(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-800 text-stone-900 dark:text-stone-100 focus:outline-none focus:ring-1 focus:ring-amber-500 font-mono"
              />
            </div>
          </div>

          <div className="pt-2">
            <button
              type="submit"
              disabled={isSaving}
              className="px-4 py-2 rounded-lg bg-stone-900 text-white dark:bg-stone-100 dark:text-stone-900 font-semibold hover:bg-stone-800 dark:hover:bg-stone-200 transition-colors flex items-center gap-2"
            >
              {isSaving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
              <span>Save Application Settings</span>
            </button>
          </div>
        </form>
      </div>

      {/* Security Session Info */}
      <div className="rounded-xl border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900 p-6 space-y-4">
        <div className="pb-3 border-b border-stone-100 dark:border-stone-800 flex items-center gap-2">
          <Shield className="w-4 h-4 text-stone-500" />
          <h2 className="text-sm font-semibold text-stone-900 dark:text-stone-100">
            Security & Active Admin Session
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          <div>
            <span className="text-[11px] text-stone-500">Authenticated Administrator</span>
            <p className="font-semibold text-stone-900 dark:text-stone-100 mt-0.5">{user?.name}</p>
            <p className="font-mono text-stone-500 text-[11px]">{user?.email}</p>
          </div>

          <div>
            <span className="text-[11px] text-stone-500">Authorization Scope</span>
            <p className="font-mono text-stone-900 dark:text-stone-100 font-semibold mt-0.5">
              ROLE_ADMIN (Full Production Access)
            </p>
          </div>

          <div>
            <span className="text-[11px] text-stone-500">Token Protocol</span>
            <p className="font-mono text-stone-700 dark:text-stone-300 mt-0.5">
              HMAC-SHA256 Signed JWT (7-Day Expiry)
            </p>
          </div>

          <div>
            <span className="text-[11px] text-stone-500">Session Status</span>
            <p className="inline-flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400 font-semibold mt-0.5">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Verified & Active</span>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
