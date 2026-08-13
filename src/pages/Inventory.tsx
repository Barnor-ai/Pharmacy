import React, { useState } from 'react';
import { usePharmacy } from '../context/PharmacyContext';
import { Medicine, StockStatus } from '../types';
import { formatCurrency, formatDate, getStockStatusBadge } from '../lib/formatters';
import {
  Search,
  Plus,
  Filter,
  Download,
  Edit2,
  Trash2,
  SlidersHorizontal,
  FileSpreadsheet,
  AlertTriangle,
  Pill,
  X,
  CheckCircle2
} from 'lucide-react';

export const Inventory: React.FC = () => {
  const {
    medicines,
    categories,
    suppliers,
    settings,
    addMedicine,
    updateMedicine,
    deleteMedicine,
    adjustStock
  } = usePharmacy();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedStatus, setSelectedStatus] = useState<string>('All');

  // Modal States
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingMedicine, setEditingMedicine] = useState<Medicine | null>(null);
  const [adjustingMed, setAdjustingMed] = useState<Medicine | null>(null);
  const [adjustDelta, setAdjustDelta] = useState<number>(0);
  const [adjustReason, setAdjustReason] = useState<string>('Physical Audit Stock Count');

  // Form State
  const initialFormState = {
    barcode: '',
    name: '',
    genericName: '',
    category: categories[0]?.name || 'Antibiotics',
    brand: '',
    dosageForm: 'Tablet',
    strength: '500mg',
    batchNumber: 'BATCH-' + Math.floor(Math.random() * 90000 + 10000),
    manufactureDate: new Date().toISOString().split('T')[0],
    expiryDate: new Date(Date.now() + 365 * 86400000 * 2).toISOString().split('T')[0],
    purchasePrice: 10,
    sellingPrice: 18,
    stockQuantity: 100,
    minReorderLevel: 20,
    unit: 'Box (30 Tabs)',
    supplierId: suppliers[0]?.id || '',
    locationRack: 'Shelf A-01',
    isPrescriptionRequired: false,
    description: '',
    sideEffects: ''
  };

  const [formData, setFormData] = useState(initialFormState);

  // Filter logic
  const filteredMedicines = medicines.filter(m => {
    const matchesSearch =
      m.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.genericName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.barcode.includes(searchQuery) ||
      m.batchNumber.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'All' || m.category === selectedCategory;
    const matchesStatus = selectedStatus === 'All' || m.status === selectedStatus;
    return matchesSearch && matchesCategory && matchesStatus;
  });

  const handleOpenAdd = () => {
    setFormData({
      ...initialFormState,
      barcode: '89010' + Math.floor(Math.random() * 900000 + 100000),
      supplierId: suppliers[0]?.id || ''
    });
    setEditingMedicine(null);
    setShowAddModal(true);
  };

  const handleOpenEdit = (med: Medicine) => {
    setEditingMedicine(med);
    setFormData({
      barcode: med.barcode,
      name: med.name,
      genericName: med.genericName,
      category: med.category,
      brand: med.brand,
      dosageForm: med.dosageForm,
      strength: med.strength,
      batchNumber: med.batchNumber,
      manufactureDate: med.manufactureDate,
      expiryDate: med.expiryDate,
      purchasePrice: med.purchasePrice,
      sellingPrice: med.sellingPrice,
      stockQuantity: med.stockQuantity,
      minReorderLevel: med.minReorderLevel,
      unit: med.unit,
      supplierId: med.supplierId,
      locationRack: med.locationRack,
      isPrescriptionRequired: med.isPrescriptionRequired,
      description: med.description || '',
      sideEffects: med.sideEffects || ''
    });
    setShowAddModal(true);
  };

  const handleSaveMedicine = (e: React.FormEvent) => {
    e.preventDefault();
    const selectedSupplier = suppliers.find(s => s.id === formData.supplierId);

    if (editingMedicine) {
      updateMedicine(editingMedicine.id, {
        ...formData,
        supplierName: selectedSupplier?.name
      });
    } else {
      addMedicine({
        ...formData,
        supplierName: selectedSupplier?.name
      });
    }

    setShowAddModal(false);
    setEditingMedicine(null);
  };

  const handleStockAdjustSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (adjustingMed && adjustDelta !== 0) {
      adjustStock(adjustingMed.id, adjustDelta, adjustReason);
    }
    setAdjustingMed(null);
    setAdjustDelta(0);
  };

  const exportCSV = () => {
    const headers = ['Barcode,Name,Generic Name,Category,Batch,Expiry Date,Cost Price,Selling Price,Stock,Status\n'];
    const rows = medicines.map(m =>
      `"${m.barcode}","${m.name}","${m.genericName}","${m.category}","${m.batchNumber}","${m.expiryDate}",${m.purchasePrice},${m.sellingPrice},${m.stockQuantity},"${m.status}"\n`
    );
    const blob = new Blob([...headers, ...rows], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `pharmacy_inventory_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
  };

  return (
    <div className="space-y-6">
      {/* Top Header Controls */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white">
            Medicine Catalog & Inventory
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Total {medicines.length} medicine records in stock database
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={exportCSV}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-100 text-xs font-bold transition shadow-sm"
          >
            <Download className="w-4 h-4 text-emerald-600" /> Export CSV
          </button>

          <button
            onClick={handleOpenAdd}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition shadow-sm"
          >
            <Plus className="w-4 h-4" /> Add Medicine
          </button>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {/* Search Input */}
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
            <input
              type="text"
              placeholder="Search by Name, Generic, Barcode..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          {/* Category Selector */}
          <div>
            <select
              value={selectedCategory}
              onChange={e => setSelectedCategory(e.target.value)}
              className="w-full py-2 px-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-medium text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            >
              <option value="All">All Categories</option>
              {categories.map(c => (
                <option key={c.id} value={c.name}>{c.name}</option>
              ))}
            </select>
          </div>

          {/* Status Selector */}
          <div>
            <select
              value={selectedStatus}
              onChange={e => setSelectedStatus(e.target.value)}
              className="w-full py-2 px-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-medium text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            >
              <option value="All">All Statuses</option>
              <option value="In Stock">In Stock</option>
              <option value="Low Stock">Low Stock</option>
              <option value="Out of Stock">Out of Stock</option>
              <option value="Expiring Soon">Expiring Soon</option>
              <option value="Expired">Expired</option>
            </select>
          </div>
        </div>
      </div>

      {/* Main Data Table */}
      <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-600 dark:text-slate-300">
            <thead className="bg-slate-100 dark:bg-slate-800/80 text-slate-700 dark:text-slate-300 font-semibold uppercase tracking-wider">
              <tr>
                <th className="p-3 rounded-l-xl">Barcode / Code</th>
                <th className="p-3">Medicine Name</th>
                <th className="p-3">Category</th>
                <th className="p-3">Batch & Expiry</th>
                <th className="p-3">Cost / Selling</th>
                <th className="p-3">Stock Level</th>
                <th className="p-3">Status</th>
                <th className="p-3 text-right rounded-r-xl">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
              {filteredMedicines.length === 0 ? (
                <tr>
                  <td colSpan={8} className="p-8 text-center text-slate-400">
                    No medicines match the selected filter criteria.
                  </td>
                </tr>
              ) : (
                filteredMedicines.map(m => (
                  <tr key={m.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition">
                    <td className="p-3 font-mono text-[11px] text-slate-500">
                      {m.barcode}
                      <span className="block text-[10px] text-slate-400">Rack: {m.locationRack}</span>
                    </td>
                    <td className="p-3 font-bold text-slate-900 dark:text-white">
                      <div className="flex items-center gap-1.5">
                        <span>{m.name}</span>
                        {m.isPrescriptionRequired && (
                          <span className="px-1 py-0.2 text-[9px] font-bold bg-rose-100 dark:bg-rose-950 text-rose-700 dark:text-rose-300 rounded border border-rose-300">
                            Rx
                          </span>
                        )}
                      </div>
                      <span className="block text-[11px] font-normal text-slate-500">
                        {m.strength} • {m.genericName}
                      </span>
                    </td>
                    <td className="p-3">{m.category}</td>
                    <td className="p-3">
                      <span className="font-mono text-[11px] font-semibold text-slate-800 dark:text-slate-200 block">
                        {m.batchNumber}
                      </span>
                      <span className="text-[11px] text-slate-500">Exp: {formatDate(m.expiryDate)}</span>
                    </td>
                    <td className="p-3">
                      <span className="text-slate-500 line-through text-[11px] block">
                        {formatCurrency(m.purchasePrice, settings.currencySymbol)}
                      </span>
                      <span className="font-bold text-slate-900 dark:text-white">
                        {formatCurrency(m.sellingPrice, settings.currencySymbol)}
                      </span>
                    </td>
                    <td className="p-3">
                      <div className="flex items-center gap-2">
                        <span className="font-extrabold text-slate-900 dark:text-white text-sm">
                          {m.stockQuantity}
                        </span>
                        <button
                          onClick={() => setAdjustingMed(m)}
                          className="px-2 py-0.5 rounded bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 text-[10px] font-semibold text-slate-600 dark:text-slate-300"
                          title="Adjust Stock Quantity"
                        >
                          ± Adjust
                        </button>
                      </div>
                    </td>
                    <td className="p-3">
                      <span className={`px-2.5 py-1 rounded-lg text-[11px] font-bold ${getStockStatusBadge(m.status)}`}>
                        {m.status}
                      </span>
                    </td>
                    <td className="p-3 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => handleOpenEdit(m)}
                          className="p-1.5 rounded-lg text-slate-500 hover:text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-950 transition"
                          title="Edit Medicine"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => {
                            if (confirm(`Are you sure you want to delete ${m.name}?`)) {
                              deleteMedicine(m.id);
                            }
                          }}
                          className="p-1.5 rounded-lg text-slate-500 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950 transition"
                          title="Delete Medicine"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add / Edit Medicine Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl max-w-2xl w-full p-6 shadow-2xl space-y-4 my-8">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
              <h3 className="font-bold text-base text-slate-900 dark:text-white">
                {editingMedicine ? 'Edit Medicine Details' : 'Add New Medicine to Catalog'}
              </h3>
              <button onClick={() => setShowAddModal(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveMedicine} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                    Medicine Trade Name *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Amoxil"
                    value={formData.name}
                    onChange={e => setFormData({ ...formData, name: e.target.value })}
                    className="w-full text-xs p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                    Generic Chemical Name *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Amoxicillin"
                    value={formData.genericName}
                    onChange={e => setFormData({ ...formData, genericName: e.target.value })}
                    className="w-full text-xs p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                    Barcode / EAN *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.barcode}
                    onChange={e => setFormData({ ...formData, barcode: e.target.value })}
                    className="w-full text-xs p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 font-mono"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                    Category *
                  </label>
                  <select
                    value={formData.category}
                    onChange={e => setFormData({ ...formData, category: e.target.value })}
                    className="w-full text-xs p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700"
                  >
                    {categories.map(c => (
                      <option key={c.id} value={c.name}>{c.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                    Dosage Form & Strength
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    <input
                      type="text"
                      placeholder="Tablet, Syrup"
                      value={formData.dosageForm}
                      onChange={e => setFormData({ ...formData, dosageForm: e.target.value })}
                      className="text-xs p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700"
                    />
                    <input
                      type="text"
                      placeholder="500mg, 10ml"
                      value={formData.strength}
                      onChange={e => setFormData({ ...formData, strength: e.target.value })}
                      className="text-xs p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                    Batch Number & Rack
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    <input
                      type="text"
                      placeholder="Batch #"
                      value={formData.batchNumber}
                      onChange={e => setFormData({ ...formData, batchNumber: e.target.value })}
                      className="text-xs p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 font-mono"
                    />
                    <input
                      type="text"
                      placeholder="Shelf A-01"
                      value={formData.locationRack}
                      onChange={e => setFormData({ ...formData, locationRack: e.target.value })}
                      className="text-xs p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                    Expiry Date *
                  </label>
                  <input
                    type="date"
                    required
                    value={formData.expiryDate}
                    onChange={e => setFormData({ ...formData, expiryDate: e.target.value })}
                    className="w-full text-xs p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                    Purchase Price / Selling Price ({settings.currencySymbol})
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    <input
                      type="number"
                      step="0.01"
                      value={formData.purchasePrice}
                      onChange={e => setFormData({ ...formData, purchasePrice: parseFloat(e.target.value) || 0 })}
                      className="text-xs p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 font-bold"
                    />
                    <input
                      type="number"
                      step="0.01"
                      value={formData.sellingPrice}
                      onChange={e => setFormData({ ...formData, sellingPrice: parseFloat(e.target.value) || 0 })}
                      className="text-xs p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 font-bold text-emerald-600"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                    Current Stock Quantity & Min Reorder
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    <input
                      type="number"
                      value={formData.stockQuantity}
                      onChange={e => setFormData({ ...formData, stockQuantity: parseInt(e.target.value) || 0 })}
                      className="text-xs p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 font-bold"
                    />
                    <input
                      type="number"
                      value={formData.minReorderLevel}
                      onChange={e => setFormData({ ...formData, minReorderLevel: parseInt(e.target.value) || 0 })}
                      className="text-xs p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                    Primary Supplier
                  </label>
                  <select
                    value={formData.supplierId}
                    onChange={e => setFormData({ ...formData, supplierId: e.target.value })}
                    className="w-full text-xs p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700"
                  >
                    {suppliers.map(s => (
                      <option key={s.id} value={s.id}>{s.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="flex items-center gap-2 pt-2">
                <input
                  type="checkbox"
                  id="rxCheckbox"
                  checked={formData.isPrescriptionRequired}
                  onChange={e => setFormData({ ...formData, isPrescriptionRequired: e.target.checked })}
                  className="w-4 h-4 text-emerald-600 rounded border-slate-300 focus:ring-emerald-500"
                />
                <label htmlFor="rxCheckbox" className="text-xs font-semibold text-rose-700 dark:text-rose-300">
                  Prescription Required (Rx Only Drug)
                </label>
              </div>

              <div className="flex justify-end gap-2 pt-4 border-t border-slate-200 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 text-xs font-bold text-slate-600 dark:text-slate-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-md"
                >
                  {editingMedicine ? 'Update Medicine' : 'Save to Inventory'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Stock Adjustment Modal */}
      {adjustingMed && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl max-w-sm w-full p-6 shadow-2xl space-y-4">
            <h3 className="font-bold text-base text-slate-900 dark:text-white">
              Stock Adjustment: {adjustingMed.name}
            </h3>
            <p className="text-xs text-slate-500">
              Current quantity: <span className="font-bold text-slate-900 dark:text-white">{adjustingMed.stockQuantity}</span>
            </p>

            <form onSubmit={handleStockAdjustSubmit} className="space-y-3">
              <div>
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                  Adjustment Quantity (+/-)
                </label>
                <input
                  type="number"
                  required
                  placeholder="e.g. +50 or -10"
                  onChange={e => setAdjustDelta(parseInt(e.target.value) || 0)}
                  className="w-full text-xs p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 font-bold"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                  Reason for Adjustment
                </label>
                <select
                  value={adjustReason}
                  onChange={e => setAdjustReason(e.target.value)}
                  className="w-full text-xs p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700"
                >
                  <option value="Physical Audit Stock Count">Physical Audit Stock Count</option>
                  <option value="Damaged / Broken Stock">Damaged / Broken Stock</option>
                  <option value="Expired Stock Removal">Expired Stock Removal</option>
                  <option value="Supplier Return">Supplier Return</option>
                  <option value="Sample / Internal Use">Sample / Internal Use</option>
                </select>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setAdjustingMed(null)}
                  className="px-3 py-1.5 text-xs font-bold text-slate-600"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-bold rounded-xl bg-emerald-600 text-white hover:bg-emerald-700"
                >
                  Apply Stock Change
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
