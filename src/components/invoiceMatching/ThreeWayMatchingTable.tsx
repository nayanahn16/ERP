import React, { useState, useMemo } from 'react';
import { 
  FileCheck2, 
  Search, 
  Download, 
  ShieldAlert, 
  Lock, 
  CheckCircle2, 
  Eye, 
  Filter 
} from 'lucide-react';
import { 
  ThreeWayMatchResult, 
  PurchaseOrder, 
  GoodsReceiptNote, 
  VendorInvoice, 
  UserProfile 
} from '../../types';
import { StatusBadge } from '../common/StatusBadge';
import { MatchDetailModal } from './MatchDetailModal';
import { ExceptionResolutionModal } from './ExceptionResolutionModal';
import { formatDate, exportToCSV } from '../../lib/utils';

interface ThreeWayMatchingTableProps {
  matchResults: ThreeWayMatchResult[];
  purchaseOrders: PurchaseOrder[];
  goodsReceipts: GoodsReceiptNote[];
  invoices: VendorInvoice[];
  currentUser: UserProfile;
  onResolveMatch: (
    matchId: string,
    action: 'CREDIT_NOTE_REQUESTED' | 'OVERRIDDEN_APPROVED' | 'RESOLVED',
    notes: string
  ) => Promise<void>;
  initialSelectedMatch?: ThreeWayMatchResult | null;
}

