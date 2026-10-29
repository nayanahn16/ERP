import React, { useState, useMemo } from 'react';
import { 
  Building2, 
  Search, 
  MapPin, 
  Check, 
  Users, 
  Globe, 
  Filter,
  CheckCircle2,
  ChevronRight
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { Manufacturer } from '../../types/dataset';

export const ManufacturersScreen: React.FC = () => {
  const { 
    manufacturers, 
    selectedManufacturerId, 
    selectManufacturer, 
    navigate,
    inventory,
    purchases 
  } = useApp();

  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');

  const categories = useMemo(() => {
    const set = new Set<string>();
    manufacturers.forEach(m => set.add(m.manufacturing_category));
    return ['ALL', ...Array.from(set)];
  }, [manufacturers]);

  const mfgStats = useMemo(() => {
    const stats: Record<string, { skus: number; orders: number }> = {};
    for (const item of inventory) {
      if (!stats[item.manufacturer_id]) stats[item.manufacturer_id] = { skus: 0, orders: 0 };
      stats[item.manufacturer_id].skus++;
    }
    for (const po of purchases) {
      if (!stats[po.manufacturer_id]) stats[po.manufacturer_id] = { skus: 0, orders: 0 };
      stats[po.manufacturer_id].orders++;
    }
    return stats;
  }, [inventory, purchases]);

  const filtered = useMemo(() => {
    return manufacturers.filter(m => {
      const q = search.toLowerCase();
      const matchSearch = 
        m.business_name.toLowerCase().includes(q) || 
        m.manufacturer_id.toLowerCase().includes(q) ||
        m.city.toLowerCase().includes(q) ||
        m.state.toLowerCase().includes(q) ||
        m.manufacturing_category.toLowerCase().includes(q);

      if (!matchSearch) return false;
      if (selectedCategory !== 'ALL' && m.manufacturing_category !== selectedCategory) return false;
      return true;
    });
  }, [manufacturers, search, selectedCategory]);

  return (
    <div className="space-y-3.5 pb-24 text-slate-800">
      {/* Search Input Bar (White Background) */}
      <div className="relative">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search 120 manufacturers by name, city, state, industry..."
          className="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-white border border-slate-200 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:border-teal-500 transition-colors shadow-xs"
        />
        {search && (
          <button 
            onClick={() => setSearch('')}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-500 hover:text-slate-800 px-1.5 py-0.5 rounded-md bg-slate-100"
          >
            Clear
          </button>
        )}
      </div>

      {/* Consolidated All-Manufacturers Card (Teal Accent) */}
      <div 
        onClick={() => {
          selectManufacturer('ALL');
          navigate('home');
        }}
        className={`cursor-pointer rounded-2xl p-4 border transition-all shadow-xs flex items-center justify-between ${
          selectedManufacturerId === 'ALL'
            ? 'bg-teal-50/90 border-teal-500 shadow-teal-500/10 ring-1 ring-teal-500/30'
            : 'bg-white hover:bg-slate-50 border-slate-200'
        }`}
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-teal-100 text-teal-800 flex items-center justify-center font-bold border border-teal-200">
            <Globe className="w-5 h-5 text-teal-700" />
          </div>
          <div>
            <div className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <span>All 120 Manufacturers (Consolidated View)</span>
              {selectedManufacturerId === 'ALL' && (
                <span className="text-[10px] bg-teal-600 text-white px-2 py-0.5 rounded-full font-bold">Active</span>
              )}
            </div>
            <div className="text-xs text-slate-500 mt-0.5">
              Pan-India aggregation of all 2,000 orders & 755 inventory records
            </div>
          </div>
        </div>
        {selectedManufacturerId === 'ALL' ? (
          <CheckCircle2 className="w-5 h-5 text-teal-600 shrink-0" />
        ) : (
          <ChevronRight className="w-5 h-5 text-slate-400 shrink-0" />
        )}
      </div>

      {/* Category Filter Chips */}
      <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-1">
        {categories.map(cat => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={`shrink-0 text-xs px-3 py-1.5 rounded-xl font-medium transition-all ${
              selectedCategory === cat
                ? 'bg-teal-600 text-white font-bold shadow-md shadow-teal-600/25'
                : 'bg-white text-slate-600 hover:text-slate-900 border border-slate-200'
            }`}
          >
            {cat === 'ALL' ? `All Categories (${manufacturers.length})` : cat}
          </button>
        ))}
      </div>

      {/* Manufacturers Cards List (White Cards) */}
      <div className="space-y-2.5">
        {filtered.map(m => {
          const isSelected = selectedManufacturerId === m.manufacturer_id;
          const stats = mfgStats[m.manufacturer_id] || { skus: 0, orders: 0 };

          return (
            <div
              key={m.manufacturer_id}
              onClick={() => {
                selectManufacturer(m.manufacturer_id);
                navigate('home');
              }}
              className={`cursor-pointer rounded-2xl p-3.5 border transition-all shadow-2xs ${
                isSelected 
                  ? 'bg-teal-50/50 border-teal-500 ring-1 ring-teal-500/40 shadow-sm' 
                  : 'bg-white hover:bg-slate-50 border-slate-200 hover:border-teal-300'
              }`}
            >
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span className="text-xs font-bold px-1.5 py-0.5 rounded bg-teal-50 text-teal-800 border border-teal-200 font-mono">
                      {m.manufacturer_id}
                    </span>
                    <span className="text-xs font-semibold px-2 py-0.2 rounded-full bg-slate-100 text-slate-700 border border-slate-200 text-[10.5px]">
                      {m.manufacturing_category}
                    </span>
                    {isSelected && (
                      <span className="text-[10px] font-bold px-2 py-0.2 rounded-full bg-teal-600 text-white">
                        Active Facility
                      </span>
                    )}
                  </div>

                  <h3 className="text-sm font-bold text-slate-900 tracking-tight mt-1 truncate">
                    {m.business_name}
                  </h3>

                  <div className="flex items-center gap-2 text-xs text-slate-500 mt-0.5">
                    <span className="flex items-center gap-1">
                      <MapPin className="w-3 h-3 text-slate-400" />
                      <span>{m.city}, {m.state} (State Code {m.state_code})</span>
                    </span>
                  </div>

                  <div className="flex items-center gap-3 mt-2 text-[11px] text-slate-500 font-medium">
                    <span className="flex items-center gap-1">
                      <Users className="w-3 h-3 text-slate-400" />
                      <span>{m.employee_count} Staff</span>
                    </span>
                    <span>·</span>
                    <span>{stats.skus} SKUs</span>
                    <span>·</span>
                    <span>{stats.orders} POs</span>
                  </div>
                </div>

                {/* Right Selection Button / Checkmark */}
                <div className="flex flex-col items-end gap-2 shrink-0">
                  {isSelected ? (
                    <div className="w-6 h-6 rounded-full bg-teal-600 text-white flex items-center justify-center shadow-md shadow-teal-600/30">
                      <Check className="w-3.5 h-3.5 stroke-[3]" />
                    </div>
                  ) : (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        selectManufacturer(m.manufacturer_id);
                        navigate('home');
                      }}
                      className="text-xs font-bold px-2.5 py-1 rounded-xl bg-slate-100 hover:bg-teal-50 text-teal-700 hover:text-teal-800 border border-slate-200 hover:border-teal-200 transition-colors"
                    >
                      Select
                    </button>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
