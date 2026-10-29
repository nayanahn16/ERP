import Dexie, { Table } from 'dexie';
import { 
  InventoryItem, 
  Vendor, 
  Warehouse, 
  PurchaseOrder, 
  GoodsReceiptNote, 
  VendorInvoice, 
  ThreeWayMatchResult, 
  StockAlert, 
  GSTReconciliationRecord, 
  AuditEvent, 
  InventoryMovement,
  UserProfile,
  POLineItem
} from '../types';
import { 
  SEED_VENDORS, 
  SEED_ITEMS, 
  SEED_PURCHASE_ORDERS, 
  SEED_GOODS_RECEIPTS, 
  SEED_VENDOR_INVOICES, 
  SEED_MATCH_RESULTS, 
  SEED_STOCK_ALERTS, 
  SEED_GST_RECORDS, 
  SEED_AUDIT_EVENTS 
} from './seedData';
import { WAREHOUSES, BUYER_COMPANY } from './constants';
import { calculateGST } from './gstService';
import { runThreeWayMatch } from './matchingEngine';
import { evaluateStockThreshold } from './replenishment';
import { createAuditEvent } from './auditLogger';

export class ForgeFlowDatabase extends Dexie {
  items!: Table<InventoryItem, string>;
  vendors!: Table<Vendor, string>;
  warehouses!: Table<Warehouse, string>;
  purchaseOrders!: Table<PurchaseOrder, string>;
  goodsReceipts!: Table<GoodsReceiptNote, string>;
  invoices!: Table<VendorInvoice, string>;
  matchResults!: Table<ThreeWayMatchResult, string>;
  stockAlerts!: Table<StockAlert, string>;
  gstRecords!: Table<GSTReconciliationRecord, string>;
  auditEvents!: Table<AuditEvent, string>;
  movements!: Table<InventoryMovement, string>;

  constructor() {
    super('ForgeFlowDB');
    this.version(1).stores({
      items: 'id, sku, name, category, preferredVendorId, overallStatus',
      vendors: 'id, vendorCode, legalName, gstin, stateCode, status',
      warehouses: 'id, code, name, city',
      purchaseOrders: 'id, poNumber, vendorId, warehouseId, status, orderDate',
      goodsReceipts: 'id, grnNumber, poId, poNumber, vendorId, status, receiptDate',
      invoices: 'id, invoiceNumber, vendorId, poId, paymentStatus, invoiceDate',
      matchResults: 'id, invoiceId, poId, grnId, matchStatus, resolutionStatus',
      stockAlerts: 'id, itemId, warehouseId, status, urgency, preferredVendorId',
      gstRecords: 'id, period, invoiceId, vendorId, reconciliationStatus, itcEligibility',
      auditEvents: 'id, timestamp, userId, action, entityType, entityId',
      movements: 'id, timestamp, itemId, warehouseId, type'
    });
  }
}

export const db = new ForgeFlowDatabase();

/**
 * Initialize Database with Seed Data if empty
 */
export async function initializeDatabase() {
  const count = await db.items.count();
  if (count === 0) {
    await seedDemoData();
  }
}

