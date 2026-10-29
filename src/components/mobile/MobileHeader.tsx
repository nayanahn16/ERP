import React from 'react';
import { 
  ChevronLeft, 
  Smartphone, 
  Monitor, 
  Building2, 
  Bell, 
  Search,
  Sparkles,
  LogOut,
  User
} from 'lucide-react';
import { useApp } from '../../context/AppContext';

export const MobileHeader: React.FC = () => {
  const { 
    currentScreen, 
    goBack, 
    navigate, 
    activeManufacturer, 
    selectedManufacturerId, 
    isPhoneFrame, 
    togglePhoneFrame,
    kpis,
    currentUser,
    logout
  } = useApp();

  const isSubPage = currentScreen !== 'home';

  const getPageTitle = () => {
    switch (currentScreen) {
      case 'home':
        return 'ForgeFlow';
      case 'inventory':
        return 'Inventory & Stock';
      case 'inventory-detail':
        return 'Material Details';
      case 'orders':
        return 'Purchases & Invoices';
      case 'order-detail':
        return 'Invoice & 3-Way Match';
      case 'new-order':
        return 'New Purchase Order';
      case 'gst':
        return 'GST & ITC Control';
      case 'vendors':
        return 'Vendor Directory';
      case 'vendor-detail':
        return 'Vendor Profile';
      case 'manufacturers':
        return '120 Manufacturers';
      case 'matching':
        return '3-Way Reconciliation';
      case 'reports':
        return 'Reports & Analytics';
      case 'scenarios':
        return 'Submission Scenarios';
      default:
        return 'ForgeFlow';
    }
  };

  const notificationCount = kpis.lowStockCount + kpis.overdueCount + kpis.mismatchCount;

  return (
    <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-xl border-b border-slate-200/90 px-4 py-2.5 transition-all shadow-xs">
      <div className="flex items-center justify-between gap-2">
        {/* Left: Back button or App Logo */}
        <div className="flex items-center gap-2 min-w-0">
          {isSubPage ? (
            <button
              onClick={goBack}
              className="flex items-center gap-1.5 text-slate-700 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 px-2.5 py-1.5 rounded-xl transition-colors text-sm font-semibold border border-slate-200"
            >
              <ChevronLeft className="w-4 h-4 text-teal-600 stroke-[2.5]" />
              <span className="text-xs">Back</span>
            </button>
          ) : (
            <div 
              onClick={() => navigate('home')}
              className="flex items-center gap-2 cursor-pointer"
            >
              <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-teal-600 to-emerald-500 flex items-center justify-center shadow-md shadow-teal-600/20 text-white font-black text-sm ring-2 ring-teal-100">
                FF
              </div>
              <div className="min-w-0">
                <div className="text-sm font-bold tracking-tight text-slate-900 flex items-center gap-1">
                  <span>ForgeFlow</span>
                  <span className="text-[10px] px-1.5 py-0.2 bg-teal-100/80 text-teal-800 rounded-md font-bold border border-teal-200">
                    ERP
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Current Page Title if subpage */}
          {isSubPage && (
            <h1 className="text-sm font-bold text-slate-900 truncate">
              {getPageTitle()}
            </h1>
          )}
        </div>

        {/* Right: Active Manufacturer, Mode Toggle & Logout */}
        <div className="flex items-center gap-1.5">
          {/* Active Manufacturer Switcher Button */}
          <button
            onClick={() => navigate('manufacturers')}
            className="flex items-center gap-1.5 bg-teal-50/80 hover:bg-teal-100 text-teal-900 border border-teal-200/80 px-2.5 py-1 rounded-xl text-xs font-semibold transition-all max-w-[130px] sm:max-w-[170px] truncate shadow-xs"
            title="Click to Switch Manufacturer"
          >
            <Building2 className="w-3.5 h-3.5 text-teal-600 shrink-0" />
            <span className="truncate">
              {selectedManufacturerId === 'ALL' 
                ? 'All 120 Mfg' 
                : activeManufacturer ? activeManufacturer.business_name.replace(/\s\d+$/, '') : 'Select Mfg'}
            </span>
          </button>

          {/* Scenarios Shortcut Pill */}
          <button
            onClick={() => navigate('scenarios')}
            className="hidden sm:flex items-center gap-1 bg-teal-600 text-white hover:bg-teal-700 px-2 py-1 rounded-xl text-xs font-semibold shadow-xs transition-all"
            title="Interactive Demo Scenarios"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Scenarios</span>
          </button>

          {/* Toggle Phone Frame preview vs Full View */}
          <button
            onClick={togglePhoneFrame}
            className="p-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 transition-colors"
            title={isPhoneFrame ? "Switch to Full View" : "Switch to Mobile Phone Mockup"}
          >
            {isPhoneFrame ? (
              <Monitor className="w-4 h-4 text-teal-600" />
            ) : (
              <Smartphone className="w-4 h-4 text-teal-600" />
            )}
          </button>

          {/* Notifications Indicator */}
          <button
            onClick={() => navigate('orders')}
            className="relative p-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 transition-colors"
            title="Alerts & Issues"
          >
            <Bell className="w-4 h-4 text-slate-700" />
            {notificationCount > 0 && (
              <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-rose-500 rounded-full animate-ping" />
            )}
          </button>

          {/* Logout / Switch Profile Button */}
          <button
            onClick={logout}
            className="p-1.5 rounded-xl bg-slate-100 hover:bg-rose-50 text-slate-600 hover:text-rose-600 border border-slate-200 hover:border-rose-200 transition-colors"
            title="Log out to Login Screen"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </header>
  );
};
