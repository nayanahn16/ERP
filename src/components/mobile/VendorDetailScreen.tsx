import React from 'react';
import { 
  ArrowLeft, 
  Truck, 
  Star, 
  MapPin, 
  CreditCard, 
  ShieldCheck, 
  PlusCircle, 
  Receipt, 
  Calendar,
  ChevronRight,
  TrendingUp
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { formatINR, formatCompactINR, formatDate } from '../../utils/formatters';

export const VendorDetailScreen: React.FC = () => {
  const { selectedVendor, goBack, purchases, navigate } = useApp();

  if (!selectedVendor) {
    return (
      <div className="py-12 text-center text-slate-500">
        <Truck className="w-10 h-10 mx-auto mb-2 text-slate-400" />
        <p>No vendor selected.</p>
        <button
          onClick={goBack}
          className="mt-4 px-4 py-2 bg-teal-600 text-white rounded-xl text-xs font-semibold"
        >
          Return to Vendors
        </button>
      </div>
    );
  }

  const vendorOrders = purchases.filter(p => p.vendor_id === selectedVendor.vendor_id);
  const totalSpend = vendorOrders.reduce((sum, p) => sum + (p.invoice_total_inr || 0), 0);

  return (
    <div className="space-y-4 pb-24 text-slate-800">
      {/* Vendor Profile Hero Card */}
      <div className="bg-white border border-slate-200 rounded-3xl p-4 sm:p-5 shadow-sm">
        <div className="flex items-center justify-between gap-2 mb-2 flex-wrap">
          <span className="text-xs font-bold px-2 py-0.5 rounded-lg bg-teal-50 text-teal-800 border border-teal-200 font-mono">
            {selectedVendor.vendor_id}
          </span>

          <div className="flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-bold">
            <Star className="w-3.5 h-3.5 fill-current" />
            <span>Reliability: {selectedVendor.reliability_score_1_to_5.toFixed(1)} / 5.0</span>
          </div>
        </div>

        <h2 className="text-xl font-black text-slate-900 tracking-tight">
          {selectedVendor.vendor_name}
        </h2>
        <div className="text-xs text-slate-500 mt-1 flex items-center gap-1.5 flex-wrap">
          <span className="px-2 py-0.2 rounded bg-slate-100 text-slate-700 font-semibold">
            {selectedVendor.vendor_category}
          </span>
          <span className="flex items-center gap-1">
            <MapPin className="w-3 h-3 text-slate-400" />
            <span>{selectedVendor.city}, {selectedVendor.state} (State Code {selectedVendor.state_code})</span>
          </span>
        </div>

        {/* Commercial terms bar */}
        <div className="grid grid-cols-2 gap-2 mt-4 pt-3 border-t border-slate-100 text-xs">
          <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200/80">
            <div className="text-[10px] text-slate-400 uppercase font-bold">Payment Terms</div>
            <div className="font-bold text-slate-900 mt-0.5">NET {selectedVendor.payment_terms_days} Days</div>
            <div className="text-[10px] text-slate-500">GST: {selectedVendor.gst_registration_type}</div>
          </div>

          <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200/80">
            <div className="text-[10px] text-slate-400 uppercase font-bold">Total Orders Spend</div>
            <div className="font-bold text-teal-700 mt-0.5">{formatCompactINR(totalSpend)}</div>
            <div className="text-[10px] text-slate-500">{vendorOrders.length} Invoices Generated</div>
          </div>
        </div>
      </div>

      {/* Action to create PO with this vendor (Teal Green) */}
      <button
        onClick={() => navigate('new-order')}
        className="w-full py-3 px-4 bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-500 hover:to-emerald-500 text-white font-bold text-xs rounded-2xl shadow-lg shadow-teal-600/25 flex items-center justify-center gap-2 transition-all active:scale-95"
      >
        <PlusCircle className="w-4 h-4" />
        <span>Create Purchase Order with this Vendor</span>
      </button>

      {/* Historical Purchases List */}
      <div className="space-y-2">
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 px-1">
          Historical Transactions ({vendorOrders.length})
        </h3>

        <div className="space-y-2">
          {vendorOrders.slice(0, 15).map(order => (
            <div
              key={order.purchase_id}
              onClick={() => navigate('order-detail', { orderId: order.purchase_id })}
              className="cursor-pointer bg-white hover:bg-teal-50/20 border border-slate-200 hover:border-teal-300 rounded-2xl p-3 transition-all flex items-center justify-between gap-2 shadow-2xs"
            >
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-slate-900 font-mono">{order.purchase_id}</span>
                  <span className="text-[10px] text-slate-400">{formatDate(order.invoice_date)}</span>
                </div>
                <div className="text-xs text-slate-700 font-semibold truncate mt-0.5">
                  {order.material_name} · {order.quantity_ordered} {order.unit}
                </div>
                <div className="flex items-center gap-1.5 mt-1">
                  <span className="text-[9.5px] px-1.5 py-0.2 rounded font-semibold bg-slate-100 text-slate-700">
                    {order.goods_receipt_status}
                  </span>
                  <span className="text-[9.5px] px-1.5 py-0.2 rounded font-semibold bg-slate-100 text-slate-700">
                    {order.payment_status}
                  </span>
                </div>
              </div>

              <div className="text-right shrink-0">
                <div className="text-xs font-black text-slate-900">
                  {formatINR(order.invoice_total_inr)}
                </div>
                <ChevronRight className="w-4 h-4 text-slate-400 ml-auto mt-1" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