export async function seedDemoData() {
  await db.transaction('rw', [
    db.items,
    db.vendors,
    db.warehouses,
    db.purchaseOrders,
    db.goodsReceipts,
    db.invoices,
    db.matchResults,
    db.stockAlerts,
    db.gstRecords,
    db.auditEvents,
    db.movements
  ], async () => {
    await db.items.clear();
    await db.vendors.clear();
    await db.warehouses.clear();
    await db.purchaseOrders.clear();
    await db.goodsReceipts.clear();
    await db.invoices.clear();
    await db.matchResults.clear();
    await db.stockAlerts.clear();
    await db.gstRecords.clear();
    await db.auditEvents.clear();
    await db.movements.clear();

    await db.warehouses.bulkAdd(WAREHOUSES);
    await db.vendors.bulkAdd(SEED_VENDORS);
    await db.items.bulkAdd(SEED_ITEMS);
    await db.purchaseOrders.bulkAdd(SEED_PURCHASE_ORDERS);
    await db.goodsReceipts.bulkAdd(SEED_GOODS_RECEIPTS);
    await db.invoices.bulkAdd(SEED_VENDOR_INVOICES);
    await db.matchResults.bulkAdd(SEED_MATCH_RESULTS);
    await db.stockAlerts.bulkAdd(SEED_STOCK_ALERTS);
    await db.gstRecords.bulkAdd(SEED_GST_RECORDS);
    await db.auditEvents.bulkAdd(SEED_AUDIT_EVENTS);

    // Initial movement records
    const initialMovements: InventoryMovement[] = [
      {
        id: 'mov-001',
        timestamp: '2026-10-21T14:30:00Z',
        itemId: 'item-sc-301',
        itemSku: 'SC-301',
        itemName: 'Solenoid Actuator Coil 230V AC 50Hz',
        warehouseId: 'WH-BLR-01',
        warehouseName: 'Peenya Central Warehouse (Bengaluru)',
        type: 'RECEIPT',
        quantity: 85,
        previousQty: 80,
        newQty: 165,
        referenceType: 'GRN',
        referenceId: 'GRN-2026-0421',
        performedBy: 'Basavaraj K',
        notes: 'Partial shipment received and accepted.'
      },
      {
        id: 'mov-002',
        timestamp: '2026-10-22T11:30:00Z',
        itemId: 'item-es-204',
        itemSku: 'ES-204',
        itemName: 'Epoxy Casting Resin (CY-230 Grade)',
        warehouseId: 'WH-BLR-01',
        warehouseName: 'Peenya Central Warehouse (Bengaluru)',
        type: 'RECEIPT',
        quantity: 300,
        previousQty: 170,
        newQty: 470,
        referenceType: 'GRN',
        referenceId: 'GRN-2026-0390',
        performedBy: 'Basavaraj K',
        notes: 'Full order received and stocked.'
      }
    ];
    await db.movements.bulkAdd(initialMovements);
  });
}

/**
 * Execute Stock Health Scan across all items and warehouses
 * Ensures threshold crossing creates alerts and dedupes unresolved ones.
 */
export async function runStockHealthScan(user: UserProfile) {
  const items = await db.items.toArray();
  const vendors = await db.vendors.toArray();
  const existingAlerts = await db.stockAlerts.toArray();
  const openPOs = await db.purchaseOrders
    .where('status')
    .anyOf(['APPROVED', 'SENT_TO_VENDOR', 'PARTIALLY_RECEIVED'])
    .toArray();

  const vendorMap = new Map(vendors.map(v => [v.id, v]));
  const alertsToUpsert: StockAlert[] = [];

  for (const item of items) {
    for (const warehouse of WAREHOUSES) {
      const balance = item.balances[warehouse.id];
      if (!balance) continue;

      // Calculate any open on-order quantity for this item in this warehouse
      let onOrderQty = 0;
      for (const po of openPOs) {
        if (po.warehouseId === warehouse.id) {
          for (const line of po.lines) {
            if (line.itemId === item.id) {
              onOrderQty += line.outstandingQty;
            }
          }
        }
      }

      const vendor = vendorMap.get(item.preferredVendorId) || vendors[0];
      const alert = evaluateStockThreshold(
        item,
        warehouse.id,
        warehouse.name,
        vendor,
        existingAlerts,
        onOrderQty
      );

      if (alert) {
        alertsToUpsert.push(alert);
      }
    }
  }

  for (const alert of alertsToUpsert) {
    const existing = await db.stockAlerts.get(alert.id);
    await db.stockAlerts.put(alert);
    if (!existing) {
      await db.auditEvents.add(
        createAuditEvent(
          user,
          'LOW_STOCK_DETECTED',
          'ALERT',
          alert.id,
          alert.sku,
          `Automated scan detected low stock: ${alert.currentAvailableQty} ${alert.uom} <= min threshold ${alert.minThreshold} at ${alert.warehouseName}`
        )
      );
    }
  }

  return alertsToUpsert;
}

/**
 * Record Goods Receipt Workflow
 * Updates PO, Updates usable Inventory, detects shortages, prevents duplicate counting!
 */
