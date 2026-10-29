import React, { useState } from 'react';
import { Truck, AlertTriangle, CheckCircle2, AlertCircle } from 'lucide-react';
import { Modal } from '../common/Modal';
import { PurchaseOrder, GoodsReceiptNote, UserProfile } from '../../types';

interface RecordGRNModalProps {
  isOpen: boolean;
  onClose: () => void;
  openPurchaseOrders: PurchaseOrder[];
  preSelectedPO?: PurchaseOrder | null;
  onRecordGRN: (
    po: PurchaseOrder,
    grnData: {
      deliveryChallanNo: string;
      vehicleNo?: string;
      receiverName: string;
      inspectionNotes?: string;
      lines: {
        poLineId: string;
        itemId: string;
        deliveredQty: number;
        acceptedQty: number;
        rejectedQty: number;
        rejectionReason?: string;
      }[];
    }
  ) => Promise<GoodsReceiptNote>;
  currentUser: UserProfile;
}

export const RecordGRNModal: React.FC<RecordGRNModalProps> = ({
  isOpen,
  onClose,
  openPurchaseOrders,
  preSelectedPO,
  onRecordGRN,
  currentUser
}) => {
  const [selectedPoId, setSelectedPoId] = useState<string>(
    preSelectedPO ? preSelectedPO.id : (openPurchaseOrders[0]?.id || '')
  );
  const [challanNo, setChallanNo] = useState<string>(`DC-${Math.floor(Math.random() * 8000) + 1000}`);
  const [vehicleNo, setVehicleNo] = useState<string>('KA-04-ME-5412');
  const [inspectionNotes, setInspectionNotes] = useState<string>('Box counts verified. Physical inspection OK.');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Active PO
  const po = openPurchaseOrders.find(p => p.id === selectedPoId) || preSelectedPO || openPurchaseOrders[0];

  // Dynamic lines state initialized from PO lines
  const [lineInputs, setLineInputs] = useState<{
    [poLineId: string]: { delivered: number; accepted: number; rejected: number; reason: string }
  }>(() => {
    const initial: any = {};
    if (po) {
      po.lines.forEach(l => {
        initial[l.id] = {
          delivered: l.outstandingQty,
          accepted: l.outstandingQty,
          rejected: 0,
          reason: ''
        };
      });
    }
    return initial;
  });

  if (!isOpen) return null;

  if (!po) {
    return (
      <Modal isOpen={isOpen} onClose={onClose} title="Record Goods Receipt (GRN)">
        <div className="py-8 text-center text-xs text-slate-400">
          <AlertCircle className="w-8 h-8 text-amber-400 mx-auto mb-2" />
          <p className="font-semibold text-white">No open purchase orders awaiting delivery.</p>
          <p className="mt-1">All existing orders are either closed or already fully received.</p>
        </div>
      </Modal>
    );
  }

  const handlePoChange = (poId: string) => {
    setSelectedPoId(poId);
    const newPo = openPurchaseOrders.find(p => p.id === poId);
    if (newPo) {
      const updated: any = {};
      newPo.lines.forEach(l => {
        updated[l.id] = {
          delivered: l.outstandingQty,
          accepted: l.outstandingQty,
          rejected: 0,
          reason: ''
        };
      });
      setLineInputs(updated);
    }
  };

  const handleLineInputChange = (poLineId: string, field: string, val: any) => {
    setLineInputs(prev => {
      const current = prev[poLineId] || { delivered: 0, accepted: 0, rejected: 0, reason: '' };
      const updated = { ...current, [field]: val };
      // auto-adjust rejected if accepted changed
      if (field === 'accepted') {
        updated.rejected = Math.max(0, updated.delivered - val);
      }
      return { ...prev, [poLineId]: updated };
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!challanNo.trim()) {
      setError('Delivery Challan Number is required.');
      return;
    }

    try {
      setLoading(true);

      const lines = po.lines.map(pLine => {
        const inp = lineInputs[pLine.id] || {
          delivered: pLine.outstandingQty,
          accepted: pLine.outstandingQty,
          rejected: 0,
          reason: ''
        };
        return {
          poLineId: pLine.id,
          itemId: pLine.itemId,
          deliveredQty: inp.delivered,
          acceptedQty: inp.accepted,
          rejectedQty: inp.rejected,
          rejectionReason: inp.reason
        };
      });

      await onRecordGRN(po, {
        deliveryChallanNo: challanNo,
        vehicleNo,
        receiverName: currentUser.name,
        inspectionNotes,
        lines
      });

      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to record GRN');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Goods Receipt Note (GRN) & Quantity Inspection"
      subtitle={`Verify physical shipments against purchase orders with shortage retention`}
      maxWidth="4xl"
    >
      <form onSubmit={handleSubmit} className="space-y-4 text-xs">
        {error && (
          <div className="p-3 bg-rose-500/15 border border-rose-500/30 rounded-lg text-rose-300 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
          {/* PO selector */}
          <div className="md:col-span-2">
            <label className="block text-slate-400 font-medium mb-1">Target Purchase Order</label>
            <select
              value={po.id}
              onChange={(e) => handlePoChange(e.target.value)}
              className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-white font-mono focus:outline-none focus:border-blue-500"
            >
              {openPurchaseOrders.map(p => (
                <option key={p.id} value={p.id}>
                  {p.poNumber} — {p.vendorName} ({p.status})
                </option>
              ))}
            </select>
          </div>

          {/* Challan No */}
          <div>
            <label className="block text-slate-400 font-medium mb-1">Delivery Challan No *</label>
            <input
              type="text"
              required
              value={challanNo}
              onChange={(e) => setChallanNo(e.target.value)}
              className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-white font-mono focus:outline-none focus:border-blue-500"
            />
          </div>

          {/* Vehicle No */}
          <div>
            <label className="block text-slate-400 font-medium mb-1">Vehicle / LR No</label>
            <input
              type="text"
              value={vehicleNo}
              onChange={(e) => setVehicleNo(e.target.value)}
              className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-white focus:outline-none focus:border-blue-500"
            />
          </div>
        </div>

        {/* Goods Inspection Table */}
        <div className="border border-slate-800 rounded-xl overflow-hidden mt-3">
          <div className="p-3 bg-slate-850 border-b border-slate-800 font-semibold text-white flex items-center justify-between">
            <span>Physical Receipt Verification per Line Item</span>
            <span className="text-[11px] text-slate-400">Destination: {po.warehouseName}</span>
          </div>

          <div className="p-3 space-y-3">
            {po.lines.map(line => {
              const inp = lineInputs[line.id] || {
                delivered: line.outstandingQty,
                accepted: line.outstandingQty,
                rejected: 0,
                reason: ''
              };

              const remainingOutstanding = Math.max(0, line.orderedQty - line.acceptedQty - inp.accepted);
              const isShortage = inp.accepted < line.outstandingQty;

              return (
                <div key={line.id} className="p-3 bg-slate-900 border border-slate-800 rounded-xl space-y-3">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div>
                      <div className="font-semibold text-white text-xs">{line.itemName}</div>
                      <div className="text-slate-400 font-mono text-[11px]">
                        {line.sku} • Contracted PO Qty: <strong className="text-white">{line.orderedQty} {line.uom}</strong> • Already Recd: {line.acceptedQty} {line.uom}
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="text-[11px] text-slate-400">Outstanding Balance:</span>
                      <span className="font-bold text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20 font-mono">
                        {line.outstandingQty} {line.uom}
                      </span>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 pt-2 border-t border-slate-800/80">
                    <div>
                      <label className="block text-slate-400 text-[11px] mb-1">Delivered in Shipment</label>
                      <input
                        type="number"
                        min={0}
                        value={inp.delivered}
                        onChange={(e) => handleLineInputChange(line.id, 'delivered', Number(e.target.value))}
                        className="w-full bg-slate-800 border border-slate-700 rounded p-1.5 text-white font-semibold"
                      />
                    </div>

                    <div>
                      <label className="block text-emerald-400 text-[11px] font-semibold mb-1">Accepted (Adds to Stock)</label>
                      <input
                        type="number"
                        min={0}
                        max={inp.delivered}
                        value={inp.accepted}
                        onChange={(e) => handleLineInputChange(line.id, 'accepted', Number(e.target.value))}
                        className="w-full bg-slate-800 border border-emerald-500/40 rounded p-1.5 text-emerald-400 font-bold"
                      />
                    </div>

                    <div>
                      <label className="block text-rose-400 text-[11px] mb-1">Rejected / Damaged</label>
                      <input
                        type="number"
                        min={0}
                        value={inp.rejected}
                        onChange={(e) => handleLineInputChange(line.id, 'rejected', Number(e.target.value))}
                        className="w-full bg-slate-800 border border-slate-700 rounded p-1.5 text-rose-400 font-medium"
                      />
                    </div>

                    <div>
                      <label className="block text-slate-400 text-[11px] mb-1">New Outstanding Balance</label>
                      <div className="p-1.5 bg-slate-850 rounded border border-slate-800 font-mono font-bold text-white text-xs">
                        {remainingOutstanding} {line.uom}
                        {isShortage && <span className="text-amber-400 text-[10px] ml-1.5 font-sans">(Shortage)</span>}
                      </div>
                    </div>
                  </div>

                  {inp.rejected > 0 && (
                    <div className="pt-2">
                      <input
                        type="text"
                        placeholder="Rejection / damage reason (e.g. cracked insulation, terminal bent)"
                        value={inp.reason}
                        onChange={(e) => handleLineInputChange(line.id, 'reason', e.target.value)}
                        className="w-full bg-slate-800 border border-rose-500/30 rounded p-1.5 text-rose-300 text-xs"
                      />
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Receiver Notes */}
        <div>
          <label className="block text-slate-400 font-medium mb-1">Receiver Inspection Notes</label>
          <input
            type="text"
            value={inspectionNotes}
            onChange={(e) => setInspectionNotes(e.target.value)}
            className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-white focus:outline-none focus:border-blue-500"
          />
        </div>

        {/* Safeguard banner */}
        <div className="p-3 bg-blue-950/20 border border-blue-900/40 rounded-lg text-slate-400 text-[11px] flex items-center justify-between">
          <span>Inspection Officer: <strong className="text-white">{currentUser.name}</strong></span>
          <span className="text-emerald-400 font-medium">✓ Verified Stock updates by Accepted Qty only</span>
        </div>

        <div className="pt-3 border-t border-slate-800 flex items-center justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white font-semibold rounded-lg transition-colors shadow-sm disabled:opacity-50"
          >
            <Truck className="w-4 h-4" />
            <span>{loading ? 'Recording & Stocking...' : 'Submit GRN & Update Inventory'}</span>
          </button>
        </div>
      </form>
    </Modal>
  );
};
