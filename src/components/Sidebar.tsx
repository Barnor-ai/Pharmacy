import React from 'react';
import { usePharmacy } from '../context/PharmacyContext';
import { NavigationTab, UserRole } from '../types';
import {
  LayoutDashboard,
  ShoppingCart,
  Pill,
  ReceiptText,
  FileText,
  PackageCheck,
  Truck,
  Users,
  BarChart3,
  Bot,
  UserCheck,
  History,
  Settings,
  PlusCircle,
  ShieldAlert,
  ChevronLeft,
  ChevronRight,
  Cross,
  LogOut,
  Download,
  Laptop
} from 'lucide-react';

interface SidebarProps {
  collapsed: boolean;
  setCollapsed: (collapsed: boolean) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ collapsed, setCollapsed }) => {
  const {
    activeTab,
    setActiveTab,
    currentUser,
    switchRole,
    settings,
    getLowStockCount,
    getExpiringSoonCount,
    getExpiredCount,
    logout
  } = usePharmacy();

  const totalAlerts = getLowStockCount() + getExpiringSoonCount() + getExpiredCount();

  const navItems: { id: NavigationTab; label: string; icon: React.ElementType; badge?: number; roles?: UserRole[] }[] = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'pos', label: 'Point of Sale (POS)', icon: ShoppingCart },
    { id: 'inventory', label: 'Medicine Catalog', icon: Pill, badge: totalAlerts },
    { id: 'sales', label: 'Sales History', icon: ReceiptText },
    { id: 'prescriptions', label: 'Prescriptions', icon: FileText },
    { id: 'purchases', label: 'Purchases & Stock-In', icon: PackageCheck },
    { id: 'suppliers', label: 'Suppliers', icon: Truck },
    { id: 'customers', label: 'Patients & Clients', icon: Users },
    { id: 'reports', label: 'Reports & Analytics', icon: BarChart3, roles: ['Super Admin', 'Store Manager'] },
    { id: 'ai-assistant', label: 'PharmaAI Assistant', icon: Bot },
    { id: 'users', label: 'Staff Management', icon: UserCheck, roles: ['Super Admin'] },
    { id: 'audit-logs', label: 'Audit Trail', icon: History, roles: ['Super Admin'] },
    { id: 'settings', label: 'Settings', icon: Settings, roles: ['Super Admin', 'Store Manager'] },
  ];

  const allowedItems = navItems.filter(item => {
    if (!item.roles) return true;
    return item.roles.includes(currentUser.role);
  });

  return (
    <aside
      className={`fixed top-0 left-0 z-30 h-screen transition-all duration-300 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 flex flex-col justify-between ${
        collapsed ? 'w-20' : 'w-64'
      }`}
    >
      {/* Top Brand Header */}
      <div>
        <div className="flex items-center justify-between h-16 px-4 border-b border-slate-200 dark:border-slate-800">
          {!collapsed ? (
            <div className="flex items-center gap-2.5 overflow-hidden">
              <div className="w-9 h-9 rounded-xl bg-emerald-600 text-white flex items-center justify-center font-bold shadow-md shadow-emerald-600/20 shrink-0">
                <Cross className="w-5 h-5" />
              </div>
              <div className="truncate">
                <h1 className="font-bold text-slate-900 dark:text-white text-base leading-tight truncate">
                  {settings.pharmacyName}
                </h1>
                <span className="text-[11px] font-medium text-emerald-600 dark:text-emerald-400 block truncate">
                  Pharmacy Management System
                </span>
              </div>
            </div>
          ) : (
            <div className="w-10 h-10 mx-auto rounded-xl bg-emerald-600 text-white flex items-center justify-center font-bold shadow-md shadow-emerald-600/20">
              <Cross className="w-6 h-6" />
            </div>
          )}

          <button
            onClick={() => setCollapsed(!collapsed)}
            className="p-1.5 text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition"
            title={collapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
          >
            {collapsed ? <ChevronRight className="w-5 h-5" /> : <ChevronLeft className="w-5 h-5" />}
          </button>
        </div>

        {/* Quick Role Switcher Selector */}
        {!collapsed && (
          <div className="p-3 mx-2 my-2 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/60">
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-[11px] font-semibold tracking-wider text-slate-500 uppercase dark:text-slate-400">
                Active User & Role
              </span>
              <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-semibold bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                {currentUser.role}
              </span>
            </div>
            <select
              value={currentUser.role}
              onChange={(e) => switchRole(e.target.value as UserRole)}
              className="w-full text-xs py-1.5 px-2 font-medium bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            >
              <option value="Super Admin">Super Admin (All Access)</option>
              <option value="Pharmacist">Pharmacist (Rx & Inventory)</option>
              <option value="Cashier">Cashier (POS & Sales)</option>
              <option value="Store Manager">Store Manager (Purchases & Reports)</option>
            </select>
          </div>
        )}

        {/* Navigation List */}
        <nav className="p-2 space-y-1 overflow-y-auto max-h-[calc(100vh-210px)]">
          {allowedItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl font-medium text-sm transition-all relative ${
                  isActive
                    ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/20 font-semibold'
                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/80 hover:text-slate-900 dark:hover:text-slate-100'
                }`}
                title={collapsed ? item.label : undefined}
              >
                <Icon className={`w-5 h-5 shrink-0 ${isActive ? 'text-white' : 'text-slate-500 dark:text-slate-400'}`} />
                {!collapsed && <span className="truncate">{item.label}</span>}

                {/* Badge if present */}
                {item.badge !== undefined && item.badge > 0 && (
                  <span
                    className={`ml-auto px-2 py-0.5 text-xs font-bold rounded-full ${
                      isActive
                        ? 'bg-white/20 text-white'
                        : 'bg-amber-100 text-amber-800 dark:bg-amber-900/60 dark:text-amber-300'
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* PC App Download Promo Card */}
      {!collapsed ? (
        <div className="mx-3 mb-2 p-3 rounded-2xl bg-gradient-to-br from-emerald-900/40 via-slate-900 to-teal-950 border border-emerald-800/50 text-white space-y-1.5">
          <div className="flex items-center gap-2">
            <Laptop className="w-4 h-4 text-emerald-400 shrink-0" />
            <span className="text-xs font-bold text-emerald-200">Download PC App</span>
          </div>
          <p className="text-[11px] text-slate-300 leading-tight">
            Install directly on your Windows or Mac PC desktop for 1-click access.
          </p>
          <button
            onClick={() => {
              const downloadBtn = document.querySelector('header button[title*="Download"]') as HTMLButtonElement;
              if (downloadBtn) downloadBtn.click();
            }}
            className="w-full py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 font-bold text-xs text-white flex items-center justify-center gap-1.5 transition shadow-sm"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Download Icon</span>
          </button>
        </div>
      ) : (
        <div className="p-2 text-center">
          <button
            onClick={() => {
              const downloadBtn = document.querySelector('header button[title*="Download"]') as HTMLButtonElement;
              if (downloadBtn) downloadBtn.click();
            }}
            className="p-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white transition mx-auto"
            title="Download PC App"
          >
            <Download className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Bottom Footer User Pill */}
      <div className="p-3 border-t border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50">
        {!collapsed ? (
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2.5 overflow-hidden">
              <div className="w-9 h-9 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 font-bold flex items-center justify-center text-sm border border-emerald-300 dark:border-emerald-800 shrink-0">
                {currentUser.name.charAt(0)}
              </div>
              <div className="truncate">
                <p className="text-xs font-semibold text-slate-800 dark:text-slate-200 truncate">{currentUser.name}</p>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate">{currentUser.email}</p>
              </div>
            </div>
            <button
              onClick={logout}
              className="p-1.5 text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition"
              title="Sign Out"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <button
            onClick={logout}
            className="w-9 h-9 mx-auto rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 font-bold flex items-center justify-center text-sm border border-emerald-300 dark:border-emerald-800 hover:bg-rose-100 dark:hover:bg-rose-950 hover:text-rose-600 transition"
            title={`Sign Out (${currentUser.name})`}
          >
            {currentUser.name.charAt(0)}
          </button>
        )}
      </div>
    </aside>
  );
};
