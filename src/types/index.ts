export type UserRole = 
  | 'BUSINESS_OWNER' 
  | 'PROCUREMENT_MANAGER' 
  | 'WAREHOUSE_OPERATOR' 
  | 'FINANCE_MANAGER' 
  | 'AUDITOR';

export interface UserProfile {
  id: string;
  name: string;
  role: UserRole;
  email: string;
  avatar?: string;
}

export interface Warehouse {
  id: string;
  code: string;
  name: string;
  location: string;
  city: string;
  state: string;
  pincode: string;
  capacitySqFt: number;
  managerName: string;
}

export type StockHealthStatus = 
  | 'HEALTHY' 
  | 'APPROACHING_THRESHOLD' 
  | 'REORDER_REQUIRED' 
  | 'CRITICAL_SHORTAGE' 
  | 'OUT_OF_STOCK';

export interface InventoryItem {
  id: string;
  sku: string;
  name: string;
  category: string;
  description: string;
  uom: string; // Unit of measurement (kg, meters, nos, coils, litres)
  hsnCode: string;
  gstRate: number; // e.g. 18 for 18%
  preferredVendorId: string;
  standardCost: number; // INR
  lastPurchasePrice?: number;
  lastPurchaseDate?: string;
  // Warehouse balances
  balances: {
    [warehouseId: string]: {
      openingQty: number;
      currentQty: number;
      reservedQty: number;
      availableQty: number; // current - reserved
      minThreshold: number;
      reorderQty: number;
      targetStock: number;
      locationRack: string;
      stockStatus: StockHealthStatus;
      avgDailyConsumption: number;
      daysRemaining: number;
      expectedStockoutDate: string;
    };
  };
  totalCurrentQty: number;
  totalAvailableQty: number;
  totalReservedQty: number;
  overallStatus: StockHealthStatus;
  updatedAt: string;
}

export type MovementType = 
  | 'RECEIPT' 
  | 'TRANSFER_IN' 
  | 'TRANSFER_OUT' 
  | 'CONSUMPTION' 
  | 'ADJUSTMENT';

export interface InventoryMovement {
  id: string;
  timestamp: string;
  itemId: string;
  itemSku: string;
  itemName: string;
  warehouseId: string;
  warehouseName: string;
  type: MovementType;
  quantity: number; // positive or negative
  previousQty: number;
  newQty: number;
  referenceType: 'PO' | 'GRN' | 'TRANSFER' | 'ADJUSTMENT' | 'PRODUCTION';
  referenceId: string;
  performedBy: string;
  notes?: string;
}

export type VendorPaymentTerms = 'IMMEDIATE' | 'NET_15' | 'NET_30' | 'NET_45' | 'NET_60';

export interface Vendor {
  id: string;
  vendorCode: string;
  legalName: string;
  tradeName?: string;
  gstin: string;
  state: string;
  stateCode: string; // e.g., '29' for Karnataka, '27' for Maharashtra
  city: string;
  address: string;
  contactPerson: string;
  email: string;
  phone: string;
  paymentTerms: VendorPaymentTerms;
  leadTimeDays: number;
  rating: number; // 1 to 5
  discrepancyRatePct: number; // e.g., 2.4%
  suppliedCategories: string[];
  outstandingPayable: number;
  status: 'ACTIVE' | 'ON_HOLD' | 'INACTIVE';
}

export type POStatus = 
  | 'DRAFT' 
  | 'PENDING_APPROVAL' 
  | 'APPROVED' 
  | 'SENT_TO_VENDOR' 
  | 'PARTIALLY_RECEIVED' 
  | 'FULLY_RECEIVED' 
  | 'CLOSED' 
  | 'CANCELLED';

export interface POLineItem {
  id: string;
  itemId: string;
  sku: string;
  itemName: string;
  uom: string;
  hsnCode: string;
  orderedQty: number;
  unitPrice: number;
  gstRate: number;
  taxableAmount: number;
  cgst: number;
  sgst: number;
  igst: number;
  totalAmount: number;
  previouslyReceivedQty: number;
  acceptedQty: number;
  outstandingQty: number; // orderedQty - acceptedQty
}

