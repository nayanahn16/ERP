export interface Manufacturer {
  manufacturer_id: string;
  business_name: string;
  manufacturing_category: string;
  city: string;
  state: string;
  state_code: string;
  gst_registration_type: string;
  gstin: string;
  employee_count: number;
  dataset_note: string;
}

export interface VendorRecord {
  vendor_id: string;
  vendor_name: string;
  vendor_category: string;
  city: string;
  state: string;
  state_code: string;
  gst_registration_type: string;
  gstin: string;
  payment_terms_days: number;
  reliability_score_1_to_5: number;
  dataset_note: string;
}

export interface PurchaseRecord {
  purchase_id: string;
  invoice_number: string;
  invoice_date: string;
  manufacturer_id: string;
  vendor_id: string;
  material_id: string;
  material_name: string;
  hsn_code_example: string;
  quantity_ordered: number;
  unit: string;
  unit_price_inr: number;
  taxable_value_inr: number;
  gst_rate_percent_example: number;
  tax_type: 'CGST+SGST' | 'IGST' | string;
  cgst_inr: number;
  sgst_inr: number;
  igst_inr: number;
  invoice_total_inr: number;
  goods_receipt_status: 'Received' | 'Partially Received' | 'Pending' | 'Cancelled';
  invoice_reconciliation_status: 'Matched' | 'Mismatch' | 'Not Checked';
  payment_status: 'Paid' | 'Partially Paid' | 'Unpaid' | 'Overdue';
  itc_review_status: 'Potentially Eligible' | 'Review Required' | 'Hold - Verify Documents';
  dataset_note: string;
}

export interface InventoryRecord {
  inventory_record_id: string;
  manufacturer_id: string;
  material_id: string;
  material_name: string;
  unit: string;
  opening_stock_qty: number;
  received_qty_period: number;
  issued_to_production_qty: number;
  closing_stock_qty: number;
  reorder_level_qty: number;
  stock_status: 'OK' | 'LOW STOCK';
  average_unit_cost_inr: number;
  closing_stock_value_inr: number;
}

export interface GSTReconciliationRecord {
  purchase_id: string;
  invoice_number: string;
  manufacturer_id: string;
  vendor_id: string;
  invoice_date: string;
  taxable_value_inr: number;
  cgst_inr: number;
  sgst_inr: number;
  igst_inr: number;
  invoice_reconciliation_status: 'Matched' | 'Mismatch' | 'Not Checked';
  itc_review_status: 'Potentially Eligible' | 'Review Required' | 'Hold - Verify Documents';
  supplier_invoice_reported: 'Yes' | 'No / Different Details' | 'Pending Check';
  goods_received_confirmed: 'Yes' | 'No' | 'Partial';
}

export interface FullDataset {
  manufacturers: Manufacturer[];
  vendors: VendorRecord[];
  purchases: PurchaseRecord[];
  inventory: InventoryRecord[];
  gstReconciliation: GSTReconciliationRecord[];
}
