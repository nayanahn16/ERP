import React, { useState, useMemo } from 'react';
import { 
  Boxes, 
  Search, 
  Filter, 
  ArrowLeftRight, 
  Download, 
  AlertTriangle, 
  CheckCircle2, 
  ExternalLink,
  Plus
} from 'lucide-react';
import { InventoryItem, StockHealthStatus, UserProfile } from '../../types';
import { StatusBadge } from '../common/StatusBadge';
import { ItemDetailDrawer } from './ItemDetailDrawer';
import { WarehouseTransferModal } from './WarehouseTransferModal';
import { WAREHOUSES } from '../../lib/constants';
import { formatINR } from '../../lib/gstService';
import { exportToCSV } from '../../lib/utils';

interface InventoryListProps {
  items: InventoryItem[];
  selectedWarehouseId: string;
  onSelectWarehouse: (whId: string) => void;
  onTransferStock: (itemId: string, fromWhId: string, toWhId: string, qty: number, notes?: string) => Promise<void>;
  currentUser: UserProfile;
  initialSelectedItem?: InventoryItem | null;
}

export const InventoryList: React.FC<InventoryListProps> = ({
  items,
  selectedWarehouseId,
  onSelectWarehouse,
  onTransferStock,
  currentUser,
  initialSelectedItem
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [selectedItem, setSelectedItem] = useState<InventoryItem | null>(initialSelectedItem || null);
  const [transferItem, setTransferItem] = useState<InventoryItem | null>(null);

  // Extract unique categories
  const categories = useMemo(() => {
    return Array.from(new Set(items.map(i => i.category))).sort();
  }, [items]);

  // Filtered Items
  const filteredItems = useMemo(() => {
    return items.filter(item => {
      // 1. Warehouse filter
      if (selectedWarehouseId !== 'ALL' && !item.balances[selectedWarehouseId]) {
        return false;
      }

      // 2. Search
      if (searchTerm) {
        const q = searchTerm.toLowerCase();
        const matches = item.name.toLowerCase().includes(q) ||
          item.sku.toLowerCase().includes(q) ||
          item.hsnCode.includes(q);
        if (!matches) return false;
      }

      // 3. Category
      if (categoryFilter !== 'ALL' && item.category !== categoryFilter) {
        return false;
      }

      // 4. Status
      if (statusFilter !== 'ALL') {
        const itemStatus = selectedWarehouseId === 'ALL'
          ? item.overallStatus
          : item.balances[selectedWarehouseId]?.stockStatus;
        if (itemStatus !== statusFilter) return false;
      }

      return true;
    });
  }, [items, selectedWarehouseId, searchTerm, categoryFilter, statusFilter]);

  // CSV Export
  const handleExportCSV = () => {
    exportToCSV(
      `ForgeFlow_Inventory_${selectedWarehouseId}`,
      filteredItems,
      [
        { key: 'sku', label: 'SKU' },
        { key: 'name', label: 'Item Name' },
        { key: 'category', label: 'Category' },
        { key: 'hsnCode', label: 'HSN Code' },
        { key: 'uom', label: 'Unit' },
        { 
          key: (i) => selectedWarehouseId === 'ALL' ? i.totalAvailableQty : (i.balances[selectedWarehouseId]?.availableQty || 0),
          label: 'Available Quantity' 
        },
        { 
          key: (i) => selectedWarehouseId === 'ALL' ? '-' : (i.balances[selectedWarehouseId]?.minThreshold || 0),
          label: 'Min Threshold' 
        },
        { 
          key: (i) => selectedWarehouseId === 'ALL' ? i.overallStatus : (i.balances[selectedWarehouseId]?.stockStatus || 'UNKNOWN'),
          label: 'Stock Status' 
        },
        { key: 'standardCost', label: 'Standard Cost (INR)' },
        { 
          key: (i) => {
            const qty = selectedWarehouseId === 'ALL' ? i.totalCurrentQty : (i.balances[selectedWarehouseId]?.currentQty || 0);
            return (qty * i.standardCost).toFixed(2);
          },
          label: 'Total Value (INR)' 
        }
      ]
    );
  };

  return (
    <div className="space-y-4">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-800">
        <div>
          <h1 className="text-xl font-bold text-white tracking-tight">Inventory Intelligence & Warehouse Control</h1>
          <p className="text-xs text-slate-400 mt-1">
            Real-time material tracking across Peenya Central Warehouse and Belagavi Industrial Estate.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleExportCSV}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-lg text-xs font-medium transition-colors"
          >
            <Download className="w-3.5 h-3.5 text-blue-400" />
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="p-4 bg-slate-900 border border-slate-800 rounded-xl space-y-3">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3 text-xs">
          {/* Search */}
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search SKU, name, HSN..."
              className="w-full bg-slate-800 border border-slate-700 rounded-lg pl-9 pr-3 py-2 text-white placeholder-slate-400 focus:outline-none focus:border-blue-500"
            />
          </div>

          {/* Warehouse */}
          <div>
            <select
              value={selectedWarehouseId}
              onChange={(e) => onSelectWarehouse(e.target.value)}
              className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-white focus:outline-none focus:border-blue-500"
            >
              <option value="ALL">All Warehouses (Consolidated)</option>
              {WAREHOUSES.map(w => (
                <option key={w.id} value={w.id}>{w.name}</option>
              ))}
            </select>
          </div>

          {/* Category */}
          <div>
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-white focus:outline-none focus:border-blue-500"
            >
              <option value="ALL">All Categories ({categories.length})</option>
              {categories.map(c => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>

          {/* Status */}
          <div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-white focus:outline-none focus:border-blue-500"
            >
              <option value="ALL">All Stock Statuses</option>
              <option value="HEALTHY">Healthy</option>
              <option value="APPROACHING_THRESHOLD">Approaching Threshold</option>
              <option value="REORDER_REQUIRED">Reorder Required</option>
              <option value="CRITICAL_SHORTAGE">Critical Shortage</option>
              <option value="OUT_OF_STOCK">Out of Stock</option>
            </select>
          </div>
        </div>

        <div className="flex items-center justify-between text-xs text-slate-400 pt-1">
          <span>Showing <strong>{filteredItems.length}</strong> of {items.length} items</span>
          {(searchTerm || categoryFilter !== 'ALL' || statusFilter !== 'ALL') && (
            <button
              onClick={() => { setSearchTerm(''); setCategoryFilter('ALL'); setStatusFilter('ALL'); }}
              className="text-blue-400 hover:text-blue-300 text-xs font-medium"
            >
              Clear filters
            </button>
          )}
        </div>
      </div>

      {/* Items Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-800 bg-slate-850/60 text-slate-400 font-semibold uppercase tracking-wider text-[11px]">
                <th className="py-3 px-4">SKU / Item Name</th>
                <th className="py-3 px-3">Category</th>
                <th className="py-3 px-3">HSN Code</th>
                <th className="py-3 px-3 text-right">Available Qty</th>
                <th className="py-3 px-3 text-right">Min Threshold</th>
                <th className="py-3 px-3">Status</th>
                <th className="py-3 px-3 text-right">Unit Cost</th>
                <th className="py-3 px-3 text-right">Valuation</th>
                <th className="py-3 px-4 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/80">
              {filteredItems.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-8 text-center text-slate-400">
                    No inventory records match the selected filters.
                  </td>
                </tr>
              ) : (
                filteredItems.map(item => {
                  const bal = selectedWarehouseId === 'ALL' ? null : item.balances[selectedWarehouseId];
                  const avail = bal ? bal.availableQty : item.totalAvailableQty;
                  const threshold = bal ? bal.minThreshold : Math.round(Object.values(item.balances).reduce((s, b) => s + b.minThreshold, 0));
                  const status = bal ? bal.stockStatus : item.overallStatus;
                  const totalVal = (bal ? bal.currentQty : item.totalCurrentQty) * item.standardCost;

                  return (
                    <tr 
                      key={item.id} 
                      className="hover:bg-slate-800/50 transition-colors group cursor-pointer"
                      onClick={() => setSelectedItem(item)}
                    >
                      <td className="py-3 px-4">
                        <div className="font-semibold text-white group-hover:text-blue-400 transition-colors">
                          {item.name}
                        </div>
                        <div className="font-mono text-[11px] text-slate-400">{item.sku}</div>
                      </td>
                      <td className="py-3 px-3 text-slate-300">{item.category}</td>
                      <td className="py-3 px-3 font-mono text-slate-400 text-[11px]">{item.hsnCode}</td>
                      <td className="py-3 px-3 text-right font-bold text-white">
                        {avail} <span className="font-normal text-slate-400 text-[10px]">{item.uom}</span>
                      </td>
                      <td className="py-3 px-3 text-right text-slate-400">
                        {threshold} {item.uom}
                      </td>
                      <td className="py-3 px-3">
                        <StatusBadge status={status} />
                      </td>
                      <td className="py-3 px-3 text-right text-slate-300">
                        ₹{item.standardCost.toFixed(2)}
                      </td>
                      <td className="py-3 px-3 text-right font-semibold text-slate-200">
                        {formatINR(totalVal)}
                      </td>
                      <td className="py-3 px-4 text-center" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-center gap-1.5">
                          <button
                            onClick={() => setTransferItem(item)}
                            className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white rounded-md transition-colors"
                            title="Transfer between warehouses"
                          >
                            <ArrowLeftRight className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => setSelectedItem(item)}
                            className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white rounded-md transition-colors"
                            title="View stock intelligence details"
                          >
                            <ExternalLink className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Item Detail Drawer */}
      <ItemDetailDrawer
        item={selectedItem}
        onClose={() => setSelectedItem(null)}
        onOpenTransfer={(it) => {
          setSelectedItem(null);
          setTransferItem(it);
        }}
        currentUser={currentUser}
      />

      {/* Warehouse Transfer Modal */}
      <WarehouseTransferModal
        isOpen={!!transferItem}
        onClose={() => setTransferItem(null)}
        item={transferItem}
        onTransfer={onTransferStock}
        currentUser={currentUser}
      />
    </div>
  );
};
