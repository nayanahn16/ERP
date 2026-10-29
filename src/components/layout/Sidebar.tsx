import React from 'react';
import { 
  LayoutDashboard, 
  Boxes, 
  BellRing, 
  ShoppingCart, 
  Truck, 
  FileCheck2, 
  Receipt, 
  Building2, 
  BarChart3, 
  History, 
  Settings, 
  Cpu,
  Layers
} from 'lucide-react';
import { cn } from '../../lib/utils';

export type NavTab = 
  | 'overview'
  | 'inventory'
  | 'replenishment'
  | 'procurement'
  | 'goods-receipt'
  | 'invoice-matching'
  | 'gst-workspace'
  | 'vendors'
  | 'reports'
  | 'audit-trail'
  | 'settings';

interface SidebarProps {
  currentTab: NavTab;
  onSelectTab: (tab: NavTab) => void;
  badgeCounts: {
    alerts: number;
    shortages: number;
    mismatches: number;
    gstExceptions: number;
  };
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentTab,
  onSelectTab,
  badgeCounts
}) => {
  const navItems = [
    {
      id: 'overview' as NavTab,
      label: 'Executive Tower',
      icon: LayoutDashboard,
      description: 'Command center & real-time KPIs'
    },
    {
      id: 'inventory' as NavTab,
      label: 'Inventory Intelligence',
      icon: Boxes,
      description: 'SKUs, stock health & transfers'
    },
    {
      id: 'replenishment' as NavTab,
      label: 'Auto Replenishment',
      icon: BellRing,
      badge: badgeCounts.alerts > 0 ? badgeCounts.alerts : undefined,
      badgeColor: 'bg-amber-500 text-slate-950',
      description: 'Vendor threshold notifications'
    },
    {
      id: 'procurement' as NavTab,
      label: 'Procurement & POs',
      icon: ShoppingCart,
      description: 'Purchase orders lifecycle'
    },
    {
      id: 'goods-receipt' as NavTab,
      label: 'Goods Receipt (GRN)',
      icon: Truck,
      badge: badgeCounts.shortages > 0 ? badgeCounts.shortages : undefined,
      badgeColor: 'bg-blue-500 text-white',
      description: 'Physical verify & shortage track'
    },
    {
      id: 'invoice-matching' as NavTab,
      label: '3-Way Match & Pay',
      icon: FileCheck2,
      badge: badgeCounts.mismatches > 0 ? badgeCounts.mismatches : undefined,
      badgeColor: 'bg-rose-500 text-white',
      description: 'PO vs GRN vs Vendor Invoice'
    },
    {
      id: 'gst-workspace' as NavTab,
      label: 'GST & ITC Control',
      icon: Receipt,
      badge: badgeCounts.gstExceptions > 0 ? badgeCounts.gstExceptions : undefined,
      badgeColor: 'bg-purple-500 text-white',
      description: 'Karnataka intra/inter-state tax'
    },
    {
      id: 'vendors' as NavTab,
      label: 'Vendors (80)',
      icon: Building2,
      description: 'Vendor master, GSTIN & ratings'
    },
    {
      id: 'reports' as NavTab,
      label: 'Reports & BI',
      icon: BarChart3,
      description: '12 operational reports & CSV export'
    },
    {
      id: 'audit-trail' as NavTab,
      label: 'Audit Trail',
      icon: History,
      description: 'Append-only ledger of actions'
    },
    {
      id: 'settings' as NavTab,
      label: 'System Settings',
      icon: Settings,
      description: 'Company profile & demo tools'
    }
  ];

  return (
    <aside className="w-64 bg-slate-950 border-r border-slate-800 flex flex-col shrink-0 min-h-screen">
      {/* Brand header */}
      <div className="h-16 flex items-center gap-3 px-5 border-b border-slate-800 bg-slate-950">
        <div className="w-9 h-9 rounded-xl bg-blue-600 flex items-center justify-center shadow-lg shadow-blue-600/30 text-white font-bold">
          <Cpu className="w-5 h-5 text-white" />
        </div>
        <div>
          <div className="flex items-center gap-1.5">
            <span className="font-extrabold text-base tracking-tight text-white">FORGEFLOW</span>
            <span className="text-[10px] uppercase font-bold px-1.5 py-0.2 rounded bg-blue-500/20 text-blue-400 border border-blue-500/30">
              v2.4
            </span>
          </div>
          <p className="text-[11px] text-slate-400 font-medium truncate max-w-[150px]">
            Manufacturing Tower
          </p>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        <div className="px-3 pb-2 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
          Operations Workflow
        </div>

        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentTab === item.id;

          return (
            <button
              key={item.id}
              onClick={() => onSelectTab(item.id)}
              className={cn(
                'w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-xs font-medium transition-all group',
                isActive
                  ? 'bg-blue-600 text-white shadow-sm shadow-blue-600/20'
                  : 'text-slate-400 hover:text-slate-100 hover:bg-slate-900'
              )}
            >
              <div className="flex items-center gap-3 truncate">
                <Icon
                  className={cn(
                    'w-4 h-4 shrink-0 transition-colors',
                    isActive ? 'text-white' : 'text-slate-400 group-hover:text-blue-400'
                  )}
                />
                <span className="truncate">{item.label}</span>
              </div>

              {item.badge !== undefined && (
                <span
                  className={cn(
                    'px-1.5 py-0.2 text-[10px] font-bold rounded-full shrink-0 shadow-sm',
                    item.badgeColor
                  )}
                >
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      {/* Footer Info */}
      <div className="p-4 border-t border-slate-900 bg-slate-950/80">
        <div className="p-3 bg-slate-900/60 rounded-lg border border-slate-800/80">
          <div className="flex items-center gap-2 text-xs font-medium text-slate-300">
            <Layers className="w-3.5 h-3.5 text-blue-400" />
            <span>Kavach Electricals</span>
          </div>
          <div className="text-[10px] text-slate-400 mt-1 leading-relaxed">
            Karnataka (29) • 120 Staff • 80 Vendors • 2 Warehouses
          </div>
        </div>
      </div>
    </aside>
  );
};
