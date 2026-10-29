import { InventoryItem, StockAlert, Vendor } from '../types';
import { BUYER_COMPANY } from './constants';

export function calculateReplenishmentQuantity(
  targetStock: number,
  availableStock: number,
  quantityOnOrder: number
): number {
  const suggested = targetStock - availableStock - quantityOnOrder;
  return Math.max(0, suggested);
}

export function generateVendorEmailDraft(
  item: InventoryItem,
  warehouseName: string,
  suggestedQty: number,
  vendor: Vendor
): { subject: string; body: string } {
  const subject = `Replenishment RFQ / Purchase Requisition: ${item.name} (${item.sku}) - Kavach Electricals`;
  
  const body = `Dear ${vendor.contactPerson || 'Vendor Partner'},

Greetings from Kavach Electricals & Control Systems Pvt Ltd.

Our automated inventory control system has flagged that our operational inventory for the following material has reached its replenishment threshold:

- Item Description: ${item.name}
- Internal SKU: ${item.sku}
- HSN Code: ${item.hsnCode}
- Delivery Destination: ${warehouseName}
- Current Available Balance: ${item.totalAvailableQty} ${item.uom}
- Required Replenishment Quantity: ${suggestedQty} ${item.uom}
- Standard Agreed Payment Terms: ${vendor.paymentTerms}

Please confirm current unit pricing (Contract Standard: ₹${item.standardCost.toFixed(2)}/${item.uom}) and expected dispatch lead time to our Peenya/Belagavi facility within 24 hours.

Kindly reply to this email or send your proforma quotation referencing our procurement department.

Best regards,
Procurement Team
${BUYER_COMPANY.name}
${BUYER_COMPANY.address}
GSTIN: ${BUYER_COMPANY.gstin}
Email: ${BUYER_COMPANY.contactEmail}
`;

  return { subject, body };
}

export function evaluateStockThreshold(
  item: InventoryItem,
  warehouseId: string,
  warehouseName: string,
  vendor: Vendor,
  existingAlerts: StockAlert[],
  openOnOrderQty: number = 0
): StockAlert | null {
  const balance = item.balances[warehouseId];
  if (!balance) return null;

  const isLowStock = balance.availableQty <= balance.minThreshold;
  if (!isLowStock) return null;

  // Check if an unresolved alert already exists for this item and warehouse
  const existingAlert = existingAlerts.find(
    a => a.itemId === item.id && a.warehouseId === warehouseId && a.status !== 'RESOLVED'
  );

  const suggestedQty = calculateReplenishmentQuantity(
    balance.targetStock || balance.minThreshold * 2,
    balance.availableQty,
    openOnOrderQty
  );

  const urgency = balance.availableQty === 0 
    ? 'CRITICAL' 
    : (balance.availableQty <= balance.minThreshold * 0.4 ? 'HIGH' : 'MODERATE');

  const emailDraft = generateVendorEmailDraft(item, warehouseName, suggestedQty, vendor);

  if (existingAlert) {
    // Return updated alert with refreshed figures without creating a duplicate record!
    return {
      ...existingAlert,
      currentAvailableQty: balance.availableQty,
      quantityOnOrder: openOnOrderQty,
      suggestedReplenishmentQty: suggestedQty,
      urgency,
      updatedAt: new Date().toISOString()
    };
  }

  // Create new alert
  return {
    id: `alert-${item.sku.toLowerCase()}-${warehouseId.toLowerCase()}-${Date.now()}`,
    itemId: item.id,
    sku: item.sku,
    itemName: item.name,
    category: item.category,
    uom: item.uom,
    warehouseId,
    warehouseName,
    currentAvailableQty: balance.availableQty,
    minThreshold: balance.minThreshold,
    targetStock: balance.targetStock,
    quantityOnOrder: openOnOrderQty,
    suggestedReplenishmentQty: suggestedQty,
    preferredVendorId: vendor.id,
    preferredVendorName: vendor.legalName,
    preferredVendorEmail: vendor.email,
    status: 'DETECTED',
    urgency,
    vendorEmailDraft: {
      recipientEmail: vendor.email,
      subject: emailDraft.subject,
      body: emailDraft.body,
      isSimulatedSent: false
    },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
}
