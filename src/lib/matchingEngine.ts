import { 
  PurchaseOrder, 
  GoodsReceiptNote, 
  VendorInvoice, 
  ThreeWayMatchResult, 
  MatchDiscrepancy, 
  MatchStatus 
} from '../types';
import { round2 } from './gstService';
import { MATCH_TOLERANCE_PCT, MATCH_TOLERANCE_AMT } from './constants';

export function runThreeWayMatch(
  invoice: VendorInvoice,
  po?: PurchaseOrder,
  grn?: GoodsReceiptNote
): ThreeWayMatchResult {
  const discrepancies: MatchDiscrepancy[] = [];

  // 1. PO Existence Check
  if (!po) {
    discrepancies.push({
      field: 'TOTAL',
      expectedValue: 'Valid Purchase Order',
      actualValue: 'No PO linked',
      difference: invoice.grandTotal,
      severity: 'CRITICAL',
      description: `Invoice ${invoice.invoiceNumber} has no corresponding Purchase Order in the system.`,
      recommendedAction: 'Verify PO reference with vendor before proceeding.'
    });

    return {
      id: `match-${invoice.id}`,
      invoiceId: invoice.id,
      invoiceNumber: invoice.invoiceNumber,
      poId: invoice.poId,
      poNumber: invoice.poNumber,
      vendorId: invoice.vendorId,
      vendorName: invoice.vendorName,
      matchStatus: 'MANUAL_REVIEW_REQUIRED',
      discrepancies,
      tolerancePercentageUsed: 0,
      resolutionStatus: 'UNRESOLVED',
      performedAt: new Date().toISOString()
    };
  }

  // 2. Goods Receipt Note Existence Check
  if (!grn) {
    discrepancies.push({
      field: 'MISSING_GRN',
      expectedValue: 'Verified Goods Receipt',
      actualValue: 'No GRN recorded',
      difference: invoice.grandTotal,
      severity: 'CRITICAL',
      description: `No Goods Receipt Note has been recorded for PO ${po.poNumber}.`,
      recommendedAction: 'Verify physical delivery with warehouse team before processing invoice.'
    });

    return {
      id: `match-${invoice.id}`,
      invoiceId: invoice.id,
      invoiceNumber: invoice.invoiceNumber,
      poId: po.id,
      poNumber: po.poNumber,
      vendorId: invoice.vendorId,
      vendorName: invoice.vendorName,
      matchStatus: 'MISSING_RECEIPT',
      discrepancies,
      tolerancePercentageUsed: 0,
      resolutionStatus: 'UNRESOLVED',
      performedAt: new Date().toISOString()
    };
  }

  // 3. Line-by-Line Quantity & Price Matching
  let maxPricePctDiff = 0;
  let hasQuantityMismatch = false;
  let hasPriceMismatch = false;

  for (const invLine of invoice.lines) {
    const poLine = po.lines.find(p => p.itemId === invLine.itemId);
    const grnLine = grn.lines.find(g => g.itemId === invLine.itemId);

    const acceptedQty = grnLine ? grnLine.acceptedQty : 0;
    const poUnitPrice = poLine ? poLine.unitPrice : 0;

    // Quantity check: Invoiced Qty vs Accepted Qty on GRN
    if (invLine.invoicedQty !== acceptedQty) {
      hasQuantityMismatch = true;
      const qtyDiff = invLine.invoicedQty - acceptedQty;
      discrepancies.push({
        field: 'QUANTITY',
        expectedValue: `${acceptedQty} ${poLine?.uom || 'units'} (Accepted on GRN)`,
        actualValue: `${invLine.invoicedQty} ${poLine?.uom || 'units'} (Billed on Invoice)`,
        difference: qtyDiff,
        unit: poLine?.uom || 'units',
        severity: Math.abs(qtyDiff) > 0 ? 'CRITICAL' : 'WARNING',
        description: `Billed quantity (${invLine.invoicedQty}) exceeds accepted delivery quantity (${acceptedQty}) by ${qtyDiff} units for ${invLine.itemName}.`,
        recommendedAction: qtyDiff > 0 
          ? `Hold invoice payment. Request vendor credit note for ${qtyDiff} units or revised invoice for ${acceptedQty} units.`
          : `Verify additional delivery challan with warehouse.`
      });
    }

    // Unit Price check: Invoiced Price vs PO Price
    if (poUnitPrice > 0) {
      const priceDiff = round2(invLine.unitPrice - poUnitPrice);
      const pctDiff = (priceDiff / poUnitPrice) * 100;
      if (pctDiff > maxPricePctDiff) maxPricePctDiff = pctDiff;

      if (priceDiff > 0) {
        if (pctDiff > MATCH_TOLERANCE_PCT && priceDiff > MATCH_TOLERANCE_AMT) {
          hasPriceMismatch = true;
          discrepancies.push({
            field: 'PRICE',
            expectedValue: `₹${poUnitPrice.toFixed(2)}/unit`,
            actualValue: `₹${invLine.unitPrice.toFixed(2)}/unit`,
            difference: priceDiff,
            unit: 'INR',
            severity: 'CRITICAL',
            description: `Invoiced unit price is ₹${priceDiff.toFixed(2)} higher (+${pctDiff.toFixed(2)}%) than contracted PO price for ${invLine.itemName}.`,
            recommendedAction: 'Seek commercial approval from Procurement Manager or request amended invoice.'
          });
        }
      }
    }
  }

  // 4. Tax and Grand Total Verification
  const expectedTax = round2(
    (invoice.isInterState ? 0 : (po.cgstTotal + po.sgstTotal)) + 
    (invoice.isInterState ? po.igstTotal : 0)
  );
  const actualTax = round2(invoice.cgstTotal + invoice.sgstTotal + invoice.igstTotal);
  const taxDiff = round2(Math.abs(actualTax - expectedTax));

  if (taxDiff > MATCH_TOLERANCE_AMT) {
    discrepancies.push({
      field: 'TAX',
      expectedValue: `₹${expectedTax.toFixed(2)}`,
      actualValue: `₹${actualTax.toFixed(2)}`,
      difference: taxDiff,
      unit: 'INR',
      severity: 'WARNING',
      description: `Tax component difference of ₹${taxDiff.toFixed(2)} between PO contract and vendor invoice.`,
      recommendedAction: 'Verify applicable GST rate, HSN classification, and place of supply.'
    });
  }

  // 5. Determine Overall Match Status
  let overallStatus: MatchStatus = 'FULLY_MATCHED';

  if (hasQuantityMismatch) {
    overallStatus = 'QUANTITY_MISMATCH';
  } else if (hasPriceMismatch) {
    overallStatus = 'PRICE_MISMATCH';
  } else if (taxDiff > MATCH_TOLERANCE_AMT) {
    overallStatus = 'TAX_MISMATCH';
  } else if (maxPricePctDiff > 0 && maxPricePctDiff <= MATCH_TOLERANCE_PCT) {
    overallStatus = 'MATCHED_WITHIN_TOLERANCE';
  }

  return {
    id: `match-${invoice.id}`,
    invoiceId: invoice.id,
    invoiceNumber: invoice.invoiceNumber,
    poId: po.id,
    poNumber: po.poNumber,
    grnId: grn.id,
    grnNumber: grn.grnNumber,
    vendorId: invoice.vendorId,
    vendorName: invoice.vendorName,
    matchStatus: overallStatus,
    discrepancies,
    tolerancePercentageUsed: round2(maxPricePctDiff),
    resolutionStatus: discrepancies.length === 0 ? 'RESOLVED' : 'UNRESOLVED',
    performedAt: new Date().toISOString()
  };
}
