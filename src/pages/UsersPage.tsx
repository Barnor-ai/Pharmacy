import React, { useState } from 'react';
import { usePharmacy } from '../context/PharmacyContext';
import { UserRole } from '../types';
import { Shield, UserPlus, Mail, Phone, Lock, X } from 'lucide-react';

export const UsersPage: React.FC = () => {
  const { users, addUser, updateUserStatus } = usePharmacy();
  const [showAddModal, setShowAddModal] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState<UserRole>('Pharmacist');
  const [phone, setPhone] = useState('');

  const handleSaveUser = (e: React.FormEvent) => {
    e.preventDefault();
    addUser({
      name,
      email,
      role,
      status: 'Active',
      avatarUrl: `https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=150`
    });
    setShowAddModal(false);
    setName('');
    setEmail('');
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white">Staff & User Management</h1>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Control role-based permissions (Super Admin, Pharmacist, Cashier, Store Manager)
          </p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition shadow-sm"
        >
          <UserPlus className="w-4 h-4" /> Add Staff Member
        </button>
      </div>

      <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-600 dark:text-slate-300">
            <thead className="bg-slate-100 dark:bg-slate-800/80 text-slate-700 dark:text-slate-300 font-semibold uppercase tracking-wider">
              <tr>
                <th className="p-3 rounded-l-xl">User Profile</th>
                <th className="p-3">Email</th>
                <th className="p-3">Role</th>
                <th className="p-3">Last Login</th>
                <th className="p-3">Status</th>
                <th className="p-3 text-right rounded-r-xl">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
              {users.map(u => (
                <tr key={u.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition">
                  <td className="p-3 font-bold text-slate-900 dark:text-white flex items-center gap-2.5">
                    <img src={u.avatarUrl} alt={u.name} className="w-8 h-8 rounded-full object-cover border" />
                    <span>{u.name}</span>
                  </td>
                  <td className="p-3 font-mono">{u.email}</td>
                  <td className="p-3">
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                      {u.role}
                    </span>
                  </td>
                  <td className="p-3 text-slate-500">{u.lastLogin ? new Date(u.lastLogin).toLocaleTimeString() : 'Never'}</td>
                  <td className="p-3">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${u.status === 'Active' ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'}`}>
                      {u.status}
                    </span>
                  </td>
                  <td className="p-3 text-right">
                    <button
                      onClick={() => updateUserStatus(u.id, u.status === 'Active' ? 'Inactive' : 'Active')}
                      className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 dark:bg-slate-800 dark:text-slate-300 font-semibold text-[11px]"
                    >
                      {u.status === 'Active' ? 'Deactivate' : 'Activate'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4 text-xs">
            <div className="flex justify-between items-center pb-2 border-b">
              <h3 className="font-bold text-base">Add Staff Account</h3>
              <button onClick={() => setShowAddModal(false)}><X className="w-5 h-5" /></button>
            </div>
            <form onSubmit={handleSaveUser} className="space-y-3">
              <div>
                <label className="font-semibold block mb-1">Full Name *</label>
                <input type="text" required value={name} onChange={e => setName(e.target.value)} className="w-full p-2.5 rounded-xl border bg-slate-50 dark:bg-slate-800" />
              </div>
              <div>
                <label className="font-semibold block mb-1">Email Address *</label>
                <input type="email" required value={email} onChange={e => setEmail(e.target.value)} className="w-full p-2.5 rounded-xl border bg-slate-50 dark:bg-slate-800" />
              </div>
              <div>
                <label className="font-semibold block mb-1">System Role *</label>
                <select value={role} onChange={e => setRole(e.target.value as any)} className="w-full p-2.5 rounded-xl border bg-slate-50 dark:bg-slate-800">
                  <option value="Super Admin">Super Admin (Full Access)</option>
                  <option value="Pharmacist">Pharmacist (Prescriptions & Inventory)</option>
                  <option value="Cashier">Cashier (POS Sales Only)</option>
                  <option value="Store Manager">Store Manager (Purchases & Inventory)</option>
                </select>
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button type="button" onClick={() => setShowAddModal(false)} className="px-4 py-2 font-bold">Cancel</button>
                <button type="submit" className="px-4 py-2 rounded-xl bg-emerald-600 text-white font-bold">Create User</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
