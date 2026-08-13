export type UserRole = 'Super Admin' | 'Pharmacist' | 'Cashier' | 'Store Manager';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatar?: string;
  phone?: string;
  status: 'Active' | 'Inactive';
  lastLogin?: string;
}

export type StockStatus = 'In Stock' | 'Low Stock' | 'Out of Stock' | 'Expiring Soon' | 'Expired';

export interface Medicine {
  id: string;
  barcode: string;
  name: string;
  genericName: string;
  category: string;
  brand: string;
  dosageForm: string; // e.g. Tablet, Syrup, Injection, Ointment, Capsule
  strength: string; // e.g. 500mg, 10ml, 5mg/ml
  batchNumber: string;
  manufactureDate: string;
  expiryDate: string;
  purchasePrice: number;
  sellingPrice: number;
  stockQuantity: number;
  minReorderLevel: number;
  unit: string; // Strip, Bottle, Box, Pack
  supplierId: string;
  supplierName?: string;
  locationRack: string;
  isPrescriptionRequired: boolean;
  status: StockStatus;
  description?: string;
  sideEffects?: string;
}

export interface Category {
  id: string;
  name: string;
  description: string;
  iconName?: string;
  itemCount?: number;
}

export interface Supplier {
  id: string;
  name: string;
  contactPerson: string;
  email: string;
  phone: string;
  address: string;
  taxId?: string;
  paymentTerms?: string;
  totalPurchased: number;
  balanceOwed: number;
  status: 'Active' | 'Inactive';
}

export interface Customer {
  id: string;
  name: string;
  phone: string;
  email?: string;
  address?: string;
  dateOfBirth?: string;
  gender?: 'Male' | 'Female' | 'Other';
  allergies?: string[];
  chronicConditions?: string[];
  loyaltyPoints: number;
  totalSpent: number;
  lastVisit?: string;
}

export interface SaleItem {
  medicineId: string;
  barcode: string;
  name: string;
  genericName: string;
  dosageForm: string;
  unitPrice: number;
  quantity: number;
  discount: number;
  total: number;
  isPrescriptionRequired: boolean;
}

export interface Sale {
  id: string;
  invoiceNo: string;
  customerId?: string;
  customerName: string;
  customerPhone?: string;
  items: SaleItem[];
  subtotal: number;
  taxAmount: number;
  discountAmount: number;
  grandTotal: number;
  paymentMethod: 'Cash' | 'Credit Card' | 'Debit Card' | 'Mobile Payment' | 'Insurance';
  amountPaid: number;
  changeGiven: number;
  status: 'Completed' | 'Refunded' | 'Cancelled';
  cashierName: string;
  createdAt: string;
  prescriptionNo?: string;
}

export interface PurchaseItem {
  medicineId: string;
  name: string;
  batchNumber: string;
  expiryDate: string;
  quantityOrdered: number;
  quantityReceived: number;
  unitCost: number;
  totalCost: number;
}

export interface Purchase {
  id: string;
  purchaseOrderNo: string;
  supplierId: string;
  supplierName: string;
  items: PurchaseItem[];
  totalAmount: number;
  paymentStatus: 'Paid' | 'Partial' | 'Pending';
  deliveryStatus: 'Received' | 'Pending' | 'Partial';
  orderDate: string;
  expectedDeliveryDate?: string;
  receivedDate?: string;
  notes?: string;
}

export interface PrescriptionRxItem {
  medicineName: string;
  dosage: string;
  frequency: string; // e.g. 1-0-1, Every 8 hours
  duration: string; // e.g. 5 days, 2 weeks
  quantity: number;
  instructions?: string;
}

export interface Prescription {
  id: string;
  prescriptionNo: string;
  customerId: string;
  customerName: string;
  doctorName: string;
  doctorRegNo: string;
  hospitalClinic: string;
  diagnosis?: string;
  items: PrescriptionRxItem[];
  status: 'Pending' | 'Verified' | 'Dispensed' | 'Cancelled';
  scannedFileUrl?: string;
  createdAt: string;
  dispensedAt?: string;
  dispensedBy?: string;
  notes?: string;
}

export interface Expense {
  id: string;
  category: 'Utilities' | 'Salaries' | 'Rent' | 'Equipment' | 'Maintenance' | 'Supplies' | 'Other';
  description: string;
  amount: number;
  date: string;
  paymentMethod: string;
  recordedBy: string;
}

export interface AuditLog {
  id: string;
  timestamp: string;
  userName: string;
  role: UserRole;
  action: string;
  module: string;
  details: string;
  ipAddress?: string;
}

export interface PharmacySettings {
  pharmacyName: string;
  licenseNumber: string;
  address: string;
  phone: string;
  email: string;
  currency: string;
  currencySymbol: string;
  vatRate: number; // percentage, e.g. 5 or 15
  lowStockThreshold: number;
  expiryWarningDays: number; // e.g. 90 days
  enablePrescriptionAlert: boolean;
  enableLoyaltyProgram: boolean;
  receiptHeaderNotice: string;
  receiptFooterNotice: string;
}

export type NavigationTab = 
  | 'dashboard'
  | 'pos'
  | 'inventory'
  | 'sales'
  | 'prescriptions'
  | 'purchases'
  | 'suppliers'
  | 'customers'
  | 'reports'
  | 'ai-assistant'
  | 'users'
  | 'audit-logs'
  | 'settings';
