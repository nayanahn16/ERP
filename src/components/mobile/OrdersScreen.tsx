import React, { useState, useMemo } from 'react';
import { 
  FileText, 
  Search, 
  Plus, 
  AlertTriangle, 
  CheckCircle2, 
  Clock, 
  ChevronRight, 
  ShieldAlert, 
  Truck,
  ArrowUpDown,
  Filter
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { PurchaseRecord } from '../../types/dataset';
import { formatINR, formatCompactINR, formatDate } from '../../utils/formatters';

export const OrdersScreen: React.FC = () => {
  const { filteredPurchases, navigate, kpis } = useApp();
  const [search, setSearch] = useState('');
  const [filterTab, setFilterTab] = useState<'ALL' | 'OVERDUE' | 'MISMATCH' | 'UNPAID' | 'PAID' | 'PENDING_GRN'>('ALL');
  const [limit, setLimit] = useState(30);

  const orders = useMemo(() => {
    return filteredPurchases.filter(p => {
      const q = search.toLowerCase();
      const matchSearch = 
        p.purchase_id.toLowerCase().includes(q) || 
        p.invoice_number.toLowerCase().includes(q) ||
        p.vendor_id.toLowerCase().includes(q) ||
        p.material_name.toLowerCase().includes(q);

      if (!matchSearch) return false;

      if (filterTab === 'OVERDUE') return p.payment_status === 'Overdue';
      if (filterTab === 'MISMATCH') return p.invoice_reconciliation_status === 'Mismatch';
      if (filterTab === 'UNPAID') return p.payment_status === 'Unpaid';
      if (filterTab === 'PAID') return p.payment_status === 'Paid';
      if (filterTab === 'PENDING_GRN') return p.goods_receipt_status === 'Pending' || p.goods_receipt_status === 'Partially Received';

      return true;
    });
  }, [filteredPurchases, search, filterTab]);

  const displayedOrders = orders.slice(0, limit);

  return (
    <div className="space-y-3.5 pb-24 text-slate-800">
      {/* Search Input Bar (White Background) */}
      <div className="relative">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by PO, Invoice, Material, Vendor..."
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
          All ({filteredPurchases.length})
        </button>

        <button
          onClick={() => { setFilterTab('OVERDUE'); setLimit(30); }}
          className={`shrink-0 text-xs px-3 py-1.5 rounded-xl font-medium transition-all flex items-center gap-1 ${
            filterTab === 'OVERDUE'
              ? 'bg-rose-600 text-white font-bold shadow-md shadow-rose-600/25'
              : 'bg-white text-rose-700 hover:bg-rose-50 border border-rose-200'
          }`}
        >
          <Clock className="w-3 h-3" />
          <span>Overdue ({kpis.overdueCount})</span>
        </button>

        <button
          onClick={() => { setFilterTab('MISMATCH'); setLimit(30); }}
          className={`shrink-0 text-xs px-3 py-1.5 rounded-xl font-medium transition-all flex items-center gap-1 ${
            filterTab === 'MISMATCH'
              ? 'bg-amber-600 text-white font-bold shadow-md shadow-amber-600/25'
              : 'bg-white text-amber-700 hover:bg-amber-50 border border-amber-200'
          }`}
        >
          <AlertTriangle className="w-3 h-3" />
          <span>Mismatch ({kpis.mismatchCount})</span>
        </button>

        <button
          onClick={() => { setFilterTab('PENDING_GRN'); setLimit(30); }}
          className={`shrink-0 text-xs px-3 py-1.5 rounded-xl font-medium transition-all flex items-center gap-1 ${
            filterTab === 'PENDING_GRN'
              ? 'bg-teal-700 text-white font-bold shadow-md shadow-teal-700/25'
              : 'bg-white text-teal-800 hover:bg-teal-50 border border-teal-200'
          }`}
        >
          <Truck className="w-3 h-3" />
          <span>Pending GRN</span>
        </button>

        <button
          onClick={() => { setFilterTab('PAID'); setLimit(30); }}
          className={`shrink-0 text-xs px-3 py-1.5 rounded-xl font-medium transition-all flex items-center gap-1 ${
            filterTab === 'PAID'
              ? 'bg-emerald-600 text-white font-bold shadow-md shadow-emerald-600/25'
              : 'bg-white text-emerald-700 hover:bg-emerald-50 border border-slate-200'
          }`}
        >
          <CheckCircle2 className="w-3 h-3" />
          <span>Paid</span>
        </button>
      </div>

      {/* Orders List (Crisp White Cards) */}
      <div className="space-y-2.5">
        {displayedOrders.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-3xl border border-slate-200 p-6 shadow-xs">
            <FileText className="w-10 h-10 text-slate-400 mx-auto mb-2" />
            <h4 className="text-sm font-bold text-slate-700">No Orders Found</h4>
            <p className="text-xs text-slate-500 mt-1">Try switching your filter or search query.</p>
          </div>
        ) : (
          displayedOrders.map((order) => {
            const isMatch = order.invoice_reconciliation_status === 'Matched';
            const isOverdue = order.payment_status === 'Overdue';
            const isPaid = order.payment_status === 'Paid';
            const isReceived = order.goods_receipt_status === 'Received';

            return (
              <div
                key={order.purchase_id}
                onClick={() => navigate('order-detail', { orderId: order.purchase_id })}
                className="cursor-pointer bg-white hover:bg-teal-50/20 border border-slate-200 hover:border-teal-300 rounded-2xl p-3.5 transition-all shadow-xs"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="text-xs font-bold text-slate-900 tracking-tight font-mono">
                        {order.purchase_id}
                      </span>
                      <span className="text-[10.5px] font-mono text-slate-500">
                        {order.invoice_number}
                      </span>
                      <span className="text-[10px] text-slate-400">
                        · {formatDate(order.invoice_date)}
                      </span>
                    </div>

                    <div className="text-xs font-bold text-slate-800 mt-1 truncate">
                      {order.material_name}
                    </div>

                    <div className="text-[11px] text-slate-500 mt-0.5 flex items-center gap-2">
                      <span>{order.quantity_ordered} {order.unit} @ {formatINR(order.unit_price_inr)}</span>
                      <span>·</span>
                      <span className="truncate">Vendor: {order.vendor_id}</span>
                    </div>

                    {/* Status Badges Row */}
                    <div className="flex items-center gap-1.5 mt-2 flex-wrap">
                      {/* GRN Status */}
                      <span className={`text-[9.5px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1 ${
                        isReceived 
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' 
                          : order.goods_receipt_status === 'Partially Received'
                            ? 'bg-amber-50 text-amber-700 border border-amber-200'
                            : 'bg-slate-100 text-slate-600 border border-slate-200'
                      }`}>
                        <Truck className="w-2.5 h-2.5" />
                        <span>{order.goods_receipt_status}</span>
                      </span>

                      {/* 3-Way Match */}
                      <span className={`text-[9.5px] font-bold px-2 py-0.5 rounded-full ${
                        isMatch 
                          ? 'bg-teal-50 text-teal-700 border border-teal-200' 
                          : 'bg-rose-50 text-rose-700 border border-rose-200'
                      }`}>
                        {order.invoice_reconciliation_status}
                      </span>

                      {/* Payment */}
                      <span className={`text-[9.5px] font-bold px-2 py-0.5 rounded-full ${
                        isPaid 
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' 
                          : isOverdue 
                            ? 'bg-rose-50 text-rose-700 border border-rose-200' 
                            : 'bg-amber-50 text-amber-700 border border-amber-200'
                      }`}>
                        {order.payment_status}
                      </span>
                    </div>
                  </div>

                  {/* Right: Amount & Tax Tag */}
                  <div className="text-right shrink-0">
                    <div className="text-sm font-black text-slate-900">
                      {formatINR(order.invoice_total_inr)}
                    </div>
                    <div className="text-[10px] text-teal-700 mt-0.5 font-bold">
                      {order.tax_type} ({order.gst_rate_percent_example}%)
                    </div>
                    <div className="mt-2 flex justify-end">
                      <div className="p-1 rounded-lg bg-slate-100 text-slate-400 group-hover:text-slate-700">
                        <ChevronRight className="w-3.5 h-3.5" />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })
        )}

        {/* Load More Button */}
        {orders.length > limit && (
          <div className="pt-2 text-center">
            <button
              onClick={() => setLimit(prev => prev + 30)}
              className="px-5 py-2 rounded-2xl bg-white hover:bg-slate-50 text-xs font-bold text-slate-700 border border-slate-200 transition-all shadow-xs"
            >
              Load More Orders ({displayedOrders.length} of {orders.length})
            </button>
          </div>
        )}
      </div>

      {/* Floating Action Button (FAB) for New Order (Teal Green) */}
      <button
        onClick={() => navigate('new-order')}
        className="fixed bottom-18 right-5 z-40 bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-500 hover:to-emerald-500 text-white p-3.5 rounded-2xl shadow-xl shadow-teal-600/30 border border-teal-400/30 flex items-center gap-2 transition-transform hover:scale-105 active:scale-95"
      >
        <Plus className="w-5 h-5 stroke-[2.5]" />
        <span className="text-xs font-bold pr-1">Create PO</span>
      </button>
    </div>
  );
};
