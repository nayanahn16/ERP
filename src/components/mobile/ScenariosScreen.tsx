import React from 'react';
import { 
  Sparkles, 
  AlertTriangle, 
  Truck, 
  ShieldAlert, 
  Receipt, 
  CheckCircle2, 
  RotateCcw, 
  ChevronRight, 
  Globe, 
  Building2, 
  Package, 
  Layers 
} from 'lucide-react';
import { useApp } from '../../context/AppContext';

export const ScenariosScreen: React.FC = () => {
  const { selectScenario, resetData, activeScenario, navigate } = useApp();

  const scenarios = [
    {
      key: 'A' as const,
      title: 'Scenario A: Low Stock Replenishment Alert',
      tag: 'Inventory Alert',
      color: 'border-rose-200 bg-rose-50 text-rose-700',
      icon: AlertTriangle,
      description: 'Stock fell below minimum reorder threshold. Evaluates replenishment formula: Target (2x Buffer) - Current Stock and drafts supplier PO.',
      target: 'Critical Stock Item'
    },
    {
      key: 'B' as const,
      title: 'Scenario B: Goods Receipt (GRN) Shortage Retention',
      tag: 'Goods Receipt',
      color: 'border-amber-200 bg-amber-50 text-amber-700',
      icon: Truck,
      description: 'Physical GRN verification flags partial delivery shortage. Remaining balance is preserved on PO for follow-up without unverified stock increase.',
      target: 'Partially Received PO'
    },
    {
      key: 'C' as const,
      title: 'Scenario C: Three-Way Invoice Mismatch',
      tag: '3-Way Match',
      color: 'border-teal-200 bg-teal-50 text-teal-800',
      icon: ShieldAlert,
      description: 'Vendor billed quantity/price exceeds verified receipt. System enforces DISCREPANCY_HOLD gating payment approval until resolved.',
      target: 'Mismatched Invoice'
    },
    {
      key: 'D' as const,
      title: 'Scenario D: GST & ITC GSTR-2B Discrepancy',
      tag: 'GST / ITC',
      color: 'border-blue-200 bg-blue-50 text-blue-700',
      icon: Receipt,
      description: 'Cross-checks invoice books against GSTR-2B portal filings. Flags missing or disputed inward taxes, placing ITC on Hold to prevent wrongful claims.',
      target: 'ITC Review Hold'
    },
    {
      key: 'E' as const,
      title: 'Scenario E: Complete Procurement-to-Pay Cycle',
      tag: 'Full Lifecycle',
      color: 'border-emerald-200 bg-emerald-50 text-emerald-800',
      icon: CheckCircle2,
      description: 'End-to-end verified workflow: PO issued, physical delivery verified via GRN, 3-way match cleared, tax reconciled, and payment disbursed.',
      target: 'Paid & Matched Order'
    },
    {
      key: 'F' as const,
      title: 'Scenario F: Multi-Facility 120 Manufacturer Network',
      tag: 'Network Scale',
      color: 'border-teal-200 bg-teal-50 text-teal-800',
      icon: Globe,
      description: 'Explore 120 small manufacturers across 10+ states (Karnataka, Tamil Nadu, Maharashtra, Gujarat, UP, etc.) with state-code-aware GST.',
      target: '120 Manufacturers'
    }
  ];

  return (
    <div className="space-y-4 pb-24 text-slate-800">
      {/* Header Banner (White & Soft Teal Gradient) */}
      <div className="bg-gradient-to-br from-teal-50/70 via-white to-emerald-50/40 border border-teal-200 rounded-3xl p-4 sm:p-5 shadow-xs">
        <div className="flex items-center gap-2 mb-2">
          <span className="text-xs font-bold px-2 py-0.5 rounded-lg bg-teal-100 text-teal-800 border border-teal-200">
            EVALUATOR DEMO
          </span>
          <span className="text-xs text-slate-500 font-medium">
            Hackathon & Project Defense
          </span>
        </div>

        <h2 className="text-lg sm:text-xl font-black text-slate-900 tracking-tight">
          Interactive Problem Scenarios
        </h2>
        <p className="text-xs text-slate-500 mt-1">
          Jump directly into the test cases to verify inventory replenishment, GRN shortage gating, 3-way matching, and GST compliance.
        </p>
      </div>

      {/* Reset Demo Data Button */}
      <div className="bg-white border border-slate-200 rounded-2xl p-3.5 flex items-center justify-between shadow-2xs">
        <div>
          <div className="text-xs font-bold text-slate-900">Reset Database to Initial State</div>
          <div className="text-[11px] text-slate-500">Clears modifications and restores all 2,000 synthetic records</div>
        </div>
        <button
          onClick={resetData}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 rounded-xl text-xs font-bold transition-all shrink-0"
        >
          <RotateCcw className="w-3.5 h-3.5 text-teal-600" />
          <span>Reset</span>
        </button>
      </div>

      {/* Scenario Cards (White Cards, Teal Accents) */}
      <div className="space-y-2.5">
        {scenarios.map((s) => {
          const Icon = s.icon;
          const isActive = activeScenario === s.key;

          return (
            <div
              key={s.key}
              onClick={() => selectScenario(s.key)}
              className={`cursor-pointer rounded-2xl p-4 border transition-all shadow-xs ${
                isActive 
                  ? 'bg-teal-50/50 border-teal-500 ring-1 ring-teal-500/30' 
                  : 'bg-white hover:bg-slate-50 border-slate-200 hover:border-teal-300'
              }`}
            >
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className={`text-[10.5px] font-bold px-2 py-0.5 rounded-full border ${s.color}`}>
                      {s.tag}
                    </span>
                    {isActive && (
                      <span className="text-[10px] font-bold px-2 py-0.2 rounded-full bg-teal-600 text-white">
                        Active Scenario
                      </span>
                    )}
                  </div>

                  <h3 className="text-sm font-bold text-slate-900 tracking-tight mt-1">
                    {s.title}
                  </h3>

                  <p className="text-xs text-slate-500 mt-1.5 leading-relaxed">
                    {s.description}
                  </p>

                  <div className="mt-2.5 flex items-center gap-1 text-[11px] font-bold text-teal-700">
                    <span>Target: {s.target}</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </div>
                </div>

                <div className="p-2 rounded-xl bg-teal-50 text-teal-700 border border-teal-100 shrink-0 mt-1">
                  <Icon className="w-4 h-4" />
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
