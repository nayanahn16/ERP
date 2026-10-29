import React, { useState, useMemo } from 'react';
import { 
  ShieldCheck, 
  Search, 
  AlertTriangle, 
  CheckCircle2, 
  Clock, 
  Truck, 
  Receipt, 
  FileText, 
  ChevronRight,
  ShieldAlert
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { formatINR, formatCompactINR, formatDate } from '../../utils/formatters';

export const MatchingScreen: React.FC = () => {
  const { filteredPurchases, navigate, updateReconciliationStatus, kpis } = useApp();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'MISMATCH' | 'MATCHED' | 'NOT_CHECKED'>('ALL');
  const [limit, setLimit] = useState(30);

  const list = useMemo(() => {
    return filteredPurchases.filter(p => {
      const q = search.toLowerCase();
      const matchSearch = 
        p.purchase_id.toLowerCase().includes(q) || 
        p.invoice_number.toLowerCase().includes(q) ||
        p.vendor_id.toLowerCase().includes(q) ||
        p.material_name.toLowerCase().includes(q);

      if (!matchSearch) return false;

      if (statusFilter === 'MISMATCH') return p.invoice_reconciliation_status === 'Mismatch';
      if (statusFilter === 'MATCHED') return p.invoice_reconciliation_status === 'Matched';
      if (statusFilter === 'NOT_CHECKED') return p.invoice_reconciliation_status === 'Not Checked';

      return true;
    });
  }, [filteredPurchases, search, statusFilter]);

  const displayed = list.slice(0, limit);

  return (
    <div className="space-y-4 pb-24 text-slate-800">
      {/* Top Banner (White & Teal Gradient) */}
      <div className="bg-gradient-to-br from-teal-50/70 via-white to-emerald-50/40 border border-teal-200 rounded-3xl p-4 sm:p-5 shadow-xs">
        <div className="flex items-center gap-2 mb-2">
          <span className="text-xs font-bold px-2 py-0.5 rounded-lg bg-teal-100 text-teal-800 border border-teal-200">
            AUDIT GATING
          </span>
          <span className="text-xs text-slate-500 font-medium">
            PO vs Physical GRN vs Vendor Invoice
          </span>
        </div>

        <h2 className="text-lg sm:text-xl font-black text-slate-900 tracking-tight">
          Three-Way Matching Verification
        </h2>
        <p className="text-xs text-slate-500 mt-1">
          Automated commercial tolerance engine checks billed count and unit price against verified goods receipts.
        </p>
      </div>

      {/* Matching Stats */}
      <div className="grid grid-cols-3 gap-2 text-center bg-white p-3 rounded-2xl border border-slate-200 shadow-xs">
        <div>
          <div className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Total Invoices</div>
          <div className="text-sm font-black text-slate-900 mt-0.5">{filteredPurchases.length}</div>
        </div>
        <div>
          <div className="text-[10px] text-rose-600 font-bold uppercase tracking-wider">Discrepancies</div>
          <div className="text-sm font-black text-rose-600 mt-0.5">{kpis.mismatchCount}</div>
        </div>
        <div>
          <div className="text-[10px] text-teal-700 font-bold uppercase tracking-wider">Clean Match</div>
          <div className="text-sm font-black text-teal-700 mt-0.5">
            {filteredPurchases.length - kpis.mismatchCount}
          </div>
        </div>
      </div>

      {/* Search Input Bar */}
      <div className="relative">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by PO, Invoice, or Material..."
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

      {/* Filter Chips */}
      <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-1">
        <button
          onClick={() => { setStatusFilter('ALL'); setLimit(30); }}
          className={`shrink-0 text-xs px-3 py-1.5 rounded-xl font-medium transition-all ${
            statusFilter === 'ALL'
              ? 'bg-teal-600 text-white font-bold shadow-md shadow-teal-600/25'
              : 'bg-white text-slate-600 hover:text-slate-900 border border-slate-200'
          }`}
        >
          All Invoices ({filteredPurchases.length})
        </button>

        <button
          onClick={() => { setStatusFilter('MISMATCH'); setLimit(30); }}
          className={`shrink-0 text-xs px-3 py-1.5 rounded-xl font-medium transition-all flex items-center gap-1 ${
            statusFilter === 'MISMATCH'
              ? 'bg-rose-600 text-white font-bold shadow-md shadow-rose-600/25'
              : 'bg-white text-rose-700 hover:bg-rose-50 border border-rose-200'
          }`}
        >
          <AlertTriangle className="w-3 h-3" />
          <span>Discrepancy Hold ({kpis.mismatchCount})</span>
        </button>

        <button
          onClick={() => { setStatusFilter('MATCHED'); setLimit(30); }}
          className={`shrink-0 text-xs px-3 py-1.5 rounded-xl font-medium transition-all flex items-center gap-1 ${
            statusFilter === 'MATCHED'
              ? 'bg-emerald-600 text-white font-bold shadow-md shadow-emerald-600/25'
              : 'bg-white text-slate-600 hover:text-slate-900 border border-slate-200'
          }`}
        >
          <CheckCircle2 className="w-3 h-3" />
          <span>Verified Matched</span>
        </button>
      </div>

      {/* Items List (White Cards) */}
      <div className="space-y-2.5">
        {displayed.map(p => {
          const isMismatch = p.invoice_reconciliation_status === 'Mismatch';
          const isReceived = p.goods_receipt_status === 'Received';

          return (
            <div
              key={p.purchase_id}
              className={`rounded-2xl p-3.5 border transition-all shadow-2xs ${
                isMismatch 
                  ? 'bg-rose-50/40 border-rose-200' 
                  : 'bg-white hover:bg-slate-50 border-slate-200 hover:border-teal-300'
              }`}
            >
              <div className="flex items-start justify-between gap-2">
                <div 
                  onClick={() => navigate('order-detail', { orderId: p.purchase_id })}
                  className="min-w-0 flex-1 cursor-pointer"
                >
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span className="text-xs font-bold text-slate-900 font-mono">
                      {p.purchase_id}
                    </span>
                    <span className="text-[10.5px] font-mono text-slate-500">
                      {p.invoice_number}
                    </span>
                    <span className="text-[10px] text-slate-400">
                      · {formatDate(p.invoice_date)}
                    </span>
                  </div>

                  <h3 className="text-xs font-bold text-slate-800 mt-1 truncate">
                    {p.material_name} · {p.quantity_ordered} {p.unit}
                  </h3>

                  <div className="text-[11px] text-slate-500 mt-0.5">
                    Vendor: {p.vendor_id} · Total: <strong className="text-slate-900">{formatINR(p.invoice_total_inr)}</strong>
                  </div>

                  {/* 3 Steps Mini Indicators */}
                  <div className="grid grid-cols-3 gap-1.5 mt-2.5 text-center text-[10px]">
                    <div className="bg-slate-50 p-1.5 rounded-lg border border-slate-200/60">
                      <div className="text-slate-400">1. PO Contract</div>
                      <div className="font-bold text-teal-700">Confirmed</div>
                    </div>
                    <div className="bg-slate-50 p-1.5 rounded-lg border border-slate-200/60">
                      <div className="text-slate-400">2. Goods Receipt</div>
                      <div className={`font-bold ${isReceived ? 'text-teal-700' : 'text-amber-700'}`}>
                        {p.goods_receipt_status}
                      </div>
                    </div>
                    <div className="bg-slate-50 p-1.5 rounded-lg border border-slate-200/60">
                      <div className="text-slate-400">3. Invoice Billed</div>
                      <div className={`font-bold ${isMismatch ? 'text-rose-600' : 'text-teal-700'}`}>
                        {p.invoice_reconciliation_status}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Right Action */}
                <div className="flex flex-col items-end gap-2 shrink-0">
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                    isMismatch 
                      ? 'bg-rose-50 text-rose-700 border border-rose-200 animate-pulse' 
                      : 'bg-teal-50 text-teal-700 border border-teal-200'
                  }`}>
                    {p.invoice_reconciliation_status}
                  </span>

                  {isMismatch ? (
                    <button
                      onClick={() => updateReconciliationStatus(p.purchase_id, 'Matched')}
                      className="text-[10.5px] font-bold bg-teal-600 hover:bg-teal-500 text-white px-2.5 py-1 rounded-xl shadow-md shadow-teal-600/25 transition-all flex items-center gap-1"
                    >
                      <CheckCircle2 className="w-3 h-3" />
                      <span>Approve</span>
                    </button>
                  ) : (
                    <button
                      onClick={() => navigate('order-detail', { orderId: p.purchase_id })}
                      className="p-1 rounded-lg bg-slate-100 text-slate-400 hover:text-slate-800 mt-1"
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
        {list.length > limit && (
          <div className="pt-2 text-center">
            <button
              onClick={() => setLimit(prev => prev + 30)}
              className="px-5 py-2 rounded-2xl bg-white hover:bg-slate-50 text-xs font-bold text-slate-700 border border-slate-200 transition-all shadow-xs"
            >
              Load More ({displayed.length} of {list.length})
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