export async function recordGoodsReceiptNote(
  po: PurchaseOrder,
  grnData: {
    deliveryChallanNo: string;
    vehicleNo?: string;
    receiverName: string;
    inspectionNotes?: string;
    lines: {
      poLineId: string;
      itemId: string;
      deliveredQty: number;
      acceptedQty: number;
      rejectedQty: number;
      rejectionReason?: string;
    }[];
  },
  user: UserProfile
): Promise<GoodsReceiptNote> {
  const grnNumber = `GRN-2026-${(Math.floor(Math.random() * 900) + 100).toString()}`;
  const now = new Date().toISOString();

  let hasDiscrepancy = false;
  let discrepancyType: GoodsReceiptNote['discrepancyType'];
  let totalOrdered = 0;
  let totalDelivered = 0;
  let totalAccepted = 0;
  let totalRejected = 0;

  const grnLines = grnData.lines.map(lineInput => {
    const poLine = po.lines.find(p => p.id === lineInput.poLineId);
    if (!poLine) throw new Error(`PO Line ${lineInput.poLineId} not found`);

    const outstanding = Math.max(0, poLine.orderedQty - poLine.acceptedQty - lineInput.acceptedQty);
    
    totalOrdered += poLine.orderedQty;
    totalDelivered += lineInput.deliveredQty;
    totalAccepted += lineInput.acceptedQty;
    totalRejected += lineInput.rejectedQty;

    if (lineInput.acceptedQty < poLine.orderedQty - poLine.acceptedQty) {
      hasDiscrepancy = true;
      discrepancyType = 'SHORTAGE';
    } else if (lineInput.acceptedQty > poLine.orderedQty - poLine.acceptedQty) {
      hasDiscrepancy = true;
      discrepancyType = 'EXCESS';
    }
    if (lineInput.rejectedQty > 0) {
      hasDiscrepancy = true;
      discrepancyType = discrepancyType ? 'MULTIPLE' : 'DAMAGED';
    }

    return {
      id: `grnl-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      poLineId: lineInput.poLineId,
      itemId: lineInput.itemId,
      sku: poLine.sku,
      itemName: poLine.itemName,
      uom: poLine.uom,
      orderedQty: poLine.orderedQty,
      previouslyReceivedQty: poLine.acceptedQty,
      deliveredQty: lineInput.deliveredQty,
      acceptedQty: lineInput.acceptedQty,
      rejectedQty: lineInput.rejectedQty,
      outstandingQty: outstanding,
      rejectionReason: lineInput.rejectionReason
    };
  });

  const grn: GoodsReceiptNote = {
    id: `grn-${Date.now()}`,
    grnNumber,
    poId: po.id,
    poNumber: po.poNumber,
    vendorId: po.vendorId,
    vendorName: po.vendorName,
    warehouseId: po.warehouseId,
    warehouseName: po.warehouseName,
    receiptDate: now.split('T')[0],
    deliveryChallanNo: grnData.deliveryChallanNo,
    vehicleNo: grnData.vehicleNo,
    receiverName: grnData.receiverName,
    inspectionNotes: grnData.inspectionNotes,
    status: hasDiscrepancy 
      ? (discrepancyType === 'SHORTAGE' ? 'SHORTAGE_FLAGGED' : 'DAMAGED_ITEMS') 
      : 'RECEIVED_VERIFIED',
    lines: grnLines,
    totalOrderedQty: totalOrdered,
    totalDeliveredQty: totalDelivered,
    totalAcceptedQty: totalAccepted,
    totalRejectedQty: totalRejected,
    hasDiscrepancy,
    discrepancyType,
    discrepancyNotes: hasDiscrepancy ? `Discrepancy detected during physical inspection: ${discrepancyType}` : undefined,
    isProcessedToInventory: true,
    createdAt: now
  };

  await db.transaction('rw', [db.goodsReceipts, db.purchaseOrders, db.items, db.movements, db.auditEvents, db.stockAlerts], async () => {
    // 1. Save GRN
    await db.goodsReceipts.add(grn);

    // 2. Update PO Lines & PO status
    let allPoLinesFulfilled = true;
    const updatedPoLines = po.lines.map(pLine => {
      const matchGrnLine = grnLines.find(g => g.poLineId === pLine.id);
      if (matchGrnLine) {
        const newAccepted = pLine.acceptedQty + matchGrnLine.acceptedQty;
        const newOutstanding = Math.max(0, pLine.orderedQty - newAccepted);
        if (newOutstanding > 0) allPoLinesFulfilled = false;
        return {
          ...pLine,
          acceptedQty: newAccepted,
          outstandingQty: newOutstanding
        };
      }
      if (pLine.outstandingQty > 0) allPoLinesFulfilled = false;
      return pLine;
    });

    const newPoStatus = allPoLinesFulfilled ? 'FULLY_RECEIVED' : 'PARTIALLY_RECEIVED';
    await db.purchaseOrders.update(po.id, {
      lines: updatedPoLines,
      status: newPoStatus,
      updatedAt: now
    });

    // 3. Update Inventory Balances with Accepted Quantity ONLY (Not vendor claimed qty!)
    for (const gLine of grnLines) {
      if (gLine.acceptedQty <= 0) continue;

      const item = await db.items.get(gLine.itemId);
      if (!item) continue;

      const currentBalance = item.balances[po.warehouseId] || {
        openingQty: 0,
        currentQty: 0,
        reservedQty: 0,
        availableQty: 0,
        minThreshold: 50,
        reorderQty: 100,
        targetStock: 150,
        locationRack: 'GENERAL',
        stockStatus: 'HEALTHY',
        avgDailyConsumption: 1,
        daysRemaining: 10,
        expectedStockoutDate: now
      };

      const prevQty = currentBalance.currentQty;
      const newCurrent = prevQty + gLine.acceptedQty;
      const newAvailable = Math.max(0, newCurrent - currentBalance.reservedQty);
      
      const newStatus = newAvailable === 0 
        ? 'OUT_OF_STOCK'
        : (newAvailable <= currentBalance.minThreshold * 0.5 
          ? 'CRITICAL_SHORTAGE' 
          : (newAvailable <= currentBalance.minThreshold 
            ? 'REORDER_REQUIRED' 
            : 'HEALTHY'));

      const updatedBalances = {
        ...item.balances,
        [po.warehouseId]: {
          ...currentBalance,
          currentQty: newCurrent,
          availableQty: newAvailable,
          stockStatus: newStatus
        }
      };

      const totalCurrent = Object.values(updatedBalances).reduce((acc, b) => acc + b.currentQty, 0);
      const totalAvailable = Object.values(updatedBalances).reduce((acc, b) => acc + b.availableQty, 0);

      await db.items.update(item.id, {
        balances: updatedBalances as any,
        totalCurrentQty: totalCurrent,
        totalAvailableQty: totalAvailable,
        overallStatus: newStatus,
        lastPurchaseDate: now.split('T')[0],
        updatedAt: now
      });

      // Record movement
      await db.movements.add({
        id: `mov-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
        timestamp: now,
        itemId: item.id,
        itemSku: item.sku,
        itemName: item.name,
        warehouseId: po.warehouseId,
        warehouseName: po.warehouseName,
        type: 'RECEIPT',
        quantity: gLine.acceptedQty,
        previousQty: prevQty,
        newQty: newCurrent,
        referenceType: 'GRN',
        referenceId: grnNumber,
        performedBy: user.name,
        notes: `Accepted ${gLine.acceptedQty} ${gLine.uom} against ${po.poNumber}. Rejected: ${gLine.rejectedQty} ${gLine.uom}.`
      });

      // Check if stock alert exists for this item/warehouse and is now resolved
      if (newAvailable > currentBalance.minThreshold) {
        const openAlert = await db.stockAlerts
          .where('itemId')
          .equals(item.id)
          .filter(a => a.warehouseId === po.warehouseId && a.status !== 'RESOLVED')
          .first();

        if (openAlert) {
          await db.stockAlerts.update(openAlert.id, {
            status: 'RESOLVED',
            currentAvailableQty: newAvailable,
            suggestedReplenishmentQty: 0,
            updatedAt: now,
            notes: `Resolved by receipt ${grnNumber} (+${gLine.acceptedQty} ${gLine.uom})`
          });
        }
      }
    }

    // 4. Audit Trail
    await db.auditEvents.add(
      createAuditEvent(
        user,
        hasDiscrepancy ? 'GRN_SHORTAGE_RECORDED' : 'GOODS_RECEIVED_VERIFIED',
        'GRN',
        grn.id,
        grnNumber,
        `Goods receipt ${grnNumber} recorded for ${po.poNumber}. Total Accepted: ${totalAccepted}, Total Rejected: ${totalRejected}. Discrepancy: ${hasDiscrepancy ? discrepancyType : 'None'}.`
      )
    );
  });

  return grn;
}

