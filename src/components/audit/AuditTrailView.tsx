import React, { useState, useMemo } from 'react';
import { History, Search, Download, ShieldCheck, Filter } from 'lucide-react';
import { AuditEvent, UserProfile } from '../../types';
import { formatDateTime, exportToCSV } from '../../lib/utils';

interface AuditTrailViewProps {
  auditEvents: AuditEvent[];
  currentUser: UserProfile;
}

export const AuditTrailView: React.FC<AuditTrailViewProps> = ({ auditEvents, currentUser }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [entityFilter, setEntityFilter] = useState('ALL');

  const filteredEvents = useMemo(() => {
    return auditEvents.filter(ev => {
      if (searchTerm) {
        const q = searchTerm.toLowerCase();
        const matches = ev.action.toLowerCase().includes(q) ||
          ev.entityRef.toLowerCase().includes(q) ||
          ev.userName.toLowerCase().includes(q) ||
          ev.details.toLowerCase().includes(q);
        if (!matches) return false;
      }
      if (entityFilter !== 'ALL' && ev.entityType !== entityFilter) return false;
      return true;
    });
  }, [auditEvents, searchTerm, entityFilter]);

  const handleExportCSV = () => {
    exportToCSV(
      'ForgeFlow_Immutable_Audit_Ledger',
      filteredEvents,
      [
        { key: 'timestamp', label: 'Timestamp' },
        { key: 'action', label: 'Action Performed' },
        { key: 'userName', label: 'User Name' },
        { key: 'userRole', label: 'User Role' },
        { key: 'entityType', label: 'Entity Type' },
        { key: 'entityRef', label: 'Record Reference' },
        { key: 'details', label: 'Detailed Description' },
        { key: 'previousValue', label: 'Previous Value' },
        { key: 'newValue', label: 'New Value' }
      ]
    );
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold text-white tracking-tight">Immutable Operational Audit Trail</h1>
            <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-[11px] font-bold">
              Append-Only Ledger
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Complete traceability of inventory changes, goods receipts, match approvals, and GST overrides.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleExportCSV}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-lg text-xs font-medium transition-colors"
          >
            <Download className="w-3.5 h-3.5 text-blue-400" />
            <span>Export Audit Trail (CSV)</span>
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
            placeholder="Search action, record ref, user, notes..."
            className="w-full bg-slate-800 border border-slate-700 rounded-lg pl-9 pr-3 py-2 text-white placeholder-slate-400 focus:outline-none focus:border-blue-500"
          />
        </div>

        <div className="flex items-center gap-2 w-full md:w-auto">
          <select
            value={entityFilter}
            onChange={(e) => setEntityFilter(e.target.value)}
            className="w-full md:w-56 bg-slate-800 border border-slate-700 rounded-lg p-2 text-white focus:outline-none focus:border-blue-500"
          >
            <option value="ALL">All Entity Types</option>
            <option value="PO">Purchase Orders (PO)</option>
            <option value="GRN">Goods Receipt (GRN)</option>
            <option value="INVOICE">Invoices</option>
            <option value="MATCH">3-Way Matches</option>
            <option value="ALERT">Stock Alerts</option>
            <option value="TRANSFER">Warehouse Transfers</option>
            <option value="GST">GST & Tax</option>
          </select>
        </div>
      </div>

      {/* Audit Log Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-800 bg-slate-850/60 text-slate-400 font-semibold uppercase tracking-wider text-[11px]">
                <th className="py-3 px-4">Timestamp</th>
                <th className="py-3 px-3">Action</th>
                <th className="py-3 px-3">Record Reference</th>
                <th className="py-3 px-3">Operator / Persona</th>
                <th className="py-3 px-3">Role</th>
                <th className="py-3 px-4">Event Details & State Changes</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/80">
              {filteredEvents.map(ev => (
                <tr key={ev.id} className="hover:bg-slate-850/50 transition-colors">
                  <td className="py-3 px-4 font-mono text-slate-400 text-[11px] whitespace-nowrap">
                    {formatDateTime(ev.timestamp)}
                  </td>
                  <td className="py-3 px-3">
                    <span className="font-semibold text-white px-2 py-0.5 rounded bg-slate-800 border border-slate-700 text-[11px]">
                      {ev.action.replace(/_/g, ' ')}
                    </span>
                  </td>
                  <td className="py-3 px-3 font-mono font-bold text-blue-400">
                    {ev.entityRef}
                  </td>
                  <td className="py-3 px-3 text-slate-200 font-medium">
                    {ev.userName}
                  </td>
                  <td className="py-3 px-3 text-slate-400 text-[11px] capitalize">
                    {ev.userRole.replace(/_/g, ' ').toLowerCase()}
                  </td>
                  <td className="py-3 px-4">
                    <p className="text-slate-300 text-xs leading-relaxed">{ev.details}</p>
                    {(ev.previousValue || ev.newValue) && (
                      <div className="text-[11px] font-mono text-slate-400 mt-1 flex items-center gap-2">
                        {ev.previousValue && <span>Prev: <span className="text-rose-400">{ev.previousValue}</span></span>}
                        {ev.newValue && <span>→ New: <span className="text-emerald-400">{ev.newValue}</span></span>}
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
