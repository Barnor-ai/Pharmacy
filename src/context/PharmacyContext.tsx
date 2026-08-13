import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  Medicine,
  Category,
  Supplier,
  Customer,
  Sale,
  Purchase,
  Prescription,
  Expense,
  User,
  AuditLog,
  PharmacySettings,
  NavigationTab,
  UserRole
} from '../types';
import {
  initialSettings,
  initialCategories,
  initialSuppliers,
  initialMedicines,
  initialCustomers,
  initialPrescriptions,
  initialSales,
  initialPurchases,
  initialExpenses,
  initialUsers,
  initialAuditLogs
} from '../data/initialData';
import {
  verifySupabaseConnection,
  syncMedicineToSupabase,
  deleteMedicineFromSupabase,
  syncSaleToSupabase,
  syncCustomerToSupabase,
  syncSupplierToSupabase,
  syncPrescriptionToSupabase,
  syncExpenseToSupabase,
  syncAuditLogToSupabase,
  syncFullStateToSupabase,
  SupabaseSyncStatus
} from '../lib/supabaseService';

interface PharmacyContextType {
  // Supabase Backend Sync Status
  supabaseStatus: SupabaseSyncStatus;
  triggerSupabaseSync: () => Promise<void>;

  // Theme & Navigation
  theme: 'light' | 'dark';
  toggleTheme: () => void;
  activeTab: NavigationTab;
  setActiveTab: (tab: NavigationTab) => void;
  
  // Active User & Authentication
  isAuthenticated: boolean;
  currentUser: User;
  setCurrentUser: (user: User) => void;
  switchRole: (role: UserRole) => void;
  login: (email: string, password?: string) => boolean;
  signup: (user: Omit<User, 'id'>) => User | null;
  loginWithGoogle: (email: string, name: string) => User;
  logout: () => void;

  // Data Collections
  settings: PharmacySettings;
  updateSettings: (newSettings: Partial<PharmacySettings>) => void;
  
  categories: Category[];
  addCategory: (category: Omit<Category, 'id'>) => void;

  suppliers: Supplier[];
  addSupplier: (supplier: Omit<Supplier, 'id' | 'totalPurchased' | 'balanceOwed'>) => void;
  updateSupplier: (id: string, updated: Partial<Supplier>) => void;

  customers: Customer[];
  addCustomer: (customer: Omit<Customer, 'id' | 'loyaltyPoints' | 'totalSpent'>) => void;
  updateCustomer: (id: string, updated: Partial<Customer>) => void;

  medicines: Medicine[];
  addMedicine: (medicine: Omit<Medicine, 'id' | 'status'>) => void;
  updateMedicine: (id: string, updated: Partial<Medicine>) => void;
  deleteMedicine: (id: string) => void;
  adjustStock: (id: string, quantityDelta: number, reason: string) => void;

  sales: Sale[];
  completeSale: (saleData: Omit<Sale, 'id' | 'invoiceNo' | 'createdAt' | 'status'>) => Sale;
  refundSale: (saleId: string) => void;

  purchases: Purchase[];
  addPurchaseOrder: (po: Omit<Purchase, 'id' | 'purchaseOrderNo' | 'deliveryStatus'>) => void;
  receivePurchaseOrder: (poId: string) => void;

  prescriptions: Prescription[];
  addPrescription: (rx: Omit<Prescription, 'id' | 'prescriptionNo' | 'createdAt' | 'status'>) => void;
  updatePrescriptionStatus: (id: string, status: Prescription['status'], notes?: string) => void;

  expenses: Expense[];
  addExpense: (expense: Omit<Expense, 'id'>) => void;

  users: User[];
  addUser: (user: Omit<User, 'id'>) => void;
  updateUserStatus: (id: string, status: 'Active' | 'Inactive') => void;

  auditLogs: AuditLog[];
  addAuditLog: (action: string, module: string, details: string) => void;

  // Helpers
  getMedicineById: (id: string) => Medicine | undefined;
  getLowStockCount: () => number;
  getExpiringSoonCount: () => number;
  getExpiredCount: () => number;
}

const PharmacyContext = createContext<PharmacyContextType | undefined>(undefined);

