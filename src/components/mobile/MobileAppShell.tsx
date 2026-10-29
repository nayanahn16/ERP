import React from 'react';
import { 
  Wifi, 
  Battery, 
  Signal, 
  Smartphone, 
  Monitor, 
  RotateCcw, 
  Sparkles,
  Building2,
  CheckCircle2,
  AlertCircle,
  Layers,
  LogOut
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { MobileHeader } from './MobileHeader';
import { MobileBottomNav } from './MobileBottomNav';
import { LoginScreen } from './LoginScreen';

// Screen Views
import { HomeScreen } from './HomeScreen';
import { InventoryScreen } from './InventoryScreen';
import { InventoryDetailScreen } from './InventoryDetailScreen';
import { OrdersScreen } from './OrdersScreen';
import { OrderDetailScreen } from './OrderDetailScreen';
import { NewOrderScreen } from './NewOrderScreen';
import { GSTScreen } from './GSTScreen';
import { VendorsScreen } from './VendorsScreen';
import { VendorDetailScreen } from './VendorDetailScreen';
import { ManufacturersScreen } from './ManufacturersScreen';
import { MatchingScreen } from './MatchingScreen';
import { ReportsScreen } from './ReportsScreen';
import { ScenariosScreen } from './ScenariosScreen';

export const MobileAppShell: React.FC = () => {
  const { 
    isAuthenticated,
    currentScreen, 
    isPhoneFrame, 
    togglePhoneFrame, 
    toastMessage, 
    resetData, 
    selectScenario,
    activeScenario,
    selectedManufacturerId,
    activeManufacturer,
    currentUser,
    logout
  } = useApp();

  // Render current screen content
  const renderScreen = () => {
    switch (currentScreen) {
      case 'home':
        return <HomeScreen />;
      case 'inventory':
        return <InventoryScreen />;
      case 'inventory-detail':
        return <InventoryDetailScreen />;
      case 'orders':
        return <OrdersScreen />;
      case 'order-detail':
        return <OrderDetailScreen />;
      case 'new-order':
        return <NewOrderScreen />;
      case 'gst':
        return <GSTScreen />;
      case 'vendors':
        return <VendorsScreen />;
      case 'vendor-detail':
        return <VendorDetailScreen />;
      case 'manufacturers':
        return <ManufacturersScreen />;
      case 'matching':
        return <MatchingScreen />;
      case 'reports':
        return <ReportsScreen />;
      case 'scenarios':
        return <ScenariosScreen />;
      default:
        return <HomeScreen />;
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 text-slate-800 flex flex-col font-sans selection:bg-teal-600 selection:text-white">
      {/* Top Desktop Helper & Scenario Navigation Bar */}
      <div className="bg-white border-b border-slate-200/90 px-4 py-2 flex items-center justify-between gap-3 text-xs flex-wrap z-50 shadow-xs">
        <div className="flex items-center gap-2">
          <div className="w-5 h-5 rounded-lg bg-teal-600 flex items-center justify-center font-black text-white text-[10px] shadow-sm">
            FF
          </div>
          <span className="font-bold text-slate-900 tracking-tight">ForgeFlow ERP Mobile</span>
          <span className="text-[10px] px-2 py-0.5 rounded-full bg-teal-50 text-teal-800 font-semibold border border-teal-200 hidden sm:inline">
            120 Manufacturers · 80 Vendors · 2,000 Invoices
          </span>
        </div>

        {/* Quick Scenario Jumper for Evaluators / Hackathon Judges */}
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar">
          <span className="text-[11px] text-slate-500 font-semibold hidden md:inline">Demo Scenarios:</span>
          {(['A', 'B', 'C', 'D', 'E', 'F'] as const).map(sc => (
            <button
              key={sc}
              onClick={() => selectScenario(sc)}
              className={`px-2.5 py-0.5 rounded-lg text-[10.5px] font-bold transition-all ${
                activeScenario === sc 
                  ? 'bg-teal-600 text-white shadow-sm' 
                  : 'bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200'
              }`}
              title={`Jump to Scenario ${sc}`}
            >
              {sc}
            </button>
          ))}

          <button
            onClick={resetData}
            className="flex items-center gap-1 text-[11px] text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 px-2 py-0.5 rounded-lg border border-slate-200 transition-colors ml-1 font-medium"
            title="Reset dataset"
          >
            <RotateCcw className="w-3 h-3 text-teal-600" />
            <span className="hidden sm:inline">Reset</span>
          </button>

          {/* Toggle Phone Frame button */}
          <button
            onClick={togglePhoneFrame}
            className="flex items-center gap-1 text-[11px] font-semibold text-teal-700 bg-teal-50 hover:bg-teal-100 px-2.5 py-0.5 rounded-lg border border-teal-200 transition-all ml-1 shadow-xs"
          >
            {isPhoneFrame ? <Monitor className="w-3.5 h-3.5 text-teal-600" /> : <Smartphone className="w-3.5 h-3.5 text-teal-600" />}
            <span>{isPhoneFrame ? 'Full View' : 'Phone Frame'}</span>
          </button>

          {isAuthenticated && (
            <button
              onClick={logout}
              className="flex items-center gap-1 text-[11px] font-semibold text-rose-600 bg-rose-50 hover:bg-rose-100 px-2.5 py-0.5 rounded-lg border border-rose-200 transition-all ml-1"
              title="Sign Out"
            >
              <LogOut className="w-3 h-3" />
              <span className="hidden sm:inline">Sign Out</span>
            </button>
          )}
        </div>
      </div>

      {/* Floating Action Toast Notification */}
      {toastMessage && (
        <div className="fixed top-14 left-1/2 -translate-x-1/2 z-50 px-4 py-2 rounded-2xl bg-slate-900/95 text-white border border-teal-500/40 shadow-2xl backdrop-blur-md text-xs font-semibold flex items-center gap-2 animate-in fade-in slide-in-from-top duration-300">
          <CheckCircle2 className="w-4 h-4 text-teal-400 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Main App Container */}
      <div className="flex-1 flex items-center justify-center p-0 sm:py-6 sm:px-4">
        {isPhoneFrame ? (
          /* Realistic Smartphone Chassis Mockup */
          <div className="relative w-full max-w-[420px] h-[870px] bg-slate-900 rounded-[50px] p-3 shadow-[0_25px_60px_-15px_rgba(0,0,0,0.3)] border-[6px] border-slate-700 ring-1 ring-slate-600/40 flex flex-col overflow-hidden">
            {/* Phone Screen Glass */}
            <div className="flex-1 flex flex-col bg-slate-50 rounded-[40px] overflow-hidden relative border border-slate-200 shadow-inner">
              
              {/* Phone Status Bar */}
              <div className="h-8 bg-white/95 backdrop-blur-md px-6 flex items-center justify-between text-[11px] text-slate-700 select-none z-40 shrink-0 border-b border-slate-100">
                <span className="font-semibold text-xs tracking-tight">9:41</span>
                {/* Dynamic Island / Speaker Pill */}
                <div className="w-24 h-4 bg-slate-900 rounded-full mx-auto flex items-center justify-center">
                  <div className="w-2.5 h-2.5 rounded-full bg-black border border-slate-800 mr-2" />
                  <div className="w-1.5 h-1.5 rounded-full bg-teal-400/80" />
                </div>
                <div className="flex items-center gap-1.5">
                  <Signal className="w-3 h-3" />
                  <Wifi className="w-3 h-3" />
                  <Battery className="w-3.5 h-3.5" />
                </div>
              </div>

              {!isAuthenticated ? (
                /* Login Screen */
                <div className="flex-1 overflow-y-auto no-scrollbar">
                  <LoginScreen />
                </div>
              ) : (
                /* Authenticated Application */
                <>
                  <MobileHeader />
                  <main className="flex-1 overflow-y-auto px-4 py-3 no-scrollbar bg-slate-50">
                    {renderScreen()}
                  </main>
                  <MobileBottomNav />
                  {/* Phone Bottom Home Swipe Bar */}
                  <div className="h-3 bg-white flex items-center justify-center z-40 shrink-0 border-t border-slate-100">
                    <div className="w-28 h-1 bg-slate-300 rounded-full" />
                  </div>
                </>
              )}
            </div>
          </div>
        ) : (
          /* Full Responsive Mobile App View */
          <div className="w-full max-w-2xl mx-auto min-h-screen flex flex-col bg-slate-50 border-x border-slate-200 shadow-xl relative">
            {!isAuthenticated ? (
              /* Login Screen */
              <div className="flex-1 flex flex-col justify-center">
                <LoginScreen />
              </div>
            ) : (
              /* Authenticated Application */
              <>
                <MobileHeader />
                <main className="flex-1 px-4 py-4 sm:px-6">
                  {renderScreen()}
                </main>
                <MobileBottomNav />
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