/**
 * Warehouse Transfer Workflow
 * Decrements source warehouse stock and increments destination warehouse stock exactly once.
 */
export async function transferStockBetweenWarehouses(
  itemId: string,
  fromWarehouseId: string,
  toWarehouseId: string,
  quantity: number,
  user: UserProfile,
  notes?: string
) {
  if (fromWarehouseId === toWarehouseId) {
    throw new Error('Source and destination warehouse cannot be the same.');
  }
  if (quantity <= 0) {
    throw new Error('Transfer quantity must be greater than zero.');
  }

  const now = new Date().toISOString();
  const transferRef = `TRF-${Date.now().toString().slice(-6)}`;

  await db.transaction('rw', [db.items, db.movements, db.auditEvents, db.warehouses], async () => {
    const item = await db.items.get(itemId);
    if (!item) throw new Error('Item not found');

    const fromWh = await db.warehouses.get(fromWarehouseId);
    const toWh = await db.warehouses.get(toWarehouseId);
    if (!fromWh || !toWh) throw new Error('Warehouse not found');

    const fromBalance = item.balances[fromWarehouseId];
    if (!fromBalance || fromBalance.availableQty < quantity) {
      throw new Error(`Insufficient available stock in ${fromWh.name}. Available: ${fromBalance?.availableQty || 0}, Requested: ${quantity}`);
    }

    const toBalance = item.balances[toWarehouseId] || {
      openingQty: 0,
      currentQty: 0,
      reservedQty: 0,
      availableQty: 0,
      minThreshold: 20,
      reorderQty: 40,
      targetStock: 60,
      locationRack: 'TRANSFER-BAY',
      stockStatus: 'HEALTHY',
      avgDailyConsumption: 1,
      daysRemaining: 10,
      expectedStockoutDate: now
    };

    // Source updates
    const fromNewCurrent = fromBalance.currentQty - quantity;
    const fromNewAvail = fromBalance.availableQty - quantity;
    const fromStatus = fromNewAvail <= fromBalance.minThreshold ? 'REORDER_REQUIRED' : 'HEALTHY';

    // Destination updates
    const toNewCurrent = toBalance.currentQty + quantity;
    const toNewAvail = toBalance.availableQty + quantity;
    const toStatus = toNewAvail <= toBalance.minThreshold ? 'REORDER_REQUIRED' : 'HEALTHY';

    const updatedBalances = {
      ...item.balances,
      [fromWarehouseId]: {
        ...fromBalance,
        currentQty: fromNewCurrent,
        availableQty: fromNewAvail,
        stockStatus: fromStatus
      },
      [toWarehouseId]: {
        ...toBalance,
        currentQty: toNewCurrent,
        availableQty: toNewAvail,
        stockStatus: toStatus
      }
    };

    await db.items.update(item.id, {
      balances: updatedBalances as any,
      updatedAt: now
    });

    // Record source movement (TRANSFER_OUT)
    await db.movements.add({
      id: `mov-${Date.now()}-out`,
      timestamp: now,
      itemId: item.id,
      itemSku: item.sku,
      itemName: item.name,
      warehouseId: fromWarehouseId,
      warehouseName: fromWh.name,
      type: 'TRANSFER_OUT',
      quantity: -quantity,
      previousQty: fromBalance.currentQty,
      newQty: fromNewCurrent,
      referenceType: 'TRANSFER',
      referenceId: transferRef,
      performedBy: user.name,
      notes: `Transferred ${quantity} ${item.uom} to ${toWh.name}. ${notes || ''}`
    });

    // Record destination movement (TRANSFER_IN)
    await db.movements.add({
      id: `mov-${Date.now()}-in`,
      timestamp: now,
      itemId: item.id,
      itemSku: item.sku,
      itemName: item.name,
      warehouseId: toWarehouseId,
      warehouseName: toWh.name,
      type: 'TRANSFER_IN',
      quantity: quantity,
      previousQty: toBalance.currentQty,
      newQty: toNewCurrent,
      referenceType: 'TRANSFER',
      referenceId: transferRef,
      performedBy: user.name,
      notes: `Received ${quantity} ${item.uom} from ${fromWh.name}. ${notes || ''}`
    });

    // Audit Event
    await db.auditEvents.add(
      createAuditEvent(
        user,
        'WAREHOUSE_STOCK_TRANSFERRED',
        'TRANSFER',
        transferRef,
        item.sku,
        `Transferred ${quantity} ${item.uom} of ${item.name} from ${fromWh.name} to ${toWh.name}. Reference: ${transferRef}.`,
        `Source: ${fromBalance.currentQty}, Dest: ${toBalance.currentQty}`,
        `Source: ${fromNewCurrent}, Dest: ${toNewCurrent}`
      )
    );
  });
}

