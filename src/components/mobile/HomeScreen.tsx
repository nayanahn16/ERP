import React from 'react';
import { 
  Building2, 
  AlertTriangle, 
  TrendingUp, 
  Package, 
  Receipt, 
  Clock, 
  CheckCircle2, 
  ArrowRight, 
  PlusCircle, 
  ShieldCheck, 
  FileCheck, 
  ChevronRight,
  Sparkles,
  RefreshCw,
  Zap,
  MapPin,
  Check
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { formatINR, formatCompactINR, formatDate } from '../../utils/formatters';

export const HomeScreen: React.FC = () => {
  const { 
    activeManufacturer, 
    selectedManufacturerId, 
    navigate, 
    kpis, 
    filteredPurchases, 
    filteredInventory,
    selectScenario,
    reorderInventoryItem,
    currentUser
  } = useApp();

  const recentOrders = filteredPurchases.slice(0, 5);
  const criticalStockItems = filteredInventory.filter(
    i => i.stock_status === 'LOW STOCK' || i.closing_stock_qty <= i.reorder_level_qty
  ).slice(0, 4);

  return (
    <div className="space-y-4 pb-20 text-slate-800">
      {/* Active Manufacturer Hero Card in Teal Green Gradient */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-teal-700 via-teal-800 to-emerald-900 p-4 sm:p-5 text-white shadow-lg shadow-teal-900/15">
        <div className="absolute top-0 right-0 -mr-6 -mt-6 w-36 h-36 rounded-full bg-white/10 blur-2xl pointer-events-none" />
        
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <div className="flex items-center gap-2 mb-1.5 flex-wrap">
              <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-white/20 text-white border border-white/30 backdrop-blur-sm">
                {selectedManufacturerId === 'ALL' ? 'CONSOLIDATED' : activeManufacturer?.manufacturer_id || 'MFG'}
              </span>
              <span className="text-[11px] font-medium text-teal-100 flex items-center gap-1">
                <MapPin className="w-3 h-3 text-teal-200" />
                {selectedManufacturerId === 'ALL' 
                  ? 'Pan-India (120 Facilities)' 
                  : `${activeManufacturer?.city}, ${activeManufacturer?.state} (${activeManufacturer?.state_code})`}
              </span>
            </div>

            <h2 className="text-lg sm:text-xl font-black text-white tracking-tight truncate">
              {selectedManufacturerId === 'ALL' 
                ? 'All 120 Synthetic Manufacturers' 
                : activeManufacturer?.business_name || 'Manufacturer Profile'}
            </h2>

            <p className="text-xs text-teal-100/90 mt-1 line-clamp-1">
              {selectedManufacturerId === 'ALL'
                ? 'Synthesized multi-state manufacturing and procurement ecosystem'
                : `Industry: ${activeManufacturer?.manufacturing_category} · ${activeManufacturer?.employee_count} Employees · GSTIN: ${activeManufacturer?.gstin}`}
            </p>
          </div>

          <button
            onClick={() => navigate('manufacturers')}
            className="shrink-0 text-xs font-bold bg-white text-teal-800 hover:bg-teal-50 px-3 py-1.5 rounded-xl shadow-md transition-all flex items-center gap-1"
          >
            <span>Switch</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Quick Metrics Bar under Hero */}
        <div className="grid grid-cols-3 gap-2 mt-4 pt-3 border-t border-teal-600/50 text-center">
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-2 border border-white/10">
            <div className="text-[10px] text-teal-200 font-medium">Orders Count</div>
            <div className="text-sm font-black text-white mt-0.5">{filteredPurchases.length} POs</div>
          </div>
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-2 border border-white/10">
            <div className="text-[10px] text-teal-200 font-medium">Stock SKUs</div>
            <div className="text-sm font-black text-white mt-0.5">{filteredInventory.length} Items</div>
          </div>
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-2 border border-white/10">
            <div className="text-[10px] text-teal-200 font-medium">Fulfillment</div>
            <div className="text-sm font-black text-emerald-200 mt-0.5">
              {filteredPurchases.length > 0 
                ? `${Math.round((kpis.receivedCount / filteredPurchases.length) * 100)}%` 
                : '100%'}
            </div>
          </div>
        </div>
      </div>

      {/* Urgent Attention Alerts Banner (Light Mode Amber) */}
      {(kpis.lowStockCount > 0 || kpis.overdueCount > 0 || kpis.mismatchCount > 0) && (
        <div className="rounded-2xl bg-amber-50 border border-amber-200 p-3.5 shadow-xs">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-1.5">
              <AlertTriangle className="w-4 h-4 text-amber-600 animate-bounce" />
              <span className="text-xs font-bold uppercase tracking-wider text-amber-800">
                Action Required
              </span>
            </div>
            <span className="text-[11px] font-bold text-amber-800 bg-amber-100 px-2 py-0.5 rounded-full">
              {kpis.lowStockCount + kpis.overdueCount + kpis.mismatchCount} items
            </span>
          </div>

          <div className="grid grid-cols-3 gap-2 text-center">
            {kpis.lowStockCount > 0 && (
              <button
                onClick={() => navigate('inventory')}
                className="bg-white hover:bg-amber-100/70 border border-amber-200/80 p-2 rounded-xl transition-all shadow-2xs"
              >
                <div className="text-sm font-black text-rose-600">{kpis.lowStockCount}</div>
                <div className="text-[10px] font-semibold text-slate-600">Low Stock</div>
              </button>
            )}

            {kpis.overdueCount > 0 && (
              <button
                onClick={() => navigate('orders')}
                className="bg-white hover:bg-amber-100/70 border border-amber-200/80 p-2 rounded-xl transition-all shadow-2xs"
              >
                <div className="text-sm font-black text-amber-700">{kpis.overdueCount}</div>
                <div className="text-[10px] font-semibold text-slate-600">Overdue POs</div>
              </button>
            )}

            {kpis.mismatchCount > 0 && (
              <button
                onClick={() => navigate('matching')}
                className="bg-white hover:bg-amber-100/70 border border-amber-200/80 p-2 rounded-xl transition-all shadow-2xs"
              >
                <div className="text-sm font-black text-teal-700">{kpis.mismatchCount}</div>
                <div className="text-[10px] font-semibold text-slate-600">3-Way Mismatch</div>
              </button>
            )}
          </div>
        </div>
      )}

      {/* 4 Primary Financial KPI Cards (White Cards, Teal Accents) */}
      <div className="grid grid-cols-2 gap-3">
        {/* Total Spend */}
        <div 
          onClick={() => navigate('orders')}
          className="cursor-pointer group bg-white hover:bg-teal-50/30 border border-slate-200 hover:border-teal-300 p-3.5 rounded-2xl transition-all shadow-sm"
        >
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-[11px] font-bold text-slate-600 uppercase tracking-tight">Purchases Spend</span>
            <div className="p-1.5 rounded-xl bg-teal-50 text-teal-700 group-hover:scale-110 transition-transform">
              <TrendingUp className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="text-base sm:text-lg font-black text-slate-900">
            {formatCompactINR(kpis.totalSpend)}
          </div>
          <div className="text-[10.5px] text-slate-500 mt-1">
            <span>{filteredPurchases.length} total orders</span>
          </div>
        </div>

        {/* Stock Valuation */}
        <div 
          onClick={() => navigate('inventory')}
          className="cursor-pointer group bg-white hover:bg-teal-50/30 border border-slate-200 hover:border-teal-300 p-3.5 rounded-2xl transition-all shadow-sm"
        >
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-[11px] font-bold text-slate-600 uppercase tracking-tight">Stock Asset Value</span>
            <div className="p-1.5 rounded-xl bg-emerald-50 text-emerald-700 group-hover:scale-110 transition-transform">
              <Package className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="text-base sm:text-lg font-black text-slate-900">
            {formatCompactINR(kpis.stockValuation)}
          </div>
          <div className="text-[10.5px] text-emerald-700 mt-1 font-medium">
            <span>{filteredInventory.length} materials in store</span>
          </div>
        </div>

        {/* Claimable ITC */}
        <div 
          onClick={() => navigate('gst')}
          className="cursor-pointer group bg-white hover:bg-teal-50/30 border border-slate-200 hover:border-teal-300 p-3.5 rounded-2xl transition-all shadow-sm"
        >
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-[11px] font-bold text-slate-600 uppercase tracking-tight">Eligible ITC (Tax)</span>
            <div className="p-1.5 rounded-xl bg-teal-50 text-teal-700 group-hover:scale-110 transition-transform">
              <Receipt className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="text-base sm:text-lg font-black text-teal-800">
            {formatCompactINR(kpis.itcEligibleAmount)}
          </div>
          <div className="text-[10.5px] text-teal-700 mt-1 font-medium">
            <span>GST Input Tax Credit</span>
          </div>
        </div>

        {/* Overdue Amount */}
        <div 
          onClick={() => navigate('orders')}
          className="cursor-pointer group bg-white hover:bg-rose-50/30 border border-slate-200 hover:border-rose-300 p-3.5 rounded-2xl transition-all shadow-sm"
        >
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-[11px] font-bold text-slate-600 uppercase tracking-tight">Overdue Invoices</span>
            <div className="p-1.5 rounded-xl bg-rose-50 text-rose-600 group-hover:scale-110 transition-transform">
              <Clock className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="text-base sm:text-lg font-black text-rose-600">
            {formatCompactINR(kpis.overdueAmount)}
          </div>
          <div className="text-[10.5px] text-rose-600 mt-1 font-semibold">
            <span>{kpis.overdueCount} bills pending payment</span>
          </div>
        </div>
      </div>

      {/* Quick Action Buttons Row (Teal Green Accents) */}
      <div className="space-y-2">
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 px-1">
          Quick Workflows
        </h3>
        <div className="grid grid-cols-4 gap-2">
          <button
            onClick={() => navigate('new-order')}
            className="flex flex-col items-center justify-center p-3 rounded-2xl bg-white hover:bg-teal-50 border border-teal-200/80 text-teal-800 transition-all text-center shadow-xs group"
          >
            <PlusCircle className="w-5 h-5 text-teal-600 mb-1 group-hover:scale-110 transition-transform" />
            <span className="text-[11px] font-bold leading-tight">New PO</span>
          </button>

          <button
            onClick={() => navigate('inventory')}
            className="flex flex-col items-center justify-center p-3 rounded-2xl bg-white hover:bg-teal-50 border border-teal-200/80 text-teal-800 transition-all text-center shadow-xs group"
          >
            <Package className="w-5 h-5 text-teal-600 mb-1 group-hover:scale-110 transition-transform" />
            <span className="text-[11px] font-bold leading-tight">Stock List</span>
          </button>

          <button
            onClick={() => navigate('matching')}
            className="flex flex-col items-center justify-center p-3 rounded-2xl bg-white hover:bg-teal-50 border border-teal-200/80 text-teal-800 transition-all text-center shadow-xs group"
          >
            <ShieldCheck className="w-5 h-5 text-teal-600 mb-1 group-hover:scale-110 transition-transform" />
            <span className="text-[11px] font-bold leading-tight">3-Way Match</span>
          </button>

          <button
            onClick={() => navigate('scenarios')}
            className="flex flex-col items-center justify-center p-3 rounded-2xl bg-white hover:bg-teal-50 border border-teal-200/80 text-teal-800 transition-all text-center shadow-xs group"
          >
            <Sparkles className="w-5 h-5 text-teal-600 mb-1 group-hover:scale-110 transition-transform" />
            <span className="text-[11px] font-bold leading-tight">Scenarios</span>
          </button>
        </div>
      </div>

      {/* Critical Low Stock Replenishment Quick View */}
      {criticalStockItems.length > 0 && (
        <div className="space-y-2">
          <div className="flex items-center justify-between px-1">
            <h3 className="text-xs font-bold uppercase tracking-wider text-rose-600 flex items-center gap-1.5">
              <span>⚠️ Low Stock Replenishment Needed</span>
            </h3>
            <button
              onClick={() => navigate('inventory')}
              className="text-xs text-teal-700 hover:text-teal-800 font-bold flex items-center gap-0.5"
            >
              <span>View All</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="space-y-2">
            {criticalStockItems.map((item) => {
              const shortfall = Math.max(0, item.reorder_level_qty * 2 - item.closing_stock_qty);
              return (
                <div
                  key={item.inventory_record_id}
                  className="bg-white border border-slate-200 rounded-2xl p-3 flex items-center justify-between gap-3 shadow-xs hover:border-teal-300 transition-all"
                >
                  <div 
                    onClick={() => navigate('inventory-detail', { itemId: item.inventory_record_id })}
                    className="min-w-0 cursor-pointer flex-1"
                  >
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="text-xs font-bold text-slate-900 truncate">
                        {item.material_name}
                      </span>
                      <span className="text-[10px] px-1.5 py-0.2 rounded bg-rose-50 text-rose-700 font-semibold border border-rose-200">
                        {item.material_id}
                      </span>
                    </div>

                    <div className="flex items-center gap-3 text-xs text-slate-500 mt-1">
                      <span>Stock: <strong className="text-rose-600 font-bold">{item.closing_stock_qty}</strong> {item.unit}</span>
                      <span>Min: <strong className="text-slate-700">{item.reorder_level_qty}</strong></span>
                    </div>
                  </div>

                  <button
                    onClick={() => reorderInventoryItem(item, shortfall || 100)}
                    className="shrink-0 text-xs font-bold bg-teal-600 hover:bg-teal-500 text-white px-3 py-1.5 rounded-xl shadow-md shadow-teal-600/20 flex items-center gap-1 transition-all"
                  >
                    <Zap className="w-3 h-3 text-yellow-300 fill-yellow-300" />
                    <span>Reorder</span>
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Recent Invoices / Purchases List (White Cards) */}
      <div className="space-y-2">
        <div className="flex items-center justify-between px-1">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">
            Recent Orders & Invoices
          </h3>
          <button
            onClick={() => navigate('orders')}
            className="text-xs text-teal-700 hover:text-teal-800 font-bold flex items-center gap-0.5"
          >
            <span>View All ({filteredPurchases.length})</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="space-y-2">
          {recentOrders.map((order) => {
            const isMatch = order.invoice_reconciliation_status === 'Matched';
            const isOverdue = order.payment_status === 'Overdue';
            const isPaid = order.payment_status === 'Paid';

            return (
              <div
                key={order.purchase_id}
                onClick={() => navigate('order-detail', { orderId: order.purchase_id })}
                className="cursor-pointer bg-white hover:bg-slate-50/80 border border-slate-200 hover:border-teal-300 rounded-2xl p-3.5 transition-all shadow-xs"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-slate-900 tracking-tight font-mono">
                        {order.purchase_id}
                      </span>
                      <span className="text-[10px] text-slate-500">
                        {formatDate(order.invoice_date)}
                      </span>
                    </div>
                    <div className="text-xs text-slate-700 font-semibold mt-1 truncate">
                      {order.material_name} · {order.quantity_ordered} {order.unit}
                    </div>
                    <div className="text-[11px] text-slate-400 truncate">
                      Vendor: {order.vendor_id}
                    </div>
                  </div>

                  <div className="text-right shrink-0">
                    <div className="text-xs font-black text-slate-900">
                      {formatINR(order.invoice_total_inr)}
                    </div>
                    <div className="flex items-center justify-end gap-1 mt-1">
                      <span className={`text-[10px] px-1.5 py-0.5 rounded font-bold ${
                        isPaid 
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' 
                          : isOverdue 
                            ? 'bg-rose-50 text-rose-700 border border-rose-200 animate-pulse' 
                            : 'bg-amber-50 text-amber-700 border border-amber-200'
                      }`}>
                        {order.payment_status}
                      </span>
                      <span className={`text-[10px] px-1.5 py-0.5 rounded font-bold ${
                        isMatch ? 'bg-teal-50 text-teal-700 border border-teal-200' : 'bg-rose-50 text-rose-700 border border-rose-200'
                      }`}>
                        {order.invoice_reconciliation_status}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Tax Summary Micro-Card */}
      <div 
        onClick={() => navigate('gst')}
        className="cursor-pointer rounded-2xl bg-white border border-slate-200 p-4 hover:border-teal-300 transition-all flex items-center justify-between shadow-xs"
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-teal-50 text-teal-700 flex items-center justify-center font-bold border border-teal-200">
            <Receipt className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xs font-bold text-slate-900">GST Control Tower & ITC Status</div>
            <div className="text-[11px] text-slate-500">
              CGST: {formatCompactINR(kpis.totalCGST)} · SGST: {formatCompactINR(kpis.totalSGST)} · IGST: {formatCompactINR(kpis.totalIGST)}
            </div>
          </div>
        </div>
        <ChevronRight className="w-4 h-4 text-slate-400" />
      </div>
    </div>
  );
};
