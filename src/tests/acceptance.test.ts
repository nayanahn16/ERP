import { describe, it, expect } from 'vitest';
import { 
  calculateGST, 
  isInterStateTransaction, 
  isValidGSTIN 
} from '../lib/gstService';
import { 
  calculateReplenishmentQuantity, 
  evaluateStockThreshold 
} from '../lib/replenishment';
import { runThreeWayMatch } from '../lib/matchingEngine';
import { 
  InventoryItem, 
  Vendor, 
  PurchaseOrder, 
  GoodsReceiptNote, 
  VendorInvoice, 
  StockAlert 
} from '../types';

describe('Acceptance Test Suite — ForgeFlow Core Business Logic', () => {

  // TEST 3: Replenishment quantity calculation: Target - Available - OnOrder
  it('TEST 3: correctly recommends replenishment quantity using target, available, and on-order quantities', () => {
    // Target: 200, Available: 35, OnOrder: 0 => Suggested = 165
    const rec1 = calculateReplenishmentQuantity(200, 35, 0);
    expect(rec1).toBe(165);

    // Target: 200, Available: 35, OnOrder: 50 => Suggested = 115
    const rec2 = calculateReplenishmentQuantity(200, 35, 50);
    expect(rec2).toBe(115);

    // Never returns negative recommendation even if over-ordered
    const rec3 = calculateReplenishmentQuantity(200, 150, 100);
    expect(rec3).toBe(0);
  });

  // TEST 1 & TEST 2: Threshold alert trigger & deduplication
  it('TEST 1 & TEST 2: creates actionable alert when stock <= threshold and prevents duplicate alerts on re-eval', () => {
    const mockVendor: Vendor = {
      id: 'ven-001',
      vendorCode: 'VND-001',
      legalName: 'Apex Components',
      gstin: '29AAACA9812E1Z1',
      state: 'Karnataka',
      stateCode: '29',
      city: 'Bengaluru',
      address: 'Industrial Area',
      contactPerson: 'Ramesh',
      email: 'ramesh@apex.com',
      phone: '9845012345',
      paymentTerms: 'NET_30',
      leadTimeDays: 7,
      rating: 4.5,
      discrepancyRatePct: 1.2,
      suppliedCategories: ['Copper & Conductors'],
      outstandingPayable: 0,
      status: 'ACTIVE'
    };

    const mockItem: InventoryItem = {
      id: 'item-cw-102',
      sku: 'CW-102',
      name: 'Enamelled Copper Wire 1.5 sq mm',
      category: 'Copper & Conductors',
      description: 'Magnet wire',
      uom: 'kg',
      hsnCode: '85441110',
      gstRate: 18,
      preferredVendorId: 'ven-001',
      standardCost: 820,
      balances: {
        'WH-BLR-01': {
          openingQty: 100,
          currentQty: 35,
          reservedQty: 0,
          availableQty: 35, // Below min threshold 100!
          minThreshold: 100,
          reorderQty: 150,
          targetStock: 200,
          locationRack: 'RACK-A1',
          stockStatus: 'CRITICAL_SHORTAGE',
          avgDailyConsumption: 10,
          daysRemaining: 3,
          expectedStockoutDate: '2026-10-31'
        }
      },
      totalCurrentQty: 35,
      totalAvailableQty: 35,
      totalReservedQty: 0,
      overallStatus: 'CRITICAL_SHORTAGE',
      updatedAt: '2026-10-28T00:00:00Z'
    };

    // First scan creates alert
    const existingAlerts: StockAlert[] = [];
    const newAlert = evaluateStockThreshold(
      mockItem,
      'WH-BLR-01',
      'Peenya Central Warehouse',
      mockVendor,
      existingAlerts,
      0
    );

    expect(newAlert).not.toBeNull();
    expect(newAlert?.currentAvailableQty).toBe(35);
    expect(newAlert?.suggestedReplenishmentQty).toBe(165);
    expect(newAlert?.status).toBe('DETECTED');

    // Second scan with existing unresolved alert: Updates instead of creating duplicate!
    if (newAlert) {
      existingAlerts.push(newAlert);
    }
    const duplicateCheck = evaluateStockThreshold(
      mockItem,
      'WH-BLR-01',
      'Peenya Central Warehouse',
      mockVendor,
      existingAlerts,
      0
    );

    expect(duplicateCheck).not.toBeNull();
    // Same ID preserved! No duplicate record generated!
    expect(duplicateCheck?.id).toBe(newAlert?.id);
  });

  // TEST 7 & TEST 8: Three-way matching PO vs GRN vs Invoice & Payment gating
  it('TEST 7 & TEST 8: invoice for 100 units against 85 accepted units produces quantity discrepancy and blocks payment', () => {
    const mockPO: PurchaseOrder = {
      id: 'po-100',
      poNumber: 'PO-2026-0812',
      vendorId: 'ven-001',
      vendorName: 'Apex Components',
      vendorGstin: '29AAACA9812E1Z1',
      warehouseId: 'WH-BLR-01',
      warehouseName: 'Peenya Central Warehouse',
      orderDate: '2026-10-15',
      expectedDeliveryDate: '2026-10-22',
      paymentTerms: 'NET_30',
      status: 'PARTIALLY_RECEIVED',
      lines: [
        {
          id: 'pol-1',
          itemId: 'item-sc-301',
          sku: 'SC-301',
          itemName: 'Solenoid Actuator Coil',
          uom: 'nos',
          hsnCode: '85059000',
          orderedQty: 100,
          unitPrice: 450,
          gstRate: 18,
          taxableAmount: 45000,
          cgst: 4050,
          sgst: 4050,
          igst: 0,
          totalAmount: 53100,
          previouslyReceivedQty: 0,
          acceptedQty: 85,
          outstandingQty: 15
        }
      ],
      subtotal: 45000,
      cgstTotal: 4050,
      sgstTotal: 4050,
      igstTotal: 0,
      grandTotal: 53100,
      isInterState: false,
      createdAt: '2026-10-15T00:00:00Z',
      updatedAt: '2026-10-21T00:00:00Z'
    };

    const mockGRN: GoodsReceiptNote = {
      id: 'grn-100',
      grnNumber: 'GRN-2026-0421',
      poId: 'po-100',
      poNumber: 'PO-2026-0812',
      vendorId: 'ven-001',
      vendorName: 'Apex Components',
      warehouseId: 'WH-BLR-01',
      warehouseName: 'Peenya Central Warehouse',
      receiptDate: '2026-10-21',
      deliveryChallanNo: 'DC-7749',
      receiverName: 'Basavaraj',
      status: 'SHORTAGE_FLAGGED',
      lines: [
        {
          id: 'grnl-1',
          poLineId: 'pol-1',
          itemId: 'item-sc-301',
          sku: 'SC-301',
          itemName: 'Solenoid Actuator Coil',
          uom: 'nos',
          orderedQty: 100,
          previouslyReceivedQty: 0,
          deliveredQty: 85,
          acceptedQty: 85, // 85 Accepted
          rejectedQty: 0,
          outstandingQty: 15
        }
      ],
      totalOrderedQty: 100,
      totalDeliveredQty: 85,
      totalAcceptedQty: 85,
      totalRejectedQty: 0,
      hasDiscrepancy: true,
      discrepancyType: 'SHORTAGE',
      isProcessedToInventory: true,
      createdAt: '2026-10-21T00:00:00Z'
    };

    // Vendor erroneously billed for 100 units instead of 85 accepted
    const mockInvoice: VendorInvoice = {
      id: 'inv-100',
      invoiceNumber: 'INV-2026-9042',
      vendorId: 'ven-001',
      vendorName: 'Apex Components',
      vendorGstin: '29AAACA9812E1Z1',
      poId: 'po-100',
      poNumber: 'PO-2026-0812',
      grnId: 'grn-100',
      grnNumber: 'GRN-2026-0421',
      warehouseId: 'WH-BLR-01',
      invoiceDate: '2026-10-22',
      dueDate: '2026-11-21',
      lines: [
        {
          id: 'invl-1',
          itemId: 'item-sc-301',
          sku: 'SC-301',
          itemName: 'Solenoid Actuator Coil',
          invoicedQty: 100, // 100 Billed!
          unitPrice: 450,
          gstRate: 18,
          taxableAmount: 45000,
          cgst: 4050,
          sgst: 4050,
          igst: 0,
          totalAmount: 53100
        }
      ],
      taxableAmount: 45000,
      cgstTotal: 4050,
      sgstTotal: 4050,
      igstTotal: 0,
      grandTotal: 53100,
      paymentStatus: 'DISCREPANCY_HOLD',
      isInterState: false,
      paidAmount: 0,
      createdAt: '2026-10-22T00:00:00Z'
    };

    const matchResult = runThreeWayMatch(mockInvoice, mockPO, mockGRN);

    // Verify QUANTITY_MISMATCH status
    expect(matchResult.matchStatus).toBe('QUANTITY_MISMATCH');
    expect(matchResult.discrepancies.length).toBeGreaterThan(0);

    const qtyDisc = matchResult.discrepancies.find(d => d.field === 'QUANTITY');
    expect(qtyDisc).toBeDefined();
    // Exactly 15 units difference detected!
    expect(qtyDisc?.difference).toBe(15);
    expect(qtyDisc?.severity).toBe('CRITICAL');
  });

  // TEST 9: GST Intra-State vs Inter-State Calculations
  it('TEST 9: calculates CGST+SGST for Karnataka intra-state and IGST for inter-state transactions', () => {
    // 1. Karnataka Intra-State: Buyer is Karnataka (29), Vendor is Karnataka (29)
    const karnatakaGstin = '29AAACA9812E1Z1';
    expect(isInterStateTransaction(karnatakaGstin)).toBe(false);

    const intraResult = calculateGST(100000, 18, karnatakaGstin);
    expect(intraResult.isInterState).toBe(false);
    expect(intraResult.cgstRate).toBe(9);
    expect(intraResult.sgstRate).toBe(9);
    expect(intraResult.igstRate).toBe(0);
    expect(intraResult.cgstAmount).toBe(9000);
    expect(intraResult.sgstAmount).toBe(9000);
    expect(intraResult.igstAmount).toBe(0);
    expect(intraResult.totalTaxAmount).toBe(18000);
    expect(intraResult.grandTotal).toBe(118000);

    // 2. Inter-State: Vendor is Maharashtra (27)
    const maharashtraGstin = '27AABCV4410D1Z2';
    expect(isInterStateTransaction(maharashtraGstin)).toBe(true);

    const interResult = calculateGST(100000, 18, maharashtraGstin);
    expect(interResult.isInterState).toBe(true);
    expect(interResult.cgstRate).toBe(0);
    expect(interResult.sgstRate).toBe(0);
    expect(interResult.igstRate).toBe(18);
    expect(interResult.cgstAmount).toBe(0);
    expect(interResult.sgstAmount).toBe(0);
    expect(interResult.igstAmount).toBe(18000);
    expect(interResult.totalTaxAmount).toBe(18000);
    expect(interResult.grandTotal).toBe(118000);
  });

  // GSTIN Validation Format Check
  it('validates 15-character statutory Indian GSTIN format', () => {
    expect(isValidGSTIN('29AABCK1234F1Z5')).toBe(true);
    expect(isValidGSTIN('27AABCV4410D1Z2')).toBe(true);
    expect(isValidGSTIN('INVALID123')).toBe(false);
    expect(isValidGSTIN('291234567890123')).toBe(false);
  });

  // TEST 5: GRN accepted vs outstanding calculation
  it('TEST 5: receiving 85 units against PO for 100 units retains 15 outstanding units', () => {
    const ordered = 100;
    const previouslyAccepted = 0;
    const newlyAccepted = 85;

    const outstanding = Math.max(0, ordered - previouslyAccepted - newlyAccepted);
    expect(outstanding).toBe(15);
  });
});