const STORAGE_PREFIX = 'pharmasys_v1_';

export const PharmacyProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Theme state
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    return (localStorage.getItem(STORAGE_PREFIX + 'theme') as 'light' | 'dark') || 'light';
  });

  // Navigation state
  const [activeTab, setActiveTab] = useState<NavigationTab>('dashboard');

  // Load persisted states or fall back to defaults
  const [settings, setSettings] = useState<PharmacySettings>(() => {
    const saved = localStorage.getItem(STORAGE_PREFIX + 'settings');
    return saved ? JSON.parse(saved) : initialSettings;
  });

  const [categories, setCategories] = useState<Category[]>(() => {
    const saved = localStorage.getItem(STORAGE_PREFIX + 'categories');
    return saved ? JSON.parse(saved) : initialCategories;
  });

  const [suppliers, setSuppliers] = useState<Supplier[]>(() => {
    const saved = localStorage.getItem(STORAGE_PREFIX + 'suppliers');
    return saved ? JSON.parse(saved) : initialSuppliers;
  });

  const [customers, setCustomers] = useState<Customer[]>(() => {
    const saved = localStorage.getItem(STORAGE_PREFIX + 'customers');
    return saved ? JSON.parse(saved) : initialCustomers;
  });

  const [medicines, setMedicines] = useState<Medicine[]>(() => {
    const saved = localStorage.getItem(STORAGE_PREFIX + 'medicines');
    return saved ? JSON.parse(saved) : initialMedicines;
  });

  const [sales, setSales] = useState<Sale[]>(() => {
    const saved = localStorage.getItem(STORAGE_PREFIX + 'sales');
    return saved ? JSON.parse(saved) : initialSales;
  });

  const [purchases, setPurchases] = useState<Purchase[]>(() => {
    const saved = localStorage.getItem(STORAGE_PREFIX + 'purchases');
    return saved ? JSON.parse(saved) : initialPurchases;
  });

  const [prescriptions, setPrescriptions] = useState<Prescription[]>(() => {
    const saved = localStorage.getItem(STORAGE_PREFIX + 'prescriptions');
    return saved ? JSON.parse(saved) : initialPrescriptions;
  });

  const [expenses, setExpenses] = useState<Expense[]>(() => {
    const saved = localStorage.getItem(STORAGE_PREFIX + 'expenses');
    return saved ? JSON.parse(saved) : initialExpenses;
  });

  const [users, setUsers] = useState<User[]>(() => {
    const saved = localStorage.getItem(STORAGE_PREFIX + 'users');
    return saved ? JSON.parse(saved) : initialUsers;
  });

  const [auditLogs, setAuditLogs] = useState<AuditLog[]>(() => {
    const saved = localStorage.getItem(STORAGE_PREFIX + 'auditLogs');
    return saved ? JSON.parse(saved) : initialAuditLogs;
  });

  const [currentUser, setCurrentUser] = useState<User>(() => {
    const savedUser = localStorage.getItem(STORAGE_PREFIX + 'currentUser');
    if (savedUser) {
      try { return JSON.parse(savedUser); } catch {}
    }
    return users[0] || initialUsers[0];
  });

  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    const savedAuth = localStorage.getItem(STORAGE_PREFIX + 'isAuthenticated');
    return savedAuth !== null ? savedAuth === 'true' : true;
  });

  // Supabase Backend Integration State
  const [supabaseStatus, setSupabaseStatus] = useState<SupabaseSyncStatus>({
    connected: false,
    message: 'Initializing Supabase backend connection...',
    lastSyncedAt: null,
    syncing: false
  });

  useEffect(() => {
    verifySupabaseConnection().then(status => {
      setSupabaseStatus(status);
    });
  }, []);

  const triggerSupabaseSync = async () => {
    setSupabaseStatus(prev => ({ ...prev, syncing: true, message: 'Syncing database records with Supabase...' }));
    try {
      const res = await syncFullStateToSupabase({
        medicines,
        sales,
        customers,
        suppliers,
        prescriptions,
        expenses
      });
      setSupabaseStatus({
        connected: true,
        message: `Synced ${res.syncedItemsCount} records with Supabase successfully!`,
        lastSyncedAt: res.timestamp,
        syncing: false
      });
    } catch (err: any) {
      setSupabaseStatus(prev => ({
        ...prev,
        syncing: false,
        message: `Sync warning: ${err?.message || 'Check Supabase table schemas.'}`
      }));
    }
  };

  useEffect(() => {
    localStorage.setItem(STORAGE_PREFIX + 'isAuthenticated', String(isAuthenticated));
  }, [isAuthenticated]);

  useEffect(() => {
    localStorage.setItem(STORAGE_PREFIX + 'currentUser', JSON.stringify(currentUser));
  }, [currentUser]);

  // Sync to local storage
  useEffect(() => {
    localStorage.setItem(STORAGE_PREFIX + 'theme', theme);
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);

  useEffect(() => {
    localStorage.setItem(STORAGE_PREFIX + 'settings', JSON.stringify(settings));
  }, [settings]);

  useEffect(() => {
    localStorage.setItem(STORAGE_PREFIX + 'categories', JSON.stringify(categories));
  }, [categories]);

  useEffect(() => {
    localStorage.setItem(STORAGE_PREFIX + 'suppliers', JSON.stringify(suppliers));
  }, [suppliers]);

  useEffect(() => {
    localStorage.setItem(STORAGE_PREFIX + 'customers', JSON.stringify(customers));
  }, [customers]);

  useEffect(() => {
    localStorage.setItem(STORAGE_PREFIX + 'medicines', JSON.stringify(medicines));
  }, [medicines]);

  useEffect(() => {
    localStorage.setItem(STORAGE_PREFIX + 'sales', JSON.stringify(sales));
  }, [sales]);

  useEffect(() => {
    localStorage.setItem(STORAGE_PREFIX + 'purchases', JSON.stringify(purchases));
  }, [purchases]);

  useEffect(() => {
    localStorage.setItem(STORAGE_PREFIX + 'prescriptions', JSON.stringify(prescriptions));
  }, [prescriptions]);

  useEffect(() => {
    localStorage.setItem(STORAGE_PREFIX + 'expenses', JSON.stringify(expenses));
  }, [expenses]);

  useEffect(() => {
    localStorage.setItem(STORAGE_PREFIX + 'users', JSON.stringify(users));
  }, [users]);

  useEffect(() => {
    localStorage.setItem(STORAGE_PREFIX + 'auditLogs', JSON.stringify(auditLogs));
  }, [auditLogs]);

  const toggleTheme = () => {
    setTheme(prev => (prev === 'light' ? 'dark' : 'light'));
  };

  const switchRole = (role: UserRole) => {
    const foundUser = users.find(u => u.role === role);
    if (foundUser) {
      setCurrentUser(foundUser);
      addAuditLog(`Switched user role to ${role}`, 'Authentication', `Active user changed to ${foundUser.name}`);
    } else {
      const newUser: User = {
        id: `usr-${Date.now()}`,
        name: `Demo ${role}`,
        email: `${role.toLowerCase().replace(' ', '')}@apothecarycure.com`,
        role,
        status: 'Active',
      };
      setUsers(prev => [...prev, newUser]);
      setCurrentUser(newUser);
      addAuditLog(`Switched user role to ${role}`, 'Authentication', `Active user changed to ${newUser.name}`);
    }
  };

  const login = (emailInput: string, _password?: string): boolean => {
    const cleanEmail = emailInput.trim().toLowerCase();
    const found = users.find(u => u.email.toLowerCase() === cleanEmail && u.status === 'Active');
    if (found) {
      setCurrentUser(found);
      setIsAuthenticated(true);
      addAuditLog('User Login', 'Authentication', `User ${found.name} (${found.email}) logged in.`);
      return true;
    }
    // Demo fallback matching
    if (cleanEmail.includes('admin') || cleanEmail.includes('pharmacist') || cleanEmail.includes('cashier') || cleanEmail.includes('manager')) {
      let roleToAssign: UserRole = 'Super Admin';
      if (cleanEmail.includes('pharmacist')) roleToAssign = 'Pharmacist';
      else if (cleanEmail.includes('cashier')) roleToAssign = 'Cashier';
      else if (cleanEmail.includes('manager')) roleToAssign = 'Store Manager';

      const demoUser: User = {
        id: `usr-${Date.now()}`,
        name: cleanEmail.split('@')[0].toUpperCase(),
        email: cleanEmail,
        role: roleToAssign,
        status: 'Active'
      };
      setUsers(prev => [...prev, demoUser]);
      setCurrentUser(demoUser);
      setIsAuthenticated(true);
      addAuditLog('User Login (Demo Fallback)', 'Authentication', `Logged in as ${demoUser.name}`);
      return true;
    }
    return false;
  };

  const signup = (userData: Omit<User, 'id'>): User | null => {
    const exists = users.some(u => u.email.toLowerCase() === userData.email.toLowerCase());
    if (exists) return null;

    const newUser: User = {
      ...userData,
      id: `usr-${Date.now()}`,
      status: 'Active',
      lastLogin: new Date().toISOString()
    };
    setUsers(prev => [...prev, newUser]);
    setCurrentUser(newUser);
    setIsAuthenticated(true);
    addAuditLog('User Registered', 'Authentication', `Registered new user: ${newUser.name} (${newUser.role})`);
    return newUser;
  };

  const loginWithGoogle = (gEmail: string, gName: string): User => {
    const existing = users.find(u => u.email.toLowerCase() === gEmail.toLowerCase());
    if (existing) {
      setCurrentUser(existing);
      setIsAuthenticated(true);
      addAuditLog('Google OAuth Login', 'Authentication', `User ${existing.name} signed in via Google.`);
      return existing;
    }

    const newUser: User = {
      id: `usr-${Date.now()}`,
      name: gName,
      email: gEmail,
      role: 'Pharmacist',
      status: 'Active',
      lastLogin: new Date().toISOString()
    };
    setUsers(prev => [...prev, newUser]);
    setCurrentUser(newUser);
    setIsAuthenticated(true);
    addAuditLog('Google OAuth Sign Up', 'Authentication', `New user registered via Google: ${gName}`);
    return newUser;
  };

  const logout = () => {
    addAuditLog('User Logout', 'Authentication', `User ${currentUser?.name} logged out.`);
    setIsAuthenticated(false);
  };

  const addAuditLog = (action: string, module: string, details: string) => {
    const newLog: AuditLog = {
      id: `log-${Date.now()}`,
      timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19),
      userName: currentUser ? currentUser.name : 'System',
      role: currentUser ? currentUser.role : 'Super Admin',
      action,
      module,
      details,
      ipAddress: '127.0.0.1'
    };
    setAuditLogs(prev => [newLog, ...prev]);
    syncAuditLogToSupabase(newLog);
  };

  // Status helper function
  const computeMedicineStatus = (stockQuantity: number, minReorder: number, expiryDateStr: string): Medicine['status'] => {
    const today = new Date();
    const expiryDate = new Date(expiryDateStr);
    const diffTime = expiryDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays <= 0) return 'Expired';
    if (diffDays <= settings.expiryWarningDays) return 'Expiring Soon';
    if (stockQuantity <= 0) return 'Out of Stock';
    if (stockQuantity <= minReorder) return 'Low Stock';
    return 'In Stock';
  };

  const updateSettings = (newSettings: Partial<PharmacySettings>) => {
    setSettings(prev => {
      const updated = { ...prev, ...newSettings };
      addAuditLog('Updated Pharmacy Settings', 'Settings', 'Modified store information and rules');
      return updated;
    });
  };

  const addCategory = (categoryData: Omit<Category, 'id'>) => {
    const newCat: Category = {
      id: `cat-${Date.now()}`,
      ...categoryData,
      itemCount: 0
    };
    setCategories(prev => [...prev, newCat]);
    addAuditLog(`Added New Category: ${newCat.name}`, 'Inventory', `Category created.`);
  };

  const addSupplier = (supplierData: Omit<Supplier, 'id' | 'totalPurchased' | 'balanceOwed'>) => {
    const newSupplier: Supplier = {
      id: `sup-${Date.now()}`,
      ...supplierData,
      totalPurchased: 0,
      balanceOwed: 0
    };
    setSuppliers(prev => [...prev, newSupplier]);
    syncSupplierToSupabase(newSupplier);
    addAuditLog(`Added New Supplier: ${newSupplier.name}`, 'Suppliers', `Contact person: ${newSupplier.contactPerson}`);
  };

  const updateSupplier = (id: string, updated: Partial<Supplier>) => {
    setSuppliers(prev => prev.map(s => {
      if (s.id === id) {
        const result = { ...s, ...updated };
        syncSupplierToSupabase(result);
        return result;
      }
      return s;
    }));
    addAuditLog(`Updated Supplier details`, 'Suppliers', `Supplier ID: ${id}`);
  };

  const addCustomer = (customerData: Omit<Customer, 'id' | 'loyaltyPoints' | 'totalSpent'>) => {
    const newCust: Customer = {
      id: `cust-${Date.now()}`,
      ...customerData,
      loyaltyPoints: 0,
      totalSpent: 0,
      lastVisit: new Date().toISOString().split('T')[0]
    };
    setCustomers(prev => [...prev, newCust]);
    syncCustomerToSupabase(newCust);
    addAuditLog(`Registered New Customer: ${newCust.name}`, 'Customers', `Phone: ${newCust.phone}`);
  };

  const updateCustomer = (id: string, updated: Partial<Customer>) => {
    setCustomers(prev => prev.map(c => {
      if (c.id === id) {
        const result = { ...c, ...updated };
        syncCustomerToSupabase(result);
        return result;
      }
      return c;
    }));
  };

  const addMedicine = (medData: Omit<Medicine, 'id' | 'status'>) => {
    const status = computeMedicineStatus(medData.stockQuantity, medData.minReorderLevel, medData.expiryDate);
    const newMed: Medicine = {
      id: `med-${Date.now()}`,
      ...medData,
      status
    };
    setMedicines(prev => [newMed, ...prev]);
    syncMedicineToSupabase(newMed);
    addAuditLog(`Added New Medicine: ${newMed.name}`, 'Inventory', `Barcode: ${newMed.barcode}, Stock: ${newMed.stockQuantity}`);
  };

  const updateMedicine = (id: string, updated: Partial<Medicine>) => {
    setMedicines(prev => prev.map(m => {
      if (m.id !== id) return m;
      const combined = { ...m, ...updated };
      combined.status = computeMedicineStatus(combined.stockQuantity, combined.minReorderLevel, combined.expiryDate);
      syncMedicineToSupabase(combined);
      return combined;
    }));
    addAuditLog(`Updated Medicine details`, 'Inventory', `Medicine ID: ${id}`);
  };

  const deleteMedicine = (id: string) => {
    const med = medicines.find(m => m.id === id);
    setMedicines(prev => prev.filter(m => m.id !== id));
    deleteMedicineFromSupabase(id);
    addAuditLog(`Deleted Medicine: ${med?.name || id}`, 'Inventory', `Removed from catalog`);
  };

  const adjustStock = (id: string, quantityDelta: number, reason: string) => {
    setMedicines(prev => prev.map(m => {
      if (m.id !== id) return m;
      const newQty = Math.max(0, m.stockQuantity + quantityDelta);
      const status = computeMedicineStatus(newQty, m.minReorderLevel, m.expiryDate);
      return { ...m, stockQuantity: newQty, status };
    }));
    addAuditLog(`Adjusted Stock (${quantityDelta > 0 ? '+' : ''}${quantityDelta})`, 'Inventory', `Reason: ${reason}`);
  };

  const completeSale = (saleData: Omit<Sale, 'id' | 'invoiceNo' | 'createdAt' | 'status'>): Sale => {
    const invoiceNo = `INV-${new Date().getFullYear()}-${String(sales.length + 401).padStart(5, '0')}`;
    const newSale: Sale = {
      id: `sale-${Date.now()}`,
      invoiceNo,
      ...saleData,
      status: 'Completed',
      createdAt: new Date().toISOString()
    };

    setSales(prev => [newSale, ...prev]);
    syncSaleToSupabase(newSale);

    // Deduct inventory quantities
    setMedicines(prevMeds => prevMeds.map(m => {
      const itemSold = saleData.items.find(i => i.medicineId === m.id);
      if (itemSold) {
        const newQty = Math.max(0, m.stockQuantity - itemSold.quantity);
        const status = computeMedicineStatus(newQty, m.minReorderLevel, m.expiryDate);
        return { ...m, stockQuantity: newQty, status };
      }
      return m;
    }));

    // Update customer spending and loyalty points if assigned
    if (saleData.customerId) {
      setCustomers(prevCust => prevCust.map(c => {
        if (c.id === saleData.customerId) {
          const addedPoints = Math.floor(saleData.grandTotal);
          return {
            ...c,
            totalSpent: c.totalSpent + saleData.grandTotal,
            loyaltyPoints: c.loyaltyPoints + addedPoints,
            lastVisit: new Date().toISOString().split('T')[0]
          };
        }
        return c;
      }));
    }

    addAuditLog(`Completed POS Sale ${invoiceNo}`, 'POS', `Grand Total: ${settings.currencySymbol}${saleData.grandTotal.toFixed(2)}, Items: ${saleData.items.length}`);
    return newSale;
  };

  const refundSale = (saleId: string) => {
    const targetSale = sales.find(s => s.id === saleId);
    if (!targetSale) return;

    setSales(prev => prev.map(s => (s.id === saleId ? { ...s, status: 'Refunded' } : s)));

    // Restock items
    setMedicines(prevMeds => prevMeds.map(m => {
      const itemRefunded = targetSale.items.find(i => i.medicineId === m.id);
      if (itemRefunded) {
        const newQty = m.stockQuantity + itemRefunded.quantity;
        const status = computeMedicineStatus(newQty, m.minReorderLevel, m.expiryDate);
        return { ...m, stockQuantity: newQty, status };
      }
      return m;
    }));

    addAuditLog(`Refunded Invoice ${targetSale.invoiceNo}`, 'Sales', `Restocked items into inventory.`);
  };

  const addPurchaseOrder = (poData: Omit<Purchase, 'id' | 'purchaseOrderNo' | 'deliveryStatus'>) => {
    const poNo = `PO-${new Date().getFullYear()}-${String(purchases.length + 101).padStart(3, '0')}`;
    const newPO: Purchase = {
      id: `po-${Date.now()}`,
      purchaseOrderNo: poNo,
      ...poData,
      deliveryStatus: 'Pending'
    };

    setPurchases(prev => [newPO, ...prev]);

    // Update supplier balance if pending
    if (poData.paymentStatus === 'Pending' || poData.paymentStatus === 'Partial') {
      setSuppliers(prev => prev.map(s => {
        if (s.id === poData.supplierId) {
          return {
            ...s,
            balanceOwed: s.balanceOwed + poData.totalAmount,
            totalPurchased: s.totalPurchased + poData.totalAmount
          };
        }
        return s;
      }));
    }

    addAuditLog(`Created Purchase Order ${poNo}`, 'Purchases', `Supplier: ${poData.supplierName}, Amount: ${settings.currencySymbol}${poData.totalAmount}`);
  };

  const receivePurchaseOrder = (poId: string) => {
    const po = purchases.find(p => p.id === poId);
    if (!po) return;

    setPurchases(prev => prev.map(p => (p.id === poId ? { ...p, deliveryStatus: 'Received', receivedDate: new Date().toISOString().split('T')[0] } : p)));

    // Increase stock quantities in inventory
    setMedicines(prevMeds => prevMeds.map(m => {
      const itemReceived = po.items.find(i => i.medicineId === m.id);
      if (itemReceived) {
        const newQty = m.stockQuantity + itemReceived.quantityOrdered;
        const status = computeMedicineStatus(newQty, m.minReorderLevel, itemReceived.expiryDate || m.expiryDate);
        return {
          ...m,
          stockQuantity: newQty,
          batchNumber: itemReceived.batchNumber || m.batchNumber,
          expiryDate: itemReceived.expiryDate || m.expiryDate,
          purchasePrice: itemReceived.unitCost || m.purchasePrice,
          status
        };
      }
      return m;
    }));

    addAuditLog(`Received Stock for Purchase Order ${po.purchaseOrderNo}`, 'Purchases', `Inventory updated.`);
  };

  const addPrescription = (rxData: Omit<Prescription, 'id' | 'prescriptionNo' | 'createdAt' | 'status'>) => {
    const rxNo = `RX-${new Date().getFullYear()}-${String(prescriptions.length + 893).padStart(4, '0')}`;
    const newRx: Prescription = {
      id: `rx-${Date.now()}`,
      prescriptionNo: rxNo,
      ...rxData,
      status: 'Pending',
      createdAt: new Date().toISOString()
    };

    setPrescriptions(prev => [newRx, ...prev]);
    syncPrescriptionToSupabase(newRx);
    addAuditLog(`Added New Prescription ${rxNo}`, 'Prescriptions', `Patient: ${rxData.customerName}, Doctor: ${rxData.doctorName}`);
  };

  const updatePrescriptionStatus = (id: string, status: Prescription['status'], notes?: string) => {
    setPrescriptions(prev => prev.map(rx => {
      if (rx.id !== id) return rx;
      const updatedRx = {
        ...rx,
        status,
        dispensedAt: status === 'Dispensed' ? new Date().toISOString() : rx.dispensedAt,
        dispensedBy: status === 'Dispensed' ? currentUser.name : rx.dispensedBy,
        notes: notes || rx.notes
      };
      syncPrescriptionToSupabase(updatedRx);
      return updatedRx;
    }));
    addAuditLog(`Updated Prescription status to ${status}`, 'Prescriptions', `Prescription ID: ${id}`);
  };

  const addExpense = (expData: Omit<Expense, 'id'>) => {
    const newExp: Expense = {
      id: `exp-${Date.now()}`,
      ...expData
    };
    setExpenses(prev => [newExp, ...prev]);
    syncExpenseToSupabase(newExp);
    addAuditLog(`Recorded Expense: ${newExp.description}`, 'Expenses', `Amount: ${settings.currencySymbol}${newExp.amount}`);
  };

  const addUser = (userData: Omit<User, 'id'>) => {
    const newUser: User = {
      id: `usr-${Date.now()}`,
      ...userData
    };
    setUsers(prev => [...prev, newUser]);
    addAuditLog(`Added New Staff Member: ${newUser.name}`, 'User Management', `Role: ${newUser.role}`);
  };

  const updateUserStatus = (id: string, status: 'Active' | 'Inactive') => {
    setUsers(prev => prev.map(u => (u.id === id ? { ...u, status } : u)));
    addAuditLog(`Changed User Status to ${status}`, 'User Management', `User ID: ${id}`);
  };

  const getMedicineById = (id: string) => medicines.find(m => m.id === id);

  const getLowStockCount = () => medicines.filter(m => m.status === 'Low Stock').length;
  const getExpiringSoonCount = () => medicines.filter(m => m.status === 'Expiring Soon').length;
  const getExpiredCount = () => medicines.filter(m => m.status === 'Expired').length;

  return (
    <PharmacyContext.Provider
      value={{
        supabaseStatus,
        triggerSupabaseSync,
        theme,
        toggleTheme,
        activeTab,
        setActiveTab,
        isAuthenticated,
        currentUser,
        setCurrentUser,
        switchRole,
        login,
        signup,
        loginWithGoogle,
        logout,
        settings,
        updateSettings,
        categories,
        addCategory,
        suppliers,
        addSupplier,
        updateSupplier,
        customers,
        addCustomer,
        updateCustomer,
        medicines,
        addMedicine,
        updateMedicine,
        deleteMedicine,
        adjustStock,
        sales,
        completeSale,
        refundSale,
        purchases,
        addPurchaseOrder,
        receivePurchaseOrder,
        prescriptions,
        addPrescription,
        updatePrescriptionStatus,
        expenses,
        addExpense,
        users,
        addUser,
        updateUserStatus,
        auditLogs,
        addAuditLog,
        getMedicineById,
        getLowStockCount,
        getExpiringSoonCount,
        getExpiredCount
      }}
    >
      {children}
    </PharmacyContext.Provider>
  );
};

export const usePharmacy = () => {
  const context = useContext(PharmacyContext);
  if (!context) {
    throw new Error('usePharmacy must be used within a PharmacyProvider');
  }
  return context;
};
