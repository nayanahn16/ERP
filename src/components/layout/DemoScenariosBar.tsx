import React from 'react';
import { 
  Sparkles, 
  AlertTriangle, 
  Truck, 
  FileSpreadsheet, 
  Receipt, 
  CheckCircle2, 
  ArrowLeftRight, 
  RotateCcw,
  ExternalLink 
} from 'lucide-react';

interface DemoScenariosBarProps {
  onSelectScenario: (scenarioKey: 'A' | 'B' | 'C' | 'D' | 'E' | 'F') => void;
  onResetData: () => void;
  activeScenario?: string | null;
}

export const DemoScenariosBar: React.FC<DemoScenariosBarProps> = ({
  onSelectScenario,
  onResetData,
  activeScenario
}) => {
  const scenarios = [
    {
      key: 'A' as const,
      title: 'Scenario A: Low Stock Replenish',
      item: 'CW-102 (Peenya)',
      icon: AlertTriangle,
      color: 'hover:border-amber-500/50 hover:bg-amber-500/10 text-amber-400',
      badge: 'Formula: Target - Avail - OnOrder'
    },
    {
      key: 'B' as const,
      title: 'Scenario B: Partial Delivery',
      item: 'PO-812 (85/100 recd)',
      icon: Truck,
      color: 'hover:border-blue-500/50 hover:bg-blue-500/10 text-blue-400',
      badge: '15 units shortage retained'
    },
    {
      key: 'C' as const,
      title: 'Scenario C: 3-Way Invoice Mismatch',
      item: 'INV-9042 (100 billed vs 85 recd)',
      icon: FileSpreadsheet,
      color: 'hover:border-rose-500/50 hover:bg-rose-500/10 text-rose-400',
      badge: 'Payment Hold Gated'
    },
    {
      key: 'D' as const,
      title: 'Scenario D: GST / ITC Discrepancy',
      item: 'INV-8819 vs GSTR-2B',
      icon: Receipt,
      color: 'hover:border-purple-500/50 hover:bg-purple-500/10 text-purple-400',
      badge: '₹3,080 Tax Mismatch'
    },
    {
      key: 'E' as const,
      title: 'Scenario E: Replenishment Completed',
      item: 'ES-204 (Epoxy Resin)',
      icon: CheckCircle2,
      color: 'hover:border-emerald-500/50 hover:bg-emerald-500/10 text-emerald-400',
      badge: 'Alert Auto-Resolved'
    },
    {
      key: 'F' as const,
      title: 'Scenario F: Cross-Warehouse Stock',
      item: 'FR-401 (BLR 280 vs BGV 12)',
      icon: ArrowLeftRight,
      color: 'hover:border-cyan-500/50 hover:bg-cyan-500/10 text-cyan-400',
      badge: 'Transfer Workflow'
    }
  ];

  return (
    <div className="bg-slate-900 border-b border-slate-800 px-4 py-2.5">
      <div className="flex items-center justify-between gap-4 overflow-x-auto pb-1 scrollbar-none">
        <div className="flex items-center gap-2 text-xs font-semibold text-slate-300 uppercase tracking-wider shrink-0">
          <Sparkles className="w-4 h-4 text-amber-400 animate-pulse" />
          <span>Interactive Demo Scenarios:</span>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          {scenarios.map(sc => {
            const Icon = sc.icon;
            const isActive = activeScenario === sc.key;
            return (
              <button
                key={sc.key}
                onClick={() => onSelectScenario(sc.key)}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border text-xs font-medium transition-all ${
                  isActive
                    ? 'bg-blue-600/20 border-blue-500 text-white shadow-sm'
                    : `bg-slate-800/80 border-slate-700 text-slate-300 ${sc.color}`
                }`}
                title={`${sc.title} — ${sc.badge}`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span className="font-semibold">{sc.key}:</span>
                <span className="truncate max-w-[130px]">{sc.item}</span>
              </button>
            );
          })}
        </div>

        <button
          onClick={onResetData}
          className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-slate-700 bg-slate-800 text-slate-300 hover:text-white hover:bg-slate-700 hover:border-slate-600 text-xs font-medium transition-colors shrink-0 ml-auto"
          title="Reset database to fresh seed state"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Reset Demo Data</span>
        </button>
      </div>
    </div>
  );
};
