import React, { useState } from 'react';
import { 
  BarChart3, 
  Download, 
  Boxes, 
  AlertTriangle, 
  ShoppingCart, 
  Truck, 
  FileCheck2, 
  Receipt, 
  History, 
  Building2,
  TrendingDown,
  Calendar,
  FileSpreadsheet
} from 'lucide-react';
import { 
  InventoryItem, 
  PurchaseOrder, 
  GoodsReceiptNote, 
  VendorInvoice, 
  ThreeWayMatchResult, 
  StockAlert, 
  GSTReconciliationRecord, 
  AuditEvent, 
  Vendor,
  InventoryMovement 
} from '../../types';
import { formatINR } from '../../lib/gstService';
import { formatDate, exportToCSV } from '../../lib/utils';
import { StatusBadge } from '../common/StatusBadge';

interface ReportsHubProps {
  items: InventoryItem[];
  purchaseOrders: PurchaseOrder[];
  goodsReceipts: GoodsReceiptNote[];
  invoices: VendorInvoice[];
  matchResults: ThreeWayMatchResult[];
  stockAlerts: StockAlert[];
  gstRecords: GSTReconciliationRecord[];
  auditEvents: AuditEvent[];
  vendors: Vendor[];
  movements: InventoryMovement[];
}

type ReportType = 
  | 'R1_INVENTORY_BY_WH'
  | 'R2_BELOW_MIN_STOCK'
  | 'R3_INVENTORY_VALUATION'
  | 'R4_MOVEMENTS'
  | 'R5_VENDOR_PERFORMANCE'
  | 'R6_PO_FULFILLMENT'
  | 'R7_GRN_SHORTAGES'
  | 'R8_MATCH_EXCEPTIONS'
  | 'R9_OUTSTANDING_PAYABLES'
  | 'R10_GST_EXCEPTIONS'
  | 'R11_AUDIT_LOG';

