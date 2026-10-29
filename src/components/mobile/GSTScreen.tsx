import React, { useState, useMemo } from 'react';
import { 
  Receipt, 
  Search, 
  ShieldCheck, 
  AlertTriangle, 
  CheckCircle2, 
  Clock, 
  FileCheck, 
  Filter,
  Building2,
  ChevronRight,
  TrendingUp,
  Download
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { formatINR, formatCompactINR, formatDate, downloadCSV } from '../../utils/formatters';

export const GSTScreen: React.FC = () => {
  const { 
    filteredGSTRecords, 
    activeManufacturer, 
    kpis, 
    navigate, 
    updateITCStatus,
    showToast 
  } = useApp();

  const [search, setSearch] = useState('');
  const [filterTab, setFilterTab] = useState<'ALL' | 'ELIGIBLE' | 'HOLD' | 'REVIEW' | 'MISMATCH'>('ALL');
  const [limit, setLimit] = useState(30);

  const records = useMemo(() => {
    return filteredGSTRecords.filter(r => {
      const q = search.toLowerCase();
      const matchSearch = 
        r.purchase_id.toLowerCase().includes(q) || 
        r.invoice_number.toLowerCase().includes(q) ||
        r.vendor_id.toLowerCase().includes(q);

      if (!matchSearch) return false;

      if (filterTab === 'ELIGIBLE') return r.itc_review_status === 'Potentially Eligible';
      if (filterTab === 'HOLD') return r.itc_review_status === 'Hold - Verify Documents';
      if (filterTab === 'REVIEW') return r.itc_review_status === 'Review Required';
      if (filterTab === 'MISMATCH') return r.invoice_reconciliation_status === 'Mismatch';

      return true;
    });
  }, [filteredGSTRecords, search, filterTab]);

  const displayedRecords = records.slice(0, limit);

  const handleExportGST = () => {
    downloadCSV('GSTR_2B_Reconciliation_Report.csv', filteredGSTRecords);
    showToast('Exported GSTR-2B Reconciliation Report');
  };

  return (
    <div className="space-y-4 pb-24 text-slate-800">
      {/* Top Banner (White & Soft Teal Gradient) */}
      <div className="bg-gradient-to-br from-teal-50/70 via-white to-emerald-50/40 border border-teal-200 rounded-3xl p-4 sm:p-5 shadow-xs">
        <div className="flex items-center justify-between mb-2 flex-wrap">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold px-2 py-0.5 rounded-lg bg-teal-100 text-teal-800 border border-teal-200">
              GSTR-2B TOWER
            </span>
            <span className="text-xs text-slate-500 font-medium">
              State: {activeManufacturer?.state || 'Multi-State'} ({activeManufacturer?.state_code || 'All'})
            </span>
          </div>

          <button
            onClick={handleExportGST}
            className="flex items-center gap-1 bg-white hover:bg-teal-50 text-teal-800 border border-teal-200 px-2.5 py-1 rounded-xl text-xs font-bold transition-all shadow-2xs"
          >
            <Download className="w-3.5 h-3.5 text-teal-600" />
            <span>Export CSV</span>
          </button>
        </div>

        <h2 className="text-lg sm:text-xl font-black text-slate-900 tracking-tight">
          GST & Input Tax Credit (ITC) Control
        </h2>
        <p className="text-xs text-slate-500 mt-1">
          Automated cross-check between vendor invoiced taxes, GSTR-2B portal filings, and physical goods receipt.
        </p>
      </div>

      {/* Tax Metric Cards */}
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-white border border-slate-200 p-3.5 rounded-2xl shadow-xs">
          <div className="text-[11px] text-slate-500 font-semibold uppercase">Eligible ITC (Claimable)</div>
          <div className="text-lg font-black text-teal-700 mt-1">
            {formatCompactINR(kpis.itcEligibleAmount)}
          </div>
          <div className="text-[10px] text-teal-700 mt-0.5 flex items-center gap-1 font-bold">
            <CheckCircle2 className="w-3 h-3 text-teal-600" />
            <span>Matched in books & portal</span>
          </div>
        </div>

        <div className="bg-white border border-slate-200 p-3.5 rounded-2xl shadow-xs">
          <div className="text-[11px] text-slate-500 font-semibold uppercase">ITC on Discrepancy Hold</div>
          <div className="text-lg font-black text-amber-700 mt-1">
            {formatCompactINR(kpis.itcHoldAmount)}
          </div>
          <div className="text-[10px] text-amber-700 mt-0.5 flex items-center gap-1 font-bold">
            <AlertTriangle className="w-3 h-3 text-amber-600" />
            <span>Pending docs / GSTR-2B</span>
          </div>
        </div>
      </div>

      {/* Intra-State vs Inter-State Tax Distribution */}
      <div className="bg-white border border-slate-200 rounded-2xl p-3.5 space-y-2 text-xs shadow-xs">
        <div className="flex items-center justify-between text-slate-900 font-bold">
          <span>Inward Supply Tax Distribution</span>
          <span className="text-slate-500 font-medium">Total Tax: {formatCompactINR(kpis.totalTax)}</span>
        </div>

        <div className="grid grid-cols-3 gap-2 text-center pt-1">
          <div className="bg-slate-50 p-2 rounded-xl border border-slate-200/80">
            <div className="text-[10px] text-slate-500 font-bold">CGST (Central)</div>
            <div className="text-xs font-black text-teal-700 mt-0.5">{formatCompactINR(kpis.totalCGST)}</div>
          </div>
          <div className="bg-slate-50 p-2 rounded-xl border border-slate-200/80">
            <div className="text-[10px] text-slate-500 font-bold">SGST (State)</div>
            <div className="text-xs font-black text-teal-700 mt-0.5">{formatCompactINR(kpis.totalSGST)}</div>
          </div>
          <div className="bg-slate-50 p-2 rounded-xl border border-slate-200/80">
            <div className="text-[10px] text-slate-500 font-bold">IGST (Inter-State)</div>
            <div className="text-xs font-black text-emerald-800 mt-0.5">{formatCompactINR(kpis.totalIGST)}</div>
          </div>
        </div>
      </div>

      {/* Search Input */}
      <div className="relative">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by PO, Invoice, or Vendor ID..."
          className="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-white border border-slate-200 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:border-teal-500 transition-colors shadow-xs"
        />
        {search && (
          <button 
            onClick={() => setSearch('')}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-500 hover:text-slate-800 px-1.5 py-0.5 rounded-md bg-slate-100"
          >
            Clear
          </button>
        )}
      </div>

      {/* Filter Tabs Chips */}
      <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-1">
        <button
          onClick={() => { setFilterTab('ALL'); setLimit(30); }}
          className={`shrink-0 text-xs px-3 py-1.5 rounded-xl font-medium transition-all ${
            filterTab === 'ALL'
              ? 'bg-teal-600 text-white font-bold shadow-md shadow-teal-600/25'
              : 'bg-white text-slate-600 hover:text-slate-900 border border-slate-200'
          }`}
        >
          All ({filteredGSTRecords.length})
        </button>

        <button
          onClick={() => { setFilterTab('ELIGIBLE'); setLimit(30); }}
          className={`shrink-0 text-xs px-3 py-1.5 rounded-xl font-medium transition-all flex items-center gap-1 ${
            filterTab === 'ELIGIBLE'
              ? 'bg-teal-600 text-white font-bold shadow-md shadow-teal-600/25'
              : 'bg-white text-teal-800 hover:bg-teal-50 border border-teal-200'
          }`}
        >
          <CheckCircle2 className="w-3 h-3" />
          <span>Eligible</span>
        </button>

        <button
          onClick={() => { setFilterTab('HOLD'); setLimit(30); }}
          className={`shrink-0 text-xs px-3 py-1.5 rounded-xl font-medium transition-all flex items-center gap-1 ${
            filterTab === 'HOLD'
              ? 'bg-amber-600 text-white font-bold shadow-md shadow-amber-600/25'
              : 'bg-white text-amber-700 hover:bg-amber-50 border border-amber-200'
          }`}
        >
          <AlertTriangle className="w-3 h-3" />
          <span>Hold / Docs</span>
        </button>

        <button
          onClick={() => { setFilterTab('MISMATCH'); setLimit(30); }}
          className={`shrink-0 text-xs px-3 py-1.5 rounded-xl font-medium transition-all flex items-center gap-1 ${
            filterTab === 'MISMATCH'
              ? 'bg-rose-600 text-white font-bold shadow-md shadow-rose-600/25'
              : 'bg-white text-rose-700 hover:bg-rose-50 border border-rose-200'
          }`}
        >
          <Clock className="w-3 h-3" />
          <span>GSTR-2B Mismatch</span>
        </button>
      </div>

      {/* Reconciliation Records Cards (White Cards) */}
      <div className="space-y-2.5">
        {displayedRecords.map((r) => {
          const isEligible = r.itc_review_status === 'Potentially Eligible';
          const isHold = r.itc_review_status === 'Hold - Verify Documents';
          const isMatched = r.invoice_reconciliation_status === 'Matched';
          const isReported = r.supplier_invoice_reported === 'Yes';
          const taxTotal = (r.cgst_inr || 0) + (r.sgst_inr || 0) + (r.igst_inr || 0);

          return (
            <div
              key={r.purchase_id}
              className="bg-white hover:bg-teal-50/20 border border-slate-200 hover:border-teal-300 rounded-2xl p-3.5 transition-all shadow-xs"
            >
              <div className="flex items-start justify-between gap-2">
                <div 
                  onClick={() => navigate('order-detail', { orderId: r.purchase_id })}
                  className="min-w-0 flex-1 cursor-pointer"
                >
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span className="text-xs font-bold text-slate-900 font-mono">
                      {r.purchase_id}
                    </span>
                    <span className="text-[10.5px] font-mono text-slate-500">
                      {r.invoice_number}
                    </span>
                    <span className="text-[10px] text-slate-400">
                      · {formatDate(r.invoice_date)}
                    </span>
                  </div>

                  <div className="text-xs text-slate-700 font-medium mt-1">
                    Taxable Supply: <strong className="text-slate-900">{formatINR(r.taxable_value_inr)}</strong>
                  </div>

                  <div className="text-[11px] text-slate-500 mt-0.5">
                    Vendor: {r.vendor_id} · Total Tax: <strong className="text-teal-700">{formatINR(taxTotal)}</strong>
                  </div>

                  {/* Status Pills */}
                  <div className="flex items-center gap-1.5 mt-2 flex-wrap">
                    <span className={`text-[9.5px] font-bold px-2 py-0.5 rounded-full ${
                      isReported 
                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' 
                        : 'bg-amber-50 text-amber-700 border border-amber-200'
                    }`}>
                      Portal: {r.supplier_invoice_reported}
                    </span>

                    <span className={`text-[9.5px] font-bold px-2 py-0.5 rounded-full ${
                      isMatched 
                        ? 'bg-teal-50 text-teal-700 border border-teal-200' 
                        : 'bg-rose-50 text-rose-700 border border-rose-200'
                    }`}>
                      Recon: {r.invoice_reconciliation_status}
                    </span>

                    <span className={`text-[9.5px] font-bold px-2 py-0.5 rounded-full ${
                      isEligible 
                        ? 'bg-teal-50 text-teal-700 border border-teal-200' 
                        : isHold 
                          ? 'bg-amber-50 text-amber-700 border border-amber-200' 
                          : 'bg-rose-50 text-rose-700 border border-rose-200'
                    }`}>
                      {r.itc_review_status}
                    </span>
                  </div>
                </div>

                {/* Right Action */}
                <div className="flex flex-col items-end gap-2 shrink-0">
                  <div className="text-xs font-black text-teal-800">
                    +{formatCompactINR(taxTotal)}
                  </div>

                  {!isEligible ? (
                    <button
                      onClick={() => updateITCStatus(r.purchase_id, 'Potentially Eligible')}
                      className="text-[10px] font-bold bg-teal-600 hover:bg-teal-500 text-white px-2.5 py-1 rounded-xl shadow-md shadow-teal-600/20 transition-all flex items-center gap-1"
                    >
                      <CheckCircle2 className="w-3 h-3" />
                      <span>Approve</span>
                    </button>
                  ) : (
                    <button
                      onClick={() => navigate('order-detail', { orderId: r.purchase_id })}
                      className="p-1 rounded-lg bg-slate-100 text-slate-400 hover:text-slate-800"
                    >
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            </div>
          );
        })}

        {/* Load More */}
        {records.length > limit && (
          <div className="pt-2 text-center">
            <button
              onClick={() => setLimit(prev => prev + 30)}
              className="px-5 py-2 rounded-2xl bg-white hover:bg-slate-50 text-xs font-bold text-slate-700 border border-slate-200 transition-all shadow-xs"
            >
              Load More ({displayedRecords.length} of {records.length})
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
