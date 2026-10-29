import React from 'react';
import { 
  Boxes, 
  AlertTriangle, 
  ShoppingCart, 
  Truck, 
  FileCheck2, 
  Receipt, 
  IndianRupee, 
  ArrowRight,
  ShieldAlert,
  Calendar,
  CheckCircle2,
  TrendingUp,
  AlertCircle
} from 'lucide-react';
import { 
  InventoryItem, 
  PurchaseOrder, 
  GoodsReceiptNote, 
  VendorInvoice, 
  ThreeWayMatchResult, 
  StockAlert, 
  GSTReconciliationRecord, 
  AuditEvent 
} from '../../types';
import { KPICard } from '../common/KPICard';
import { formatINR } from '../../lib/gstService';
import { formatDate, formatDateTime } from '../../lib/utils';
import { 
  ResponsiveContainer, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  Cell, 
  PieChart, 
  Pie, 
  Legend 
} from 'recharts';

interface ExecutiveOverviewProps {
  items: InventoryItem[];
  purchaseOrders: PurchaseOrder[];
  goodsReceipts: GoodsReceiptNote[];
  invoices: VendorInvoice[];
  matchResults: ThreeWayMatchResult[];
  stockAlerts: StockAlert[];
  gstRecords: GSTReconciliationRecord[];
  auditEvents: AuditEvent[];
  selectedWarehouseId: string;
  onNavigate: (tab: any, context?: any) => void;
}

