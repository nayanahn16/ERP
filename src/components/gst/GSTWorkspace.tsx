import React, { useState, useMemo } from 'react';
import { 
  Receipt, 
  Search, 
  Download, 
  CheckCircle2, 
  AlertTriangle, 
  ShieldAlert, 
  Info,
  Calendar,
  FileCheck
} from 'lucide-react';
import { GSTReconciliationRecord, UserProfile } from '../../types';
import { StatusBadge } from '../common/StatusBadge';
import { BUYER_COMPANY } from '../../lib/constants';
import { formatINR, isValidGSTIN } from '../../lib/gstService';
import { formatDate, exportToCSV } from '../../lib/utils';

interface GSTWorkspaceProps {
  gstRecords: GSTReconciliationRecord[];
  currentUser: UserProfile;
  initialSelectedRecord?: GSTReconciliationRecord | null;
}

export const GSTWorkspace: React.FC<GSTWorkspaceProps> = ({
  gstRecords,
  currentUser,
  initialSelectedRecord
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [periodFilter, setPeriodFilter] = useState('2026-10');
  const [selectedRecord, setSelectedRecord] = useState<GSTReconciliationRecord | null>(initialSelectedRecord || null);

  // Period calculations
  const totalTaxable = gstRecords.reduce((sum, r) => sum + r.taxableValue, 0);
  const totalCalculatedTax = gstRecords.reduce((sum, r) => sum + r.calculatedTotalTax, 0);
  const totalClaimableITC = gstRecords.reduce((sum, r) => sum + r.itcClaimableAmount, 0);
  const itcAtRisk = Math.max(0, totalCalculatedTax - totalClaimableITC);

  const filteredRecords = useMemo(() => {
    return gstRecords.filter(r => {
      if (searchTerm) {
        const q = searchTerm.toLowerCase();
        const matches = r.invoiceNumber.toLowerCase().includes(q) ||
          r.vendorName.toLowerCase().includes(q) ||
          r.vendorGstin.toLowerCase().includes(q) ||
          r.hsnCode.includes(q);
        if (!matches) return false;
      }
      if (statusFilter !== 'ALL') {
        if (statusFilter === 'DISCREPANCIES') {
          return r.reconciliationStatus !== 'RECONCILED' || r.itcEligibility !== 'ELIGIBLE_VERIFIED';
        }
        if (r.reconciliationStatus !== statusFilter) return false;
      }
      return true;
    });
  }, [gstRecords, searchTerm, statusFilter]);

  const handleExportCSV = () => {
    exportToCSV(
      'ForgeFlow_GSTR2B_ITC_Reconciliation',
      filteredRecords,
      [
        { key: 'period', label: 'Tax Period' },
        { key: 'invoiceNumber', label: 'Invoice Number' },
        { key: 'invoiceDate', label: 'Invoice Date' },
        { key: 'vendorName', label: 'Vendor Legal Name' },
        { key: 'vendorGstin', label: 'Vendor GSTIN' },
        { key: 'posState', label: 'Place of Supply' },
        { key: (r) => r.isInterState ? 'Inter-State (IGST)' : 'Intra-State (CGST+SGST)', label: 'Tax Supply Type' },
        { key: 'hsnCode', label: 'HSN Code' },
        { key: 'taxableValue', label: 'Taxable Value (INR)' },
        { key: 'calculatedCGST', label: 'CGST (INR)' },
        { key: 'calculatedSGST', label: 'SGST (INR)' },
        { key: 'calculatedIGST', label: 'IGST (INR)' },
        { key: 'calculatedTotalTax', label: 'Invoice Total Tax (INR)' },
        { key: (r) => r.gstr2bReportedTotalTax || 0, label: 'GSTR-2B Reported Tax (INR)' },
        { key: 'reconciliationStatus', label: 'Reconciliation Status' },
        { key: 'itcEligibility', label: 'ITC Eligibility Status' },
        { key: 'itcClaimableAmount', label: 'ITC Claimable (INR)' }
      ]
    );
  };

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold text-white tracking-tight">GST & Input Tax Credit (ITC) Reconciliation Tower</h1>
            <span className="px-2 py-0.5 rounded bg-purple-500/20 text-purple-400 border border-purple-500/30 text-[11px] font-bold">
              GSTR-2B vs Books
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Automated tax calculation, place of supply verification (Karnataka 29), and ITC claim protection.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleExportCSV}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-lg text-xs font-medium transition-colors"
          >
            <Download className="w-3.5 h-3.5 text-blue-400" />
            <span>Export GSTR-2B Match Report (CSV)</span>
          </button>
        </div>
      </div>

      {/* Tax Position Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
        <div className="p-4 bg-slate-900 border border-slate-800 rounded-xl space-y-1">
          <span className="text-slate-400 block text-[11px]">Period Taxable Inward Supplies</span>
          <div className="text-xl font-bold text-white font-mono">{formatINR(totalTaxable)}</div>
          <span className="text-[10px] text-slate-400">October 2026 Inward Register</span>
        </div>

        <div className="p-4 bg-slate-900 border border-slate-800 rounded-xl space-y-1">
          <span className="text-slate-400 block text-[11px]">Total Invoiced Tax (Books)</span>
          <div className="text-xl font-bold text-blue-400 font-mono">{formatINR(totalCalculatedTax)}</div>
          <span className="text-[10px] text-slate-400">CGST + SGST + IGST calculated</span>
        </div>

        <div className="p-4 bg-slate-900 border border-slate-800 rounded-xl space-y-1">
          <span className="text-slate-400 block text-[11px]">Eligible ITC Claimable</span>
          <div className="text-xl font-bold text-emerald-400 font-mono">{formatINR(totalClaimableITC)}</div>
          <span className="text-[10px] text-emerald-400 font-medium">Matched & Verified in GSTR-2B</span>
        </div>

        <div className="p-4 bg-slate-900 border border-slate-800 rounded-xl space-y-1">
          <span className="text-slate-400 block text-[11px]">ITC At Risk (Restricted)</span>
          <div className="text-xl font-bold text-rose-400 font-mono">{formatINR(itcAtRisk)}</div>
          <span className="text-[10px] text-rose-400 font-medium">Pending Vendor Filing Amendment</span>
        </div>
      </div>

      {/* Statutory Compliance Notice */}
      <div className="p-3 bg-blue-950/20 border border-blue-900/40 rounded-xl text-slate-300 text-xs flex items-start gap-2.5">
        <Info className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" />
        <p className="text-[11px] leading-relaxed">
          <strong>Karnataka GST Compliance Rules:</strong> Intra-state purchases within Karnataka (State code 29) calculate 50% CGST + 50% SGST. Inter-state inward shipments calculate 100% IGST. ITC eligibility requires 3-way matching clearance and appearance in supplier's GSTR-1 / GSTR-2B.
        </p>
      </div>

      {/* Filter and Search */}
      <div className="p-4 bg-slate-900 border border-slate-800 rounded-xl flex flex-col md:flex-row items-center justify-between gap-3 text-xs">
        <div className="relative w-full md:w-96">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search Invoice#, Vendor, GSTIN, HSN..."
            className="w-full bg-slate-800 border border-slate-700 rounded-lg pl-9 pr-3 py-2 text-white placeholder-slate-400 focus:outline-none focus:border-blue-500"
          />
        </div>

        <div className="flex items-center gap-2 w-full md:w-auto">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-full md:w-60 bg-slate-800 border border-slate-700 rounded-lg p-2 text-white focus:outline-none focus:border-blue-500"
          >
            <option value="ALL">All GST Records</option>
            <option value="DISCREPANCIES">ITC Variances & Exceptions Only</option>
            <option value="RECONCILED">Reconciled Clean</option>
            <option value="AMOUNT_MISMATCH">Amount Mismatch with 2B</option>
          </select>
        </div>
      </div>

      {/* GST Records Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-800 bg-slate-850/60 text-slate-400 font-semibold uppercase tracking-wider text-[11px]">
                <th className="py-3 px-4">Invoice / Period</th>
                <th className="py-3 px-3">Supplier Legal Name</th>
                <th className="py-3 px-3">Vendor GSTIN</th>
                <th className="py-3 px-3">Tax Treatment</th>
                <th className="py-3 px-3 text-right">Taxable Value</th>
                <th className="py-3 px-3 text-right">Books Tax</th>
                <th className="py-3 px-3 text-right">2B Reported Tax</th>
                <th className="py-3 px-3">Reconciliation</th>
                <th className="py-3 px-3">ITC Eligibility</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/80">
              {filteredRecords.map(rec => {
                const isGstinValid = isValidGSTIN(rec.vendorGstin);
                const hasVariance = (rec.gstr2bReportedTotalTax !== undefined) && Math.abs(rec.calculatedTotalTax - rec.gstr2bReportedTotalTax) > 5;

                return (
                  <tr
                    key={rec.id}
                    onClick={() => setSelectedRecord(rec)}
                    className="hover:bg-slate-800/50 transition-colors group cursor-pointer"
                  >
                    <td className="py-3 px-4">
                      <div className="font-mono font-bold text-white group-hover:text-blue-400 transition-colors">
                        {rec.invoiceNumber}
                      </div>
                      <div className="text-[11px] text-slate-400">{rec.period} • {formatDate(rec.invoiceDate)}</div>
                    </td>
                    <td className="py-3 px-3">
                      <div className="font-semibold text-white">{rec.vendorName}</div>
                      <div className="text-[11px] text-slate-400">HSN: {rec.hsnCode}</div>
                    </td>
                    <td className="py-3 px-3">
                      <div className="font-mono font-medium text-slate-200">{rec.vendorGstin}</div>
                      {!isGstinValid && (
                        <span className="text-[10px] text-rose-400 font-semibold">Invalid Format</span>
                      )}
                    </td>
                    <td className="py-3 px-3">
                      {rec.isInterState ? (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-purple-500/10 text-purple-400 border border-purple-500/20">
                          IGST (Inter-State)
                        </span>
                      ) : (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-blue-500/10 text-blue-400 border border-blue-500/20">
                          CGST + SGST (KA)
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-3 text-right text-slate-200 font-mono">
                      {formatINR(rec.taxableValue)}
                    </td>
                    <td className="py-3 px-3 text-right text-white font-mono font-bold">
                      {formatINR(rec.calculatedTotalTax)}
                    </td>
                    <td className="py-3 px-3 text-right font-mono">
                      {rec.gstr2bReportedTotalTax !== undefined ? (
                        <span className={hasVariance ? 'text-rose-400 font-bold' : 'text-emerald-400 font-semibold'}>
                          {formatINR(rec.gstr2bReportedTotalTax)}
                        </span>
                      ) : (
                        <span className="text-slate-400">Pending 2B</span>
                      )}
                    </td>
                    <td className="py-3 px-3">
                      <StatusBadge status={rec.reconciliationStatus} />
                    </td>
                    <td className="py-3 px-3">
                      <StatusBadge status={rec.itcEligibility} />
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Detail Drawer if record clicked */}
      {selectedRecord && (
        <div className="p-4 bg-slate-850 rounded-xl border border-slate-700 space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-slate-700">
            <div>
              <span className="text-xs text-slate-400 font-mono">Detailed Tax Audit</span>
              <h3 className="text-sm font-bold text-white">Invoice {selectedRecord.invoiceNumber} — {selectedRecord.vendorName}</h3>
            </div>
            <button
              onClick={() => setSelectedRecord(null)}
              className="text-xs text-slate-400 hover:text-white"
            >
              Close
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div className="p-3 bg-slate-900 rounded-lg border border-slate-800 space-y-1.5">
              <span className="text-slate-400 block text-[11px] font-semibold uppercase">Books Tax Calculation</span>
              <div>Taxable Value: <strong className="text-white font-mono">{formatINR(selectedRecord.taxableValue)}</strong></div>
              <div>Supply Type: <strong className="text-white">{selectedRecord.isInterState ? 'Inter-state IGST' : 'Intra-state CGST+SGST'}</strong></div>
              <div>Calculated Tax Amount: <strong className="text-blue-400 font-mono">{formatINR(selectedRecord.calculatedTotalTax)}</strong></div>
            </div>

            <div className="p-3 bg-slate-900 rounded-lg border border-slate-800 space-y-1.5">
              <span className="text-slate-400 block text-[11px] font-semibold uppercase">GSTR-2B Auto-Drafted Status</span>
              <div>Reported Tax: <strong className="text-white font-mono">{formatINR(selectedRecord.gstr2bReportedTotalTax || 0)}</strong></div>
              <div>Filing Date: <strong className="text-slate-300">{selectedRecord.gstr2bFilingDate || 'Not filed yet'}</strong></div>
              <div>Eligible ITC Claim: <strong className="text-emerald-400 font-mono">{formatINR(selectedRecord.itcClaimableAmount)}</strong></div>
            </div>
          </div>

          {selectedRecord.discrepancyReason && (
            <div className="p-3 bg-rose-500/10 border border-rose-500/30 rounded-lg text-rose-300 text-xs">
              <strong>Exception Reason:</strong> {selectedRecord.discrepancyReason}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
