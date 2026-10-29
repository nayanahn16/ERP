import React, { useState, useMemo } from 'react';
import { 
  Building2, 
  Search, 
  Download, 
  Star, 
  MapPin, 
  AlertTriangle,
  Clock,
  IndianRupee 
} from 'lucide-react';
import { Vendor, UserProfile } from '../../types';
import { StatusBadge } from '../common/StatusBadge';
import { formatINR } from '../../lib/gstService';
import { exportToCSV } from '../../lib/utils';

interface VendorsListProps {
  vendors: Vendor[];
  currentUser: UserProfile;
}

export const VendorsList: React.FC<VendorsListProps> = ({ vendors, currentUser }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [stateFilter, setStateFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [selectedVendor, setSelectedVendor] = useState<Vendor | null>(null);

  const states = useMemo(() => {
    return Array.from(new Set(vendors.map(v => v.state))).sort();
  }, [vendors]);

  const filteredVendors = useMemo(() => {
    return vendors.filter(v => {
      if (searchTerm) {
        const q = searchTerm.toLowerCase();
        const matches = v.legalName.toLowerCase().includes(q) ||
          v.vendorCode.toLowerCase().includes(q) ||
          v.gstin.toLowerCase().includes(q) ||
          v.city.toLowerCase().includes(q) ||
          v.contactPerson.toLowerCase().includes(q);
        if (!matches) return false;
      }
      if (stateFilter !== 'ALL' && v.state !== stateFilter) return false;
      if (statusFilter !== 'ALL' && v.status !== statusFilter) return false;
      return true;
    });
  }, [vendors, searchTerm, stateFilter, statusFilter]);

  const handleExportCSV = () => {
    exportToCSV(
      'ForgeFlow_Vendors_Directory',
      filteredVendors,
      [
        { key: 'vendorCode', label: 'Vendor Code' },
        { key: 'legalName', label: 'Legal Name' },
        { key: 'gstin', label: 'GSTIN' },
        { key: 'state', label: 'State' },
        { key: 'city', label: 'City' },
        { key: 'contactPerson', label: 'Contact Person' },
        { key: 'email', label: 'Email' },
        { key: 'phone', label: 'Phone' },
        { key: 'paymentTerms', label: 'Payment Terms' },
        { key: 'leadTimeDays', label: 'Lead Time (Days)' },
        { key: 'rating', label: 'Rating' },
        { key: 'discrepancyRatePct', label: 'Discrepancy Rate (%)' },
        { key: 'outstandingPayable', label: 'Outstanding Payable (INR)' },
        { key: 'status', label: 'Status' }
      ]
    );
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-800">
        <div>
          <h1 className="text-xl font-bold text-white tracking-tight">Suppliers & Vendor Master (80 Registered Vendors)</h1>
          <p className="text-xs text-slate-400 mt-1">
            Vendor delivery performance, Karnataka vs inter-state tax profiles, lead times, and outstanding obligations.
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
      <div className="p-4 bg-slate-900 border border-slate-800 rounded-xl grid grid-cols-1 md:grid-cols-4 gap-3 text-xs">
        <div className="relative md:col-span-2">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search vendor name, code, GSTIN, city, contact..."
            className="w-full bg-slate-800 border border-slate-700 rounded-lg pl-9 pr-3 py-2 text-white placeholder-slate-400 focus:outline-none focus:border-blue-500"
          />
        </div>

        <div>
          <select
            value={stateFilter}
            onChange={(e) => setStateFilter(e.target.value)}
            className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-white focus:outline-none focus:border-blue-500"
          >
            <option value="ALL">All States ({states.length})</option>
            {states.map(s => (
              <option key={s} value={s}>{s} ({s === 'Karnataka' ? 'Local 29' : 'Inter-State'})</option>
            ))}
          </select>
        </div>

        <div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-white focus:outline-none focus:border-blue-500"
          >
            <option value="ALL">All Statuses</option>
            <option value="ACTIVE">Active</option>
            <option value="ON_HOLD">On Hold</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-800 bg-slate-850/60 text-slate-400 font-semibold uppercase tracking-wider text-[11px]">
                <th className="py-3 px-4">Vendor Code / Name</th>
                <th className="py-3 px-3">Location / State</th>
                <th className="py-3 px-3">GSTIN</th>
                <th className="py-3 px-3">Terms / Lead Time</th>
                <th className="py-3 px-3 text-center">Rating</th>
                <th className="py-3 px-3 text-right">Discrepancy Rate</th>
                <th className="py-3 px-3 text-right">Payable (INR)</th>
                <th className="py-3 px-4 text-center">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/80">
              {filteredVendors.map(ven => {
                const isLocal = ven.stateCode === '29';

                return (
                  <tr
                    key={ven.id}
                    onClick={() => setSelectedVendor(ven)}
                    className="hover:bg-slate-800/50 transition-colors group cursor-pointer"
                  >
                    <td className="py-3 px-4">
                      <div className="font-semibold text-white group-hover:text-blue-400 transition-colors">
                        {ven.legalName}
                      </div>
                      <div className="text-[11px] text-slate-400 font-mono">
                        {ven.vendorCode} • {ven.contactPerson}
                      </div>
                    </td>
                    <td className="py-3 px-3">
                      <div className="text-slate-200">{ven.city}, {ven.state}</div>
                      <span className={`text-[10px] font-semibold ${isLocal ? 'text-blue-400' : 'text-purple-400'}`}>
                        {isLocal ? 'Intra-State (Karnataka)' : 'Inter-State'}
                      </span>
                    </td>
                    <td className="py-3 px-3 font-mono text-slate-300 text-[11px]">
                      {ven.gstin}
                    </td>
                    <td className="py-3 px-3 text-slate-300">
                      <div>{ven.paymentTerms}</div>
                      <div className="text-[11px] text-slate-400">{ven.leadTimeDays} days lead time</div>
                    </td>
                    <td className="py-3 px-3 text-center">
                      <div className="inline-flex items-center gap-1 font-bold text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">
                        <Star className="w-3 h-3 fill-amber-400" />
                        <span>{ven.rating}</span>
                      </div>
                    </td>
                    <td className="py-3 px-3 text-right">
                      <span className={`font-semibold ${ven.discrepancyRatePct > 4 ? 'text-rose-400' : 'text-slate-300'}`}>
                        {ven.discrepancyRatePct}%
                      </span>
                    </td>
                    <td className="py-3 px-3 text-right font-mono font-semibold text-white">
                      {formatINR(ven.outstandingPayable)}
                    </td>
                    <td className="py-3 px-4 text-center">
                      <StatusBadge status={ven.status} />
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
