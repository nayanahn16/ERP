import React, { useState } from 'react';
import { 
  ArrowLeft, 
  Package, 
  AlertTriangle, 
  CheckCircle2, 
  TrendingUp, 
  Building2, 
  Boxes, 
  Zap, 
  Calculator, 
  FileText,
  Calendar,
  Layers,
  ArrowDownRight,
  ArrowUpRight
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { formatINR, formatCompactINR } from '../../utils/formatters';

export const InventoryDetailScreen: React.FC = () => {
  const { 
    selectedItem, 
    goBack, 
    navigate, 
    reorderInventoryItem, 
    purchases, 
    vendors, 
    manufacturers,
    showToast 
  } = useApp();

  if (!selectedItem) {
    return (
      <div className="py-12 text-center text-slate-500">
        <Package className="w-10 h-10 mx-auto mb-2 text-slate-400" />
        <p>No material selected.</p>
        <button
          onClick={goBack}
          className="mt-4 px-4 py-2 bg-teal-600 text-white rounded-xl text-xs font-semibold"
        >
          Return to Inventory
        </button>
      </div>
    );
  }

  const isLow = selectedItem.stock_status === 'LOW STOCK' || selectedItem.closing_stock_qty <= selectedItem.reorder_level_qty;
  const targetStock = selectedItem.reorder_level_qty * 2;
  const shortfall = Math.max(0, targetStock - selectedItem.closing_stock_qty);
  const [customOrderQty, setCustomOrderQty] = useState(shortfall > 0 ? shortfall : 100);

  const matchingPurchases = purchases.filter(p => p.material_id === selectedItem.material_id);
  const vendorId = matchingPurchases.length > 0 ? matchingPurchases[0].vendor_id : 'VEN001';
  const vendor = vendors.find(v => v.vendor_id === vendorId) || vendors[0];
  const mfg = manufacturers.find(m => m.manufacturer_id === selectedItem.manufacturer_id);

  return (
    <div className="space-y-4 pb-20 text-slate-800">
      {/* Top Header Card */}
      <div className="bg-white border border-slate-200 rounded-3xl p-4 sm:p-5 shadow-sm">
        <div className="flex items-center justify-between gap-2 mb-3">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold px-2 py-0.5 rounded-lg bg-teal-50 text-teal-800 border border-teal-200 font-mono">
              {selectedItem.material_id}
            </span>
            <span className="text-xs text-slate-500 font-medium">
              Facility: {selectedItem.manufacturer_id}
            </span>
          </div>

          <span className={`text-xs font-bold px-2.5 py-1 rounded-full flex items-center gap-1 ${
            isLow 
              ? 'bg-rose-50 text-rose-700 border border-rose-200 animate-pulse' 
              : 'bg-teal-50 text-teal-700 border border-teal-200'
          }`}>
            {isLow ? <AlertTriangle className="w-3.5 h-3.5" /> : <CheckCircle2 className="w-3.5 h-3.5" />}
            <span>{selectedItem.stock_status}</span>
          </span>
        </div>

        <h2 className="text-xl font-black text-slate-900 tracking-tight">
          {selectedItem.material_name}
        </h2>
        <p className="text-xs text-slate-500 mt-1">
          Standard Unit: <strong className="text-slate-800 uppercase">{selectedItem.unit}</strong> · Manufacturer: {mfg?.business_name || selectedItem.manufacturer_id}
        </p>
      </div>

      {/* 4 Big Metrics Grid (White Cards) */}
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-white border border-slate-200 p-3.5 rounded-2xl shadow-2xs">
          <div className="text-[11px] text-slate-500 font-semibold uppercase">Closing Stock</div>
          <div className={`text-lg font-black mt-1 ${isLow ? 'text-rose-600' : 'text-slate-900'}`}>
            {selectedItem.closing_stock_qty} <span className="text-xs font-normal text-slate-500">{selectedItem.unit}</span>
          </div>
          <div className="text-[10px] text-slate-400 mt-1">
            Status: {isLow ? 'Deficit below safety threshold' : 'Stock level is healthy'}
          </div>
        </div>

        <div className="bg-white border border-slate-200 p-3.5 rounded-2xl shadow-2xs">
          <div className="text-[11px] text-slate-500 font-semibold uppercase">Reorder Level Threshold</div>
          <div className="text-lg font-black text-amber-700 mt-1">
            {selectedItem.reorder_level_qty} <span className="text-xs font-normal text-slate-500">{selectedItem.unit}</span>
          </div>
          <div className="text-[10px] text-slate-400 mt-1">
            Safety buffer minimum
          </div>
        </div>

        <div className="bg-white border border-slate-200 p-3.5 rounded-2xl shadow-2xs">
          <div className="text-[11px] text-slate-500 font-semibold uppercase">Average Unit Cost</div>
          <div className="text-lg font-black text-slate-900 mt-1">
            {formatINR(selectedItem.average_unit_cost_inr)}
          </div>
          <div className="text-[10px] text-slate-400 mt-1">
            Per {selectedItem.unit}
          </div>
        </div>

        <div className="bg-white border border-slate-200 p-3.5 rounded-2xl shadow-2xs">
          <div className="text-[11px] text-slate-500 font-semibold uppercase">Total Asset Value</div>
          <div className="text-lg font-black text-teal-700 mt-1">
            {formatCompactINR(selectedItem.closing_stock_value_inr)}
          </div>
          <div className="text-[10px] text-teal-700/80 mt-1 font-semibold">
            {formatINR(selectedItem.closing_stock_value_inr)}
          </div>
        </div>
      </div>

      {/* Movement Ledger Card */}
      <div className="bg-white border border-slate-200 rounded-2xl p-4 space-y-3 shadow-xs">
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-600 flex items-center gap-1.5">
          <Layers className="w-3.5 h-3.5 text-teal-600" />
          <span>Period Stock Movement Ledger</span>
        </h3>

        <div className="space-y-2 text-xs">
          <div className="flex items-center justify-between p-2 rounded-xl bg-slate-50 border border-slate-100">
            <span className="text-slate-600 font-medium">Opening Stock</span>
            <span className="font-bold text-slate-800">{selectedItem.opening_stock_qty} {selectedItem.unit}</span>
          </div>

          <div className="flex items-center justify-between p-2 rounded-xl bg-teal-50 text-teal-800 border border-teal-100">
            <span className="flex items-center gap-1 font-medium">
              <ArrowDownRight className="w-3.5 h-3.5 text-teal-600" />
              <span>Received in Period (GRN)</span>
            </span>
            <span className="font-bold">+{selectedItem.received_qty_period} {selectedItem.unit}</span>
          </div>

          <div className="flex items-center justify-between p-2 rounded-xl bg-rose-50 text-rose-800 border border-rose-100">
            <span className="flex items-center gap-1 font-medium">
              <ArrowUpRight className="w-3.5 h-3.5 text-rose-600" />
              <span>Issued to Production</span>
            </span>
            <span className="font-bold">-{selectedItem.issued_to_production_qty} {selectedItem.unit}</span>
          </div>

          <div className="flex items-center justify-between p-2 rounded-xl bg-slate-100 text-slate-900 font-bold border border-slate-200">
            <span>Closing Stock Balance</span>
            <span>{selectedItem.closing_stock_qty} {selectedItem.unit}</span>
          </div>
        </div>
      </div>

      {/* Automated Replenishment & Reorder Card (Teal Accent) */}
      <div className="bg-gradient-to-br from-teal-50/80 via-white to-emerald-50/60 border border-teal-200 rounded-2xl p-4 space-y-3 shadow-sm">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-bold uppercase tracking-wider text-teal-900 flex items-center gap-1.5">
            <Calculator className="w-4 h-4 text-teal-600" />
            <span>Automated Replenishment Formula</span>
          </h3>
          <span className="text-[10px] px-2 py-0.5 rounded-full bg-teal-100 text-teal-800 font-bold border border-teal-200">
            Target - Current
          </span>
        </div>

        <div className="bg-white rounded-xl p-3 text-xs space-y-1.5 border border-slate-200 shadow-2xs">
          <div className="flex justify-between text-slate-600">
            <span>Target Stock (2x Buffer):</span>
            <strong className="text-slate-800">{targetStock} {selectedItem.unit}</strong>
          </div>
          <div className="flex justify-between text-slate-600">
            <span>Current Available Stock:</span>
            <strong className="text-slate-800">{selectedItem.closing_stock_qty} {selectedItem.unit}</strong>
          </div>
          <div className="flex justify-between text-teal-800 font-bold pt-1.5 border-t border-slate-100">
            <span>Recommended Replenishment Order:</span>
            <span className="text-sm font-black text-teal-700">
              {shortfall > 0 ? shortfall : 0} {selectedItem.unit}
            </span>
          </div>
        </div>

        {/* Preferred Supplier Box */}
        <div className="flex items-center justify-between text-xs bg-white p-2.5 rounded-xl border border-slate-200 shadow-2xs">
          <div>
            <div className="text-[10px] text-slate-400 font-semibold uppercase">Recommended Supplier</div>
            <div className="font-bold text-slate-900 mt-0.5">{vendor?.vendor_name || 'Standard Vendor'}</div>
            <div className="text-[10.5px] text-slate-500">{vendor?.city}, {vendor?.state} · Rating: ⭐ {vendor?.reliability_score_1_to_5}/5</div>
          </div>
          <span className="text-[10px] px-2 py-1 rounded bg-teal-50 text-teal-800 font-bold border border-teal-200">
            NET {vendor?.payment_terms_days} Days
          </span>
        </div>

        {/* Order Quantity Input & Reorder Action Button */}
        <div className="flex items-center gap-2 pt-1">
          <div className="w-32">
            <label className="text-[10px] text-slate-600 font-semibold block mb-1">Order Qty ({selectedItem.unit})</label>
            <input
              type="number"
              value={customOrderQty}
              onChange={(e) => setCustomOrderQty(Math.max(1, Number(e.target.value)))}
              className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-sm font-bold text-slate-900 focus:outline-none focus:border-teal-500 shadow-inner"
            />
          </div>

          <button
            onClick={() => reorderInventoryItem(selectedItem, customOrderQty)}
            className="flex-1 mt-4.5 py-2.5 px-4 bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-500 hover:to-emerald-500 text-white font-bold text-xs rounded-xl shadow-lg shadow-teal-600/25 flex items-center justify-center gap-2 transition-all active:scale-95"
          >
            <Zap className="w-4 h-4 text-yellow-300 fill-yellow-300" />
            <span>Generate Purchase Order</span>
          </button>
        </div>
      </div>
    </div>
  );
};
