import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import { 
  Manufacturer, 
  VendorRecord, 
  PurchaseRecord, 
  InventoryRecord, 
  GSTReconciliationRecord 
} from '../types/dataset';
import { 
  rawManufacturers, 
  rawVendors, 
  rawPurchases, 
  rawInventory, 
  rawGSTReconciliation 
} from '../data/datasetLoader';

export type ScreenName = 
  | 'home' 
  | 'inventory' 
  | 'inventory-detail' 
  | 'orders' 
  | 'order-detail' 
  | 'new-order' 
  | 'gst' 
  | 'vendors' 
  | 'vendor-detail' 
  | 'manufacturers' 
  | 'matching' 
  | 'reports' 
  | 'scenarios';

export interface AppKPIs {
  totalSpend: number;
  taxableSpend: number;
  totalCGST: number;
  totalSGST: number;
  totalIGST: number;
  totalTax: number;
  stockValuation: number;
  lowStockCount: number;
  totalStockSKUs: number;
  overdueCount: number;
  overdueAmount: number;
  unpaidCount: number;
  unpaidAmount: number;
  mismatchCount: number;
  itcEligibleAmount: number;
  itcHoldAmount: number;
  itcReviewAmount: number;
  receivedCount: number;
  totalPurchasesCount: number;
}

export interface AuthUser {
  name: string;
  email: string;
  role: string;
  title: string;
}

interface AppContextType {
  // Auth state
  isAuthenticated: boolean;
  currentUser: AuthUser | null;
  login: (user: AuthUser) => void;
  logout: () => void;

  // Master lists
  manufacturers: Manufacturer[];
  vendors: VendorRecord[];
  purchases: PurchaseRecord[];
  inventory: InventoryRecord[];
  gstRecords: GSTReconciliationRecord[];

  // Active Context
  selectedManufacturerId: string;
  activeManufacturer: Manufacturer | null;
  selectManufacturer: (mfgId: string) => void;

  // Navigation
  currentScreen: ScreenName;
  screenHistory: ScreenName[];
  navigate: (screen: ScreenName, params?: { itemId?: string; orderId?: string; vendorId?: string; mfgId?: string }) => void;
  goBack: () => void;

  // Selected Entities for detail views
  selectedItemId: string | null;
  selectedOrderId: string | null;
  selectedVendorId: string | null;
  selectedItem: InventoryRecord | null;
  selectedOrder: PurchaseRecord | null;
  selectedVendor: VendorRecord | null;

  // Filtered Lists by Active Manufacturer
  filteredPurchases: PurchaseRecord[];
  filteredInventory: InventoryRecord[];
  filteredGSTRecords: GSTReconciliationRecord[];
  kpis: AppKPIs;

  // Phone Frame Display Mode
  isPhoneFrame: boolean;
  togglePhoneFrame: () => void;

  // Search
  searchQuery: string;
  setSearchQuery: (q: string) => void;

  // Scenario
  activeScenario: 'A' | 'B' | 'C' | 'D' | 'E' | 'F' | null;
  selectScenario: (key: 'A' | 'B' | 'C' | 'D' | 'E' | 'F') => void;

  // Actions
  updatePaymentStatus: (purchaseId: string, status: 'Paid' | 'Partially Paid' | 'Unpaid' | 'Overdue') => void;
  updateReconciliationStatus: (purchaseId: string, status: 'Matched' | 'Mismatch' | 'Not Checked') => void;
  updateITCStatus: (purchaseId: string, status: 'Potentially Eligible' | 'Review Required' | 'Hold - Verify Documents') => void;
  recordGoodsReceipt: (purchaseId: string, status: 'Received' | 'Partially Received') => void;
  createPurchaseOrder: (newPO: Omit<PurchaseRecord, 'purchase_id' | 'dataset_note'>) => PurchaseRecord;
  reorderInventoryItem: (invRecord: InventoryRecord, quantity: number) => void;
  resetData: () => void;

