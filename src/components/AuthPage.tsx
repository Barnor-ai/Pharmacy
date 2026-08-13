import React, { useState } from 'react';
import { usePharmacy } from '../context/PharmacyContext';
import { UserRole, User } from '../types';
import {
  Cross,
  Lock,
  Mail,
  User as UserIcon,
  Phone,
  ShieldCheck,
  ArrowRight,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  Eye,
  EyeOff
} from 'lucide-react';

export const AuthPage: React.FC = () => {
  const { login, signup, loginWithGoogle, settings } = usePharmacy();
  const [mode, setMode] = useState<'login' | 'signup'>('login');

  // Form states
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [role, setRole] = useState<UserRole>('Pharmacist');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // Google OAuth Popup Simulation State
  const [showGoogleModal, setShowGoogleModal] = useState(false);
  const [customGoogleEmail, setCustomGoogleEmail] = useState('');

  const demoAccounts = [
    { name: 'Dr. Sarah Jenkins', email: 'admin@apothecarycure.com', role: 'Super Admin' as UserRole, desc: 'Full System Control & Settings' },
    { name: 'Mark Vance, RPh', email: 'pharmacist@apothecarycure.com', role: 'Pharmacist' as UserRole, desc: 'Prescriptions & Clinical Inventory' },
    { name: 'Jessica Alba', email: 'cashier@apothecarycure.com', role: 'Cashier' as UserRole, desc: 'POS Terminal & Daily Checkout' },
    { name: 'David Miller', email: 'manager@apothecarycure.com', role: 'Store Manager' as UserRole, desc: 'Purchases, Suppliers & Analytics' },
  ];

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!email || !password) {
      setError('Please provide both email and password.');
      return;
    }
    setLoading(true);
    setTimeout(() => {
      const success = login(email, password);
      setLoading(false);
      if (!success) {
        setError('Invalid credentials or inactive account. Try one of the quick demo accounts below.');
      }
    }, 600);
  };

  const handleSignup = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!name || !email || !password) {
      setError('Please fill in all required fields (Name, Email, Password).');
      return;
    }
    if (password.length < 4) {
      setError('Password should be at least 4 characters.');
      return;
    }
    setLoading(true);
    setTimeout(() => {
      const newUser = signup({
        name,
        email,
        role,
        phone,
        status: 'Active'
      });
      setLoading(false);
      if (!newUser) {
        setError('An account with this email already exists.');
      }
    }, 600);
  };

  const handleQuickDemo = (acc: typeof demoAccounts[0]) => {
    setEmail(acc.email);
    setPassword('demo123');
    login(acc.email, 'demo123');
  };

  const handleGoogleSelect = (gEmail: string, gName: string) => {
    loginWithGoogle(gEmail, gName);
    setShowGoogleModal(false);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center p-4 sm:p-6 lg:p-8 font-sans relative overflow-hidden">
      {/* Background ambient lighting */}
      <div className="absolute -top-40 -left-40 w-96 h-96 bg-emerald-600/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-teal-600/20 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-4xl grid grid-cols-1 md:grid-cols-12 bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl overflow-hidden relative z-10">
        
        {/* Left Side: Brand Hero & Benefits */}
        <div className="md:col-span-5 bg-gradient-to-br from-emerald-800 via-emerald-900 to-slate-950 p-8 flex flex-col justify-between text-white relative">
          <div className="space-y-6">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-emerald-500 text-slate-950 flex items-center justify-center font-extrabold shadow-lg shadow-emerald-500/30">
                <Cross className="w-7 h-7" />
              </div>
              <div>
                <h1 className="text-xl font-black tracking-tight leading-tight">{settings.pharmacyName}</h1>
                <p className="text-xs text-emerald-300 font-medium">Enterprise Health Suite</p>
              </div>
            </div>

            <div className="space-y-4 pt-4">
              <h2 className="text-2xl font-extrabold leading-snug">
                Streamlined Pharmacy Operations & Sales
              </h2>
              <p className="text-xs text-emerald-100/80 leading-relaxed">
                Securely manage drug inventories, real-time POS sales, patient prescriptions, suppliers, and clinical AI analytics in one unified platform.
              </p>
            </div>

            <div className="space-y-2.5 pt-2">
              {[
                'Instant POS Barcode Checkout',
                'Automatic Stock & Expiry Alerts',
                'Patient Allergy & Rx Safety Checks',
                'Gemini AI Operations Assistant',
                'Multi-Currency & Comprehensive Financial Reports'
              ].map((feat, i) => (
                <div key={i} className="flex items-center gap-2.5 text-xs text-emerald-100">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>{feat}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="pt-8 border-t border-emerald-800/60 mt-8">
            <p className="text-[11px] text-emerald-300/70">
              © {new Date().getFullYear()} {settings.pharmacyName}. All rights reserved.
            </p>
          </div>
        </div>

        {/* Right Side: Auth Form */}
        <div className="md:col-span-7 p-6 sm:p-8 flex flex-col justify-center bg-slate-900">
          
          {/* Mode Switcher Tabs */}
          <div className="flex rounded-xl bg-slate-800/80 p-1 mb-6 border border-slate-700/60">
            <button
              type="button"
              onClick={() => { setMode('login'); setError(null); }}
              className={`flex-1 py-2 text-xs font-bold rounded-lg transition ${
                mode === 'login' ? 'bg-emerald-600 text-white shadow-md' : 'text-slate-400 hover:text-white'
              }`}
            >
              Sign In
            </button>
            <button
              type="button"
              onClick={() => { setMode('signup'); setError(null); }}
              className={`flex-1 py-2 text-xs font-bold rounded-lg transition ${
                mode === 'signup' ? 'bg-emerald-600 text-white shadow-md' : 'text-slate-400 hover:text-white'
              }`}
            >
              Create Account
            </button>
          </div>

          {/* Error Alert */}
          {error && (
            <div className="mb-4 p-3 rounded-xl bg-rose-950/80 border border-rose-800 text-rose-200 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Form */}
          <form onSubmit={mode === 'login' ? handleLogin : handleSignup} className="space-y-4">
            
            {mode === 'signup' && (
              <>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Full Name *</label>
                  <div className="relative">
                    <UserIcon className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
                    <input
                      type="text"
                      required
                      placeholder="e.g. Dr. Alex Vance"
                      value={name}
                      onChange={e => setName(e.target.value)}
                      className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">Phone Number</label>
                    <div className="relative">
                      <Phone className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
                      <input
                        type="text"
                        placeholder="+1 (555) 019-2834"
                        value={phone}
                        onChange={e => setPhone(e.target.value)}
                        className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">Select User Role *</label>
                    <div className="relative">
                      <ShieldCheck className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
                      <select
                        value={role}
                        onChange={e => setRole(e.target.value as UserRole)}
                        className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500"
                      >
                        <option value="Pharmacist">Pharmacist</option>
                        <option value="Cashier">Cashier</option>
                        <option value="Store Manager">Store Manager</option>
                        <option value="Super Admin">Super Admin</option>
                      </select>
                    </div>
                  </div>
                </div>
              </>
            )}

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Email Address *</label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
                <input
                  type="email"
                  required
                  placeholder="name@pharmacy.com"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Password *</label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  placeholder="••••••••"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  className="w-full pl-9 pr-10 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-3 text-slate-500 hover:text-slate-300"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 font-bold text-white text-xs flex items-center justify-center gap-2 transition shadow-lg shadow-emerald-600/20 disabled:opacity-50 mt-2"
            >
              {loading ? (
                <span>Authenticating...</span>
              ) : (
                <>
                  <span>{mode === 'login' ? 'Sign In to Dashboard' : 'Register Pharmacy Account'}</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Social Google OAuth Divider */}
          <div className="my-5 flex items-center gap-3">
            <div className="h-px bg-slate-800 flex-1" />
            <span className="text-[11px] font-semibold text-slate-500 uppercase">Or continue with</span>
            <div className="h-px bg-slate-800 flex-1" />
          </div>

          {/* Google Sign In Button */}
          <button
            type="button"
            onClick={() => setShowGoogleModal(true)}
            className="w-full py-2.5 px-4 rounded-xl bg-slate-950 border border-slate-800 hover:border-slate-700 text-slate-200 text-xs font-semibold flex items-center justify-center gap-3 transition shadow-sm"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
              />
            </svg>
            <span>Sign in with Google Account</span>
          </button>

          {/* Quick Demo Accounts Helper */}
          <div className="mt-6 pt-4 border-t border-slate-800">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-2">
              ⚡ Quick 1-Click Demo Accounts
            </span>
            <div className="grid grid-cols-2 gap-2">
              {demoAccounts.map((acc, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => handleQuickDemo(acc)}
                  className="p-2 rounded-xl bg-slate-950/60 border border-slate-800 hover:border-emerald-600/50 text-left transition group"
                >
                  <p className="text-xs font-semibold text-slate-200 group-hover:text-emerald-400 truncate">{acc.name}</p>
                  <p className="text-[10px] text-slate-500 truncate">{acc.role}</p>
                </button>
              ))}
            </div>
          </div>

        </div>
      </div>

      {/* Google OAuth Modal Simulation */}
      {showGoogleModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white text-slate-900 rounded-3xl p-6 max-w-md w-full shadow-2xl space-y-5 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between border-b pb-4">
              <div className="flex items-center gap-2">
                <svg className="w-6 h-6" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
                </svg>
                <span className="font-bold text-sm text-slate-800">Sign in with Google</span>
              </div>
              <button
                onClick={() => setShowGoogleModal(false)}
                className="text-slate-400 hover:text-slate-600 font-bold text-sm"
              >
                ✕
              </button>
            </div>

            <div>
              <h3 className="font-bold text-base text-slate-900">Choose a Google Account</h3>
              <p className="text-xs text-slate-500">to continue to {settings.pharmacyName}</p>
            </div>

            <div className="space-y-2">
              {[
                { name: 'Dr. Sarah Jenkins', email: 'sarah.jenkins.pharma@gmail.com' },
                { name: 'Mark Vance (Licensed RPh)', email: 'mark.vance.rx@gmail.com' },
                { name: 'Jessica Alba (Cashier)', email: 'jessica.alba.staff@gmail.com' },
              ].map((g, i) => (
                <button
                  key={i}
                  onClick={() => handleGoogleSelect(g.email, g.name)}
                  className="w-full flex items-center gap-3 p-3 rounded-2xl border border-slate-200 hover:bg-slate-50 text-left transition"
                >
                  <div className="w-9 h-9 rounded-full bg-emerald-600 text-white font-bold flex items-center justify-center text-xs shrink-0">
                    {g.name.charAt(0)}
                  </div>
                  <div className="truncate">
                    <p className="text-xs font-bold text-slate-800">{g.name}</p>
                    <p className="text-[11px] text-slate-500">{g.email}</p>
                  </div>
                </button>
              ))}
            </div>

            <div className="pt-2 border-t space-y-2">
              <label className="block text-xs font-semibold text-slate-700">Or use another Google email:</label>
              <div className="flex gap-2">
                <input
                  type="email"
                  placeholder="your.email@gmail.com"
                  value={customGoogleEmail}
                  onChange={e => setCustomGoogleEmail(e.target.value)}
                  className="flex-1 p-2.5 rounded-xl border border-slate-300 text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
                <button
                  type="button"
                  disabled={!customGoogleEmail.includes('@')}
                  onClick={() => handleGoogleSelect(customGoogleEmail, customGoogleEmail.split('@')[0])}
                  className="px-4 py-2.5 rounded-xl bg-emerald-600 disabled:opacity-50 text-white font-bold text-xs"
                >
                  Continue
                </button>
              </div>
            </div>

          </div>
        </div>
      )}
    </div>
  );
};
