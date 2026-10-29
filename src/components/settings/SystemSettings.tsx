import React, { useState } from 'react';
import { 
  Settings, 
  Building2, 
  Sliders, 
  Database, 
  RotateCcw, 
  CheckCircle2, 
  AlertCircle,
  RefreshCw 
} from 'lucide-react';
import { BUYER_COMPANY, WAREHOUSES, MATCH_TOLERANCE_PCT, MATCH_TOLERANCE_AMT } from '../../lib/constants';
import { UserProfile } from '../../types';

interface SystemSettingsProps {
  currentUser: UserProfile;
  onResetData: () => Promise<void>;
  onRunScan: () => Promise<void>;
  tableCounts: {
    items: number;
    vendors: number;
    pos: number;
    grns: number;
    invoices: number;
    matches: number;
    alerts: number;
    auditEvents: number;
  };
}

export const SystemSettings: React.FC<SystemSettingsProps> = ({
  currentUser,
  onResetData,
  onRunScan,
  tableCounts
}) => {
  const [resetting, setResetting] = useState(false);
  const [scanning, setScanning] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const handleReset = async () => {
    if (!window.confirm('Reset database to clean seed demo state? This will restore the 6 demo scenarios.')) return;
    try {
      setResetting(true);
      await onResetData();
      setMessage('Database successfully re-seeded to initial hackathon demo state.');
      setTimeout(() => setMessage(null), 3500);
    } finally {
      setResetting(false);
    }
  };

  const handleScan = async () => {
    try {
      setScanning(true);
      await onRunScan();
      setMessage('Inventory threshold scan complete. All items verified.');
      setTimeout(() => setMessage(null), 3500);
    } finally {
      setScanning(false);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl text-xs">
      {/* Header */}
      <div className="pb-2 border-b border-slate-800">
        <h1 className="text-xl font-bold text-white tracking-tight">System Configuration & Demo Controls</h1>
        <p className="text-slate-400 mt-1">
          Company profile, tolerance parameters, and local database controls.
        </p>
      </div>

      {message && (
        <div className="p-3 bg-emerald-500/15 border border-emerald-500/30 rounded-lg text-emerald-300 flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>{message}</span>
        </div>
      )}

      {/* Company Profile Card */}
      <div className="p-5 bg-slate-900 border border-slate-800 rounded-xl space-y-4">
        <div className="flex items-center gap-2.5 pb-2 border-b border-slate-800">
          <Building2 className="w-4 h-4 text-blue-400" />
          <h2 className="font-semibold text-white text-sm">Manufacturer Enterprise Identity</h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <span className="text-slate-400 text-[11px] block">Company Legal Name</span>
            <span className="font-bold text-white text-sm mt-0.5 block">{BUYER_COMPANY.name}</span>
          </div>
          <div>
            <span className="text-slate-400 text-[11px] block">Statutory GSTIN (Karnataka)</span>
            <span className="font-mono font-bold text-blue-400 text-sm mt-0.5 block">{BUYER_COMPANY.gstin}</span>
          </div>
          <div>
            <span className="text-slate-400 text-[11px] block">Registered Address</span>
            <span className="text-slate-200 mt-0.5 block">{BUYER_COMPANY.address}</span>
          </div>
          <div>
            <span className="text-slate-400 text-[11px] block">Procurement Contact</span>
            <span className="text-slate-200 mt-0.5 block">{BUYER_COMPANY.contactEmail} • {BUYER_COMPANY.phone}</span>
          </div>
        </div>
      </div>

      {/* Warehouses Card */}
      <div className="p-5 bg-slate-900 border border-slate-800 rounded-xl space-y-3">
        <h2 className="font-semibold text-white text-sm">Configured Warehouse Hubs (2 Facilities)</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {WAREHOUSES.map(w => (
            <div key={w.id} className="p-3 bg-slate-850 rounded-lg border border-slate-800 space-y-1">
              <div className="font-bold text-white">{w.name}</div>
              <div className="text-slate-400 text-[11px]">{w.location}, {w.city} ({w.pincode})</div>
              <div className="text-[11px] text-slate-400">
                Facility Manager: <strong className="text-slate-200">{w.managerName}</strong> • {w.capacitySqFt} sq. ft.
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Tolerance Parameters */}
      <div className="p-5 bg-slate-900 border border-slate-800 rounded-xl space-y-3">
        <div className="flex items-center gap-2.5 pb-2 border-b border-slate-800">
          <Sliders className="w-4 h-4 text-amber-400" />
          <h2 className="font-semibold text-white text-sm">3-Way Match Commercial Tolerance Controls</h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="p-3 bg-slate-850 rounded-lg border border-slate-800">
            <span className="text-slate-400 block text-[11px]">Commercial Price Tolerance</span>
            <span className="font-bold text-white text-base mt-1 block">{MATCH_TOLERANCE_PCT}%</span>
            <span className="text-slate-400 text-[11px] mt-0.5 block">Price variance within 0.5% permitted without blocking payment.</span>
          </div>
          <div className="p-3 bg-slate-850 rounded-lg border border-slate-800">
            <span className="text-slate-400 block text-[11px]">Statutory Rounding Differential</span>
            <span className="font-bold text-white text-base mt-1 block">₹{MATCH_TOLERANCE_AMT.toFixed(2)}</span>
            <span className="text-slate-400 text-[11px] mt-0.5 block">Rounding variance between PO and invoice tax components.</span>
          </div>
        </div>
      </div>

      {/* Local Persistence & Demo Management */}
      <div className="p-5 bg-slate-900 border border-slate-800 rounded-xl space-y-4">
        <div className="flex items-center gap-2.5 pb-2 border-b border-slate-800">
          <Database className="w-4 h-4 text-emerald-400" />
          <h2 className="font-semibold text-white text-sm">IndexedDB Local Persistence Engine</h2>
        </div>

        <p className="text-slate-300 text-xs">
          ForgeFlow operates with an isolated, persistent IndexedDB client database (Dexie). All changes, receipts, transfers, and resolutions survive page reloads and browser sessions without requiring third-party credentials.
        </p>

        {/* Database Table Counts */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1 font-mono text-[11px]">
          <div className="p-2 bg-slate-850 rounded border border-slate-800">Items: <strong className="text-white">{tableCounts.items}</strong></div>
          <div className="p-2 bg-slate-850 rounded border border-slate-800">Vendors: <strong className="text-white">{tableCounts.vendors}</strong></div>
          <div className="p-2 bg-slate-850 rounded border border-slate-800">POs: <strong className="text-white">{tableCounts.pos}</strong></div>
          <div className="p-2 bg-slate-850 rounded border border-slate-800">GRNs: <strong className="text-white">{tableCounts.grns}</strong></div>
          <div className="p-2 bg-slate-850 rounded border border-slate-800">Invoices: <strong className="text-white">{tableCounts.invoices}</strong></div>
          <div className="p-2 bg-slate-850 rounded border border-slate-800">Matches: <strong className="text-white">{tableCounts.matches}</strong></div>
          <div className="p-2 bg-slate-850 rounded border border-slate-800">Alerts: <strong className="text-white">{tableCounts.alerts}</strong></div>
          <div className="p-2 bg-slate-850 rounded border border-slate-800">Audit Logs: <strong className="text-white">{tableCounts.auditEvents}</strong></div>
        </div>

        <div className="pt-3 border-t border-slate-800 flex items-center gap-3">
          <button
            onClick={handleReset}
            disabled={resetting}
            className="flex items-center gap-1.5 px-4 py-2 bg-rose-600/20 hover:bg-rose-600/30 text-rose-300 border border-rose-500/30 rounded-lg text-xs font-semibold transition-colors disabled:opacity-50"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>{resetting ? 'Resetting Data...' : 'Reset Database to Initial Seed State'}</span>
          </button>

          <button
            onClick={handleScan}
            disabled={scanning}
            className="flex items-center gap-1.5 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-lg text-xs font-semibold transition-colors disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 text-blue-400 ${scanning ? 'animate-spin' : ''}`} />
            <span>{scanning ? 'Scanning...' : 'Trigger Stock Scan'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
