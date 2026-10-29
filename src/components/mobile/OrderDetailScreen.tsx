import React from 'react';
import { 
  ArrowLeft, 
  FileText, 
  CheckCircle2, 
  AlertTriangle, 
  Clock, 
  Truck, 
  Receipt, 
  Download, 
  ShieldCheck, 
  Building2, 
  Calendar,
  CreditCard,
  DollarSign,
  HelpCircle,
  FileCheck
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { formatINR, formatCompactINR, formatDate, downloadCSV } from '../../utils/formatters';

export const OrderDetailScreen: React.FC = () => {
  const { 
    selectedOrder, 
    goBack, 
    vendors, 
    manufacturers, 
    updatePaymentStatus, 
    updateReconciliationStatus,
    updateITCStatus,
    recordGoodsReceipt,
    showToast 
  } = useApp();

  if (!selectedOrder) {
    return (
      <div className="py-12 text-center text-slate-500">
        <FileText className="w-10 h-10 mx-auto mb-2 text-slate-400" />
        <p>No order selected.</p>
        <button
          onClick={goBack}
          className="mt-4 px-4 py-2 bg-teal-600 text-white rounded-xl text-xs font-semibold"
        >
          Return to Orders
        </button>
      </div>
    );
  }

  const vendor = vendors.find(v => v.vendor_id === selectedOrder.vendor_id);
  const mfg = manufacturers.find(m => m.manufacturer_id === selectedOrder.manufacturer_id);

  const isMatched = selectedOrder.invoice_reconciliation_status === 'Matched';
  const isPaid = selectedOrder.payment_status === 'Paid';
  const isOverdue = selectedOrder.payment_status === 'Overdue';
  const isReceived = selectedOrder.goods_receipt_status === 'Received';
  const isEligibleITC = selectedOrder.itc_review_status === 'Potentially Eligible';

  const handleDownloadSlip = () => {
    downloadCSV(`${selectedOrder.purchase_id}_invoice_slip.csv`, [{
      Purchase_ID: selectedOrder.purchase_id,
      Invoice_Number: selectedOrder.invoice_number,
      Date: selectedOrder.invoice_date,
      Manufacturer: mfg?.business_name || selectedOrder.manufacturer_id,
      Manufacturer_GSTIN: mfg?.gstin || '',
      Vendor: vendor?.vendor_name || selectedOrder.vendor_id,
      Vendor_GSTIN: vendor?.gstin || '',
      Material: selectedOrder.material_name,
      HSN: selectedOrder.hsn_code_example,
      Quantity: selectedOrder.quantity_ordered,
      Unit: selectedOrder.unit,
      Unit_Price_INR: selectedOrder.unit_price_inr,
      Taxable_Value_INR: selectedOrder.taxable_value_inr,
      GST_Rate_Pct: selectedOrder.gst_rate_percent_example,
      Tax_Type: selectedOrder.tax_type,
      CGST_INR: selectedOrder.cgst_inr,
      SGST_INR: selectedOrder.sgst_inr,
      IGST_INR: selectedOrder.igst_inr,
      Invoice_Total_INR: selectedOrder.invoice_total_inr,
      GRN_Status: selectedOrder.goods_receipt_status,
      Reconciliation_Status: selectedOrder.invoice_reconciliation_status,
      Payment_Status: selectedOrder.payment_status,
      ITC_Review_Status: selectedOrder.itc_review_status
    }]);
    showToast(`Invoice slip downloaded for ${selectedOrder.purchase_id}`);
  };

  return (
    <div className="space-y-4 pb-24 text-slate-800">
      {/* Top Invoice Card (White Card with Teal Accents) */}
      <div className="bg-white border border-slate-200 rounded-3xl p-4 sm:p-5 shadow-sm">
        <div className="flex items-center justify-between gap-2 mb-2 flex-wrap">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold px-2 py-0.5 rounded-lg bg-teal-50 text-teal-800 border border-teal-200 font-mono">
              {selectedOrder.purchase_id}
            </span>
            <span className="text-xs font-mono text-slate-600 font-semibold">
              {selectedOrder.invoice_number}
            </span>
          </div>

          <span className="text-xs text-slate-500 flex items-center gap-1 font-medium">
            <Calendar className="w-3.5 h-3.5 text-teal-600" />
            <span>{formatDate(selectedOrder.invoice_date)}</span>
          </span>
        </div>

        <div className="flex items-start justify-between gap-2 mt-3">
          <div>
            <h2 className="text-lg sm:text-xl font-black text-slate-900 tracking-tight">
              {selectedOrder.material_name}
            </h2>
            <p className="text-xs text-slate-600 font-medium mt-0.5">
              {selectedOrder.quantity_ordered} {selectedOrder.unit} @ {formatINR(selectedOrder.unit_price_inr)} / {selectedOrder.unit}
            </p>
          </div>

          <div className="text-right">
            <div className="text-lg sm:text-xl font-black text-slate-900">
              {formatINR(selectedOrder.invoice_total_inr)}
            </div>
            <div className="text-[10.5px] text-teal-700 font-bold">
              Taxable: {formatINR(selectedOrder.taxable_value_inr)}
            </div>
          </div>
        </div>

        {/* Parties Details */}
        <div className="grid grid-cols-2 gap-2 mt-4 pt-3 border-t border-slate-100 text-xs">
          <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200/60">
            <div className="text-[10px] text-slate-400 uppercase font-bold">Supplier (Vendor)</div>
            <div className="font-bold text-slate-900 mt-0.5 truncate">{vendor?.vendor_name || selectedOrder.vendor_id}</div>
            <div className="text-[10.5px] text-slate-500 mt-0.5">{vendor?.city}, {vendor?.state} ({vendor?.state_code})</div>
            <div className="text-[10px] font-mono text-slate-400 mt-0.5">GSTIN: {vendor?.gstin}</div>
          </div>

          <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200/60">
            <div className="text-[10px] text-slate-400 uppercase font-bold">Buyer (Manufacturer)</div>
            <div className="font-bold text-slate-900 mt-0.5 truncate">{mfg?.business_name || selectedOrder.manufacturer_id}</div>
            <div className="text-[10.5px] text-slate-500 mt-0.5">{mfg?.city}, {mfg?.state} ({mfg?.state_code})</div>
            <div className="text-[10px] font-mono text-slate-400 mt-0.5">GSTIN: {mfg?.gstin}</div>
          </div>
        </div>
      </div>

      {/* Tax Breakdown Card */}
      <div className="bg-white border border-slate-200 rounded-2xl p-4 space-y-2.5 shadow-2xs">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-600 flex items-center gap-1.5">
            <Receipt className="w-3.5 h-3.5 text-teal-600" />
            <span>Statutory Tax Breakdown</span>
          </h3>
          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-teal-50 text-teal-800 border border-teal-200">
            HSN {selectedOrder.hsn_code_example} · Rate {selectedOrder.gst_rate_percent_example}%
          </span>
        </div>

        <div className="space-y-1.5 text-xs">
          <div className="flex justify-between text-slate-600">
            <span>Taxable Inward Supply:</span>
            <strong className="text-slate-900">{formatINR(selectedOrder.taxable_value_inr)}</strong>
          </div>

          {selectedOrder.tax_type === 'CGST+SGST' ? (
            <>
              <div className="flex justify-between text-slate-600">
                <span>Central GST (CGST {selectedOrder.gst_rate_percent_example / 2}%):</span>
                <strong className="text-teal-700">{formatINR(selectedOrder.cgst_inr)}</strong>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>State GST (SGST {selectedOrder.gst_rate_percent_example / 2}%):</span>
                <strong className="text-teal-700">{formatINR(selectedOrder.sgst_inr)}</strong>
              </div>
            </>
          ) : (
            <div className="flex justify-between text-slate-600">
              <span>Integrated GST (IGST {selectedOrder.gst_rate_percent_example}%):</span>
              <strong className="text-teal-800">{formatINR(selectedOrder.igst_inr)}</strong>
            </div>
          )}

          <div className="flex justify-between text-slate-900 font-bold pt-2 border-t border-slate-100 text-sm">
            <span>Invoice Grand Total:</span>
            <span className="text-teal-700">{formatINR(selectedOrder.invoice_total_inr)}</span>
          </div>
        </div>
      </div>

      {/* 3-Way Matching Engine Card */}
      <div className={`rounded-2xl p-4 border space-y-3 shadow-2xs ${
        isMatched 
          ? 'bg-white border-slate-200' 
          : 'bg-rose-50/40 border-rose-200'
      }`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ShieldCheck className={`w-4 h-4 ${isMatched ? 'text-teal-600' : 'text-rose-600'}`} />
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700">
              Three-Way Matching Status
            </h3>
          </div>
          <span className={`text-xs font-bold px-2.5 py-0.5 rounded-full ${
            isMatched 
              ? 'bg-teal-50 text-teal-800 border border-teal-200' 
              : 'bg-rose-100 text-rose-800 border border-rose-200 animate-pulse'
          }`}>
            {selectedOrder.invoice_reconciliation_status}
          </span>
        </div>

        <div className="grid grid-cols-3 gap-2 text-center text-xs">
          <div className="bg-slate-50 p-2 rounded-xl border border-slate-200/80">
            <div className="text-[10px] text-slate-500 font-semibold">1. PO Contract</div>
            <div className="font-bold text-slate-900 mt-1">{selectedOrder.quantity_ordered} {selectedOrder.unit}</div>
            <div className="text-[10px] text-teal-700 font-bold">Approved</div>
          </div>

          <div className="bg-slate-50 p-2 rounded-xl border border-slate-200/80">
            <div className="text-[10px] text-slate-500 font-semibold">2. Physical GRN</div>
            <div className="font-bold text-slate-900 mt-1">{selectedOrder.goods_receipt_status}</div>
            <div className={`text-[10px] font-bold ${isReceived ? 'text-teal-700' : 'text-amber-700'}`}>
              {isReceived ? 'Accepted In Store' : 'Pending Physical Delivery'}
            </div>
          </div>

          <div className="bg-slate-50 p-2 rounded-xl border border-slate-200/80">
            <div className="text-[10px] text-slate-500 font-semibold">3. Vendor Invoice</div>
            <div className="font-bold text-slate-900 mt-1">{formatCompactINR(selectedOrder.invoice_total_inr)}</div>
            <div className={`text-[10px] font-bold ${isMatched ? 'text-teal-700' : 'text-rose-700'}`}>
              {isMatched ? 'Verified Match' : 'Discrepancy Hold'}
            </div>
          </div>
        </div>

        {!isMatched && (
          <div className="bg-rose-50 border border-rose-200 rounded-xl p-2.5 text-xs text-rose-900">
            <div className="font-bold flex items-center gap-1.5 text-rose-800">
              <AlertTriangle className="w-3.5 h-3.5 text-rose-600" />
              <span>Commercial Discrepancy Gate Active</span>
            </div>
            <p className="text-[11px] text-rose-700 mt-1">
              Payment is blocked on DISCREPANCY_HOLD. Invoice billing and delivery verification require resolution before disbursement.
            </p>
            <div className="mt-2 flex gap-2">
              <button
                onClick={() => updateReconciliationStatus(selectedOrder.purchase_id, 'Matched')}
                className="px-3 py-1 bg-teal-600 hover:bg-teal-500 text-white rounded-lg text-xs font-bold transition-all shadow-sm"
              >
                Clear & Approve Match
              </button>
            </div>
          </div>
        )}
      </div>

      {/* GST & ITC Review Card */}
      <div className="bg-white border border-slate-200 rounded-2xl p-4 space-y-3 shadow-2xs">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-600 flex items-center gap-1.5">
            <FileCheck className="w-3.5 h-3.5 text-teal-600" />
            <span>GSTR-2B & ITC Eligibility</span>
          </h3>
          <span className={`text-[10.5px] font-bold px-2.5 py-0.5 rounded-full ${
            isEligibleITC 
              ? 'bg-teal-50 text-teal-800 border border-teal-200' 
              : 'bg-amber-50 text-amber-800 border border-amber-200'
          }`}>
            {selectedOrder.itc_review_status}
          </span>
        </div>

        <div className="space-y-2 text-xs">
          <div className="flex items-center justify-between p-2 rounded-xl bg-slate-50 border border-slate-100">
            <span className="text-slate-600">Total Tax Claimable:</span>
            <span className="font-bold text-slate-900">
              {formatINR((selectedOrder.cgst_inr || 0) + (selectedOrder.sgst_inr || 0) + (selectedOrder.igst_inr || 0))}
            </span>
          </div>

          <div className="flex items-center justify-between p-2 rounded-xl bg-slate-50 border border-slate-100">
            <span className="text-slate-600">Supplier Reported in Portal:</span>
            <span className="font-bold text-teal-700">Reported in GSTR-2B</span>
          </div>

          {/* Quick ITC Action toggle */}
          <div className="flex items-center justify-between pt-1">
            <span className="text-slate-600 font-medium">Update ITC Flag:</span>
            <div className="flex items-center gap-1">
              <button
                onClick={() => updateITCStatus(selectedOrder.purchase_id, 'Potentially Eligible')}
                className={`px-2.5 py-1 rounded-lg text-[10.5px] font-bold transition-all ${
                  isEligibleITC ? 'bg-teal-600 text-white shadow-xs' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                Eligible
              </button>
              <button
                onClick={() => updateITCStatus(selectedOrder.purchase_id, 'Hold - Verify Documents')}
                className={`px-2.5 py-1 rounded-lg text-[10.5px] font-bold transition-all ${
                  selectedOrder.itc_review_status === 'Hold - Verify Documents' ? 'bg-amber-600 text-white shadow-xs' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                Hold
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Action Buttons Toolbar */}
      <div className="space-y-2">
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 px-1">
          Payment & Delivery Actions
        </h3>

        <div className="grid grid-cols-2 gap-2">
          {selectedOrder.payment_status !== 'Paid' ? (
            <button
              onClick={() => updatePaymentStatus(selectedOrder.purchase_id, 'Paid')}
              className="py-2.5 px-3 bg-teal-600 hover:bg-teal-500 text-white rounded-xl text-xs font-bold shadow-md shadow-teal-600/25 flex items-center justify-center gap-1.5 transition-all"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Mark as Paid</span>
            </button>
          ) : (
            <button
              onClick={() => updatePaymentStatus(selectedOrder.purchase_id, 'Unpaid')}
              className="py-2.5 px-3 bg-white hover:bg-amber-50 text-amber-800 rounded-xl text-xs font-bold border border-amber-200 flex items-center justify-center gap-1.5 transition-all shadow-2xs"
            >
              <Clock className="w-4 h-4 text-amber-600" />
              <span>Reopen (Unpaid)</span>
            </button>
          )}

          {!isReceived ? (
            <button
              onClick={() => recordGoodsReceipt(selectedOrder.purchase_id, 'Received')}
              className="py-2.5 px-3 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold shadow-md shadow-emerald-600/25 flex items-center justify-center gap-1.5 transition-all"
            >
              <Truck className="w-4 h-4" />
              <span>Confirm Receipt (GRN)</span>
            </button>
          ) : (
            <button
              onClick={() => recordGoodsReceipt(selectedOrder.purchase_id, 'Partially Received')}
              className="py-2.5 px-3 bg-white hover:bg-slate-100 text-slate-700 rounded-xl text-xs font-bold border border-slate-200 flex items-center justify-center gap-1.5 transition-all shadow-2xs"
            >
              <AlertTriangle className="w-4 h-4 text-amber-600" />
              <span>Flag Shortage</span>
            </button>
          )}
        </div>

        {/* Download Slip */}
        <button
          onClick={handleDownloadSlip}
          className="w-full py-2.5 px-4 bg-white hover:bg-slate-50 text-slate-800 border border-slate-200 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all shadow-2xs"
        >
          <Download className="w-4 h-4 text-teal-600" />
          <span>Download Invoice Slip & Data (CSV)</span>
        </button>
      </div>
    </div>
  );
};
