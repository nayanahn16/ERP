import React from 'react';
import { 
  BarChart3, 
  Download, 
  FileSpreadsheet, 
  TrendingUp, 
  Package, 
  Receipt, 
  Clock, 
  Truck, 
  Building2,
  CheckCircle2,
  AlertTriangle
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { formatINR, formatCompactINR, downloadCSV } from '../../utils/formatters';

export const ReportsScreen: React.FC = () => {
  const { 
    filteredPurchases, 
    filteredInventory, 
    filteredGSTRecords, 
    vendors, 
    manufacturers, 
    kpis, 
    showToast 
  } = useApp();

  const exportPurchases = () => {
    downloadCSV('Purchases_Transactions_Export.csv', filteredPurchases);
    showToast(`Exported ${filteredPurchases.length} Purchase records to CSV`);
  };

  const exportInventory = () => {
    downloadCSV('Inventory_Stock_Export.csv', filteredInventory);
    showToast(`Exported ${filteredInventory.length} Inventory records to CSV`);
  };

  const exportGST = () => {
    downloadCSV('GSTR_2B_Reconciliation_Export.csv', filteredGSTRecords);
    showToast(`Exported ${filteredGSTRecords.length} GST records to CSV`);
  };

  const exportVendors = () => {
    downloadCSV('Vendors_Directory_Export.csv', vendors);
    showToast(`Exported ${vendors.length} Vendors to CSV`);
  };

  const exportManufacturers = () => {
    downloadCSV('Manufacturers_Directory_Export.csv', manufacturers);
    showToast(`Exported ${manufacturers.length} Manufacturers to CSV`);
  };

  return (
    <div className="space-y-4 pb-24 text-slate-800">
      {/* Top Hero Banner */}
      <div className="bg-gradient-to-br from-teal-50/70 via-white to-emerald-50/40 border border-teal-200 rounded-3xl p-4 sm:p-5 shadow-xs">
        <div className="flex items-center gap-2 mb-2">
          <span className="text-xs font-bold px-2 py-0.5 rounded-lg bg-teal-100 text-teal-800 border border-teal-200">
            BUSINESS INTELLIGENCE
          </span>
          <span className="text-xs text-slate-500 font-medium">
            Audit-Ready Operational Reports
          </span>
        </div>

        <h2 className="text-lg sm:text-xl font-black text-slate-900 tracking-tight">
          Executive Reports & CSV Exports
        </h2>
        <p className="text-xs text-slate-500 mt-1">
          Export verified ledger tables, tax audit sheets, and operational summaries for management or submission.
        </p>
      </div>

      {/* 1-Click CSV Downloads Grid (White Cards, Teal Accents) */}
      <div className="space-y-2">
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 px-1">
          Dataset Exports (Direct CSV)
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
          <button
            onClick={exportPurchases}
            className="flex items-center justify-between p-3.5 bg-white hover:bg-teal-50/30 border border-slate-200 hover:border-teal-300 rounded-2xl transition-all shadow-xs group text-left"
          >
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-teal-50 text-teal-700 flex items-center justify-center border border-teal-200 group-hover:scale-105 transition-transform">
                <FileSpreadsheet className="w-5 h-5" />
              </div>
              <div>
                <div className="text-xs font-bold text-slate-900">Purchases & Invoices</div>
                <div className="text-[11px] text-slate-500">{filteredPurchases.length} records · Taxable & GST totals</div>
              </div>
            </div>
            <Download className="w-4 h-4 text-teal-600 shrink-0" />
          </button>

          <button
            onClick={exportInventory}
            className="flex items-center justify-between p-3.5 bg-white hover:bg-teal-50/30 border border-slate-200 hover:border-teal-300 rounded-2xl transition-all shadow-xs group text-left"
          >
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center border border-emerald-200 group-hover:scale-105 transition-transform">
                <Package className="w-5 h-5" />
              </div>
              <div>
                <div className="text-xs font-bold text-slate-900">Inventory Balances</div>
                <div className="text-[11px] text-slate-500">{filteredInventory.length} SKUs · Stock valuations</div>
              </div>
            </div>
            <Download className="w-4 h-4 text-teal-600 shrink-0" />
          </button>

          <button
            onClick={exportGST}
            className="flex items-center justify-between p-3.5 bg-white hover:bg-teal-50/30 border border-slate-200 hover:border-teal-300 rounded-2xl transition-all shadow-xs group text-left"
          >
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-teal-50 text-teal-700 flex items-center justify-center border border-teal-200 group-hover:scale-105 transition-transform">
                <Receipt className="w-5 h-5" />
              </div>
              <div>
                <div className="text-xs font-bold text-slate-900">GSTR-2B Reconciliation</div>
                <div className="text-[11px] text-slate-500">{filteredGSTRecords.length} records · ITC claim status</div>
              </div>
            </div>
            <Download className="w-4 h-4 text-teal-600 shrink-0" />
          </button>

          <button
            onClick={exportVendors}
            className="flex items-center justify-between p-3.5 bg-white hover:bg-teal-50/30 border border-slate-200 hover:border-teal-300 rounded-2xl transition-all shadow-xs group text-left"
          >
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-teal-50 text-teal-700 flex items-center justify-center border border-teal-200 group-hover:scale-105 transition-transform">
                <Truck className="w-5 h-5" />
              </div>
              <div>
                <div className="text-xs font-bold text-slate-900">Vendors Directory</div>
                <div className="text-[11px] text-slate-500">80 vendors · Ratings & payment terms</div>
              </div>
            </div>
            <Download className="w-4 h-4 text-teal-600 shrink-0" />
          </button>
        </div>
      </div>

      {/* Analytical KPI Summary */}
      <div className="bg-white border border-slate-200 rounded-2xl p-4 space-y-3 shadow-xs">
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-600">
          Financial & Operational Summary
        </h3>

        <div className="space-y-2 text-xs">
          <div className="flex items-center justify-between p-2 rounded-xl bg-slate-50 border border-slate-100">
            <span className="text-slate-600">Gross Procurement Spend:</span>
            <span className="font-bold text-slate-900">{formatINR(kpis.totalSpend)}</span>
          </div>

          <div className="flex items-center justify-between p-2 rounded-xl bg-slate-50 border border-slate-100">
            <span className="text-slate-600">Inward Taxable Base:</span>
            <span className="font-bold text-slate-900">{formatINR(kpis.taxableSpend)}</span>
          </div>

          <div className="flex items-center justify-between p-2 rounded-xl bg-teal-50 text-teal-800 border border-teal-100 font-medium">
            <span>Total Inward Tax (CGST+SGST+IGST):</span>
            <span className="font-bold">{formatINR(kpis.totalTax)}</span>
          </div>

          <div className="flex items-center justify-between p-2 rounded-xl bg-emerald-50 text-emerald-800 border border-emerald-100 font-medium">
            <span>Total Closing Stock Valuation:</span>
            <span className="font-bold">{formatINR(kpis.stockValuation)}</span>
          </div>

          <div className="flex items-center justify-between p-2 rounded-xl bg-rose-50 text-rose-800 border border-rose-100 font-medium">
            <span>Overdue Vendor Invoices:</span>
            <span className="font-bold">{kpis.overdueCount} bills ({formatINR(kpis.overdueAmount)})</span>
          </div>
        </div>
      </div>
    </div>
  );
};