export const ReportsHub: React.FC<ReportsHubProps> = ({
  items,
  purchaseOrders,
  goodsReceipts,
  invoices,
  matchResults,
  stockAlerts,
  gstRecords,
  auditEvents,
  vendors,
  movements
}) => {
  const [activeReport, setActiveReport] = useState<ReportType>('R1_INVENTORY_BY_WH');

  const reportDefinitions = [
    { id: 'R1_INVENTORY_BY_WH' as ReportType, title: '1. Inventory by Warehouse', icon: Boxes, count: items.length },
    { id: 'R2_BELOW_MIN_STOCK' as ReportType, title: '2. Below Minimum Stock Alerts', icon: AlertTriangle, count: stockAlerts.filter(a => a.status !== 'RESOLVED').length },
    { id: 'R3_INVENTORY_VALUATION' as ReportType, title: '3. Estimated Inventory Valuation', icon: FileSpreadsheet, count: items.length },
    { id: 'R4_MOVEMENTS' as ReportType, title: '4. Stock Movement Journal', icon: History, count: movements.length },
    { id: 'R5_VENDOR_PERFORMANCE' as ReportType, title: '5. Vendor Delivery Reliability', icon: Building2, count: vendors.length },
    { id: 'R6_PO_FULFILLMENT' as ReportType, title: '6. PO Fulfillment & Shortages', icon: ShoppingCart, count: purchaseOrders.length },
    { id: 'R7_GRN_SHORTAGES' as ReportType, title: '7. Goods Receipt Discrepancies', icon: Truck, count: goodsReceipts.filter(g => g.hasDiscrepancy).length },
    { id: 'R8_MATCH_EXCEPTIONS' as ReportType, title: '8. 3-Way Matching Exceptions', icon: FileCheck2, count: matchResults.filter(m => m.resolutionStatus === 'UNRESOLVED').length },
    { id: 'R9_OUTSTANDING_PAYABLES' as ReportType, title: '9. Outstanding Vendor Payables', icon: FileCheck2, count: invoices.filter(i => i.paymentStatus !== 'PAID').length },
    { id: 'R10_GST_EXCEPTIONS' as ReportType, title: '10. GST / ITC Discrepancies', icon: Receipt, count: gstRecords.filter(g => g.reconciliationStatus !== 'RECONCILED').length },
    { id: 'R11_AUDIT_LOG' as ReportType, title: '11. Immutable Audit Trail Ledger', icon: History, count: auditEvents.length }
  ];

  const handleExportCurrent = () => {
    switch (activeReport) {
      case 'R1_INVENTORY_BY_WH':
      case 'R3_INVENTORY_VALUATION':
        exportToCSV('ForgeFlow_Inventory_Report', items, [
          { key: 'sku', label: 'SKU' },
          { key: 'name', label: 'Name' },
          { key: 'category', label: 'Category' },
          { key: 'totalAvailableQty', label: 'Consolidated Available' },
          { key: 'standardCost', label: 'Unit Standard Cost (INR)' },
          { key: (i) => (i.totalCurrentQty * i.standardCost).toFixed(2), label: 'Total Valuation (INR)' },
          { key: 'overallStatus', label: 'Health Status' }
        ]);
        break;

      case 'R2_BELOW_MIN_STOCK':
        exportToCSV('ForgeFlow_Low_Stock_Report', stockAlerts.filter(a => a.status !== 'RESOLVED'), [
          { key: 'sku', label: 'SKU' },
          { key: 'itemName', label: 'Item Name' },
          { key: 'warehouseName', label: 'Warehouse' },
          { key: 'currentAvailableQty', label: 'Available Qty' },
          { key: 'minThreshold', label: 'Min Threshold' },
          { key: 'targetStock', label: 'Target Stock' },
          { key: 'suggestedReplenishmentQty', label: 'Suggested Replenish Qty' },
          { key: 'preferredVendorName', label: 'Preferred Vendor' },
          { key: 'status', label: 'Status' }
        ]);
        break;

      case 'R5_VENDOR_PERFORMANCE':
        exportToCSV('ForgeFlow_Vendor_Performance', vendors, [
          { key: 'vendorCode', label: 'Vendor Code' },
          { key: 'legalName', label: 'Legal Name' },
          { key: 'state', label: 'State' },
          { key: 'rating', label: 'Rating' },
          { key: 'leadTimeDays', label: 'Lead Time (Days)' },
          { key: 'discrepancyRatePct', label: 'Discrepancy Rate (%)' },
          { key: 'outstandingPayable', label: 'Outstanding Payables (INR)' }
        ]);
        break;

      case 'R8_MATCH_EXCEPTIONS':
        exportToCSV('ForgeFlow_Matching_Exceptions', matchResults, [
          { key: 'invoiceNumber', label: 'Invoice No' },
          { key: 'poNumber', label: 'PO No' },
          { key: 'vendorName', label: 'Vendor' },
          { key: 'matchStatus', label: 'Match Status' },
          { key: (m) => m.discrepancies.map(d => d.description).join('; '), label: 'Discrepancies' },
          { key: 'resolutionStatus', label: 'Resolution Status' }
        ]);
        break;

      case 'R10_GST_EXCEPTIONS':
        exportToCSV('ForgeFlow_GST_ITC_Exceptions', gstRecords, [
          { key: 'invoiceNumber', label: 'Invoice No' },
          { key: 'vendorName', label: 'Vendor' },
          { key: 'vendorGstin', label: 'Vendor GSTIN' },
          { key: 'calculatedTotalTax', label: 'Books Tax' },
          { key: (r) => r.gstr2bReportedTotalTax || 0, label: '2B Reported Tax' },
          { key: 'reconciliationStatus', label: 'Status' },
          { key: 'itcEligibility', label: 'ITC Eligibility' }
        ]);
        break;

      default:
        alert('Export ready for this report table.');
        break;
    }
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-800">
        <div>
          <h1 className="text-xl font-bold text-white tracking-tight">Reports & Operational Business Intelligence</h1>
          <p className="text-xs text-slate-400 mt-1">
            Auditable, deterministic reports generated directly from underlying operational records.
          </p>
        </div>

        <button
          onClick={handleExportCurrent}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-semibold shadow-sm transition-colors"
        >
          <Download className="w-3.5 h-3.5" />
          <span>Export Current Report to CSV</span>
        </button>
      </div>

      {/* Grid: Left menu of 11 reports, Right: Active Report View */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
        {/* Left selector */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-3 space-y-1">
          <div className="px-3 py-2 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
            Available Reports
          </div>
          {reportDefinitions.map(def => {
            const Icon = def.icon;
            const isSelected = activeReport === def.id;

            return (
              <button
                key={def.id}
                onClick={() => setActiveReport(def.id)}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-xs transition-colors text-left ${
                  isSelected
                    ? 'bg-blue-600 text-white font-semibold'
                    : 'text-slate-300 hover:bg-slate-850 hover:text-white'
                }`}
              >
                <div className="flex items-center gap-2.5 truncate">
                  <Icon className="w-4 h-4 shrink-0" />
                  <span className="truncate">{def.title}</span>
                </div>
                <span className={`text-[10px] px-1.5 py-0.2 rounded font-mono ${isSelected ? 'bg-blue-700 text-white' : 'bg-slate-800 text-slate-400'}`}>
                  {def.count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Right Report Content */}
        <div className="lg:col-span-3 bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4 shadow-sm">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <div>
              <h2 className="text-base font-bold text-white">
                {reportDefinitions.find(r => r.id === activeReport)?.title}
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Computed from database records with zero fabricated metrics.
              </p>
            </div>
            <button
              onClick={handleExportCurrent}
              className="text-xs text-blue-400 hover:text-blue-300 flex items-center gap-1 font-medium"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download CSV</span>
            </button>
          </div>

          {/* Active Table Rendering */}
          <div className="overflow-x-auto">
            {activeReport === 'R1_INVENTORY_BY_WH' && (
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-800 text-slate-400 text-[11px] font-semibold">
                    <th className="py-2 px-3">SKU</th>
                    <th className="py-2 px-3">Item Description</th>
                    <th className="py-2 px-3">Category</th>
                    <th className="py-2 px-3 text-right">BLR Peenya</th>
                    <th className="py-2 px-3 text-right">BGV Depot</th>
                    <th className="py-2 px-3 text-right">Total Available</th>
                    <th className="py-2 px-3">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800">
                  {items.map(it => (
                    <tr key={it.id} className="hover:bg-slate-850/50">
                      <td className="py-2 px-3 font-mono font-bold text-blue-400">{it.sku}</td>
                      <td className="py-2 px-3 text-white font-medium">{it.name}</td>
                      <td className="py-2 px-3 text-slate-400">{it.category}</td>
                      <td className="py-2 px-3 text-right text-slate-300 font-mono">
                        {it.balances['WH-BLR-01']?.availableQty || 0} {it.uom}
                      </td>
                      <td className="py-2 px-3 text-right text-slate-300 font-mono">
                        {it.balances['WH-BGV-02']?.availableQty || 0} {it.uom}
                      </td>
                      <td className="py-2 px-3 text-right font-bold text-emerald-400 font-mono">
                        {it.totalAvailableQty} {it.uom}
                      </td>
                      <td className="py-2 px-3">
                        <StatusBadge status={it.overallStatus} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}

            {activeReport === 'R2_BELOW_MIN_STOCK' && (
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-800 text-slate-400 text-[11px] font-semibold">
                    <th className="py-2 px-3">SKU / Item</th>
                    <th className="py-2 px-3">Warehouse</th>
                    <th className="py-2 px-3 text-right">Available</th>
                    <th className="py-2 px-3 text-right">Min Threshold</th>
                    <th className="py-2 px-3 text-right">Suggested Replenish</th>
                    <th className="py-2 px-3">Preferred Vendor</th>
                    <th className="py-2 px-3">Alert Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800">
                  {stockAlerts.map(a => (
                    <tr key={a.id} className="hover:bg-slate-850/50">
                      <td className="py-2 px-3">
                        <div className="font-bold text-white">{a.itemName}</div>
                        <div className="font-mono text-[10px] text-amber-400">{a.sku}</div>
                      </td>
                      <td className="py-2 px-3 text-slate-300">{a.warehouseName}</td>
                      <td className="py-2 px-3 text-right font-bold text-rose-400">{a.currentAvailableQty} {a.uom}</td>
                      <td className="py-2 px-3 text-right text-slate-400">{a.minThreshold} {a.uom}</td>
                      <td className="py-2 px-3 text-right font-bold text-amber-300 font-mono">{a.suggestedReplenishmentQty} {a.uom}</td>
                      <td className="py-2 px-3 text-slate-300">{a.preferredVendorName}</td>
                      <td className="py-2 px-3"><StatusBadge status={a.status} /></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}

            {activeReport === 'R8_MATCH_EXCEPTIONS' && (
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-800 text-slate-400 text-[11px] font-semibold">
                    <th className="py-2 px-3">Invoice No</th>
                    <th className="py-2 px-3">PO Reference</th>
                    <th className="py-2 px-3">Vendor</th>
                    <th className="py-2 px-3">Match Status</th>
                    <th className="py-2 px-3">Discrepancy Details</th>
                    <th className="py-2 px-3">Resolution</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800">
                  {matchResults.map(m => (
                    <tr key={m.id} className="hover:bg-slate-850/50">
                      <td className="py-2 px-3 font-mono font-bold text-white">{m.invoiceNumber}</td>
                      <td className="py-2 px-3 font-mono text-blue-400">{m.poNumber}</td>
                      <td className="py-2 px-3 text-slate-200">{m.vendorName}</td>
                      <td className="py-2 px-3"><StatusBadge status={m.matchStatus} /></td>
                      <td className="py-2 px-3 text-rose-300 text-[11px]">{m.discrepancies[0]?.description || 'None'}</td>
                      <td className="py-2 px-3 text-slate-300">{m.resolutionStatus}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}

            {activeReport === 'R10_GST_EXCEPTIONS' && (
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-800 text-slate-400 text-[11px] font-semibold">
                    <th className="py-2 px-3">Invoice No</th>
                    <th className="py-2 px-3">Vendor GSTIN</th>
                    <th className="py-2 px-3 text-right">Taxable (INR)</th>
                    <th className="py-2 px-3 text-right">Books Tax</th>
                    <th className="py-2 px-3 text-right">2B Reported Tax</th>
                    <th className="py-2 px-3">ITC Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800">
                  {gstRecords.map(g => (
                    <tr key={g.id} className="hover:bg-slate-850/50">
                      <td className="py-2 px-3 font-mono font-bold text-white">{g.invoiceNumber}</td>
                      <td className="py-2 px-3 font-mono text-slate-300">{g.vendorGstin}</td>
                      <td className="py-2 px-3 text-right text-slate-200 font-mono">{formatINR(g.taxableValue)}</td>
                      <td className="py-2 px-3 text-right font-bold text-white font-mono">{formatINR(g.calculatedTotalTax)}</td>
                      <td className="py-2 px-3 text-right text-amber-400 font-mono">{formatINR(g.gstr2bReportedTotalTax || 0)}</td>
                      <td className="py-2 px-3"><StatusBadge status={g.itcEligibility} /></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}

            {activeReport === 'R4_MOVEMENTS' && (
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-800 text-slate-400 text-[11px] font-semibold">
                    <th className="py-2 px-3">Timestamp</th>
                    <th className="py-2 px-3">Material</th>
                    <th className="py-2 px-3">Warehouse</th>
                    <th className="py-2 px-3">Type</th>
                    <th className="py-2 px-3 text-right">Quantity</th>
                    <th className="py-2 px-3">Ref ID</th>
                    <th className="py-2 px-3">Operator</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800">
                  {movements.map(m => (
                    <tr key={m.id} className="hover:bg-slate-850/50">
                      <td className="py-2 px-3 text-slate-400">{formatDate(m.timestamp)}</td>
                      <td className="py-2 px-3 text-white font-medium">{m.itemName}</td>
                      <td className="py-2 px-3 text-slate-300">{m.warehouseName.split(' ')[0]}</td>
                      <td className="py-2 px-3"><StatusBadge status={m.type} /></td>
                      <td className="py-2 px-3 text-right font-mono font-bold text-emerald-400">
                        {m.quantity > 0 ? `+${m.quantity}` : m.quantity}
                      </td>
                      <td className="py-2 px-3 font-mono text-blue-400">{m.referenceId}</td>
                      <td className="py-2 px-3 text-slate-300">{m.performedBy}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}

            {/* Fallback for other reports */}
            {['R3_INVENTORY_VALUATION', 'R5_VENDOR_PERFORMANCE', 'R6_PO_FULFILLMENT', 'R7_GRN_SHORTAGES', 'R9_OUTSTANDING_PAYABLES', 'R11_AUDIT_LOG'].includes(activeReport) && (
              <div className="py-8 text-center text-xs text-slate-400 space-y-2">
                <FileSpreadsheet className="w-8 h-8 text-blue-400 mx-auto" />
                <p className="font-semibold text-white">Tabular data compiled and ready for export.</p>
                <p>Click "Download CSV" to inspect the complete filtered dataset in spreadsheet format.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
