import React, { useState, useMemo } from 'react';
import { 
  Truck, 
  Search, 
  Plus, 
  Download, 
  Eye, 
  AlertTriangle, 
  CheckCircle2 
} from 'lucide-react';
import { GoodsReceiptNote, PurchaseOrder, UserProfile } from '../../types';
import { StatusBadge } from '../common/StatusBadge';
import { RecordGRNModal } from './RecordGRNModal';
import { GRNDetailDrawer } from './GRNDetailDrawer';
import { formatDate, exportToCSV } from '../../lib/utils';

interface GoodsReceiptListProps {
  goodsReceipts: GoodsReceiptNote[];
  purchaseOrders: PurchaseOrder[];
  currentUser: UserProfile;
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
  initialSelectedGRN?: GoodsReceiptNote | null;
  preSelectedPOForGRN?: PurchaseOrder | null;
}

export const GoodsReceiptList: React.FC<GoodsReceiptListProps> = ({
  goodsReceipts,
  purchaseOrders,
  currentUser,
  onRecordGRN,
  initialSelectedGRN,
  preSelectedPOForGRN
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [selectedGRN, setSelectedGRN] = useState<GoodsReceiptNote | null>(initialSelectedGRN || null);
  const [isRecordModalOpen, setIsRecordModalOpen] = useState(!!preSelectedPOForGRN);

  const openPOs = useMemo(() => {
    return purchaseOrders.filter(p => ['APPROVED', 'SENT_TO_VENDOR', 'PARTIALLY_RECEIVED'].includes(p.status));
  }, [purchaseOrders]);

  const filteredGRNs = useMemo(() => {
    return goodsReceipts.filter(grn => {
      if (searchTerm) {
        const q = searchTerm.toLowerCase();
        const matches = grn.grnNumber.toLowerCase().includes(q) ||
          grn.poNumber.toLowerCase().includes(q) ||
          grn.vendorName.toLowerCase().includes(q) ||
          grn.deliveryChallanNo.toLowerCase().includes(q);
        if (!matches) return false;
      }
      if (statusFilter !== 'ALL' && grn.status !== statusFilter) {
        return false;
      }
      return true;
    });
  }, [goodsReceipts, searchTerm, statusFilter]);

  const handleExportCSV = () => {
    exportToCSV(
      'ForgeFlow_Goods_Receipts',
      filteredGRNs,
      [
        { key: 'grnNumber', label: 'GRN Number' },
        { key: 'poNumber', label: 'PO Number' },
        { key: 'vendorName', label: 'Vendor' },
        { key: 'warehouseName', label: 'Warehouse' },
        { key: 'receiptDate', label: 'Receipt Date' },
        { key: 'deliveryChallanNo', label: 'Delivery Challan No' },
        { key: 'receiverName', label: 'Receiver Inspector' },
        { key: 'totalOrderedQty', label: 'Total Ordered Qty' },
        { key: 'totalDeliveredQty', label: 'Total Delivered Qty' },
        { key: 'totalAcceptedQty', label: 'Total Accepted Qty' },
        { key: 'totalRejectedQty', label: 'Total Rejected Qty' },
        { key: 'status', label: 'Status' }
      ]
    );
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-800">
        <div>
          <h1 className="text-xl font-bold text-white tracking-tight">Goods Receipt & Quantity Reconciliation</h1>
          <p className="text-xs text-slate-400 mt-1">
            Physical receipt verification against POs, shortage retention, and usable stock updates.
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
            onClick={() => setIsRecordModalOpen(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-semibold shadow-sm transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Record Goods Receipt (GRN)</span>
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
            placeholder="Search GRN#, PO#, Vendor, Challan No..."
            className="w-full bg-slate-800 border border-slate-700 rounded-lg pl-9 pr-3 py-2 text-white placeholder-slate-400 focus:outline-none focus:border-blue-500"
          />
        </div>

        <div className="flex items-center gap-2 w-full md:w-auto">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-full md:w-48 bg-slate-800 border border-slate-700 rounded-lg p-2 text-white focus:outline-none focus:border-blue-500"
          >
            <option value="ALL">All GRN Statuses</option>
            <option value="RECEIVED_VERIFIED">Received & Verified</option>
            <option value="SHORTAGE_FLAGGED">Shortage Flagged</option>
            <option value="DAMAGED_ITEMS">Damaged Items</option>
            <option value="EXCESS_FLAGGED">Excess Flagged</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-800 bg-slate-850/60 text-slate-400 font-semibold uppercase tracking-wider text-[11px]">
                <th className="py-3 px-4">GRN Number</th>
                <th className="py-3 px-3">PO Reference</th>
                <th className="py-3 px-3">Supplier / Vendor</th>
                <th className="py-3 px-3">Receipt Date</th>
                <th className="py-3 px-3">Challan No</th>
                <th className="py-3 px-3 text-right">Delivered / Accepted</th>
                <th className="py-3 px-3">Status</th>
                <th className="py-3 px-4 text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/80">
              {filteredGRNs.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-slate-400">
                    No goods receipts match the selected filters.
                  </td>
                </tr>
              ) : (
                filteredGRNs.map(grn => (
                  <tr
                    key={grn.id}
                    onClick={() => setSelectedGRN(grn)}
                    className="hover:bg-slate-800/50 transition-colors group cursor-pointer"
                  >
                    <td className="py-3 px-4">
                      <div className="font-mono font-bold text-white group-hover:text-blue-400 transition-colors">
                        {grn.grnNumber}
                      </div>
                      <div className="text-[11px] text-slate-400">{grn.warehouseName.split(' ')[0]}</div>
                    </td>
                    <td className="py-3 px-3">
                      <span className="font-mono font-semibold text-blue-400">{grn.poNumber}</span>
                    </td>
                    <td className="py-3 px-3">
                      <div className="font-semibold text-white">{grn.vendorName}</div>
                    </td>
                    <td className="py-3 px-3 text-slate-300">{formatDate(grn.receiptDate)}</td>
                    <td className="py-3 px-3 font-mono text-slate-300">{grn.deliveryChallanNo}</td>
                    <td className="py-3 px-3 text-right">
                      <div className="font-bold text-emerald-400">
                        {grn.totalAcceptedQty} accepted
                      </div>
                      <div className="text-[10px] text-slate-400">
                        of {grn.totalOrderedQty} ordered ({grn.totalDeliveredQty} delivered)
                      </div>
                    </td>
                    <td className="py-3 px-3">
                      <StatusBadge status={grn.status} />
                    </td>
                    <td className="py-3 px-4 text-center" onClick={(e) => e.stopPropagation()}>
                      <button
                        onClick={() => setSelectedGRN(grn)}
                        className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white rounded-md transition-colors"
                        title="View GRN inspection breakdown"
                      >
                        <Eye className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* GRN Detail Drawer */}
      <GRNDetailDrawer
        grn={selectedGRN}
        onClose={() => setSelectedGRN(null)}
      />

      {/* Record GRN Modal */}
      <RecordGRNModal
        isOpen={isRecordModalOpen}
        onClose={() => setIsRecordModalOpen(false)}
        openPurchaseOrders={openPOs}
        preSelectedPO={preSelectedPOForGRN}
        onRecordGRN={onRecordGRN}
        currentUser={currentUser}
      />
    </div>
  );
};
