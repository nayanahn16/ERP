import React, { useState } from 'react';
import { ArrowLeftRight, AlertCircle, Check } from 'lucide-react';
import { Modal } from '../common/Modal';
import { InventoryItem, UserProfile } from '../../types';
import { WAREHOUSES } from '../../lib/constants';

interface WarehouseTransferModalProps {
  isOpen: boolean;
  onClose: () => void;
  item: InventoryItem | null;
  onTransfer: (
    itemId: string,
    fromWhId: string,
    toWhId: string,
    qty: number,
    notes?: string
  ) => Promise<void>;
  currentUser: UserProfile;
}

export const WarehouseTransferModal: React.FC<WarehouseTransferModalProps> = ({
  isOpen,
  onClose,
  item,
  onTransfer,
  currentUser
}) => {
  const [fromWhId, setFromWhId] = useState<string>('WH-BLR-01');
  const [toWhId, setToWhId] = useState<string>('WH-BGV-02');
  const [quantity, setQuantity] = useState<number>(10);
  const [notes, setNotes] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  if (!item) return null;

  const fromBalance = item.balances[fromWhId];
  const maxAvailable = fromBalance ? fromBalance.availableQty : 0;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (fromWhId === toWhId) {
      setError('Source and Destination warehouse cannot be the same.');
      return;
    }
    if (quantity <= 0) {
      setError('Quantity must be greater than zero.');
      return;
    }
    if (quantity > maxAvailable) {
      setError(`Cannot transfer ${quantity} ${item.uom}. Only ${maxAvailable} ${item.uom} available in source warehouse.`);
      return;
    }

    try {
      setLoading(true);
      await onTransfer(item.id, fromWhId, toWhId, quantity, notes);
      onClose();
    } catch (err: any) {
      setError(err.message || 'Transfer failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Inter-Warehouse Stock Transfer"
      subtitle={`Move verified stock between Peenya Central and Belagavi Depot`}
      maxWidth="md"
    >
      <form onSubmit={handleSubmit} className="space-y-4 text-xs">
        {/* Item Info Card */}
        <div className="p-3 bg-slate-850 rounded-lg border border-slate-700">
          <div className="font-semibold text-white text-sm">{item.name}</div>
          <div className="text-slate-400 font-mono mt-0.5">{item.sku} • {item.category}</div>
          <div className="mt-2 flex items-center justify-between text-slate-300">
            <span>Current Total Available:</span>
            <span className="font-bold text-white">{item.totalAvailableQty} {item.uom}</span>
          </div>
        </div>

        {error && (
          <div className="p-3 bg-rose-500/15 border border-rose-500/30 rounded-lg text-rose-300 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-slate-400 font-medium mb-1">From Warehouse (Source)</label>
            <select
              value={fromWhId}
              onChange={(e) => {
                setFromWhId(e.target.value);
                if (e.target.value === toWhId) {
                  setToWhId(e.target.value === 'WH-BLR-01' ? 'WH-BGV-02' : 'WH-BLR-01');
                }
              }}
              className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-white focus:outline-none focus:border-blue-500"
            >
              {WAREHOUSES.map(w => (
                <option key={w.id} value={w.id}>{w.city} ({w.name.split(' ')[0]})</option>
              ))}
            </select>
            <span className="text-[11px] text-slate-400 mt-1 block">
              Available: <strong className="text-emerald-400">{maxAvailable} {item.uom}</strong>
            </span>
          </div>

          <div>
            <label className="block text-slate-400 font-medium mb-1">To Warehouse (Dest)</label>
            <select
              value={toWhId}
              onChange={(e) => setToWhId(e.target.value)}
              className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-white focus:outline-none focus:border-blue-500"
            >
              {WAREHOUSES.map(w => (
                <option key={w.id} value={w.id}>{w.city} ({w.name.split(' ')[0]})</option>
              ))}
            </select>
            <span className="text-[11px] text-slate-400 mt-1 block">
              Current: <strong className="text-slate-300">{item.balances[toWhId]?.currentQty || 0} {item.uom}</strong>
            </span>
          </div>
        </div>

        <div>
          <label className="block text-slate-400 font-medium mb-1">
            Transfer Quantity ({item.uom})
          </label>
          <input
            type="number"
            min={1}
            max={maxAvailable}
            value={quantity}
            onChange={(e) => setQuantity(Number(e.target.value))}
            className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-white text-sm focus:outline-none focus:border-blue-500 font-semibold"
          />
        </div>

        <div>
          <label className="block text-slate-400 font-medium mb-1">Transfer Notes / Reason</label>
          <input
            type="text"
            placeholder="e.g. Production line rebalancing for Belagavi contactor assembly"
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
            disabled={loading || maxAvailable <= 0}
            className="flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white font-medium rounded-lg transition-colors shadow-sm disabled:opacity-50"
          >
            <ArrowLeftRight className="w-4 h-4" />
            <span>{loading ? 'Processing...' : 'Execute Stock Transfer'}</span>
          </button>
        </div>
      </form>
    </Modal>
  );
};
