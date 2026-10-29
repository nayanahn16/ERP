import React from 'react';
import { 
  X, 
  Boxes, 
  Warehouse, 
  TrendingDown, 
  Calendar, 
  ArrowLeftRight, 
  Building2, 
  Info,
  Clock
} from 'lucide-react';
import { InventoryItem, Vendor, UserProfile } from '../../types';
import { StatusBadge } from '../common/StatusBadge';
import { WAREHOUSES } from '../../lib/constants';
import { formatINR } from '../../lib/gstService';
import { formatDate } from '../../lib/utils';

interface ItemDetailDrawerProps {
  item: InventoryItem | null;
  onClose: () => void;
  vendor?: Vendor;
  onOpenTransfer: (item: InventoryItem) => void;
  currentUser: UserProfile;
}

export const ItemDetailDrawer: React.FC<ItemDetailDrawerProps> = ({
  item,
  onClose,
  vendor,
  onOpenTransfer
}) => {
  if (!item) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-slate-950/70 backdrop-blur-xs flex justify-end animate-in fade-in duration-150">
      <div className="fixed inset-0" onClick={onClose} />

      <div className="relative w-full max-w-xl bg-slate-900 border-l border-slate-800 shadow-2xl h-full flex flex-col z-10 overflow-y-auto">
        {/* Header */}
        <div className="p-6 border-b border-slate-800 bg-slate-850/80 sticky top-0 z-20 backdrop-blur-sm">
          <div className="flex items-start justify-between">
            <div>
              <div className="flex items-center gap-2">
                <span className="font-mono text-xs font-bold text-blue-400 bg-blue-500/10 px-2 py-0.5 rounded border border-blue-500/30">
                  {item.sku}
                </span>
                <StatusBadge status={item.overallStatus} />
              </div>
              <h2 className="text-lg font-bold text-white mt-1.5 leading-snug">{item.name}</h2>
              <p className="text-xs text-slate-400 mt-0.5">{item.category} • HSN: {item.hsnCode}</p>
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
          {/* Quick Stats Grid */}
          <div className="grid grid-cols-3 gap-3">
            <div className="bg-slate-850 p-3 rounded-lg border border-slate-800">
              <span className="text-slate-400 block text-[11px]">Consolidated Available</span>
              <span className="text-lg font-bold text-white mt-0.5 block">{item.totalAvailableQty} {item.uom}</span>
            </div>
            <div className="bg-slate-850 p-3 rounded-lg border border-slate-800">
              <span className="text-slate-400 block text-[11px]">Standard Cost</span>
              <span className="text-lg font-bold text-emerald-400 mt-0.5 block">₹{item.standardCost.toFixed(2)}</span>
            </div>
            <div className="bg-slate-850 p-3 rounded-lg border border-slate-800">
              <span className="text-slate-400 block text-[11px]">Total Stock Value</span>
              <span className="text-lg font-bold text-white mt-0.5 block">
                {formatINR(item.totalCurrentQty * item.standardCost)}
              </span>
            </div>
          </div>

          {/* Warehouse Breakdown */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold text-white text-sm flex items-center gap-2">
                <Warehouse className="w-4 h-4 text-blue-400" />
                <span>Warehouse Balances</span>
              </h3>
              <button
                onClick={() => onOpenTransfer(item)}
                className="flex items-center gap-1.5 px-2.5 py-1 bg-blue-600/20 hover:bg-blue-600/30 text-blue-400 border border-blue-500/30 rounded-lg text-xs font-medium transition-colors"
              >
                <ArrowLeftRight className="w-3.5 h-3.5" />
                <span>Transfer Stock</span>
              </button>
            </div>

            <div className="space-y-3">
              {WAREHOUSES.map(wh => {
                const bal = item.balances[wh.id];
                if (!bal) return null;

                return (
                  <div key={wh.id} className="p-4 bg-slate-850 border border-slate-800 rounded-xl space-y-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-semibold text-white">{wh.name}</div>
                        <div className="text-slate-400 text-[11px]">Rack: <span className="text-slate-300 font-mono">{bal.locationRack}</span></div>
                      </div>
                      <StatusBadge status={bal.stockStatus} />
                    </div>

                    <div className="grid grid-cols-4 gap-2 pt-2 border-t border-slate-800/80 text-[11px]">
                      <div>
                        <span className="text-slate-400 block">Current Qty</span>
                        <span className="font-bold text-white text-xs">{bal.currentQty} {item.uom}</span>
                      </div>
                      <div>
                        <span className="text-slate-400 block">Reserved</span>
                        <span className="font-semibold text-slate-300 text-xs">{bal.reservedQty} {item.uom}</span>
                      </div>
                      <div>
                        <span className="text-slate-400 block">Available</span>
                        <span className="font-bold text-emerald-400 text-xs">{bal.availableQty} {item.uom}</span>
                      </div>
                      <div>
                        <span className="text-slate-400 block">Min Threshold</span>
                        <span className="font-semibold text-amber-400 text-xs">{bal.minThreshold} {item.uom}</span>
                      </div>
                    </div>

                    {/* Baseline Forecasting Callout */}
                    <div className="p-2.5 bg-slate-900 rounded-lg border border-slate-800 flex items-center justify-between text-[11px]">
                      <div className="flex items-center gap-2">
                        <TrendingDown className="w-3.5 h-3.5 text-blue-400" />
                        <span className="text-slate-300">
                          Avg Consumption: <strong>{bal.avgDailyConsumption} {item.uom}/day</strong>
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Clock className="w-3.5 h-3.5 text-amber-400" />
                        <span className="text-slate-300">
                          Stockout in: <strong className={bal.daysRemaining <= 7 ? 'text-rose-400' : 'text-emerald-400'}>{bal.daysRemaining} days</strong> ({formatDate(bal.expectedStockoutDate)})
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Preferred Vendor Card */}
          {vendor && (
            <div className="p-4 bg-slate-850 border border-slate-800 rounded-xl space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-white flex items-center gap-2">
                  <Building2 className="w-4 h-4 text-amber-400" />
                  <span>Preferred Supplier</span>
                </span>
                <span className="text-slate-400 font-mono text-[11px]">Lead Time: {vendor.leadTimeDays} days</span>
              </div>
              <div className="text-white font-medium">{vendor.legalName}</div>
              <div className="text-slate-400 text-[11px]">
                GSTIN: <span className="font-mono text-slate-300">{vendor.gstin}</span> • State: {vendor.state}
              </div>
              <div className="text-slate-400 text-[11px]">
                Contact: {vendor.contactPerson} ({vendor.email})
              </div>
            </div>
          )}

          {/* Forecasting Transparency Disclaimer */}
          <div className="p-3 bg-blue-950/20 border border-blue-900/40 rounded-lg text-slate-400 text-[11px] flex items-start gap-2">
            <Info className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" />
            <p>
              <strong>Transparent Forecasting Note:</strong> Consumption rates are estimated from 60-day historical stock decrement journals. Does not extrapolate unverified AI assumptions.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