/**
 * Convert Replenishment Request / Alert to Purchase Order
 */
export async function convertAlertToPurchaseOrder(
  alert: StockAlert,
  user: UserProfile,
  orderQty?: number
): Promise<PurchaseOrder> {
  const item = await db.items.get(alert.itemId);
  const vendor = await db.vendors.get(alert.preferredVendorId);
  if (!item || !vendor) throw new Error('Item or Vendor not found');

  const finalQty = orderQty || alert.suggestedReplenishmentQty || 50;
  const taxable = item.standardCost * finalQty;
  const gst = calculateGST(taxable, item.gstRate, vendor.gstin);
  const poNumber = `PO-2026-${(Math.floor(Math.random() * 800) + 820).toString()}`;
  const now = new Date().toISOString();

  const poLine: POLineItem = {
    id: `pol-${Date.now()}`,
    itemId: item.id,
    sku: item.sku,
    itemName: item.name,
    uom: item.uom,
    hsnCode: item.hsnCode,
    orderedQty: finalQty,
    unitPrice: item.standardCost,
    gstRate: item.gstRate,
    taxableAmount: taxable,
    cgst: gst.cgstAmount,
    sgst: gst.sgstAmount,
    igst: gst.igstAmount,
    totalAmount: gst.grandTotal,
    previouslyReceivedQty: 0,
    acceptedQty: 0,
    outstandingQty: finalQty
  };

  const newPO: PurchaseOrder = {
    id: `po-${Date.now()}`,
    poNumber,
    vendorId: vendor.id,
    vendorName: vendor.legalName,
    vendorGstin: vendor.gstin,
    warehouseId: alert.warehouseId,
    warehouseName: alert.warehouseName,
    orderDate: now.split('T')[0],
    expectedDeliveryDate: new Date(Date.now() + vendor.leadTimeDays * 86400000).toISOString().split('T')[0],
    paymentTerms: vendor.paymentTerms,
    status: 'APPROVED',
    lines: [poLine],
    subtotal: taxable,
    cgstTotal: gst.cgstAmount,
    sgstTotal: gst.sgstAmount,
    igstTotal: gst.igstAmount,
    grandTotal: gst.grandTotal,
    isInterState: gst.isInterState,
    notes: `Created from automated stock alert ${alert.id}. Suggested replenishment quantity: ${finalQty} ${item.uom}.`,
    approvalNotes: 'Auto-approved per replenishment threshold authorization.',
    approvedBy: user.name,
    approvedAt: now,
    createdAt: now,
    updatedAt: now
  };

  await db.transaction('rw', [db.purchaseOrders, db.stockAlerts, db.auditEvents], async () => {
    await db.purchaseOrders.add(newPO);
    await db.stockAlerts.update(alert.id, {
      status: 'PO_CREATED',
      linkedPoId: newPO.id,
      updatedAt: now
    });
    await db.auditEvents.add(
      createAuditEvent(
        user,
        'PO_CREATED_FROM_REPLENISHMENT',
        'PO',
        newPO.id,
        newPO.poNumber,
        `Purchase Order ${newPO.poNumber} created for ${vendor.legalName} (${finalQty} ${item.uom} of ${item.sku}) from automated replenishment alert.`
      )
    );
  });

  return newPO;
}

