import React, { useState } from 'react';
import { usePharmacy } from '../context/PharmacyContext';
import { Settings, Save, CheckCircle2, ShieldCheck, Landmark, Database, RefreshCw, Server, Zap } from 'lucide-react';
import { SupabaseSyncModal } from '../components/SupabaseSyncModal';

export const SettingsPage: React.FC = () => {
  const { settings, updateSettings, supabaseStatus, triggerSupabaseSync } = usePharmacy();
  const [form, setForm] = useState(settings);
  const [savedNotice, setSavedNotice] = useState(false);
  const [showSupabaseModal, setShowSupabaseModal] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateSettings(form);
    setSavedNotice(true);
    setTimeout(() => setSavedNotice(false), 3000);
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white">Pharmacy & System Settings</h1>
        <p className="text-xs text-slate-500 dark:text-slate-400">
          Configure business license, receipt headers, tax percentages & regional currencies
        </p>
      </div>

      {savedNotice && (
        <div className="p-3.5 rounded-2xl bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 text-xs font-bold flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4" /> System settings updated successfully!
        </div>
      )}

      {/* Supabase Backend Integration Settings Card */}
      <div className="p-5 rounded-2xl bg-slate-900 border border-emerald-800/60 text-white shadow-lg space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-600/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400">
              <Database className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-sm text-white">Supabase Backend Integration</h3>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  Live REST API
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5 font-mono truncate max-w-md">
                https://oenzgttwkhepavbkcacj.supabase.co
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={triggerSupabaseSync}
              disabled={supabaseStatus.syncing}
              className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-bold text-xs flex items-center gap-1.5 transition shadow"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${supabaseStatus.syncing ? 'animate-spin' : ''}`} />
              <span>{supabaseStatus.syncing ? 'Syncing...' : 'Sync Database'}</span>
            </button>

            <button
              type="button"
              onClick={() => setShowSupabaseModal(true)}
              className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-emerald-300 font-bold text-xs transition border border-slate-700"
            >
              View API Details
            </button>
          </div>
        </div>

        <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-300 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="font-semibold text-emerald-300">Status:</span>
            <span className="text-slate-300">{supabaseStatus.message}</span>
          </div>
          {supabaseStatus.lastSyncedAt && (
            <span className="text-[11px] text-slate-500">Last Synced: {supabaseStatus.lastSyncedAt}</span>
          )}
        </div>
      </div>

      <form onSubmit={handleSubmit} className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4 text-xs">
        <h3 className="font-bold text-sm text-slate-900 dark:text-white border-b pb-2">Business Information</h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="font-semibold block mb-1">Pharmacy Name</label>
            <input
              type="text"
              value={form.pharmacyName}
              onChange={e => setForm({ ...form, pharmacyName: e.target.value })}
              className="w-full p-2.5 rounded-xl border bg-slate-50 dark:bg-slate-800 font-bold"
            />
          </div>

          <div>
            <label className="font-semibold block mb-1">Pharmacy License Number</label>
            <input
              type="text"
              value={form.licenseNumber}
              onChange={e => setForm({ ...form, licenseNumber: e.target.value })}
              className="w-full p-2.5 rounded-xl border bg-slate-50 dark:bg-slate-800 font-mono"
            />
          </div>

          <div>
            <label className="font-semibold block mb-1">Phone Contact</label>
            <input
              type="text"
              value={form.phone}
              onChange={e => setForm({ ...form, phone: e.target.value })}
              className="w-full p-2.5 rounded-xl border bg-slate-50 dark:bg-slate-800"
            />
          </div>

          <div>
            <label className="font-semibold block mb-1">Email Address</label>
            <input
              type="email"
              value={form.email}
              onChange={e => setForm({ ...form, email: e.target.value })}
              className="w-full p-2.5 rounded-xl border bg-slate-50 dark:bg-slate-800"
            />
          </div>
        </div>

        <div>
          <label className="font-semibold block mb-1">Physical Address</label>
          <input
            type="text"
            value={form.address}
            onChange={e => setForm({ ...form, address: e.target.value })}
            className="w-full p-2.5 rounded-xl border bg-slate-50 dark:bg-slate-800"
          />
        </div>

        <h3 className="font-bold text-sm text-slate-900 dark:text-white border-b pb-2 pt-2">Financial & Currency Settings</h3>

        <div>
          <label className="font-semibold block mb-1">Select Active Currency Preset</label>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-3">
            {[
              { code: 'USD', symbol: '$', name: 'US Dollar' },
              { code: 'EUR', symbol: '€', name: 'Euro' },
              { code: 'GBP', symbol: '£', name: 'British Pound' },
              { code: 'NGN', symbol: '₦', name: 'Nigerian Naira' },
              { code: 'INR', symbol: '₹', name: 'Indian Rupee' },
              { code: 'CAD', symbol: '$', name: 'Canadian Dollar' },
              { code: 'KES', symbol: 'KSh', name: 'Kenyan Shilling' },
              { code: 'ZAR', symbol: 'R', name: 'South African Rand' },
            ].map(curr => (
              <button
                key={curr.code}
                type="button"
                onClick={() => setForm({ ...form, currency: curr.code, currencySymbol: curr.symbol })}
                className={`p-2.5 rounded-xl border text-left transition ${
                  form.currency === curr.code
                    ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-950/60 font-bold text-emerald-800 dark:text-emerald-300'
                    : 'border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold">{curr.code}</span>
                  <span className="text-sm font-extrabold text-emerald-600">{curr.symbol}</span>
                </div>
                <span className="text-[10px] text-slate-500 block truncate">{curr.name}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div>
            <label className="font-semibold block mb-1">Custom Currency Code</label>
            <input
              type="text"
              value={form.currency}
              onChange={e => setForm({ ...form, currency: e.target.value })}
              className="w-full p-2.5 rounded-xl border bg-slate-50 dark:bg-slate-800 font-bold uppercase"
            />
          </div>

          <div>
            <label className="font-semibold block mb-1">Currency Symbol</label>
            <input
              type="text"
              value={form.currencySymbol}
              onChange={e => setForm({ ...form, currencySymbol: e.target.value })}
              className="w-full p-2.5 rounded-xl border bg-slate-50 dark:bg-slate-800 font-bold"
            />
          </div>

          <div>
            <label className="font-semibold block mb-1">VAT / Tax Rate (%)</label>
            <input
              type="number"
              step="0.1"
              value={form.vatRate}
              onChange={e => setForm({ ...form, vatRate: parseFloat(e.target.value) || 0 })}
              className="w-full p-2.5 rounded-xl border bg-slate-50 dark:bg-slate-800 font-bold text-emerald-600"
            />
          </div>
        </div>

        <h3 className="font-bold text-sm text-slate-900 dark:text-white border-b pb-2 pt-2">POS Receipt Customization</h3>

        <div>
          <label className="font-semibold block mb-1">Receipt Footer Notice</label>
          <textarea
            rows={2}
            value={form.receiptFooterNotice}
            onChange={e => setForm({ ...form, receiptFooterNotice: e.target.value })}
            className="w-full p-2.5 rounded-xl border bg-slate-50 dark:bg-slate-800"
          />
        </div>

        <div className="flex justify-end pt-4">
          <button
            type="submit"
            className="px-6 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center gap-2 shadow-md"
          >
            <Save className="w-4 h-4" /> Save System Settings
          </button>
        </div>
      </form>

      <SupabaseSyncModal
        isOpen={showSupabaseModal}
        onClose={() => setShowSupabaseModal(false)}
      />
    </div>
  );
};