export interface PurchaseOrder {
  id: string;
  poNumber: string; // e.g. PO-2026-0801
  vendorId: string;
  vendorName: string;
  vendorGstin: string;
  warehouseId: string;
  warehouseName: string;
  orderDate: string;
  expectedDeliveryDate: string;
  paymentTerms: VendorPaymentTerms;
  status: POStatus;
  lines: POLineItem[];
  subtotal: number;
  cgstTotal: number;
  sgstTotal: number;
  igstTotal: number;
  grandTotal: number;
  isInterState: boolean;
  notes?: string;
  approvalNotes?: string;
  approvedBy?: string;
  approvedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export type GRNStatus = 
  | 'RECEIVED_VERIFIED' 
  | 'SHORTAGE_FLAGGED' 
  | 'EXCESS_FLAGGED' 
  | 'DAMAGED_ITEMS'
  | 'DISCREPANCY_RESOLVED';

export interface GRNLineItem {
  id: string;
  poLineId: string;
  itemId: string;
  sku: string;
  itemName: string;
  uom: string;
  orderedQty: number;
  previouslyReceivedQty: number;
  deliveredQty: number;
  acceptedQty: number;
  rejectedQty: number;
  outstandingQty: number; // orderedQty - previouslyReceivedQty - acceptedQty
  rejectionReason?: string;
}

export interface GoodsReceiptNote {
  id: string;
  grnNumber: string; // e.g. GRN-2026-0412
  poId: string;
  poNumber: string;
  vendorId: string;
  vendorName: string;
  warehouseId: string;
  warehouseName: string;
  receiptDate: string;
  deliveryChallanNo: string;
  vehicleNo?: string;
  receiverName: string;
  inspectionNotes?: string;
  status: GRNStatus;
  lines: GRNLineItem[];
  totalOrderedQty: number;
  totalDeliveredQty: number;
  totalAcceptedQty: number;
  totalRejectedQty: number;
  hasDiscrepancy: boolean;
  discrepancyType?: 'SHORTAGE' | 'EXCESS' | 'DAMAGED' | 'MULTIPLE';
  discrepancyNotes?: string;
  isProcessedToInventory: boolean;
  createdAt: string;
}

export type InvoicePaymentStatus = 
  | 'AWAITING_RECEIPT' 
  | 'AWAITING_MATCH' 
  | 'MATCHED' 
  | 'DISCREPANCY_HOLD' 
  | 'APPROVED_FOR_PAYMENT' 
  | 'PARTIALLY_PAID' 
  | 'PAID';

export interface VendorInvoiceLine {
  id: string;
  itemId: string;
  sku: string;
  itemName: string;
  invoicedQty: number;
  unitPrice: number;
  gstRate: number;
  taxableAmount: number;
  cgst: number;
  sgst: number;
  igst: number;
  totalAmount: number;
}

export interface VendorInvoice {
  id: string;
  invoiceNumber: string; // e.g. INV-2026-5501
  vendorId: string;
  vendorName: string;
  vendorGstin: string;
  poId: string;
  poNumber: string;
  grnId?: string;
  grnNumber?: string;
  warehouseId: string;
  invoiceDate: string;
  dueDate: string;
  lines: VendorInvoiceLine[];
  taxableAmount: number;
  cgstTotal: number;
  sgstTotal: number;
  igstTotal: number;
  grandTotal: number;
  paymentStatus: InvoicePaymentStatus;
  isInterState: boolean;
  paidAmount: number;
  notes?: string;
  createdAt: string;
}

export type MatchStatus = 
  | 'FULLY_MATCHED' 
  | 'MATCHED_WITHIN_TOLERANCE' 
  | 'QUANTITY_MISMATCH' 
  | 'PRICE_MISMATCH' 
  | 'TAX_MISMATCH' 
  | 'MISSING_RECEIPT' 
  | 'DUPLICATE_INVOICE' 
  | 'MANUAL_REVIEW_REQUIRED';

export interface MatchDiscrepancy {
  field: 'QUANTITY' | 'PRICE' | 'TAX' | 'TOTAL' | 'MISSING_GRN';
  expectedValue: number | string;
  actualValue: number | string;
  difference: number;
  unit?: string;
  severity: 'INFO' | 'WARNING' | 'CRITICAL';
  description: string;
  recommendedAction: string;
}

export interface ThreeWayMatchResult {
  id: string;
  invoiceId: string;
  invoiceNumber: string;
  poId: string;
  poNumber: string;
  grnId?: string;
  grnNumber?: string;
  vendorId: string;
  vendorName: string;
  matchStatus: MatchStatus;
  discrepancies: MatchDiscrepancy[];
  tolerancePercentageUsed: number;
  resolutionStatus: 'UNRESOLVED' | 'UNDER_REVIEW' | 'CREDIT_NOTE_REQUESTED' | 'OVERRIDDEN_APPROVED' | 'RESOLVED';
  resolutionNotes?: string;
  resolvedBy?: string;
  resolvedAt?: string;
  performedAt: string;
}

export type ReplenishmentStatus = 
  | 'DETECTED' 
  | 'REVIEW_REQUIRED' 
  | 'DRAFTED' 
  | 'APPROVED' 
  | 'PO_CREATED' 
  | 'RESOLVED';

export interface StockAlert {
  id: string;
  itemId: string;
  sku: string;
  itemName: string;
  category: string;
  uom: string;
  warehouseId: string;
  warehouseName: string;
  currentAvailableQty: number;
  minThreshold: number;
  targetStock: number;
  quantityOnOrder: number;
  suggestedReplenishmentQty: number; // Target - Available - OnOrder
  preferredVendorId: string;
  preferredVendorName: string;
  preferredVendorEmail: string;
  status: ReplenishmentStatus;
  urgency: 'MODERATE' | 'HIGH' | 'CRITICAL';
  vendorEmailDraft: {
    recipientEmail: string;
    subject: string;
    body: string;
    isSimulatedSent: boolean;
    sentAt?: string;
  };
  linkedPoId?: string;
  createdAt: string;
  updatedAt: string;
  notes?: string;
}

export type ITCEligibilityStatus = 
  | 'ELIGIBLE_VERIFIED' 
  | 'UNDER_REVIEW' 
  | 'DISCREPANCY_FLAGGED' 
  | 'INELIGIBLE' 
  | 'APPROVED_MANUAL';

export interface GSTReconciliationRecord {
  id: string;
  period: string; // e.g. "2026-10" or "Q3 2026"
  invoiceId: string;
  invoiceNumber: string;
  invoiceDate: string;
  vendorId: string;
  vendorName: string;
  vendorGstin: string;
  posState: string; // Place of Supply
  isInterState: boolean;
  hsnCode: string;
  taxableValue: number;
  calculatedCGST: number;
  calculatedSGST: number;
  calculatedIGST: number;
  calculatedTotalTax: number;
  // GSTR-2B / Portal reported figures
  gstr2bReportedTaxable?: number;
  gstr2bReportedCGST?: number;
  gstr2bReportedSGST?: number;
  gstr2bReportedIGST?: number;
  gstr2bReportedTotalTax?: number;
  gstr2bFilingDate?: string;
  reconciliationStatus: 'RECONCILED' | 'AMOUNT_MISMATCH' | 'MISSING_IN_2B' | 'EXTRA_IN_2B' | 'GSTIN_INVALID';
  itcEligibility: ITCEligibilityStatus;
  itcClaimableAmount: number;
  discrepancyReason?: string;
  reviewedBy?: string;
  reviewedAt?: string;
}

export interface AuditEvent {
  id: string;
  timestamp: string;
  userId: string;
  userName: string;
  userRole: UserRole;
  action: string;
  entityType: 'INVENTORY' | 'PO' | 'GRN' | 'INVOICE' | 'MATCH' | 'ALERT' | 'GST' | 'PAYMENT' | 'TRANSFER';
  entityId: string;
  entityRef: string; // e.g. "PO-2026-0801"
  details: string;
  previousValue?: string;
  newValue?: string;
}

export interface BuyerCompanyProfile {
  name: string;
  gstin: string;
  state: string;
  stateCode: string;
  address: string;
  pan: string;
  contactEmail: string;
  phone: string;
}
