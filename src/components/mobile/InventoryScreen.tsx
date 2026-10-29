import React, { useState, useMemo } from 'react';
import { 
  Package, 
  Search, 
  Filter, 
  AlertTriangle, 
  CheckCircle2, 
  ChevronRight, 
  Zap, 
  ArrowUpDown,
  Boxes
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { InventoryRecord } from '../../types/dataset';
import { formatINR, formatCompactINR } from '../../utils/formatters';

export const InventoryScreen: React.FC = () => {
  const { filteredInventory, navigate, reorderInventoryItem, kpis } = useApp();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'LOW' | 'OK'>('ALL');
  const [categoryFilter, setCategoryFilter] = useState<string>('ALL');

  // Distinct materials/categories
  const categories = useMemo(() => {
    const set = new Set<string>();
    filteredInventory.forEach(i => set.add(i.material_name));
    return ['ALL', ...Array.from(set)];
  }, [filteredInventory]);

  const items = useMemo(() => {
    return filteredInventory.filter(item => {
      const q = search.toLowerCase();
      const matchSearch = 
        item.material_name.toLowerCase().includes(q) || 
        item.material_id.toLowerCase().includes(q) ||
        item.manufacturer_id.toLowerCase().includes(q);

      if (!matchSearch) return false;

      if (statusFilter === 'LOW') {
        if (item.stock_status !== 'LOW STOCK' && item.closing_stock_qty > item.reorder_level_qty) return false;
      }
      if (statusFilter === 'OK') {
        if (item.stock_status === 'LOW STOCK' || item.closing_stock_qty <= item.reorder_level_qty) return false;
      }

      if (categoryFilter !== 'ALL' && item.material_name !== categoryFilter) {
        return false;
      }

      return true;
    });
  }, [filteredInventory, search, statusFilter, categoryFilter]);

  return (
    <div className="space-y-3.5 pb-20 text-slate-800">
      {/* Search Input Bar (White Background) */}
      <div className="relative">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search materials, RM code, or manufacturer..."
          className="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-white border border-slate-200 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:border-teal-500 transition-colors shadow-xs"
        />
        {search && (
          <button 
            onClick={() => setSearch('')}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-500 hover:text-slate-800 px-1.5 py-0.5 rounded-md bg-slate-100"
          >
            Clear
          </button>
        )}
      </div>

      {/* Summary KPI Ribbon (White Card, Teal Highlights) */}
      <div className="grid grid-cols-3 gap-2 text-center bg-white p-3 rounded-2xl border border-slate-200 shadow-xs">
        <div>
          <div className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Total SKUs</div>
          <div className="text-sm font-black text-slate-900 mt-0.5">{filteredInventory.length}</div>
        </div>
        <div>
          <div className="text-[10px] text-rose-600 font-bold uppercase tracking-wider">Low Stock</div>
          <div className="text-sm font-black text-rose-600 mt-0.5">{kpis.lowStockCount}</div>
        </div>
        <div>
          <div className="text-[10px] text-teal-700 font-bold uppercase tracking-wider">Asset Value</div>
          <div className="text-sm font-black text-teal-700 mt-0.5">{formatCompactINR(kpis.stockValuation)}</div>
        </div>
      </div>

      {/* Filter Chips */}
      <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-1">
        <button
          onClick={() => setStatusFilter('ALL')}
          className={`shrink-0 text-xs px-3 py-1.5 rounded-xl font-medium transition-all ${
            statusFilter === 'ALL'
              ? 'bg-teal-600 text-white font-bold shadow-md shadow-teal-600/25'
              : 'bg-white text-slate-600 hover:text-slate-900 border border-slate-200'
          }`}
        >
          All Items ({filteredInventory.length})
        </button>

        <button
          onClick={() => setStatusFilter('LOW')}
          className={`shrink-0 text-xs px-3 py-1.5 rounded-xl font-medium transition-all flex items-center gap-1 ${
            statusFilter === 'LOW'
              ? 'bg-rose-600 text-white font-bold shadow-md shadow-rose-600/25'
              : 'bg-white text-rose-700 hover:bg-rose-50 border border-rose-200'
          }`}
        >
          <AlertTriangle className="w-3 h-3" />
          <span>Low Stock ({kpis.lowStockCount})</span>
        </button>

        <button
          onClick={() => setStatusFilter('OK')}
          className={`shrink-0 text-xs px-3 py-1.5 rounded-xl font-medium transition-all flex items-center gap-1 ${
            statusFilter === 'OK'
              ? 'bg-emerald-600 text-white font-bold shadow-md shadow-emerald-600/25'
              : 'bg-white text-emerald-700 hover:bg-emerald-50 border border-slate-200'
          }`}
        >
          <CheckCircle2 className="w-3 h-3" />
          <span>OK</span>
        </button>
      </div>

      {/* Inventory Items List (Crisp White Cards) */}
      <div className="space-y-2.5">
        {items.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-3xl border border-slate-200 p-6 shadow-xs">
            <Boxes className="w-10 h-10 text-slate-400 mx-auto mb-2" />
            <h4 className="text-sm font-bold text-slate-700">No Inventory Items Found</h4>
            <p className="text-xs text-slate-500 mt-1">Try adjusting your search query or filters.</p>
          </div>
        ) : (
          items.map((item) => {
            const isLow = item.stock_status === 'LOW STOCK' || item.closing_stock_qty <= item.reorder_level_qty;
            const percentage = Math.min(100, Math.round((item.closing_stock_qty / (item.reorder_level_qty * 1.8 || 1)) * 100));

            return (
              <div
                key={item.inventory_record_id}
                className="bg-white hover:bg-teal-50/20 border border-slate-200 hover:border-teal-300 rounded-2xl p-3.5 transition-all shadow-xs"
              >
                <div className="flex items-start justify-between gap-3">
                  <div 
                    onClick={() => navigate('inventory-detail', { itemId: item.inventory_record_id })}
                    className="min-w-0 cursor-pointer flex-1"
                  >
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="text-sm font-bold text-slate-900 tracking-tight">
                        {item.material_name}
                      </span>
                      <span className="text-[10px] font-semibold px-1.5 py-0.2 rounded bg-slate-100 text-slate-700 border border-slate-200 font-mono">
                        {item.material_id}
                      </span>
                      <span className="text-[10px] font-semibold text-slate-400">
                        {item.manufacturer_id}
                      </span>
                    </div>

                    {/* Stock vs Threshold Progress Bar */}
                    <div className="mt-2.5">
                      <div className="flex items-center justify-between text-[11px] mb-1">
                        <span className="text-slate-500">
                          Current: <strong className={isLow ? 'text-rose-600 font-bold' : 'text-slate-800'}>{item.closing_stock_qty} {item.unit}</strong>
                        </span>
                        <span className="text-slate-500">
                          Min Reorder: <strong className="text-slate-700">{item.reorder_level_qty} {item.unit}</strong>
                        </span>
                      </div>
                      <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden border border-slate-200/60">
                        <div 
                          className={`h-full rounded-full transition-all duration-300 ${
                            isLow ? 'bg-rose-500' : percentage < 60 ? 'bg-amber-400' : 'bg-teal-500'
                          }`}
                          style={{ width: `${Math.max(6, percentage)}%` }}
                        />
                      </div>
                    </div>

                    {/* Cost & Valuation */}
                    <div className="flex items-center justify-between text-[11px] text-slate-500 mt-2">
                      <span>Rate: {formatINR(item.average_unit_cost_inr)} / {item.unit}</span>
                      <span className="font-bold text-slate-800">Value: {formatINR(item.closing_stock_value_inr)}</span>
                    </div>
                  </div>

                  {/* Right Status & Reorder Action */}
                  <div className="flex flex-col items-end gap-2 shrink-0">
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      isLow 
                        ? 'bg-rose-50 text-rose-700 border border-rose-200' 
                        : 'bg-teal-50 text-teal-700 border border-teal-200'
                    }`}>
                      {item.stock_status}
                    </span>

                    {isLow ? (
                      <button
                        onClick={() => reorderInventoryItem(item, Math.max(100, item.reorder_level_qty * 2 - item.closing_stock_qty))}
                        className="text-[11px] font-bold bg-teal-600 hover:bg-teal-500 text-white px-2.5 py-1 rounded-xl shadow-md shadow-teal-600/20 flex items-center gap-1 transition-all"
                      >
                        <Zap className="w-3 h-3 text-yellow-300 fill-yellow-300" />
                        <span>Reorder</span>
                      </button>
                    ) : (
                      <button
                        onClick={() => navigate('inventory-detail', { itemId: item.inventory_record_id })}
                        className="text-slate-400 hover:text-slate-800 p-1 rounded-lg hover:bg-slate-100 transition-colors"
                      >
                        <ChevronRight className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
