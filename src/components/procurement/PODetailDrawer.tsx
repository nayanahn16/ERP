import React from 'react';
import { 
  X, 
  ShoppingCart, 
  Truck, 
  Building2, 
  Calendar, 
  CheckCircle2, 
  AlertTriangle,
  Receipt,
  Download
} from 'lucide-react';
import { PurchaseOrder, UserProfile } from '../../types';
import { StatusBadge } from '../common/StatusBadge';
import { formatINR } from '../../lib/gstService';
import { formatDate } from '../../lib/utils';

interface PODetailDrawerProps {
  po: PurchaseOrder | null;
  onClose: () => void;
  onRecordGRN?: (po: PurchaseOrder) => void;
  currentUser: UserProfile;
}

export const PODetailDrawer: React.FC<PODetailDrawerProps> = ({
  po,
  onClose,
  onRecordGRN,
  currentUser
}) => {
  if (!po) return null;

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
                  {po.poNumber}
                </span>
                <StatusBadge status={po.status} />
                {po.isInterState ? (
                  <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-purple-500/10 text-purple-400 border border-purple-500/30">
                    INTER-STATE IGST
                  </span>
                ) : (
                  <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-blue-500/10 text-blue-400 border border-blue-500/30">
                    INTRA-STATE CGST+SGST
                  </span>
                )}
              </div>
              <h2 className="text-base font-bold text-white mt-1.5">{po.vendorName}</h2>
              <p className="text-xs text-slate-400 font-mono">GSTIN: {po.vendorGstin} • Warehouse: {po.warehouseName}</p>
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
              <span className="text-slate-400 text-[11px] block">Order Date</span>
              <span className="font-semibold text-white mt-0.5 block">{formatDate(po.orderDate)}</span>
            </div>
            <div className="bg-slate-850 p-3 rounded-lg border border-slate-800">
              <span className="text-slate-400 text-[11px] block">Expected Delivery</span>
              <span className="font-semibold text-white mt-0.5 block">{formatDate(po.expectedDeliveryDate)}</span>
            </div>
            <div className="bg-slate-850 p-3 rounded-lg border border-slate-800">
              <span className="text-slate-400 text-[11px] block">Payment Terms</span>
              <span className="font-semibold text-emerald-400 mt-0.5 block">{po.paymentTerms}</span>
            </div>
          </div>

          {/* Line Items Table */}
          <div className="border border-slate-800 rounded-xl overflow-hidden">
            <div className="p-3 bg-slate-850 border-b border-slate-800 font-semibold text-white">
              Ordered Line Items & Receipt Reconciliation
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-800 bg-slate-900/60 text-slate-400 font-medium text-[11px]">
                    <th className="py-2.5 px-3">Item Description</th>
                    <th className="py-2.5 px-2 text-right">Ordered</th>
                    <th className="py-2.5 px-2 text-right">Accepted</th>
                    <th className="py-2.5 px-2 text-right">Outstanding</th>
                    <th className="py-2.5 px-2 text-right">Unit Price</th>
                    <th className="py-2.5 px-3 text-right">Total</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800">
                  {po.lines.map(line => (
                    <tr key={line.id} className="hover:bg-slate-850/50">
                      <td className="py-2.5 px-3">
                        <div className="font-semibold text-white">{line.itemName}</div>
                        <div className="font-mono text-[10px] text-slate-400">{line.sku} • HSN: {line.hsnCode}</div>
                      </td>
                      <td className="py-2.5 px-2 text-right font-medium text-white">
                        {line.orderedQty} {line.uom}
                      </td>
                      <td className="py-2.5 px-2 text-right font-medium text-emerald-400">
                        {line.acceptedQty} {line.uom}
                      </td>
                      <td className="py-2.5 px-2 text-right">
                        {line.outstandingQty > 0 ? (
                          <span className="font-bold text-amber-400 bg-amber-500/10 px-1.5 py-0.5 rounded border border-amber-500/20">
                            {line.outstandingQty} {line.uom}
                          </span>
                        ) : (
                          <span className="text-slate-400">0</span>
                        )}
                      </td>
                      <td className="py-2.5 px-2 text-right text-slate-300">
                        ₹{line.unitPrice.toFixed(2)}
                      </td>
                      <td className="py-2.5 px-3 text-right font-semibold text-white">
                        {formatINR(line.totalAmount)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Financial Breakdown */}
          <div className="p-4 bg-slate-850 rounded-xl border border-slate-800 flex justify-between">
            <div className="space-y-1 text-slate-400">
              <div>Approved by: <strong className="text-white">{po.approvedBy || 'Pending'}</strong></div>
              <div>Notes: <span className="text-slate-300">{po.notes || 'None'}</span></div>
            </div>

            <div className="space-y-1.5 text-right min-w-[200px]">
              <div className="flex justify-between text-slate-400">
                <span>Subtotal:</span>
                <span className="font-mono text-white">{formatINR(po.subtotal)}</span>
              </div>
              {!po.isInterState ? (
                <>
                  <div className="flex justify-between text-slate-400">
                    <span>CGST (9%):</span>
                    <span className="font-mono text-white">{formatINR(po.cgstTotal)}</span>
                  </div>
                  <div className="flex justify-between text-slate-400">
                    <span>SGST (9%):</span>
                    <span className="font-mono text-white">{formatINR(po.sgstTotal)}</span>
                  </div>
                </>
              ) : (
                <div className="flex justify-between text-slate-400">
                  <span>IGST (18%):</span>
                  <span className="font-mono text-white">{formatINR(po.igstTotal)}</span>
                </div>
              )}
              <div className="flex justify-between text-sm font-bold text-white pt-2 border-t border-slate-700">
                <span>Grand Total:</span>
                <span className="text-emerald-400">{formatINR(po.grandTotal)}</span>
              </div>
            </div>
          </div>

          {/* Action to receive goods */}
          {onRecordGRN && po.status !== 'FULLY_RECEIVED' && po.status !== 'CANCELLED' && (
            <div className="p-4 bg-blue-950/20 border border-blue-500/30 rounded-xl flex items-center justify-between">
              <div>
                <span className="font-semibold text-white block">Shipment Delivery Expected?</span>
                <span className="text-slate-400 text-[11px]">Record physical receipt against this purchase order.</span>
              </div>
              <button
                onClick={() => {
                  onClose();
                  onRecordGRN(po);
                }}
                className="flex items-center gap-1.5 px-3 py-2 bg-blue-600 hover:bg-blue-500 text-white font-medium rounded-lg text-xs transition-colors shadow-sm"
              >
                <Truck className="w-3.5 h-3.5" />
                <span>Record Goods Receipt (GRN)</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
