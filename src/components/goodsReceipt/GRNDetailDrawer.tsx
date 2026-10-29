import React from 'react';
import { 
  X, 
  Truck, 
  Building2, 
  Calendar, 
  AlertTriangle, 
  CheckCircle2, 
  FileText,
  ShieldAlert
} from 'lucide-react';
import { GoodsReceiptNote } from '../../types';
import { StatusBadge } from '../common/StatusBadge';
import { formatDate } from '../../lib/utils';

interface GRNDetailDrawerProps {
  grn: GoodsReceiptNote | null;
  onClose: () => void;
}

export const GRNDetailDrawer: React.FC<GRNDetailDrawerProps> = ({ grn, onClose }) => {
  if (!grn) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-slate-950/70 backdrop-blur-xs flex justify-end animate-in fade-in duration-150">
      <div className="fixed inset-0" onClick={onClose} />

      <div className="relative w-full max-w-2xl bg-slate-900 border-l border-slate-800 shadow-2xl h-full flex flex-col z-10 overflow-y-auto">
        {/* Header */}
        <div className="p-6 border-b border-slate-800 bg-slate-850/80 sticky top-0 z-20 backdrop-blur-sm">
          <div className="flex items-start justify-between">
            <div>
              <div className="flex items-center gap-2">
                <span className="font-mono text-sm font-bold text-white bg-blue-600/20 text-blue-400 border border-blue-500/30 px-2.5 py-0.5 rounded">
                  {grn.grnNumber}
                </span>
                <StatusBadge status={grn.status} />
              </div>
              <h2 className="text-base font-bold text-white mt-1.5">{grn.vendorName}</h2>
              <p className="text-xs text-slate-400 font-mono">
                PO: <span className="text-blue-400 font-semibold">{grn.poNumber}</span> • Challan: {grn.deliveryChallanNo}
              </p>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6 flex-1 text-xs">
          {/* Metadata Cards */}
          <div className="grid grid-cols-3 gap-3">
            <div className="bg-slate-850 p-3 rounded-lg border border-slate-800">
              <span className="text-slate-400 text-[11px] block">Receipt Date</span>
              <span className="font-semibold text-white mt-0.5 block">{formatDate(grn.receiptDate)}</span>
            </div>
            <div className="bg-slate-850 p-3 rounded-lg border border-slate-800">
              <span className="text-slate-400 text-[11px] block">Receiving Depot</span>
              <span className="font-semibold text-white mt-0.5 block">{grn.warehouseName.split(' ')[0]}</span>
            </div>
            <div className="bg-slate-850 p-3 rounded-lg border border-slate-800">
              <span className="text-slate-400 text-[11px] block">Receiver Inspector</span>
              <span className="font-semibold text-slate-200 mt-0.5 block">{grn.receiverName}</span>
            </div>
          </div>

          {/* Shortage or Discrepancy Alert */}
          {grn.hasDiscrepancy && (
            <div className="p-4 bg-amber-500/10 border border-amber-500/30 rounded-xl space-y-2">
              <div className="flex items-center gap-2 text-amber-400 font-semibold text-xs">
                <ShieldAlert className="w-4 h-4" />
                <span>Quantity Reconciliation Exception Detected</span>
              </div>
              <p className="text-slate-300 text-xs leading-relaxed">
                {grn.discrepancyNotes || 'Delivery contained a shortage or damaged units. Usable inventory was increased strictly by the accepted quantity, and the outstanding balance has been retained on the purchase order.'}
              </p>
            </div>
          )}

          {/* Line items table */}
          <div className="border border-slate-800 rounded-xl overflow-hidden">
            <div className="p-3 bg-slate-850 border-b border-slate-800 font-semibold text-white">
              Inspection Breakdown per Line
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-800 bg-slate-900/60 text-slate-400 font-medium text-[11px]">
                    <th className="py-2.5 px-3">Item Description</th>
                    <th className="py-2.5 px-2 text-right">PO Ordered</th>
                    <th className="py-2.5 px-2 text-right">Delivered</th>
                    <th className="py-2.5 px-2 text-right">Accepted (Stock)</th>
                    <th className="py-2.5 px-2 text-right">Rejected</th>
                    <th className="py-2.5 px-3 text-right">Outstanding</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800">
                  {grn.lines.map(line => (
                    <tr key={line.id} className="hover:bg-slate-850/50">
                      <td className="py-2.5 px-3">
                        <div className="font-semibold text-white">{line.itemName}</div>
                        <div className="font-mono text-[10px] text-slate-400">{line.sku}</div>
                      </td>
                      <td className="py-2.5 px-2 text-right text-slate-300">
                        {line.orderedQty} {line.uom}
                      </td>
                      <td className="py-2.5 px-2 text-right text-white">
                        {line.deliveredQty} {line.uom}
                      </td>
                      <td className="py-2.5 px-2 text-right font-bold text-emerald-400">
                        +{line.acceptedQty} {line.uom}
                      </td>
                      <td className="py-2.5 px-2 text-right font-semibold text-rose-400">
                        {line.rejectedQty > 0 ? `${line.rejectedQty} ${line.uom}` : '0'}
                      </td>
                      <td className="py-2.5 px-3 text-right">
                        {line.outstandingQty > 0 ? (
                          <span className="font-bold text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">
                            {line.outstandingQty} {line.uom}
                          </span>
                        ) : (
                          <span className="text-slate-400">0</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Inspection and Delivery Details */}
          <div className="p-4 bg-slate-850 rounded-xl border border-slate-800 space-y-2">
            <span className="text-slate-400 font-semibold block text-[11px] uppercase tracking-wider">Inspection Field Notes</span>
            <p className="text-slate-200 text-xs italic">
              "{grn.inspectionNotes || 'No inspection notes entered.'}"
            </p>
            <div className="pt-2 flex items-center justify-between text-slate-400 text-[11px] border-t border-slate-800">
              <span>Vehicle No: <strong className="text-white">{grn.vehicleNo || 'N/A'}</strong></span>
              <span>Inventory Sync: <strong className="text-emerald-400">Updated Usable Stock</strong></span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
