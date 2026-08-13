import React, { useState } from 'react';
import { usePharmacy } from '../context/PharmacyContext';
import {
  Database,
  CheckCircle2,
  RefreshCw,
  Copy,
  Check,
  ExternalLink,
  Code2,
  Server,
  X,
  Zap,
  HardDrive
} from 'lucide-react';

interface SupabaseSyncModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SupabaseSyncModal: React.FC<SupabaseSyncModalProps> = ({ isOpen, onClose }) => {
  const {
    supabaseStatus,
    triggerSupabaseSync,
    medicines,
    sales,
    customers,
    suppliers,
    prescriptions,
    expenses
  } = usePharmacy();

  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'status' | 'tables' | 'sql'>('status');

  if (!isOpen) return null;

  const projectId = 'oenzgttwkhepavbkcacj';
  const restUrl = 'https://oenzgttwkhepavbkcacj.supabase.co/rest/v1/';
  const anonKey =
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9lbnpndHR3a2hlcGF2YmtjYWNqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODY2NDg3MTIsImV4cCI6MjEwMjIyNDcxMn0.kcKn419KctlwijIJ0CeLcVKWYnM8dy0ec1cDsvSUByQ';

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(label);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const sqlSchemaScript = `-- Supabase Table Schemas for Apothecary Pharmacy Management System

-- 1. Medicines Table
CREATE TABLE IF NOT EXISTS public.medicines (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  generic_name TEXT,
  category TEXT,
  barcode TEXT,
  stock_quantity INTEGER DEFAULT 0,
  unit TEXT,
  purchase_price NUMERIC(10,2),
  selling_price NUMERIC(10,2),
  expiry_date DATE,
  batch_number TEXT,
  min_reorder_level INTEGER DEFAULT 10,
  status TEXT,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Sales Table
CREATE TABLE IF NOT EXISTS public.sales (
  id TEXT PRIMARY KEY,
  invoice_no TEXT NOT NULL,
  customer_name TEXT,
  payment_method TEXT,
  subtotal NUMERIC(10,2),
  tax_amount NUMERIC(10,2),
  discount_amount NUMERIC(10,2),
  grand_total NUMERIC(10,2),
  status TEXT,
  items JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Customers Table
CREATE TABLE IF NOT EXISTS public.customers (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  phone TEXT,
  email TEXT,
  loyalty_points INTEGER DEFAULT 0,
  total_spent NUMERIC(10,2) DEFAULT 0,
  allergies JSONB,
  chronic_conditions JSONB,
  last_visit DATE
);

-- 4. Suppliers Table
CREATE TABLE IF NOT EXISTS public.suppliers (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  contact_person TEXT,
  phone TEXT,
  email TEXT,
  total_purchased NUMERIC(10,2) DEFAULT 0,
  balance_owed NUMERIC(10,2) DEFAULT 0
);

-- 5. Prescriptions Table
CREATE TABLE IF NOT EXISTS public.prescriptions (
  id TEXT PRIMARY KEY,
  prescription_no TEXT NOT NULL,
  customer_name TEXT,
  doctor_name TEXT,
  hospital_name TEXT,
  status TEXT,
  medicines JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 6. Expenses Table
CREATE TABLE IF NOT EXISTS public.expenses (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  category TEXT,
  amount NUMERIC(10,2),
  date DATE,
  payment_method TEXT
);

-- 7. Audit Logs Table
CREATE TABLE IF NOT EXISTS public.audit_logs (
  id TEXT PRIMARY KEY,
  user_name TEXT,
  role TEXT,
  action TEXT,
  module TEXT,
  details TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security (RLS) or public policies
ALTER TABLE public.medicines ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public Read/Write Medicines" ON public.medicines FOR ALL USING (true);
CREATE POLICY "Public Read/Write Sales" ON public.sales FOR ALL USING (true);
`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 backdrop-blur-sm p-4 animate-fadeIn">
      <div className="bg-slate-900 border border-emerald-800/60 rounded-2xl shadow-2xl max-w-2xl w-full text-slate-100 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="flex items-center justify-between p-4 border-b border-slate-800 bg-gradient-to-r from-emerald-950/80 via-slate-900 to-slate-900">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-emerald-600/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400">
              <Database className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <h3 className="font-bold text-base text-white flex items-center gap-2">
                Supabase Backend Sync
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  Product ID: {projectId}
                </span>
              </h3>
              <p className="text-xs text-slate-400">
                Connected to Supabase REST API & Realtime Storage
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Tabs */}
        <div className="flex border-b border-slate-800 bg-slate-950/50 px-4">
          <button
            onClick={() => setActiveTab('status')}
            className={`py-2.5 px-4 text-xs font-semibold flex items-center gap-1.5 border-b-2 transition ${
              activeTab === 'status'
                ? 'border-emerald-500 text-emerald-400 bg-emerald-500/10'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Server className="w-3.5 h-3.5" />
            <span>Connection Status</span>
          </button>
          <button
            onClick={() => setActiveTab('tables')}
            className={`py-2.5 px-4 text-xs font-semibold flex items-center gap-1.5 border-b-2 transition ${
              activeTab === 'tables'
                ? 'border-emerald-500 text-emerald-400 bg-emerald-500/10'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <HardDrive className="w-3.5 h-3.5" />
            <span>REST Endpoints</span>
          </button>
          <button
            onClick={() => setActiveTab('sql')}
            className={`py-2.5 px-4 text-xs font-semibold flex items-center gap-1.5 border-b-2 transition ${
              activeTab === 'sql'
                ? 'border-emerald-500 text-emerald-400 bg-emerald-500/10'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Code2 className="w-3.5 h-3.5" />
            <span>SQL Schema Script</span>
          </button>
        </div>

        {/* Tab Content */}
        <div className="p-5 overflow-y-auto space-y-4 flex-1 text-xs">
          {activeTab === 'status' && (
            <div className="space-y-4">
              {/* Connection Status Box */}
              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 rounded-full bg-emerald-500 animate-ping shrink-0" />
                  <div>
                    <div className="font-bold text-sm text-emerald-400 flex items-center gap-1.5">
                      <CheckCircle2 className="w-4 h-4" />
                      Supabase REST Client Connected
                    </div>
                    <div className="text-slate-400 text-[11px] mt-0.5">
                      {supabaseStatus.message}
                    </div>
                  </div>
                </div>

                <button
                  onClick={triggerSupabaseSync}
                  disabled={supabaseStatus.syncing}
                  className="px-3 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-bold flex items-center gap-1.5 transition shadow-lg shadow-emerald-950"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${supabaseStatus.syncing ? 'animate-spin' : ''}`} />
                  <span>{supabaseStatus.syncing ? 'Syncing...' : 'Sync All Data Now'}</span>
                </button>
              </div>

              {/* Live Record Counters */}
              <div className="grid grid-cols-3 gap-2 text-center">
                <div className="p-2.5 rounded-xl bg-slate-950/70 border border-slate-800">
                  <div className="text-slate-400 text-[10px]">Medicines Catalog</div>
                  <div className="text-base font-bold text-emerald-400 mt-0.5">{medicines.length}</div>
                </div>
                <div className="p-2.5 rounded-xl bg-slate-950/70 border border-slate-800">
                  <div className="text-slate-400 text-[10px]">POS Sales Recorded</div>
                  <div className="text-base font-bold text-teal-400 mt-0.5">{sales.length}</div>
                </div>
                <div className="p-2.5 rounded-xl bg-slate-950/70 border border-slate-800">
                  <div className="text-slate-400 text-[10px]">Customers Registered</div>
                  <div className="text-base font-bold text-indigo-400 mt-0.5">{customers.length}</div>
                </div>
                <div className="p-2.5 rounded-xl bg-slate-950/70 border border-slate-800">
                  <div className="text-slate-400 text-[10px]">Active Suppliers</div>
                  <div className="text-base font-bold text-amber-400 mt-0.5">{suppliers.length}</div>
                </div>
                <div className="p-2.5 rounded-xl bg-slate-950/70 border border-slate-800">
                  <div className="text-slate-400 text-[10px]">Prescriptions</div>
                  <div className="text-base font-bold text-purple-400 mt-0.5">{prescriptions.length}</div>
                </div>
                <div className="p-2.5 rounded-xl bg-slate-950/70 border border-slate-800">
                  <div className="text-slate-400 text-[10px]">Expenses Recorded</div>
                  <div className="text-base font-bold text-rose-400 mt-0.5">{expenses.length}</div>
                </div>
              </div>

              {/* Supabase API Credentials Display */}
              <div className="space-y-2">
                <label className="font-bold text-slate-300 block">Supabase Project REST Endpoint URL</label>
                <div className="flex items-center gap-2 p-2.5 rounded-xl bg-slate-950 border border-slate-800 font-mono text-slate-300">
                  <span className="truncate flex-1 select-all">{restUrl}</span>
                  <button
                    onClick={() => copyToClipboard(restUrl, 'url')}
                    className="p-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 transition shrink-0"
                    title="Copy REST URL"
                  >
                    {copiedKey === 'url' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>

              <div className="space-y-2">
                <label className="font-bold text-slate-300 block">Supabase Anon Key (JWT)</label>
                <div className="flex items-center gap-2 p-2.5 rounded-xl bg-slate-950 border border-slate-800 font-mono text-slate-400 text-[11px]">
                  <span className="truncate flex-1">{anonKey.substring(0, 45)}...</span>
                  <button
                    onClick={() => copyToClipboard(anonKey, 'key')}
                    className="p-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 transition shrink-0"
                    title="Copy Anon Key"
                  >
                    {copiedKey === 'key' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'tables' && (
            <div className="space-y-3">
              <p className="text-slate-300">
                The frontend automatically syncs with these REST v1 endpoints on your Supabase instance:
              </p>
              <div className="space-y-2 font-mono text-[11px]">
                {[
                  { name: 'medicines', count: medicines.length, endpoint: `${restUrl}medicines` },
                  { name: 'sales', count: sales.length, endpoint: `${restUrl}sales` },
                  { name: 'customers', count: customers.length, endpoint: `${restUrl}customers` },
                  { name: 'suppliers', count: suppliers.length, endpoint: `${restUrl}suppliers` },
                  { name: 'prescriptions', count: prescriptions.length, endpoint: `${restUrl}prescriptions` },
                  { name: 'expenses', count: expenses.length, endpoint: `${restUrl}expenses` },
                  { name: 'audit_logs', count: 'Live', endpoint: `${restUrl}audit_logs` }
                ].map(item => (
                  <div key={item.name} className="flex items-center justify-between p-2.5 rounded-xl bg-slate-950 border border-slate-800">
                    <div className="flex items-center gap-2">
                      <Zap className="w-3.5 h-3.5 text-emerald-400" />
                      <span className="font-bold text-emerald-300">{item.name}</span>
                      <span className="text-slate-500">({item.count} items)</span>
                    </div>
                    <a
                      href={item.endpoint}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1 text-slate-400 hover:text-emerald-400 transition"
                    >
                      <span>REST API</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'sql' && (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-slate-300 font-semibold">Copy SQL schema for Supabase SQL Editor:</span>
                <button
                  onClick={() => copyToClipboard(sqlSchemaScript, 'sql')}
                  className="px-2.5 py-1 rounded bg-emerald-600/30 hover:bg-emerald-600/50 text-emerald-300 text-xs font-semibold flex items-center gap-1 transition"
                >
                  {copiedKey === 'sql' ? (
                    <>
                      <Check className="w-3 h-3" />
                      <span>Copied!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3 h-3" />
                      <span>Copy SQL Script</span>
                    </>
                  )}
                </button>
              </div>
              <pre className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-[10px] font-mono text-emerald-300/90 overflow-x-auto max-h-60 leading-relaxed">
                {sqlSchemaScript}
              </pre>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-4 border-t border-slate-800 bg-slate-950/60 flex items-center justify-between">
          <span className="text-[11px] text-slate-400">
            Base URL: https://oenzgttwkhepavbkcacj.supabase.co
          </span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold transition"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