/**
 * Resolve Match Discrepancy (Exception approval or Credit Note recorded)
 */
export async function resolveMatchDiscrepancy(
  matchId: string,
  resolutionType: 'CREDIT_NOTE_REQUESTED' | 'OVERRIDDEN_APPROVED' | 'RESOLVED',
  notes: string,
  user: UserProfile
) {
  const match = await db.matchResults.get(matchId);
  if (!match) throw new Error('Match record not found');

  const now = new Date().toISOString();

  await db.transaction('rw', [db.matchResults, db.invoices, db.auditEvents], async () => {
    await db.matchResults.update(matchId, {
      resolutionStatus: resolutionType,
      resolutionNotes: notes,
      resolvedBy: user.name,
      resolvedAt: now
    });

    const newPaymentStatus = resolutionType === 'OVERRIDDEN_APPROVED' 
      ? 'APPROVED_FOR_PAYMENT' 
      : (resolutionType === 'CREDIT_NOTE_REQUESTED' ? 'DISCREPANCY_HOLD' : 'MATCHED');

    await db.invoices.update(match.invoiceId, {
      paymentStatus: newPaymentStatus
    });

    await db.auditEvents.add(
      createAuditEvent(
        user,
        'MATCH_DISCREPANCY_RESOLVED',
        'MATCH',
        matchId,
        match.invoiceNumber,
        `Exception resolved with action '${resolutionType}'. Notes: ${notes}. Payment status updated to '${newPaymentStatus}'.`
      )
    );
  });
}
