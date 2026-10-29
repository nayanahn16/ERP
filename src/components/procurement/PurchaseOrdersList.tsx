import React, { useState, useMemo } from 'react';
import { 
  ShoppingCart, 
  Search, 
  Plus, 
  Download, 
  Filter, 
  Eye, 
  CheckCircle2, 
  Truck 
} from 'lucide-react';
import { PurchaseOrder, UserProfile, Vendor, InventoryItem } from '../../types';
import { StatusBadge } from '../common/StatusBadge';
import { CreatePOModal } from './CreatePOModal';
import { PODetailDrawer } from './PODetailDrawer';
import { formatINR } from '../../lib/gstService';
import { formatDate, exportToCSV } from '../../lib/utils';

interface PurchaseOrdersListProps {
  purchaseOrders: PurchaseOrder[];
  vendors: Vendor[];
  items: InventoryItem[];
  currentUser: UserProfile;
  onCreatePO: (poData: Partial<PurchaseOrder>) => Promise<PurchaseOrder>;
  onRecordGRN?: (po: PurchaseOrder) => void;
  initialSelectedPO?: PurchaseOrder | null;
}

export const PurchaseOrdersList: React.FC<PurchaseOrdersListProps> = ({
  purchaseOrders,
  vendors,
  items,
  currentUser,
  onCreatePO,
  onRecordGRN,
  initialSelectedPO
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [selectedPO, setSelectedPO] = useState<PurchaseOrder | null>(initialSelectedPO || null);
  const [isCreateOpen, setIsCreateOpen] = useState(false);

  const filteredPOs = useMemo(() => {
    return purchaseOrders.filter(po => {
      if (searchTerm) {
        const q = searchTerm.toLowerCase();
        const matches = po.poNumber.toLowerCase().includes(q) ||
          po.vendorName.toLowerCase().includes(q) ||
          po.vendorGstin.toLowerCase().includes(q);
        if (!matches) return false;
      }
      if (statusFilter !== 'ALL' && po.status !== statusFilter) {
        return false;
      }
      return true;
    });
  }, [purchaseOrders, searchTerm, statusFilter]);

  const handleExportCSV = () => {
    exportToCSV(
      'ForgeFlow_Purchase_Orders',
      filteredPOs,
      [
        { key: 'poNumber', label: 'PO Number' },
        { key: 'vendorName', label: 'Vendor' },
        { key: 'vendorGstin', label: 'Vendor GSTIN' },
        { key: 'warehouseName', label: 'Warehouse' },
        { key: 'orderDate', label: 'Order Date' },
        { key: 'expectedDeliveryDate', label: 'Delivery Date' },
        { key: 'paymentTerms', label: 'Payment Terms' },
        { key: 'status', label: 'Status' },
        { key: 'subtotal', label: 'Subtotal (INR)' },
        { key: 'grandTotal', label: 'Grand Total (INR)' }
      ]
    );
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-800">
        <div>
          <h1 className="text-xl font-bold text-white tracking-tight">Procurement & Purchase Order Operations</h1>
          <p className="text-xs text-slate-400 mt-1">
            End-to-end purchasing lifecycle with automated HSN tax calculations and delivery tracking.
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

          <button
            onClick={() => setIsCreateOpen(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-semibold shadow-sm transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Create New PO</span>
          </button>
        </div>
      </div>

      {/* Filter and Search */}
      <div className="p-4 bg-slate-900 border border-slate-800 rounded-xl flex flex-col md:flex-row items-center justify-between gap-3 text-xs">
        <div className="relative w-full md:w-96">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search PO#, vendor name, GSTIN..."
            className="w-full bg-slate-800 border border-slate-700 rounded-lg pl-9 pr-3 py-2 text-white placeholder-slate-400 focus:outline-none focus:border-blue-500"
          />
        </div>

        <div className="flex items-center gap-2 w-full md:w-auto">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-full md:w-48 bg-slate-800 border border-slate-700 rounded-lg p-2 text-white focus:outline-none focus:border-blue-500"
          >
            <option value="ALL">All PO Statuses</option>
            <option value="DRAFT">Draft</option>
            <option value="PENDING_APPROVAL">Pending Approval</option>
            <option value="APPROVED">Approved</option>
            <option value="PARTIALLY_RECEIVED">Partially Received</option>
            <option value="FULLY_RECEIVED">Fully Received</option>
            <option value="CLOSED">Closed</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-800 bg-slate-850/60 text-slate-400 font-semibold uppercase tracking-wider text-[11px]">
                <th className="py-3 px-4">PO Number</th>
                <th className="py-3 px-3">Vendor / Supplier</th>
                <th className="py-3 px-3">Destination</th>
                <th className="py-3 px-3">Order Date</th>
                <th className="py-3 px-3">Expected Delivery</th>
                <th className="py-3 px-3 text-right">Grand Total (INR)</th>
                <th className="py-3 px-3">Status</th>
                <th className="py-3 px-4 text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/80">
              {filteredPOs.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-slate-400">
                    No purchase orders match the selected filters.
                  </td>
                </tr>
              ) : (
                filteredPOs.map(po => {
                  const hasShortage = po.lines.some(l => l.outstandingQty > 0 && l.acceptedQty > 0);

                  return (
                    <tr
                      key={po.id}
                      onClick={() => setSelectedPO(po)}
                      className="hover:bg-slate-800/50 transition-colors group cursor-pointer"
                    >
                      <td className="py-3 px-4">
                        <div className="font-mono font-bold text-white group-hover:text-blue-400 transition-colors">
                          {po.poNumber}
                        </div>
                        <div className="text-[11px] text-slate-400">{po.lines.length} Line Item(s)</div>
                      </td>
                      <td className="py-3 px-3">
                        <div className="font-semibold text-white">{po.vendorName}</div>
                        <div className="text-slate-400 text-[10px] font-mono">{po.vendorGstin}</div>
                      </td>
                      <td className="py-3 px-3 text-slate-300">
                        {po.warehouseName.split(' ')[0]}
                      </td>
                      <td className="py-3 px-3 text-slate-300">{formatDate(po.orderDate)}</td>
                      <td className="py-3 px-3 text-slate-300">{formatDate(po.expectedDeliveryDate)}</td>
                      <td className="py-3 px-3 text-right font-bold text-white">
                        {formatINR(po.grandTotal)}
                      </td>
                      <td className="py-3 px-3">
                        <StatusBadge status={po.status} />
                        {hasShortage && (
                          <span className="block text-[10px] text-amber-400 font-semibold mt-0.5">
                            Shortage Retained
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-4 text-center" onClick={(e) => e.stopPropagation()}>
                        <button
                          onClick={() => setSelectedPO(po)}
                          className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white rounded-md transition-colors"
                          title="View PO details"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* PO Detail Drawer */}
      <PODetailDrawer
        po={selectedPO}
        onClose={() => setSelectedPO(null)}
        onRecordGRN={onRecordGRN}
        currentUser={currentUser}
      />

      {/* Create PO Modal */}
      <CreatePOModal
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        vendors={vendors}
        items={items}
        currentUser={currentUser}
        onCreatePO={onCreatePO}
      />
    </div>
  );
};
