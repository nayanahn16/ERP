import { BUYER_COMPANY } from './constants';

export interface TaxCalculationResult {
  taxableValue: number;
  gstRate: number;
  isInterState: boolean;
  cgstRate: number;
  sgstRate: number;
  igstRate: number;
  cgstAmount: number;
  sgstAmount: number;
  igstAmount: number;
  totalTaxAmount: number;
  grandTotal: number;
}

/**
 * Standard rounding to 2 decimal places to avoid IEEE-754 float drift
 */
export function round2(num: number): number {
  return Math.round((num + Number.EPSILON) * 100) / 100;
}

/**
 * Validates standard Indian GSTIN format (15 characters)
 * e.g. 29AABCK1234F1Z5
 */
export function isValidGSTIN(gstin: string): boolean {
  if (!gstin || gstin.trim().length !== 15) return false;
  const gstinRegex = /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/i;
  return gstinRegex.test(gstin.trim());
}

/**
 * Extract 2-digit state code from GSTIN
 */
export function getStateCodeFromGSTIN(gstin: string): string {
  if (!gstin || gstin.length < 2) return '';
  return gstin.substring(0, 2);
}

/**
 * Determines whether a transaction is Inter-State (IGST) or Intra-State (CGST + SGST)
 * based on Buyer's state (Karnataka - 29) and Supplier's state.
 */
export function isInterStateTransaction(vendorGstinOrStateCode: string): boolean {
  let stateCode = vendorGstinOrStateCode.trim();
  if (stateCode.length === 15) {
    stateCode = getStateCodeFromGSTIN(stateCode);
  }
  return stateCode !== BUYER_COMPANY.stateCode;
}

/**
 * Core GST Calculation Service
 * Deterministic, precise, unit-testable.
 */
export function calculateGST(taxableValue: number, gstRate: number, vendorGstin: string): TaxCalculationResult {
  const isInterState = isInterStateTransaction(vendorGstin);
  const roundedTaxable = round2(taxableValue);

  if (isInterState) {
    const igstRate = gstRate;
    const igstAmount = round2(roundedTaxable * (igstRate / 100));
    return {
      taxableValue: roundedTaxable,
      gstRate,
      isInterState: true,
      cgstRate: 0,
      sgstRate: 0,
      igstRate,
      cgstAmount: 0,
      sgstAmount: 0,
      igstAmount,
      totalTaxAmount: igstAmount,
      grandTotal: round2(roundedTaxable + igstAmount)
    };
  } else {
    const halfRate = gstRate / 2;
    const cgstAmount = round2(roundedTaxable * (halfRate / 100));
    const sgstAmount = round2(roundedTaxable * (halfRate / 100));
    const totalTax = round2(cgstAmount + sgstAmount);
    return {
      taxableValue: roundedTaxable,
      gstRate,
      isInterState: false,
      cgstRate: halfRate,
      sgstRate: halfRate,
      igstRate: 0,
      cgstAmount,
      sgstAmount,
      igstAmount: 0,
      totalTaxAmount: totalTax,
      grandTotal: round2(roundedTaxable + totalTax)
    };
  }
}

/**
 * Format currency in Indian format (₹ Lakhs / Crores or standard ₹ 1,23,456.00)
 */
export function formatINR(amount: number): string {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 2
  }).format(amount);
}
