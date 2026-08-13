import { supabase, checkSupabaseConnection } from './supabase';
import {
  Medicine,
  Sale,
  Customer,
  Supplier,
  Prescription,
  Expense,
  Category,
  AuditLog,
  PharmacySettings
} from '../types';

export interface SupabaseSyncStatus {
  connected: boolean;
  message: string;
  lastSyncedAt: string | null;
  syncing: boolean;
}

export async function verifySupabaseConnection(): Promise<SupabaseSyncStatus> {
  const result = await checkSupabaseConnection();
  return {
    connected: result.success,
    message: result.message,
    lastSyncedAt: new Date().toLocaleTimeString(),
    syncing: false
  };
}

/**
 * Helper to safely upsert or insert data into Supabase
 */
export async function syncMedicineToSupabase(medicine: Medicine) {
  try {
    const { data, error } = await supabase.from('medicines').upsert({
      id: medicine.id,
      name: medicine.name,
      genericName: medicine.genericName,
      category: medicine.category,
      barcode: medicine.barcode,
      stockQuantity: medicine.stockQuantity,
      unit: medicine.unit,
      purchasePrice: medicine.purchasePrice,
      sellingPrice: medicine.sellingPrice,
      expiryDate: medicine.expiryDate,
      batchNumber: medicine.batchNumber,
      minReorderLevel: medicine.minReorderLevel,
      status: medicine.status,
      updated_at: new Date().toISOString()
    }, { onConflict: 'id' });

    if (error && error.code !== '42P01') {
      console.warn('Supabase sync medicine warning:', error.message);
    }
    return { data, error };
  } catch (err: any) {
    console.warn('Supabase sync medicine failed:', err?.message);
    return { data: null, error: err };
  }
}

export async function deleteMedicineFromSupabase(medicineId: string) {
  try {
    const { error } = await supabase.from('medicines').delete().eq('id', medicineId);
    if (error && error.code !== '42P01') {
      console.warn('Supabase delete medicine warning:', error.message);
    }
  } catch (err) {
    console.warn('Supabase delete medicine error:', err);
  }
}

export async function syncSaleToSupabase(sale: Sale) {
  try {
    const { data, error } = await supabase.from('sales').upsert({
      id: sale.id,
      invoiceNo: sale.invoiceNo,
      customerName: sale.customerName,
      paymentMethod: sale.paymentMethod,
      subtotal: sale.subtotal,
      taxAmount: sale.taxAmount,
      discountAmount: sale.discountAmount,
      grandTotal: sale.grandTotal,
      status: sale.status,
      items: JSON.stringify(sale.items),
      created_at: sale.createdAt
    }, { onConflict: 'id' });

    if (error && error.code !== '42P01') {
      console.warn('Supabase sync sale warning:', error.message);
    }
    return { data, error };
  } catch (err) {
    console.warn('Supabase sync sale error:', err);
  }
}

export async function syncCustomerToSupabase(customer: Customer) {
  try {
    const { data, error } = await supabase.from('customers').upsert({
      id: customer.id,
      name: customer.name,
      phone: customer.phone,
      email: customer.email,
      loyaltyPoints: customer.loyaltyPoints,
      totalSpent: customer.totalSpent,
      allergies: customer.allergies ? JSON.stringify(customer.allergies) : '[]',
      chronicConditions: customer.chronicConditions ? JSON.stringify(customer.chronicConditions) : '[]',
      lastVisit: customer.lastVisit
    }, { onConflict: 'id' });

    if (error && error.code !== '42P01') {
      console.warn('Supabase sync customer warning:', error.message);
    }
    return { data, error };
  } catch (err) {
    console.warn('Supabase sync customer error:', err);
  }
}

export async function syncSupplierToSupabase(supplier: Supplier) {
  try {
    const { data, error } = await supabase.from('suppliers').upsert({
      id: supplier.id,
      name: supplier.name,
      contactPerson: supplier.contactPerson,
      phone: supplier.phone,
      email: supplier.email,
      totalPurchased: supplier.totalPurchased,
      balanceOwed: supplier.balanceOwed
    }, { onConflict: 'id' });

    if (error && error.code !== '42P01') {
      console.warn('Supabase sync supplier warning:', error.message);
    }
    return { data, error };
  } catch (err) {
    console.warn('Supabase sync supplier error:', err);
  }
}

export async function syncPrescriptionToSupabase(prescription: Prescription) {
  try {
    const { data, error } = await supabase.from('prescriptions').upsert({
      id: prescription.id,
      prescriptionNo: prescription.prescriptionNo,
      customerName: prescription.customerName,
      doctorName: prescription.doctorName,
      hospitalClinic: prescription.hospitalClinic,
      status: prescription.status,
      items: JSON.stringify(prescription.items),
      created_at: prescription.createdAt
    }, { onConflict: 'id' });

    if (error && error.code !== '42P01') {
      console.warn('Supabase sync prescription warning:', error.message);
    }
    return { data, error };
  } catch (err) {
    console.warn('Supabase sync prescription error:', err);
  }
}

export async function syncExpenseToSupabase(expense: Expense) {
  try {
    const { data, error } = await supabase.from('expenses').upsert({
      id: expense.id,
      title: expense.description,
      category: expense.category,
      amount: expense.amount,
      date: expense.date,
      paymentMethod: expense.paymentMethod
    }, { onConflict: 'id' });

    if (error && error.code !== '42P01') {
      console.warn('Supabase sync expense warning:', error.message);
    }
    return { data, error };
  } catch (err) {
    console.warn('Supabase sync expense error:', err);
  }
}

export async function syncAuditLogToSupabase(log: AuditLog) {
  try {
    const { data, error } = await supabase.from('audit_logs').insert({
      id: log.id,
      userName: log.userName,
      role: log.role,
      action: log.action,
      module: log.module,
      details: log.details,
      created_at: log.timestamp
    });

    if (error && error.code !== '42P01') {
      console.warn('Supabase audit log warning:', error.message);
    }
    return { data, error };
  } catch (err) {
    console.warn('Supabase audit log error:', err);
  }
}

/**
 * Full Database Sync: Attempts to load state from Supabase, or sync local state to Supabase
 */
export async function syncFullStateToSupabase(payload: {
  medicines: Medicine[];
  sales: Sale[];
  customers: Customer[];
  suppliers: Supplier[];
  prescriptions: Prescription[];
  expenses: Expense[];
}) {
  let syncedItemsCount = 0;

  for (const m of payload.medicines) {
    await syncMedicineToSupabase(m);
    syncedItemsCount++;
  }
  for (const s of payload.sales) {
    await syncSaleToSupabase(s);
    syncedItemsCount++;
  }
  for (const c of payload.customers) {
    await syncCustomerToSupabase(c);
    syncedItemsCount++;
  }
  for (const sp of payload.suppliers) {
    await syncSupplierToSupabase(sp);
    syncedItemsCount++;
  }
  for (const rx of payload.prescriptions) {
    await syncPrescriptionToSupabase(rx);
    syncedItemsCount++;
  }
  for (const ex of payload.expenses) {
    await syncExpenseToSupabase(ex);
    syncedItemsCount++;
  }

  return { syncedItemsCount, timestamp: new Date().toLocaleTimeString() };
}