  // Toast
  toastMessage: string | null;
  showToast: (msg: string) => void;
}

const AppContext = createContext<AppContextType | null>(null);

const STORAGE_KEYS = {
  PURCHASES: 'forgeflow_purchases_v2',
  INVENTORY: 'forgeflow_inventory_v2',
  GST: 'forgeflow_gst_v2',
  ACTIVE_MFG: 'forgeflow_active_mfg_v2',
  PHONE_FRAME: 'forgeflow_phone_frame_v2',
  AUTH: 'forgeflow_auth_v2',
  USER: 'forgeflow_user_v2'
};

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Authentication State
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.AUTH);
      return stored ? JSON.parse(stored) : false; // user should get login page after entering the website!
    } catch {
      return false;
    }
  });

  const [currentUser, setCurrentUser] = useState<AuthUser | null>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.USER);
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  });

  // Load initial from storage if available, else raw
  const [manufacturers] = useState<Manufacturer[]>(rawManufacturers);
  const [vendors] = useState<VendorRecord[]>(rawVendors);

  const [purchases, setPurchases] = useState<PurchaseRecord[]>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.PURCHASES);
      return stored ? JSON.parse(stored) : rawPurchases;
    } catch {
      return rawPurchases;
    }
  });

  const [inventory, setInventory] = useState<InventoryRecord[]>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.INVENTORY);
      return stored ? JSON.parse(stored) : rawInventory;
    } catch {
      return rawInventory;
    }
  });

  const [gstRecords, setGstRecords] = useState<GSTReconciliationRecord[]>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.GST);
      return stored ? JSON.parse(stored) : rawGSTReconciliation;
    } catch {
      return rawGSTReconciliation;
    }
  });

  const [selectedManufacturerId, setSelectedManufacturerId] = useState<string>(() => {
    try {
      return localStorage.getItem(STORAGE_KEYS.ACTIVE_MFG) || 'MFG001';
    } catch {
      return 'MFG001';
    }
  });

  const [isPhoneFrame, setIsPhoneFrame] = useState<boolean>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.PHONE_FRAME);
      return stored !== null ? JSON.parse(stored) : false; // default fullscreen on desktop with phone toggle
    } catch {
      return false;
    }
  });

  const [currentScreen, setCurrentScreen] = useState<ScreenName>('home');
  const [screenHistory, setScreenHistory] = useState<ScreenName[]>(['home']);
  const [selectedItemId, setSelectedItemId] = useState<string | null>(null);
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);
  const [selectedVendorId, setSelectedVendorId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [activeScenario, setActiveScenario] = useState<'A' | 'B' | 'C' | 'D' | 'E' | 'F' | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Sync state to local storage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.PURCHASES, JSON.stringify(purchases));
    } catch (e) {
      console.warn('Storage failed', e);
    }
  }, [purchases]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.INVENTORY, JSON.stringify(inventory));
    } catch (e) {
      console.warn('Storage failed', e);
    }
  }, [inventory]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.GST, JSON.stringify(gstRecords));
    } catch (e) {
      console.warn('Storage failed', e);
    }
  }, [gstRecords]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.ACTIVE_MFG, selectedManufacturerId);
    } catch (e) {
      console.warn('Storage failed', e);
    }
  }, [selectedManufacturerId]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.PHONE_FRAME, JSON.stringify(isPhoneFrame));
    } catch (e) {
      console.warn('Storage failed', e);
    }
  }, [isPhoneFrame]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage((prev) => (prev === msg ? null : prev));
    }, 3200);
  };

  const togglePhoneFrame = () => {
    setIsPhoneFrame(prev => !prev);
    showToast(!isPhoneFrame ? 'Switched to Mobile Frame Mode' : 'Switched to Fullscreen App Mode');
  };

  const activeManufacturer = useMemo(() => {
    if (selectedManufacturerId === 'ALL') return null;
    return manufacturers.find(m => m.manufacturer_id === selectedManufacturerId) || manufacturers[0];
  }, [manufacturers, selectedManufacturerId]);

  const selectManufacturer = (mfgId: string) => {
    setSelectedManufacturerId(mfgId);
    const m = manufacturers.find(item => item.manufacturer_id === mfgId);
    showToast(mfgId === 'ALL' ? 'Showing All Manufacturers' : `Active: ${m?.business_name || mfgId}`);
  };

  // Filtered views by Manufacturer
  const filteredPurchases = useMemo(() => {
    if (selectedManufacturerId === 'ALL') return purchases;
    return purchases.filter(p => p.manufacturer_id === selectedManufacturerId);
  }, [purchases, selectedManufacturerId]);

  const filteredInventory = useMemo(() => {
    if (selectedManufacturerId === 'ALL') return inventory;
    return inventory.filter(i => i.manufacturer_id === selectedManufacturerId);
  }, [inventory, selectedManufacturerId]);

  const filteredGSTRecords = useMemo(() => {
    if (selectedManufacturerId === 'ALL') return gstRecords;
    return gstRecords.filter(g => g.manufacturer_id === selectedManufacturerId);
  }, [gstRecords, selectedManufacturerId]);

  // Selected Detail records
  const selectedItem = useMemo(() => {
    if (!selectedItemId) return null;
    return inventory.find(i => i.inventory_record_id === selectedItemId) || null;
  }, [inventory, selectedItemId]);

  const selectedOrder = useMemo(() => {
    if (!selectedOrderId) return null;
    return purchases.find(p => p.purchase_id === selectedOrderId || p.invoice_number === selectedOrderId) || null;
  }, [purchases, selectedOrderId]);

  const selectedVendor = useMemo(() => {
    if (!selectedVendorId) return null;
    return vendors.find(v => v.vendor_id === selectedVendorId) || null;
  }, [vendors, selectedVendorId]);

  // Compute KPIs
  const kpis = useMemo<AppKPIs>(() => {
    let totalSpend = 0;
    let taxableSpend = 0;
    let totalCGST = 0;
    let totalSGST = 0;
    let totalIGST = 0;
    let overdueCount = 0;
    let overdueAmount = 0;
    let unpaidCount = 0;
    let unpaidAmount = 0;
    let mismatchCount = 0;
    let itcEligibleAmount = 0;
    let itcHoldAmount = 0;
    let itcReviewAmount = 0;
    let receivedCount = 0;

    for (const p of filteredPurchases) {
      totalSpend += p.invoice_total_inr || 0;
      taxableSpend += p.taxable_value_inr || 0;
      totalCGST += p.cgst_inr || 0;
      totalSGST += p.sgst_inr || 0;
      totalIGST += p.igst_inr || 0;

      if (p.payment_status === 'Overdue') {
        overdueCount++;
        overdueAmount += p.invoice_total_inr || 0;
      }
      if (p.payment_status === 'Unpaid' || p.payment_status === 'Overdue') {
        unpaidCount++;
        unpaidAmount += p.invoice_total_inr || 0;
      }
      if (p.invoice_reconciliation_status === 'Mismatch') {
        mismatchCount++;
      }
      if (p.goods_receipt_status === 'Received') {
        receivedCount++;
      }

      const taxTotal = (p.cgst_inr || 0) + (p.sgst_inr || 0) + (p.igst_inr || 0);
      if (p.itc_review_status === 'Potentially Eligible') {
        itcEligibleAmount += taxTotal;
      } else if (p.itc_review_status === 'Hold - Verify Documents') {
        itcHoldAmount += taxTotal;
      } else {
        itcReviewAmount += taxTotal;
      }
    }

    let stockValuation = 0;
    let lowStockCount = 0;
    for (const item of filteredInventory) {
      stockValuation += item.closing_stock_value_inr || 0;
      if (item.stock_status === 'LOW STOCK' || item.closing_stock_qty <= item.reorder_level_qty) {
        lowStockCount++;
      }
    }

    return {
      totalSpend,
      taxableSpend,
      totalCGST,
      totalSGST,
      totalIGST,
      totalTax: totalCGST + totalSGST + totalIGST,
      stockValuation,
      lowStockCount,
      totalStockSKUs: filteredInventory.length,
      overdueCount,
      overdueAmount,
      unpaidCount,
      unpaidAmount,
      mismatchCount,
      itcEligibleAmount,
      itcHoldAmount,
      itcReviewAmount,
      receivedCount,
      totalPurchasesCount: filteredPurchases.length
    };
  }, [filteredPurchases, filteredInventory]);

  // Page-wise Navigation
  const navigate = (screen: ScreenName, params?: { itemId?: string; orderId?: string; vendorId?: string; mfgId?: string }) => {
    if (params?.itemId) setSelectedItemId(params.itemId);
    if (params?.orderId) setSelectedOrderId(params.orderId);
    if (params?.vendorId) setSelectedVendorId(params.vendorId);
    if (params?.mfgId) selectManufacturer(params.mfgId);

    setScreenHistory(prev => [...prev, screen]);
    setCurrentScreen(screen);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const goBack = () => {
    if (screenHistory.length > 1) {
      const newHistory = [...screenHistory];
      newHistory.pop(); // remove current
      const prevScreen = newHistory[newHistory.length - 1];
      setScreenHistory(newHistory);
      setCurrentScreen(prevScreen);
    } else {
      setCurrentScreen('home');
      setScreenHistory(['home']);
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Actions
  const updatePaymentStatus = (purchaseId: string, status: 'Paid' | 'Partially Paid' | 'Unpaid' | 'Overdue') => {
    setPurchases(prev => prev.map(p => {
      if (p.purchase_id === purchaseId || p.invoice_number === purchaseId) {
        return { ...p, payment_status: status };
      }
      return p;
    }));
    showToast(`Order ${purchaseId} updated to ${status}`);
  };

  const updateReconciliationStatus = (purchaseId: string, status: 'Matched' | 'Mismatch' | 'Not Checked') => {
    setPurchases(prev => prev.map(p => {
      if (p.purchase_id === purchaseId || p.invoice_number === purchaseId) {
        return { ...p, invoice_reconciliation_status: status };
      }
      return p;
    }));
    setGstRecords(prev => prev.map(g => {
      if (g.purchase_id === purchaseId || g.invoice_number === purchaseId) {
        return { ...g, invoice_reconciliation_status: status };
      }
      return g;
    }));
    showToast(`3-Way Reconciliation updated to ${status}`);
  };

  const updateITCStatus = (purchaseId: string, status: 'Potentially Eligible' | 'Review Required' | 'Hold - Verify Documents') => {
    setPurchases(prev => prev.map(p => {
      if (p.purchase_id === purchaseId || p.invoice_number === purchaseId) {
        return { ...p, itc_review_status: status };
      }
      return p;
    }));
    setGstRecords(prev => prev.map(g => {
      if (g.purchase_id === purchaseId || g.invoice_number === purchaseId) {
        return { ...g, itc_review_status: status };
      }
      return g;
    }));
    showToast(`ITC Eligibility set to "${status}"`);
  };

  const recordGoodsReceipt = (purchaseId: string, status: 'Received' | 'Partially Received') => {
    setPurchases(prev => prev.map(p => {
      if (p.purchase_id === purchaseId || p.invoice_number === purchaseId) {
        return { ...p, goods_receipt_status: status };
      }
      return p;
    }));
    setGstRecords(prev => prev.map(g => {
      if (g.purchase_id === purchaseId || g.invoice_number === purchaseId) {
        return { ...g, goods_received_confirmed: status === 'Received' ? 'Yes' : 'Partial' };
      }
      return g;
    }));
    showToast(`GRN Recorded: ${status}`);
  };

  const createPurchaseOrder = (newPOData: Omit<PurchaseRecord, 'purchase_id' | 'dataset_note'>): PurchaseRecord => {
    const nextNum = purchases.length + 1;
    const poId = `PO${String(nextNum).padStart(5, '0')}`;
    const newPO: PurchaseRecord = {
      ...newPOData,
      purchase_id: poId,
      dataset_note: 'Created in ForgeFlow Mobile App'
    };
    setPurchases(prev => [newPO, ...prev]);
    showToast(`PO ${poId} generated successfully!`);
    return newPO;
  };

  const reorderInventoryItem = (invRecord: InventoryRecord, quantity: number) => {
    // Look up preferred vendor or default vendor for this material
    const matchingPO = purchases.find(p => p.material_id === invRecord.material_id);
    const vendorId = matchingPO ? matchingPO.vendor_id : 'VEN001';
    const vendor = vendors.find(v => v.vendor_id === vendorId) || vendors[0];
    const mfg = manufacturers.find(m => m.manufacturer_id === invRecord.manufacturer_id) || manufacturers[0];

    const isSameState = vendor.state_code === mfg.state_code;
    const unitPrice = invRecord.average_unit_cost_inr || 100;
    const taxable = Math.round(unitPrice * quantity * 100) / 100;
    const gstRate = 18;
    const taxTotal = Math.round(taxable * (gstRate / 100) * 100) / 100;
    const cgst = isSameState ? Math.round((taxTotal / 2) * 100) / 100 : 0;
    const sgst = isSameState ? Math.round((taxTotal / 2) * 100) / 100 : 0;
    const igst = isSameState ? 0 : taxTotal;
    const invoiceTotal = Math.round((taxable + taxTotal) * 100) / 100;

    const newPO = createPurchaseOrder({
      invoice_number: `INV-${vendorId}-${String(Date.now()).slice(-5)}`,
      invoice_date: new Date().toISOString().split('T')[0],
      manufacturer_id: invRecord.manufacturer_id,
      vendor_id: vendorId,
      material_id: invRecord.material_id,
      material_name: invRecord.material_name,
      hsn_code_example: matchingPO?.hsn_code_example || '8479',
      quantity_ordered: quantity,
      unit: invRecord.unit,
      unit_price_inr: unitPrice,
      taxable_value_inr: taxable,
      gst_rate_percent_example: gstRate,
      tax_type: isSameState ? 'CGST+SGST' : 'IGST',
      cgst_inr: cgst,
      sgst_inr: sgst,
      igst_inr: igst,
      invoice_total_inr: invoiceTotal,
      goods_receipt_status: 'Pending',
      invoice_reconciliation_status: 'Not Checked',
      payment_status: 'Unpaid',
      itc_review_status: 'Potentially Eligible'
    });

    // Update inventory to show on-order / received in period
    setInventory(prev => prev.map(item => {
      if (item.inventory_record_id === invRecord.inventory_record_id) {
        return {
          ...item,
          received_qty_period: item.received_qty_period + quantity
        };
      }
      return item;
    }));

    navigate('order-detail', { orderId: newPO.purchase_id });
  };

  const resetData = () => {
    localStorage.removeItem(STORAGE_KEYS.PURCHASES);
    localStorage.removeItem(STORAGE_KEYS.INVENTORY);
    localStorage.removeItem(STORAGE_KEYS.GST);
    localStorage.removeItem(STORAGE_KEYS.ACTIVE_MFG);

    setPurchases(rawPurchases);
    setInventory(rawInventory);
    setGstRecords(rawGSTReconciliation);
    setSelectedManufacturerId('MFG001');
    setActiveScenario(null);
    showToast('Reset to original synthetic dataset (2,000 POs, 755 Stock, 120 Mfg, 80 Vendors)');
    navigate('home');
  };

  // Pre-seeded Scenarios A-F Handler
  const selectScenario = (key: 'A' | 'B' | 'C' | 'D' | 'E' | 'F') => {
    setActiveScenario(key);
    switch (key) {
      case 'A': {
        // Low Stock Scenario
        const lowStock = inventory.find(i => i.stock_status === 'LOW STOCK') || inventory[0];
        setSelectedManufacturerId(lowStock.manufacturer_id);
        setSelectedItemId(lowStock.inventory_record_id);
        navigate('inventory-detail', { itemId: lowStock.inventory_record_id });
        showToast('Scenario A: Critical Low Stock Alert & Reorder Formula');
        break;
      }
      case 'B': {
        // Partial Delivery Shortage
        const partialPO = purchases.find(p => p.goods_receipt_status === 'Partially Received') || purchases[0];
        setSelectedManufacturerId(partialPO.manufacturer_id);
        setSelectedOrderId(partialPO.purchase_id);
        navigate('order-detail', { orderId: partialPO.purchase_id });
        showToast('Scenario B: GRN Shortage Retention & Delivery Verification');
        break;
      }
      case 'C': {
        // Three-Way Invoice Mismatch
        const mismatchPO = purchases.find(p => p.invoice_reconciliation_status === 'Mismatch') || purchases[0];
        setSelectedManufacturerId(mismatchPO.manufacturer_id);
        setSelectedOrderId(mismatchPO.purchase_id);
        navigate('order-detail', { orderId: mismatchPO.purchase_id });
        showToast('Scenario C: 3-Way Match Discrepancy & Payment Gated Hold');
        break;
      }
      case 'D': {
        // GST & ITC Discrepancy
        const gstHold = gstRecords.find(g => g.itc_review_status === 'Hold - Verify Documents' || g.invoice_reconciliation_status === 'Mismatch') || gstRecords[0];
        setSelectedManufacturerId(gstHold.manufacturer_id);
        navigate('gst');
        showToast('Scenario D: GSTR-2B vs Books Variance & ITC Protection');
        break;
      }
      case 'E': {
        // Replenishment Cycle
        const po = purchases.find(p => p.goods_receipt_status === 'Received' && p.payment_status === 'Paid') || purchases[0];
        setSelectedManufacturerId(po.manufacturer_id);
        setSelectedOrderId(po.purchase_id);
        navigate('order-detail', { orderId: po.purchase_id });
        showToast('Scenario E: Completed Procurement & Replenishment Cycle');
        break;
      }
      case 'F': {
        // Multi-Manufacturer Supply Chain Comparison
        navigate('manufacturers');
        showToast('Scenario F: Multi-State 120 Manufacturer Network Overview');
        break;
      }
    }
  };

  const login = (user: AuthUser) => {
    setIsAuthenticated(true);
    setCurrentUser(user);
    try {
      localStorage.setItem(STORAGE_KEYS.AUTH, JSON.stringify(true));
      localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(user));
    } catch {}
    showToast(`Welcome back, ${user.name}!`);
    setCurrentScreen('home');
    setScreenHistory(['home']);
  };

  const logout = () => {
    setIsAuthenticated(false);
    setCurrentUser(null);
    try {
      localStorage.removeItem(STORAGE_KEYS.AUTH);
      localStorage.removeItem(STORAGE_KEYS.USER);
    } catch {}
    showToast('Logged out successfully');
  };

  return (
    <AppContext.Provider
      value={{
        isAuthenticated,
        currentUser,
        login,
        logout,
        manufacturers,
        vendors,
        purchases,
        inventory,
        gstRecords,
        selectedManufacturerId,
        activeManufacturer,
        selectManufacturer,
        currentScreen,
        screenHistory,
        navigate,
        goBack,
        selectedItemId,
        selectedOrderId,
        selectedVendorId,
        selectedItem,
        selectedOrder,
        selectedVendor,
        filteredPurchases,
        filteredInventory,
        filteredGSTRecords,
        kpis,
        isPhoneFrame,
        togglePhoneFrame,
        searchQuery,
        setSearchQuery,
        activeScenario,
        selectScenario,
        updatePaymentStatus,
        updateReconciliationStatus,
        updateITCStatus,
        recordGoodsReceipt,
        createPurchaseOrder,
        reorderInventoryItem,
        resetData,
        toastMessage,
        showToast
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