export const ThreeWayMatchingTable: React.FC<ThreeWayMatchingTableProps> = ({
  matchResults,
  purchaseOrders,
  goodsReceipts,
  invoices,
  currentUser,
  onResolveMatch,
  initialSelectedMatch
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [selectedMatch, setSelectedMatch] = useState<ThreeWayMatchResult | null>(initialSelectedMatch || null);
  const [resolvingMatch, setResolvingMatch] = useState<ThreeWayMatchResult | null>(null);

  const poMap = useMemo(() => new Map(purchaseOrders.map(p => [p.id, p])), [purchaseOrders]);
  const grnMap = useMemo(() => new Map(goodsReceipts.map(g => [g.id, g])), [goodsReceipts]);
  const invoiceMap = useMemo(() => new Map(invoices.map(i => [i.id, i])), [invoices]);

  const filteredMatches = useMemo(() => {
    return matchResults.filter(match => {
      if (searchTerm) {
        const q = searchTerm.toLowerCase();
        const matches = match.invoiceNumber.toLowerCase().includes(q) ||
          match.poNumber.toLowerCase().includes(q) ||
          (match.grnNumber && match.grnNumber.toLowerCase().includes(q)) ||
          match.vendorName.toLowerCase().includes(q);
        if (!matches) return false;
      }
      if (statusFilter !== 'ALL') {
        if (statusFilter === 'DISCREPANCIES') {
          return match.matchStatus !== 'FULLY_MATCHED' && match.matchStatus !== 'MATCHED_WITHIN_TOLERANCE';
        }
        if (match.matchStatus !== statusFilter) return false;
      }
      return true;
    });
  }, [matchResults, searchTerm, statusFilter]);

  const handleExportCSV = () => {
    exportToCSV(
      'ForgeFlow_Three_Way_Reconciliation',
      filteredMatches,
      [
        { key: 'invoiceNumber', label: 'Invoice Number' },
        { key: 'poNumber', label: 'PO Number' },
        { key: 'grnNumber', label: 'GRN Number' },
        { key: 'vendorName', label: 'Vendor' },
        { key: 'matchStatus', label: 'Match Status' },
        { key: 'resolutionStatus', label: 'Resolution Status' },
        { 
          key: (m) => m.discrepancies.map(d => d.description).join('; ') || 'None', 
          label: 'Discrepancy Details' 
        },
        { key: 'performedAt', label: 'Reconciliation Timestamp' }
      ]
    );
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold text-white tracking-tight">Three-Way Matching Control: PO vs GRN vs Invoice</h1>
            <span className="px-2 py-0.5 rounded bg-rose-500/20 text-rose-400 border border-rose-500/30 text-[11px] font-bold">
              Automated Payment Gating
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Detects billed quantity vs accepted delivery shortages, pricing variations, and duplicate invoices.
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

      {/* Filter and Search */}
      <div className="p-4 bg-slate-900 border border-slate-800 rounded-xl flex flex-col md:flex-row items-center justify-between gap-3 text-xs">
        <div className="relative w-full md:w-96">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search Invoice#, PO#, GRN#, Vendor..."
            className="w-full bg-slate-800 border border-slate-700 rounded-lg pl-9 pr-3 py-2 text-white placeholder-slate-400 focus:outline-none focus:border-blue-500"
          />
        </div>

        <div className="flex items-center gap-2 w-full md:w-auto">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-full md:w-60 bg-slate-800 border border-slate-700 rounded-lg p-2 text-white focus:outline-none focus:border-blue-500"
          >
            <option value="ALL">All Match Records</option>
            <option value="DISCREPANCIES">All Exceptions / Discrepancies</option>
            <option value="FULLY_MATCHED">Fully Matched</option>
            <option value="QUANTITY_MISMATCH">Quantity Mismatch</option>
            <option value="PRICE_MISMATCH">Price Mismatch</option>
            <option value="TAX_MISMATCH">Tax Mismatch</option>
            <option value="MISSING_RECEIPT">Missing Receipt</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-800 bg-slate-850/60 text-slate-400 font-semibold uppercase tracking-wider text-[11px]">
                <th className="py-3 px-4">Invoice Reference</th>
                <th className="py-3 px-3">Contracted PO</th>
                <th className="py-3 px-3">Verified GRN</th>
                <th className="py-3 px-3">Supplier / Vendor</th>
                <th className="py-3 px-3">Match Status</th>
                <th className="py-3 px-3">Discrepancy Details</th>
                <th className="py-3 px-3">Payment Gate</th>
                <th className="py-3 px-4 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/80">
              {filteredMatches.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-slate-400">
                    No reconciliation records match the selected filters.
                  </td>
                </tr>
              ) : (
                filteredMatches.map(match => {
                  const inv = invoiceMap.get(match.invoiceId);
                  const isBlocked = inv?.paymentStatus === 'DISCREPANCY_HOLD';
                  const isApproved = inv?.paymentStatus === 'APPROVED_FOR_PAYMENT' || inv?.paymentStatus === 'PAID';

                  return (
                    <tr
                      key={match.id}
                      onClick={() => setSelectedMatch(match)}
                      className="hover:bg-slate-800/50 transition-colors group cursor-pointer"
                    >
                      <td className="py-3 px-4">
                        <div className="font-mono font-bold text-white group-hover:text-blue-400 transition-colors">
                          {match.invoiceNumber}
                        </div>
                        <div className="text-[11px] text-slate-400">₹{inv?.grandTotal.toLocaleString('en-IN')}</div>
                      </td>
                      <td className="py-3 px-3">
                        <span className="font-mono font-semibold text-blue-400">{match.poNumber}</span>
                      </td>
                      <td className="py-3 px-3">
                        <span className="font-mono font-semibold text-emerald-400">
                          {match.grnNumber || <span className="text-rose-400 font-sans">No GRN</span>}
                        </span>
                      </td>
                      <td className="py-3 px-3 text-slate-200 font-medium">
                        {match.vendorName}
                      </td>
                      <td className="py-3 px-3">
                        <StatusBadge status={match.matchStatus} />
                      </td>
                      <td className="py-3 px-3 max-w-xs">
                        {match.discrepancies.length > 0 ? (
                          <div className="text-rose-300 text-[11px] truncate" title={match.discrepancies[0].description}>
                            {match.discrepancies[0].description}
                          </div>
                        ) : (
                          <span className="text-emerald-400 text-[11px] flex items-center gap-1">
                            <CheckCircle2 className="w-3 h-3" />
                            <span>Quantities & prices match PO</span>
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-3">
                        {isBlocked ? (
                          <span className="inline-flex items-center gap-1 text-[11px] font-bold text-rose-400 bg-rose-500/10 px-2 py-0.5 rounded border border-rose-500/20">
                            <Lock className="w-3 h-3" />
                            <span>Hold Blocked</span>
                          </span>
                        ) : isApproved ? (
                          <span className="inline-flex items-center gap-1 text-[11px] font-medium text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                            <CheckCircle2 className="w-3 h-3" />
                            <span>Payment Ready</span>
                          </span>
                        ) : (
                          <span className="text-slate-400 text-[11px]">Awaiting match</span>
                        )}
                      </td>
                      <td className="py-3 px-4 text-center" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-center gap-1.5">
                          <button
                            onClick={() => setSelectedMatch(match)}
                            className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white rounded-md transition-colors"
                            title="Inspect 3-way match details"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </button>
                          {match.resolutionStatus === 'UNRESOLVED' && (
                            <button
                              onClick={() => setResolvingMatch(match)}
                              className="px-2 py-1 bg-rose-600 hover:bg-rose-500 text-white rounded text-[11px] font-medium transition-colors"
                              title="Resolve discrepancy / approve override"
                            >
                              Resolve
                            </button>
                          )}
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

      {/* Match Detail Modal */}
      <MatchDetailModal
        isOpen={!!selectedMatch}
        onClose={() => setSelectedMatch(null)}
        matchResult={selectedMatch}
        po={selectedMatch ? poMap.get(selectedMatch.poId) : undefined}
        grn={selectedMatch && selectedMatch.grnId ? grnMap.get(selectedMatch.grnId) : undefined}
        invoice={selectedMatch ? invoiceMap.get(selectedMatch.invoiceId) : undefined}
        onOpenResolution={(m) => {
          setSelectedMatch(null);
          setResolvingMatch(m);
        }}
        currentUser={currentUser}
      />

      {/* Exception Resolution Modal */}
      <ExceptionResolutionModal
        isOpen={!!resolvingMatch}
        onClose={() => setResolvingMatch(null)}
        matchResult={resolvingMatch}
        currentUser={currentUser}
        onResolve={onResolveMatch}
      />
    </div>
  );
};