export const ExecutiveOverview: React.FC<ExecutiveOverviewProps> = ({
  items,
  purchaseOrders,
  goodsReceipts,
  invoices,
  matchResults,
  stockAlerts,
  gstRecords,
  auditEvents,
  selectedWarehouseId,
  onNavigate
}) => {
  // 1. Calculate Real Dynamic KPIs from records
  const filteredItems = selectedWarehouseId === 'ALL'
    ? items
    : items.filter(i => !!i.balances[selectedWarehouseId]);

  const totalInventoryValue = filteredItems.reduce((acc, item) => {
    if (selectedWarehouseId === 'ALL') {
      return acc + (item.totalCurrentQty * item.standardCost);
    } else {
      const b = item.balances[selectedWarehouseId];
      return acc + ((b?.currentQty || 0) * item.standardCost);
    }
  }, 0);

  const activeAlerts = stockAlerts.filter(a => {
    const whMatch = selectedWarehouseId === 'ALL' || a.warehouseId === selectedWarehouseId;
    return whMatch && a.status !== 'RESOLVED';
  });

  const lowStockCount = activeAlerts.length;
  const criticalShortageCount = activeAlerts.filter(a => a.urgency === 'CRITICAL').length;

  const openPOs = purchaseOrders.filter(p => {
    const whMatch = selectedWarehouseId === 'ALL' || p.warehouseId === selectedWarehouseId;
    return whMatch && ['APPROVED', 'SENT_TO_VENDOR', 'PARTIALLY_RECEIVED'].includes(p.status);
  });

  const pendingGRNs = goodsReceipts.filter(g => {
    const whMatch = selectedWarehouseId === 'ALL' || g.warehouseId === selectedWarehouseId;
    return whMatch && g.hasDiscrepancy;
  });

  const matchingExceptions = matchResults.filter(m => m.resolutionStatus === 'UNRESOLVED');

  const outstandingPayables = invoices
    .filter(inv => ['APPROVED_FOR_PAYMENT', 'DISCREPANCY_HOLD', 'AWAITING_MATCH'].includes(inv.paymentStatus))
    .reduce((acc, inv) => acc + (inv.grandTotal - inv.paidAmount), 0);

  const gstExceptions = gstRecords.filter(g => g.itcEligibility === 'DISCREPANCY_FLAGGED' || g.reconciliationStatus === 'AMOUNT_MISMATCH');

  // 2. Chart Data: Inventory Value by Category
  const categoryMap: { [cat: string]: number } = {};
  filteredItems.forEach(item => {
    const val = (selectedWarehouseId === 'ALL' ? item.totalCurrentQty : (item.balances[selectedWarehouseId]?.currentQty || 0)) * item.standardCost;
    categoryMap[item.category] = (categoryMap[item.category] || 0) + val;
  });

  const categoryChartData = Object.entries(categoryMap).map(([name, value]) => ({
    name,
    value: Math.round(value)
  }));

  const COLORS = ['#2563eb', '#3b82f6', '#0ea5e9', '#6366f1', '#8b5cf6'];

  // 3. Chart Data: PO vs Invoiced vs Accepted
  const procurementOverviewData = [
    {
      name: 'PO Ordered',
      amount: purchaseOrders.reduce((sum, p) => sum + p.grandTotal, 0),
      color: '#3b82f6'
    },
    {
      name: 'Invoiced',
      amount: invoices.reduce((sum, inv) => sum + inv.grandTotal, 0),
      color: '#f59e0b'
    },
    {
      name: 'Clean Matched',
      amount: invoices.filter(i => ['MATCHED', 'APPROVED_FOR_PAYMENT', 'PAID'].includes(i.paymentStatus)).reduce((sum, inv) => sum + inv.grandTotal, 0),
      color: '#10b981'
    },
    {
      name: 'Dispute Hold',
      amount: invoices.filter(i => i.paymentStatus === 'DISCREPANCY_HOLD').reduce((sum, inv) => sum + inv.grandTotal, 0),
      color: '#ef4444'
    }
  ];

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-800">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Executive Operational Command Center</h1>
          <p className="text-xs text-slate-400 mt-1">
            Real-time control tower for procurement, warehouse reconciliation, 3-way matching & GST Input Tax Credit.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 rounded-lg text-xs font-medium">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
            Live DB Synchronized
          </span>
        </div>
      </div>

      {/* 8 Primary Calculated KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <KPICard
          title="Total Inventory Value"
          value={formatINR(totalInventoryValue)}
          subtitle={`${filteredItems.length} SKUs across 5 categories`}
          icon={Boxes}
          accentColor="blue"
          onClick={() => onNavigate('inventory')}
        />
        <KPICard
          title="Stock Threshold Alerts"
          value={lowStockCount}
          subtitle={`${criticalShortageCount} critical out-of-stock`}
          icon={AlertTriangle}
          accentColor={criticalShortageCount > 0 ? 'rose' : 'amber'}
          badge={criticalShortageCount > 0 ? 'ACTION REQUIRED' : 'MONITORING'}
          badgeType={criticalShortageCount > 0 ? 'danger' : 'warning'}
          onClick={() => onNavigate('replenishment')}
        />
        <KPICard
          title="Active Purchase Orders"
          value={openPOs.length}
          subtitle={`₹${(openPOs.reduce((s, p) => s + p.grandTotal, 0) / 100000).toFixed(2)} Lakhs on order`}
          icon={ShoppingCart}
          accentColor="emerald"
          onClick={() => onNavigate('procurement')}
        />
        <KPICard
          title="Shortage Goods Receipts"
          value={pendingGRNs.length}
          subtitle="Partial shipments flagged"
          icon={Truck}
          accentColor="amber"
          badge={pendingGRNs.length > 0 ? 'SHORTAGES' : 'CLEAR'}
          badgeType={pendingGRNs.length > 0 ? 'warning' : 'success'}
          onClick={() => onNavigate('goods-receipt')}
        />
        <KPICard
          title="3-Way Match Exceptions"
          value={matchingExceptions.length}
          subtitle="Invoice vs GRN discrepancies"
          icon={FileCheck2}
          accentColor={matchingExceptions.length > 0 ? 'rose' : 'emerald'}
          badge={matchingExceptions.length > 0 ? 'PAYMENT HOLD' : 'MATCHED'}
          badgeType={matchingExceptions.length > 0 ? 'danger' : 'success'}
          onClick={() => onNavigate('invoice-matching')}
        />
        <KPICard
          title="Outstanding Payables"
          value={formatINR(outstandingPayables)}
          subtitle="Vendor payment commitments"
          icon={IndianRupee}
          accentColor="purple"
          onClick={() => onNavigate('invoice-matching')}
        />
        <KPICard
          title="GST / ITC Exceptions"
          value={gstExceptions.length}
          subtitle="2B vs Purchase mismatches"
          icon={Receipt}
          accentColor={gstExceptions.length > 0 ? 'rose' : 'emerald'}
          badge={gstExceptions.length > 0 ? 'REVIEW ITC' : 'RECONCILED'}
          badgeType={gstExceptions.length > 0 ? 'danger' : 'success'}
          onClick={() => onNavigate('gst-workspace')}
        />
        <KPICard
          title="Active Vendors"
          value="80"
          subtitle="Karnataka & Inter-state suppliers"
          icon={TrendingUp}
          accentColor="blue"
          onClick={() => onNavigate('vendors')}
        />
      </div>

      {/* SECTION 4: PRIORITY ACTION CENTER - "Needs Your Attention" */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-sm">
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-rose-500/10 border border-rose-500/30 rounded-lg text-rose-400">
              <ShieldAlert className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-semibold text-white">Needs Your Attention (Operational Exceptions)</h2>
              <p className="text-xs text-slate-400">Actionable events detected by automated business logic</p>
            </div>
          </div>
          <span className="text-xs text-slate-400">
            {activeAlerts.length + matchingExceptions.length + pendingGRNs.length + gstExceptions.length} Items Flagged
          </span>
        </div>

        <div className="mt-4 space-y-3">
          {/* Action item 1: Low stock Scenario A */}
          {activeAlerts.map(alert => (
            <div 
              key={alert.id}
              className="flex flex-col sm:flex-row sm:items-center justify-between p-4 bg-slate-850 hover:bg-slate-800/90 border border-amber-500/30 rounded-xl transition-colors gap-3"
            >
              <div className="flex items-start gap-3">
                <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-white uppercase">{alert.itemName} ({alert.sku})</span>
                    <span className="px-2 py-0.5 text-[10px] font-bold rounded bg-amber-500/20 text-amber-400 border border-amber-500/30">
                      CRITICAL STOCK ({alert.currentAvailableQty} {alert.uom} left)
                    </span>
                  </div>
                  <p className="text-xs text-slate-300 mt-1">
                    Available stock ({alert.currentAvailableQty} {alert.uom}) fell below min threshold ({alert.minThreshold} {alert.uom}) at {alert.warehouseName}.
                  </p>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    <strong>Recommended Action:</strong> Order suggested quantity of <span className="text-amber-300 font-semibold">{alert.suggestedReplenishmentQty} {alert.uom}</span> from preferred vendor <span className="text-slate-200">{alert.preferredVendorName}</span>.
                  </p>
                </div>
              </div>

              <button
                onClick={() => onNavigate('replenishment', alert)}
                className="flex items-center justify-center gap-1.5 px-3 py-1.5 bg-amber-600 hover:bg-amber-500 text-slate-950 font-semibold rounded-lg text-xs transition-colors shrink-0"
              >
                <span>Draft PO / Notify</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}

          {/* Action item 2: 3-way match mismatch Scenario C */}
          {matchingExceptions.map(match => (
            <div 
              key={match.id}
              className="flex flex-col sm:flex-row sm:items-center justify-between p-4 bg-slate-850 hover:bg-slate-800/90 border border-rose-500/30 rounded-xl transition-colors gap-3"
            >
              <div className="flex items-start gap-3">
                <FileCheck2 className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-white uppercase">Invoice {match.invoiceNumber} vs {match.grnNumber || 'GRN'}</span>
                    <span className="px-2 py-0.5 text-[10px] font-bold rounded bg-rose-500/20 text-rose-400 border border-rose-500/30">
                      {match.matchStatus.replace(/_/g, ' ')}
                    </span>
                  </div>
                  <p className="text-xs text-slate-300 mt-1">
                    {match.discrepancies[0]?.description || 'Discrepancy detected between invoice and received items.'}
                  </p>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    <strong>Recommended Action:</strong> {match.discrepancies[0]?.recommendedAction || 'Hold invoice until credit note or override.'}
                  </p>
                </div>
              </div>

              <button
                onClick={() => onNavigate('invoice-matching', match)}
                className="flex items-center justify-center gap-1.5 px-3 py-1.5 bg-rose-600 hover:bg-rose-500 text-white font-medium rounded-lg text-xs transition-colors shrink-0"
              >
                <span>Resolve Discrepancy</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}

          {/* Action item 3: GST ITC Discrepancy Scenario D */}
          {gstExceptions.map(gst => (
            <div 
              key={gst.id}
              className="flex flex-col sm:flex-row sm:items-center justify-between p-4 bg-slate-850 hover:bg-slate-800/90 border border-purple-500/30 rounded-xl transition-colors gap-3"
            >
              <div className="flex items-start gap-3">
                <Receipt className="w-5 h-5 text-purple-400 shrink-0 mt-0.5" />
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-white uppercase">GST / ITC Variance: {gst.invoiceNumber}</span>
                    <span className="px-2 py-0.5 text-[10px] font-bold rounded bg-purple-500/20 text-purple-400 border border-purple-500/30">
                      GSTR-2B Variance
                    </span>
                  </div>
                  <p className="text-xs text-slate-300 mt-1">
                    Vendor {gst.vendorName} reported {formatINR(gst.gstr2bReportedTotalTax || 0)} in GSTR-2B, but invoice claims {formatINR(gst.calculatedTotalTax)}.
                  </p>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    <strong>Recommended Action:</strong> Restrict ITC claim and notify vendor to amend GSTR-1 return.
                  </p>
                </div>
              </div>

              <button
                onClick={() => onNavigate('gst-workspace', gst)}
                className="flex items-center justify-center gap-1.5 px-3 py-1.5 bg-purple-600 hover:bg-purple-500 text-white font-medium rounded-lg text-xs transition-colors shrink-0"
              >
                <span>Review ITC</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Visualizations Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Chart 1: Inventory Value by Category */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-sm">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <div>
              <h3 className="text-sm font-semibold text-white">Inventory Valuation by Material Category</h3>
              <p className="text-xs text-slate-400">Total: {formatINR(totalInventoryValue)}</p>
            </div>
            <Boxes className="w-4 h-4 text-blue-400" />
          </div>

          <div className="h-64 mt-4">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={categoryChartData} layout="vertical" margin={{ top: 5, right: 30, left: 40, bottom: 5 }}>
                <XAxis type="number" tickFormatter={(v) => `₹${(v / 1000).toFixed(0)}k`} stroke="#64748b" fontSize={11} />
                <YAxis type="category" dataKey="name" stroke="#94a3b8" fontSize={11} width={130} />
                <Tooltip
                  formatter={(val: any) => [formatINR(Number(val)), 'Stock Value']}
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px', fontSize: '12px' }}
                />
                <Bar dataKey="value" radius={[0, 4, 4, 0]}>
                  {categoryChartData.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 2: Three-Way Procurement Lifecycle Distribution */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-sm">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <div>
              <h3 className="text-sm font-semibold text-white">Procurement to Invoice Pipeline (INR)</h3>
              <p className="text-xs text-slate-400">Comparing PO commitments vs invoiced amounts</p>
            </div>
            <ShoppingCart className="w-4 h-4 text-emerald-400" />
          </div>

          <div className="h-64 mt-4">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={procurementOverviewData} margin={{ top: 15, right: 20, left: 10, bottom: 5 }}>
                <XAxis dataKey="name" stroke="#94a3b8" fontSize={11} />
                <YAxis tickFormatter={(v) => `₹${(v / 1000).toFixed(0)}k`} stroke="#64748b" fontSize={11} />
                <Tooltip
                  formatter={(val: any) => [formatINR(Number(val)), 'Amount']}
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px', fontSize: '12px' }}
                />
                <Bar dataKey="amount" radius={[4, 4, 0, 0]}>
                  {procurementOverviewData.map((entry, index) => (
                    <Cell key={`cell-pipe-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Live Recent Activity Feed */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-sm">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-blue-400" />
            <h3 className="text-sm font-semibold text-white">Live Operational Activity Feed (Audit Log Events)</h3>
          </div>
          <button
            onClick={() => onNavigate('audit-trail')}
            className="text-xs text-blue-400 hover:text-blue-300 font-medium flex items-center gap-1"
          >
            <span>View Full Audit Trail</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="mt-3 divide-y divide-slate-800/80">
          {auditEvents.slice(0, 5).map(ev => (
            <div key={ev.id} className="py-2.5 flex items-start justify-between text-xs gap-3">
              <div className="flex items-start gap-2.5">
                <span className="w-2 h-2 rounded-full bg-blue-400 mt-1.5 shrink-0" />
                <div>
                  <div className="font-medium text-slate-200">
                    <span className="text-white font-semibold">{ev.action.replace(/_/g, ' ')}</span> — Ref: <span className="font-mono text-blue-400">{ev.entityRef}</span>
                  </div>
                  <p className="text-slate-400 text-[11px] mt-0.5">{ev.details}</p>
                </div>
              </div>
              <div className="text-right shrink-0">
                <div className="text-slate-400 text-[11px]">{formatDateTime(ev.timestamp)}</div>
                <div className="text-slate-400 text-[10px]">{ev.userName}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
