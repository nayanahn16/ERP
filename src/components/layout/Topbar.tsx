import React, { useState } from 'react';
import { 
  Search, 
  Warehouse, 
  Bell, 
  User, 
  Sparkles, 
  ChevronDown, 
  ShieldCheck, 
  RefreshCw,
  Plus
} from 'lucide-react';
import { UserProfile, Warehouse as WarehouseType } from '../../types';
import { WAREHOUSES, DEMO_USERS, BUYER_COMPANY } from '../../lib/constants';

interface TopbarProps {
  currentUser: UserProfile;
  onChangeUser: (user: UserProfile) => void;
  selectedWarehouseId: string; // 'ALL' or warehouseId
  onSelectWarehouse: (warehouseId: string) => void;
  onOpenSearch: () => void;
  onTriggerScan: () => void;
  onOpenNewPO?: () => void;
  alertCount: number;
}

export const Topbar: React.FC<TopbarProps> = ({
  currentUser,
  onChangeUser,
  selectedWarehouseId,
  onSelectWarehouse,
  onOpenSearch,
  onTriggerScan,
  onOpenNewPO,
  alertCount
}) => {
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [isScanning, setIsScanning] = useState(false);

  const handleScan = async () => {
    setIsScanning(true);
    await onTriggerScan();
    setTimeout(() => setIsScanning(false), 600);
  };

  return (
    <header className="h-16 bg-slate-900 border-b border-slate-800 flex items-center justify-between px-6 z-30 sticky top-0">
      {/* Search trigger */}
      <div className="flex items-center gap-4 flex-1 max-w-xl">
        <button
          onClick={onOpenSearch}
          className="flex items-center justify-between w-full max-w-md px-3.5 py-2 bg-slate-850 hover:bg-slate-800 border border-slate-700/80 rounded-lg text-sm text-slate-400 hover:text-slate-200 transition-colors shadow-inner"
        >
          <div className="flex items-center gap-2.5">
            <Search className="w-4 h-4 text-slate-400" />
            <span className="text-xs">Search SKU, PO, GRN, Vendor, GSTIN...</span>
          </div>
          <kbd className="hidden sm:inline-block px-1.5 py-0.5 text-[10px] font-mono font-medium text-slate-400 bg-slate-800 border border-slate-700 rounded shadow">
            Ctrl+K
          </kbd>
        </button>
      </div>

      {/* Right Controls */}
      <div className="flex items-center gap-3">
        {/* Quick PO Button */}
        {onOpenNewPO && (
          <button
            onClick={onOpenNewPO}
            className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-medium shadow-sm transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Create PO</span>
          </button>
        )}

        {/* Scan Inventory */}
        <button
          onClick={handleScan}
          disabled={isScanning}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-750 border border-slate-700 text-slate-200 rounded-lg text-xs font-medium transition-colors"
          title="Run instant automated stock health & threshold scan"
        >
          <RefreshCw className={`w-3.5 h-3.5 text-blue-400 ${isScanning ? 'animate-spin' : ''}`} />
          <span className="hidden md:inline">Scan Stock</span>
        </button>

        {/* Warehouse Selector */}
        <div className="flex items-center gap-2 bg-slate-800/80 border border-slate-700 rounded-lg px-2.5 py-1 text-xs">
          <Warehouse className="w-3.5 h-3.5 text-slate-400" />
          <select
            value={selectedWarehouseId}
            onChange={(e) => onSelectWarehouse(e.target.value)}
            className="bg-transparent text-white font-medium focus:outline-none cursor-pointer py-0.5 pr-2"
          >
            <option value="ALL" className="bg-slate-900 text-slate-100">
              Consolidated (All Warehouses)
            </option>
            {WAREHOUSES.map((wh) => (
              <option key={wh.id} value={wh.id} className="bg-slate-900 text-slate-100">
                {wh.city} — {wh.name}
              </option>
            ))}
          </select>
        </div>

        {/* Notifications */}
        <div className="relative">
          <button 
            className="relative p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
            title={`${alertCount} active alerts`}
          >
            <Bell className="w-4 h-4" />
            {alertCount > 0 && (
              <span className="absolute top-1 right-1 w-4 h-4 bg-rose-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center animate-pulse">
                {alertCount}
              </span>
            )}
          </button>
        </div>

        {/* User Role Switcher Dropdown */}
        <div className="relative">
          <button
            onClick={() => setShowUserMenu(!showUserMenu)}
            className="flex items-center gap-2.5 pl-2 pr-3 py-1.5 bg-slate-800/80 hover:bg-slate-800 border border-slate-700 rounded-lg transition-colors"
          >
            <div className="w-7 h-7 rounded-full bg-blue-600/30 border border-blue-500/40 text-blue-400 flex items-center justify-center font-semibold text-xs">
              {currentUser.name.charAt(0)}
            </div>
            <div className="text-left hidden lg:block">
              <div className="text-xs font-medium text-white leading-tight">{currentUser.name}</div>
              <div className="text-[10px] text-slate-400 capitalize">{currentUser.role.replace(/_/g, ' ').toLowerCase()}</div>
            </div>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
          </button>

          {showUserMenu && (
            <div 
              className="absolute right-0 mt-2 w-64 bg-slate-900 border border-slate-800 rounded-xl shadow-2xl py-2 z-50 animate-in fade-in slide-in-from-top-2 duration-150"
              onMouseLeave={() => setShowUserMenu(false)}
            >
              <div className="px-4 py-2 border-b border-slate-800">
                <p className="text-xs font-semibold text-white">{BUYER_COMPANY.name}</p>
                <p className="text-[11px] text-slate-400 font-mono">GSTIN: {BUYER_COMPANY.gstin}</p>
              </div>

              <div className="px-2 py-1.5 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                Switch Operational Persona:
              </div>

              {DEMO_USERS.map((user) => (
                <button
                  key={user.id}
                  onClick={() => {
                    onChangeUser(user);
                    setShowUserMenu(false);
                  }}
                  className={`w-full flex items-center justify-between px-3 py-2 text-left text-xs transition-colors rounded-lg mx-1 ${
                    user.id === currentUser.id 
                      ? 'bg-blue-600/20 text-blue-400 font-medium' 
                      : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                  }`}
                >
                  <div>
                    <div className="font-medium">{user.name}</div>
                    <div className="text-[10px] text-slate-400 capitalize">{user.role.replace(/_/g, ' ').toLowerCase()}</div>
                  </div>
                  {user.id === currentUser.id && <ShieldCheck className="w-4 h-4 text-blue-400" />}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
