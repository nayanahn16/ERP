import React, { useState, useMemo } from 'react';
import { 
  Truck, 
  Search, 
  Star, 
  MapPin, 
  ChevronRight, 
  CreditCard, 
  ShieldCheck, 
  PlusCircle,
  Building
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { VendorRecord } from '../../types/dataset';
import { formatCompactINR, formatINR } from '../../utils/formatters';

export const VendorsScreen: React.FC = () => {
  const { vendors, purchases, navigate } = useApp();
  const [search, setSearch] = useState('');
  const [selectedCat, setSelectedCat] = useState<string>('ALL');

  const categories = useMemo(() => {
    const set = new Set<string>();
    vendors.forEach(v => set.add(v.vendor_category));
    return ['ALL', ...Array.from(set)];
  }, [vendors]);

  const vendorStats = useMemo(() => {
    const stats: Record<string, { count: number; spend: number }> = {};
    for (const p of purchases) {
      if (!stats[p.vendor_id]) {
        stats[p.vendor_id] = { count: 0, spend: 0 };
      }
      stats[p.vendor_id].count++;
      stats[p.vendor_id].spend += p.invoice_total_inr || 0;
    }
    return stats;
  }, [purchases]);

  const filteredVendors = useMemo(() => {
    return vendors.filter(v => {
      const q = search.toLowerCase();
      const matchSearch = 
        v.vendor_name.toLowerCase().includes(q) || 
        v.vendor_id.toLowerCase().includes(q) ||
        v.city.toLowerCase().includes(q) ||
        v.state.toLowerCase().includes(q);

      if (!matchSearch) return false;
      if (selectedCat !== 'ALL' && v.vendor_category !== selectedCat) return false;
      return true;
    });
  }, [vendors, search, selectedCat]);

  return (
    <div className="space-y-3.5 pb-24 text-slate-800">
      {/* Search Input Bar (White Background) */}
      <div className="relative">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search 80 vendors by name, city, state..."
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

      {/* Category Filter Chips */}
      <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-1">
        {categories.map(cat => (
          <button
            key={cat}
            onClick={() => setSelectedCat(cat)}
            className={`shrink-0 text-xs px-3 py-1.5 rounded-xl font-medium transition-all ${
              selectedCat === cat
                ? 'bg-teal-600 text-white font-bold shadow-md shadow-teal-600/25'
                : 'bg-white text-slate-600 hover:text-slate-900 border border-slate-200'
            }`}
          >
            {cat === 'ALL' ? `All Vendors (${vendors.length})` : cat}
          </button>
        ))}
      </div>

      {/* Vendors Cards List (White Cards) */}
      <div className="space-y-2.5">
        {filteredVendors.map(v => {
          const stats = vendorStats[v.vendor_id] || { count: 0, spend: 0 };
          const isReliable = v.reliability_score_1_to_5 >= 4.0;

          return (
            <div
              key={v.vendor_id}
              onClick={() => navigate('vendor-detail', { vendorId: v.vendor_id })}
              className="cursor-pointer bg-white hover:bg-teal-50/20 border border-slate-200 hover:border-teal-300 rounded-2xl p-3.5 transition-all shadow-xs"
            >
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span className="text-xs font-bold px-1.5 py-0.5 rounded bg-teal-50 text-teal-800 border border-teal-200 font-mono">
                      {v.vendor_id}
                    </span>
                    <span className="text-xs font-semibold px-2 py-0.2 rounded-full bg-slate-100 text-slate-700 border border-slate-200 text-[10.5px]">
                      {v.vendor_category}
                    </span>
                  </div>

                  <h3 className="text-sm font-bold text-slate-900 tracking-tight mt-1 truncate">
                    {v.vendor_name}
                  </h3>

                  <div className="flex items-center gap-2 text-xs text-slate-500 mt-0.5">
                    <span className="flex items-center gap-1">
                      <MapPin className="w-3 h-3 text-slate-400" />
                      <span>{v.city}, {v.state} ({v.state_code})</span>
                    </span>
                  </div>

                  <div className="flex items-center gap-2 mt-2 flex-wrap text-[10px]">
                    <span className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 font-medium border border-slate-200">
                      Payment: NET {v.payment_terms_days} Days
                    </span>
                    <span className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">
                      GST: {v.gst_registration_type}
                    </span>
                    <span className="text-slate-500 font-medium">
                      {stats.count} Orders · Spend: <strong className="text-slate-800">{formatCompactINR(stats.spend)}</strong>
                    </span>
                  </div>
                </div>

                {/* Right Reliability Badge & Chevron */}
                <div className="flex flex-col items-end gap-2 shrink-0">
                  <div className={`flex items-center gap-1 px-2 py-0.5 rounded-xl text-xs font-bold ${
                    isReliable 
                      ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' 
                      : 'bg-amber-50 text-amber-700 border border-amber-200'
                  }`}>
                    <Star className="w-3 h-3 fill-current" />
                    <span>{v.reliability_score_1_to_5.toFixed(1)}</span>
                  </div>

                  <div className="p-1 rounded-lg bg-slate-100 text-slate-400 mt-2">
                    <ChevronRight className="w-4 h-4" />
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
