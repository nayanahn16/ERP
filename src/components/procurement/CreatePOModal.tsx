import React, { useState } from 'react';
import { Plus, Trash2, ShoppingCart, AlertCircle } from 'lucide-react';
import { Modal } from '../common/Modal';
import { Vendor, Warehouse, InventoryItem, UserProfile, POLineItem, PurchaseOrder } from '../../types';
import { WAREHOUSES } from '../../lib/constants';
import { calculateGST, formatINR } from '../../lib/gstService';

interface CreatePOModalProps {
  isOpen: boolean;
  onClose: () => void;
  vendors: Vendor[];
  items: InventoryItem[];
  currentUser: UserProfile;
  onCreatePO: (poData: Partial<PurchaseOrder>) => Promise<PurchaseOrder>;
}

export const CreatePOModal: React.FC<CreatePOModalProps> = ({
  isOpen,
  onClose,
  vendors,
  items,
  currentUser,
  onCreatePO
}) => {
  const [selectedVendorId, setSelectedVendorId] = useState<string>(vendors[0]?.id || '');
  const [selectedWarehouseId, setSelectedWarehouseId] = useState<string>(WAREHOUSES[0].id);
  const [expectedDate, setExpectedDate] = useState<string>(
    new Date(Date.now() + 10 * 86400000).toISOString().split('T')[0]
  );
  const [notes, setNotes] = useState<string>('');
  const [lines, setLines] = useState<{ itemId: string; qty: number; unitPrice: number }[]>([
    { itemId: items[0]?.id || '', qty: 100, unitPrice: items[0]?.standardCost || 500 }
  ]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const vendor = vendors.find(v => v.id === selectedVendorId) || vendors[0];
  const warehouse = WAREHOUSES.find(w => w.id === selectedWarehouseId) || WAREHOUSES[0];

  const handleAddLine = () => {
    const defaultItem = items[0];
    setLines([...lines, { itemId: defaultItem.id, qty: 50, unitPrice: defaultItem.standardCost }]);
  };

  const handleRemoveLine = (idx: number) => {
    if (lines.length === 1) return;
    setLines(lines.filter((_, i) => i !== idx));
  };

  const handleLineChange = (index: number, field: string, value: any) => {
    const updated = [...lines];
    if (field === 'itemId') {
      const it = items.find(i => i.id === value);
      updated[index] = {
        ...updated[index],
        itemId: value,
        unitPrice: it ? it.standardCost : updated[index].unitPrice
      };
    } else {
      (updated[index] as any)[field] = value;
    }
    setLines(updated);
  };

  // Live GST and Totals calculation
  let subtotal = 0;
  let totalCGST = 0;
  let totalSGST = 0;
  let totalIGST = 0;

  const poLines: POLineItem[] = lines.map((line, idx) => {
    const it = items.find(i => i.id === line.itemId) || items[0];
    const lineTaxable = line.qty * line.unitPrice;
    const gst = calculateGST(lineTaxable, it.gstRate, vendor.gstin);

    subtotal += lineTaxable;
    totalCGST += gst.cgstAmount;
    totalSGST += gst.sgstAmount;
    totalIGST += gst.igstAmount;

    return {
      id: `pol-new-${idx}`,
      itemId: it.id,
      sku: it.sku,
      itemName: it.name,
      uom: it.uom,
      hsnCode: it.hsnCode,
      orderedQty: line.qty,
      unitPrice: line.unitPrice,
      gstRate: it.gstRate,
      taxableAmount: lineTaxable,
      cgst: gst.cgstAmount,
      sgst: gst.sgstAmount,
      igst: gst.igstAmount,
      totalAmount: gst.grandTotal,
      previouslyReceivedQty: 0,
      acceptedQty: 0,
      outstandingQty: line.qty
    };
  });

  const grandTotal = subtotal + totalCGST + totalSGST + totalIGST;
  const isInterState = vendor.stateCode !== '29';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (lines.some(l => l.qty <= 0)) {
      setError('Quantity for all line items must be greater than zero.');
      return;
    }

    try {
      setLoading(true);
      const poNumber = `PO-2026-${(Math.floor(Math.random() * 800) + 850).toString()}`;
      const now = new Date().toISOString();

      await onCreatePO({
        id: `po-${Date.now()}`,
        poNumber,
        vendorId: vendor.id,
        vendorName: vendor.legalName,
        vendorGstin: vendor.gstin,
        warehouseId: warehouse.id,
        warehouseName: warehouse.name,
        orderDate: now.split('T')[0],
        expectedDeliveryDate: expectedDate,
        paymentTerms: vendor.paymentTerms,
        status: 'APPROVED',
        lines: poLines,
        subtotal,
        cgstTotal: totalCGST,
        sgstTotal: totalSGST,
        igstTotal: totalIGST,
        grandTotal,
        isInterState,
        notes,
        approvalNotes: 'Approved upon creation per procurement authorization.',
        approvedBy: currentUser.name,
        approvedAt: now,
        createdAt: now,
        updatedAt: now
      });

      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to create PO');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Create Purchase Order"
      subtitle="Issue formal purchase contract with automated GST calculation"
      maxWidth="4xl"
    >
      <form onSubmit={handleSubmit} className="space-y-4 text-xs">
        {error && (
          <div className="p-3 bg-rose-500/15 border border-rose-500/30 rounded-lg text-rose-300 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {/* Vendor */}
          <div>
            <label className="block text-slate-400 font-medium mb-1">Supplier / Vendor</label>
            <select
              value={selectedVendorId}
              onChange={(e) => setSelectedVendorId(e.target.value)}
              className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-white focus:outline-none focus:border-blue-500"
            >
              {vendors.map(v => (
                <option key={v.id} value={v.id}>{v.legalName} ({v.state})</option>
              ))}
            </select>
            <span className="text-[11px] text-slate-400 mt-1 block font-mono">
              GSTIN: {vendor.gstin} ({isInterState ? 'Inter-state IGST' : 'Intra-state CGST+SGST'})
            </span>
          </div>

          {/* Warehouse */}
          <div>
            <label className="block text-slate-400 font-medium mb-1">Destination Warehouse</label>
            <select
              value={selectedWarehouseId}
              onChange={(e) => setSelectedWarehouseId(e.target.value)}
              className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-white focus:outline-none focus:border-blue-500"
            >
              {WAREHOUSES.map(w => (
                <option key={w.id} value={w.id}>{w.name}</option>
              ))}
            </select>
            <span className="text-[11px] text-slate-400 mt-1 block">
              Lead Time: {vendor.leadTimeDays} days • Terms: {vendor.paymentTerms}
            </span>
          </div>

          {/* Delivery Date */}
          <div>
            <label className="block text-slate-400 font-medium mb-1">Expected Delivery Date</label>
            <input
              type="date"
              value={expectedDate}
              onChange={(e) => setExpectedDate(e.target.value)}
              className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-white focus:outline-none focus:border-blue-500"
            />
          </div>
        </div>

        {/* Line Items Table */}
        <div className="border border-slate-800 rounded-xl overflow-hidden mt-4">
          <div className="flex items-center justify-between p-3 bg-slate-850 border-b border-slate-800">
            <span className="font-semibold text-white">Purchase Order Line Items</span>
            <button
              type="button"
              onClick={handleAddLine}
              className="flex items-center gap-1 px-2.5 py-1 bg-blue-600/20 hover:bg-blue-600/30 text-blue-400 border border-blue-500/30 rounded text-xs transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Item Line</span>
            </button>
          </div>

          <div className="p-3 space-y-3">
            {lines.map((line, idx) => {
              const it = items.find(i => i.id === line.itemId) || items[0];
              const lineTaxable = line.qty * line.unitPrice;

              return (
                <div key={idx} className="flex flex-col md:flex-row items-end md:items-center gap-3 p-3 bg-slate-900 rounded-lg border border-slate-800">
                  <div className="flex-1 w-full">
                    <label className="block text-slate-400 text-[11px] mb-1">Item Material</label>
                    <select
                      value={line.itemId}
                      onChange={(e) => handleLineChange(idx, 'itemId', e.target.value)}
                      className="w-full bg-slate-800 border border-slate-700 rounded p-1.5 text-white text-xs"
                    >
                      {items.map(i => (
                        <option key={i.id} value={i.id}>{i.sku} — {i.name} ({i.uom})</option>
                      ))}
                    </select>
                  </div>

                  <div className="w-24">
                    <label className="block text-slate-400 text-[11px] mb-1">Qty ({it.uom})</label>
                    <input
                      type="number"
                      min={1}
                      value={line.qty}
                      onChange={(e) => handleLineChange(idx, 'qty', Number(e.target.value))}
                      className="w-full bg-slate-800 border border-slate-700 rounded p-1.5 text-white text-xs font-semibold"
                    />
                  </div>

                  <div className="w-28">
                    <label className="block text-slate-400 text-[11px] mb-1">Price (₹/{it.uom})</label>
                    <input
                      type="number"
                      step="0.01"
                      value={line.unitPrice}
                      onChange={(e) => handleLineChange(idx, 'unitPrice', Number(e.target.value))}
                      className="w-full bg-slate-800 border border-slate-700 rounded p-1.5 text-white text-xs"
                    />
                  </div>

                  <div className="w-28 text-right">
                    <span className="block text-slate-400 text-[11px] mb-1">Taxable</span>
                    <span className="font-semibold text-white block py-1.5">{formatINR(lineTaxable)}</span>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleRemoveLine(idx)}
                    disabled={lines.length === 1}
                    className="p-1.5 text-slate-400 hover:text-rose-400 disabled:opacity-30 rounded hover:bg-slate-800 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              );
            })}
          </div>
        </div>

        {/* Financial Summary & Tax Details */}
        <div className="p-4 bg-slate-850 rounded-xl border border-slate-800 flex flex-col md:flex-row justify-between gap-4">
          <div className="space-y-1 text-slate-400 text-xs">
            <div>Place of Supply: <strong className="text-white">Karnataka (29)</strong></div>
            <div>
              Tax Treatment: <strong className={isInterState ? 'text-purple-400' : 'text-blue-400'}>
                {isInterState ? 'Inter-State (100% IGST)' : 'Intra-State (50% CGST + 50% SGST)'}
              </strong>
            </div>
            <div className="text-[11px] mt-1 text-slate-400">
              Contract terms compliant with Indian GST Statutory Invoice Formats.
            </div>
          </div>

          <div className="space-y-1.5 text-xs text-right min-w-[220px]">
            <div className="flex justify-between text-slate-400">
              <span>Subtotal:</span>
              <span className="font-mono text-white">{formatINR(subtotal)}</span>
            </div>
            {!isInterState ? (
              <>
                <div className="flex justify-between text-slate-400">
                  <span>CGST:</span>
                  <span className="font-mono text-white">{formatINR(totalCGST)}</span>
                </div>
                <div className="flex justify-between text-slate-400">
                  <span>SGST:</span>
                  <span className="font-mono text-white">{formatINR(totalSGST)}</span>
                </div>
              </>
            ) : (
              <div className="flex justify-between text-slate-400">
                <span>IGST:</span>
                <span className="font-mono text-white">{formatINR(totalIGST)}</span>
              </div>
            )}
            <div className="flex justify-between text-sm font-bold text-white pt-2 border-t border-slate-700">
              <span>Grand Total:</span>
              <span className="text-emerald-400">{formatINR(grandTotal)}</span>
            </div>
          </div>
        </div>

        <div>
          <label className="block text-slate-400 font-medium mb-1">Commercial Notes / Terms</label>
          <input
            type="text"
            placeholder="e.g. Standard rate contract pricing. Delivery with test batch report."
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-white focus:outline-none focus:border-blue-500"
          />
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
            <ShoppingCart className="w-4 h-4" />
            <span>{loading ? 'Authorizing PO...' : 'Create & Approve PO'}</span>
          </button>
        </div>
      </form>
    </Modal>
  );
};
