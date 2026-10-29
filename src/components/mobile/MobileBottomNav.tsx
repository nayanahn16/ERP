import React from 'react';
import { 
  Home, 
  Package, 
  FileText, 
  Receipt, 
  Building2, 
  MoreHorizontal 
} from 'lucide-react';
import { useApp, ScreenName } from '../../context/AppContext';

export const MobileBottomNav: React.FC = () => {
  const { currentScreen, navigate, kpis } = useApp();

  // Highlight active bottom item based on screen
  const getIsActive = (target: ScreenName) => {
    if (target === 'home') return currentScreen === 'home';
    if (target === 'inventory') return currentScreen === 'inventory' || currentScreen === 'inventory-detail';
    if (target === 'orders') return currentScreen === 'orders' || currentScreen === 'order-detail' || currentScreen === 'new-order';
    if (target === 'gst') return currentScreen === 'gst';
    if (target === 'manufacturers') return currentScreen === 'manufacturers';
    return currentScreen === 'vendors' || currentScreen === 'matching' || currentScreen === 'reports' || currentScreen === 'scenarios';
  };

  const navItems = [
    {
      id: 'home' as ScreenName,
      label: 'Home',
      icon: Home,
      badge: 0
    },
    {
      id: 'inventory' as ScreenName,
      label: 'Stock',
      icon: Package,
      badge: kpis.lowStockCount
    },
    {
      id: 'orders' as ScreenName,
      label: 'Orders',
      icon: FileText,
      badge: kpis.overdueCount + kpis.mismatchCount
    },
    {
      id: 'gst' as ScreenName,
      label: 'GST & ITC',
      icon: Receipt,
      badge: kpis.mismatchCount
    },
    {
      id: 'manufacturers' as ScreenName,
      label: 'Mfg (120)',
      icon: Building2,
      badge: 0
    },
    {
      id: 'scenarios' as ScreenName,
      label: 'Demo',
      icon: MoreHorizontal,
      badge: 0
    }
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-xl border-t border-slate-200 px-2 py-1 max-w-lg mx-auto sm:max-w-xl transition-all shadow-[0_-4px_20px_rgba(0,0,0,0.06)]">
      <div className="flex items-center justify-around">
        {navItems.map((item) => {
          const isActive = getIsActive(item.id);
          const IconComponent = item.icon;
          return (
            <button
              key={item.id}
              onClick={() => navigate(item.id)}
              className={`relative flex flex-col items-center justify-center py-1 px-2.5 rounded-2xl transition-all duration-200 ${
                isActive 
                  ? 'text-teal-700 font-bold scale-105' 
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              <div className="relative">
                <IconComponent className={`w-5 h-5 transition-transform ${isActive ? 'stroke-[2.5px] text-teal-600' : 'stroke-[1.8px]'}`} />
                {item.badge > 0 && (
                  <span className="absolute -top-1.5 -right-2.5 bg-rose-500 text-white text-[10px] font-bold px-1.5 py-0.2 rounded-full min-w-[16px] text-center shadow-sm animate-pulse">
                    {item.badge > 99 ? '99+' : item.badge}
                  </span>
                )}
              </div>
              <span className={`text-[10.5px] mt-0.5 tracking-tight font-medium ${isActive ? 'text-teal-700 font-bold' : 'text-slate-500'}`}>
                {item.label}
              </span>
              {isActive && (
                <div className="w-1.5 h-1.5 bg-teal-600 rounded-full mt-0.5" />
              )}
            </button>
          );
        })}
      </div>
    </nav>
  );
};
