import React from 'react';
import { 
  X, 
  ShoppingCart, 
  Truck, 
  FileText, 
  ShieldAlert, 
  CheckCircle2, 
  AlertTriangle,
  ArrowRight,
  Lock
} from 'lucide-react';
import { Modal } from '../common/Modal';
import { ThreeWayMatchResult, PurchaseOrder, GoodsReceiptNote, VendorInvoice, UserProfile } from '../../types';
import { StatusBadge } from '../common/StatusBadge';
import { formatINR } from '../../lib/gstService';

interface MatchDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  matchResult: ThreeWayMatchResult | null;
  po?: PurchaseOrder;
  grn?: GoodsReceiptNote;
  invoice?: VendorInvoice;
  onOpenResolution: (match: ThreeWayMatchResult) => void;
  currentUser: UserProfile;
}

export const MatchDetailModal: React.FC<MatchDetailModalProps> = ({
  isOpen,
  onClose,
  matchResult,
  po,
  grn,
  invoice,
  onOpenResolution,
  currentUser
}) => {
  if (!matchResult) return null;

  const isDisputed = matchResult.matchStatus !== 'FULLY_MATCHED' && matchResult.matchStatus !== 'MATCHED_WITHIN_TOLERANCE';
  const isResolved = matchResult.resolutionStatus === 'RESOLVED' || matchResult.resolutionStatus === 'OVERRIDDEN_APPROVED';

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Three-Way Reconciliation: PO vs GRN vs Vendor Invoice"
      subtitle={`Invoice: ${matchResult.invoiceNumber} • Supplier: ${matchResult.vendorName}`}
      maxWidth="4xl"
    >
      <div className="space-y-5 text-xs">
        {/* Match Header Badge */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 bg-slate-850 rounded-xl border border-slate-700">
          <div className="flex items-center gap-2.5">
            <StatusBadge status={matchResult.matchStatus} size="md" />
            <span className="text-slate-300 font-medium">
              Tolerance Used: {matchResult.tolerancePercentageUsed}%
            </span>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-slate-400">Payment Gate:</span>
            {isDisputed && !isResolved ? (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-rose-500/20 text-rose-400 border border-rose-500/30 font-bold text-xs">
                <Lock className="w-3.5 h-3.5" />
                <span>PAYMENT BLOCKED (DISCREPANCY HOLD)</span>
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 font-bold text-xs">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>PAYMENT APPROVED</span>
              </span>
            )}
          </div>
        </div>

        {/* Discrepancy Callouts */}
        {matchResult.discrepancies.length > 0 && (
          <div className="space-y-2">
            <span className="font-semibold text-white block text-xs">Detected Reconciled Variances:</span>
            {matchResult.discrepancies.map((disc, idx) => (
              <div 
                key={idx}
                className="p-3.5 bg-rose-500/10 border border-rose-500/30 rounded-xl space-y-1.5"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-rose-400 font-bold">
                    <ShieldAlert className="w-4 h-4" />
                    <span>{disc.field} MISMATCH (Severity: {disc.severity})</span>
                  </div>
                  <span className="font-mono text-rose-300 font-bold">
                    Variance: {disc.difference > 0 ? `+${disc.difference}` : disc.difference} {disc.unit || ''}
                  </span>
                </div>
                <p className="text-slate-200 text-xs leading-relaxed">{disc.description}</p>
                <div className="p-2 bg-slate-900 rounded border border-slate-800 text-[11px] text-slate-300">
                  <strong className="text-amber-400">Recommended Action:</strong> {disc.recommendedAction}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* 3-Column Comparison View */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {/* Column 1: PO Contract */}
          <div className="p-4 bg-slate-850 rounded-xl border border-slate-800 space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <ShoppingCart className="w-4 h-4 text-blue-400" />
                <span className="font-bold text-white text-xs">1. Purchase Order</span>
              </div>
              <span className="font-mono text-blue-400 font-bold text-xs">{po ? po.poNumber : matchResult.poNumber}</span>
            </div>

            {po ? (
              <div className="space-y-2 text-[11px]">
                {po.lines.map(l => (
                  <div key={l.id} className="p-2 bg-slate-900 rounded border border-slate-800">
                    <div className="font-semibold text-white">{l.itemName}</div>
                    <div className="text-slate-400">Ordered Qty: <strong className="text-white">{l.orderedQty} {l.uom}</strong></div>
                    <div className="text-slate-400">Contract Price: <strong className="text-white">₹{l.unitPrice.toFixed(2)}</strong></div>
                    <div className="text-slate-400">Taxable: {formatINR(l.taxableAmount)}</div>
                  </div>
                ))}
                <div className="pt-2 border-t border-slate-800 text-right">
                  <span className="text-slate-400">PO Grand Total:</span>
                  <div className="text-base font-bold text-white font-mono">{formatINR(po.grandTotal)}</div>
                </div>
              </div>
            ) : (
              <div className="py-4 text-center text-slate-400 text-xs">No PO linked</div>
            )}
          </div>

          {/* Column 2: Verified GRN */}
          <div className="p-4 bg-slate-850 rounded-xl border border-slate-800 space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <Truck className="w-4 h-4 text-emerald-400" />
                <span className="font-bold text-white text-xs">2. Physical GRN</span>
              </div>
              <span className="font-mono text-emerald-400 font-bold text-xs">{grn ? grn.grnNumber : (matchResult.grnNumber || 'No GRN')}</span>
            </div>

            {grn ? (
              <div className="space-y-2 text-[11px]">
                {grn.lines.map(l => (
                  <div key={l.id} className="p-2 bg-slate-900 rounded border border-slate-800">
                    <div className="font-semibold text-white">{l.itemName}</div>
                    <div className="text-slate-400">Delivered in shipment: {l.deliveredQty} {l.uom}</div>
                    <div className="text-emerald-400 font-bold">Accepted to Stock: {l.acceptedQty} {l.uom}</div>
                    {l.outstandingQty > 0 && (
                      <div className="text-amber-400 font-semibold">Shortage: {l.outstandingQty} {l.uom}</div>
                    )}
                  </div>
                ))}
                <div className="pt-2 border-t border-slate-800 text-right">
                  <span className="text-slate-400">Challan Reference:</span>
                  <div className="text-xs font-semibold text-white font-mono">{grn.deliveryChallanNo}</div>
                </div>
              </div>
            ) : (
              <div className="py-4 text-center text-rose-400 text-xs">
                No verified goods receipt recorded!
              </div>
            )}
          </div>

          {/* Column 3: Billed Invoice */}
          <div className="p-4 bg-slate-850 rounded-xl border border-slate-800 space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4 text-amber-400" />
                <span className="font-bold text-white text-xs">3. Vendor Invoice</span>
              </div>
              <span className="font-mono text-amber-400 font-bold text-xs">{invoice ? invoice.invoiceNumber : matchResult.invoiceNumber}</span>
            </div>

            {invoice ? (
              <div className="space-y-2 text-[11px]">
                {invoice.lines.map(l => (
                  <div key={l.id} className="p-2 bg-slate-900 rounded border border-slate-800">
                    <div className="font-semibold text-white">{l.itemName}</div>
                    <div className="text-slate-400">Billed Qty: <strong className="text-white font-mono">{l.invoicedQty} units</strong></div>
                    <div className="text-slate-400">Billed Price: <strong className="text-white font-mono">₹{l.unitPrice.toFixed(2)}</strong></div>
                    <div className="text-slate-400">Taxable: {formatINR(l.taxableAmount)}</div>
                  </div>
                ))}
                <div className="pt-2 border-t border-slate-800 text-right">
                  <span className="text-slate-400">Invoice Grand Total:</span>
                  <div className="text-base font-bold text-amber-400 font-mono">{formatINR(invoice.grandTotal)}</div>
                </div>
              </div>
            ) : (
              <div className="py-4 text-center text-slate-400 text-xs">No Invoice record</div>
            )}
          </div>
        </div>

        {/* Resolution History if resolved */}
        {matchResult.resolutionNotes && (
          <div className="p-3 bg-slate-850 rounded-xl border border-slate-800 text-xs space-y-1">
            <span className="font-semibold text-white block">Audit Resolution Record:</span>
            <p className="text-slate-300">{matchResult.resolutionNotes}</p>
            <div className="text-[11px] text-slate-400 pt-1">
              Resolved by: <strong className="text-white">{matchResult.resolvedBy}</strong> at {matchResult.resolvedAt}
            </div>
          </div>
        )}

        {/* Footer Actions */}
        <div className="pt-3 border-t border-slate-800 flex items-center justify-between">
          <button
            type="button"
            onClick={onClose}
            className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg transition-colors"
          >
            Close
          </button>

          {!isResolved && (
            <button
              type="button"
              onClick={() => {
                onClose();
                onOpenResolution(matchResult);
              }}
              className="flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white font-semibold rounded-lg transition-colors shadow-sm"
            >
              <span>Resolve Exception / Review Action</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    </Modal>
  );
};
