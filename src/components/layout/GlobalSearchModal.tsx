import React, { useState, useEffect, useMemo } from 'react';
import { 
  Search, 
  X, 
  Boxes, 
  Building2, 
  ShoppingCart, 
  Truck, 
  FileCheck2, 
  ArrowRight,
  Receipt
} from 'lucide-react';
import { 
  InventoryItem, 
  Vendor, 
  PurchaseOrder, 
  GoodsReceiptNote, 
  VendorInvoice 
} from '../../types';

interface GlobalSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  items: InventoryItem[];
  vendors: Vendor[];
  purchaseOrders: PurchaseOrder[];
  goodsReceipts: GoodsReceiptNote[];
  invoices: VendorInvoice[];
  onNavigate: (tab: any, itemContext?: any) => void;
}

export const GlobalSearchModal: React.FC<GlobalSearchModalProps> = ({
  isOpen,
  onClose,
  items,
  vendors,
  purchaseOrders,
  goodsReceipts,
  invoices,
  onNavigate
}) => {
  const [query, setQuery] = useState('');

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        // toggle handled by parent
      }
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  if (!isOpen) return null;

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return { items: [], vendors: [], pos: [], grns: [], invoices: [] };

    return {
      items: items.filter(
        i => i.name.toLowerCase().includes(q) || i.sku.toLowerCase().includes(q) || i.category.toLowerCase().includes(q)
      ).slice(0, 4),
      vendors: vendors.filter(
        v => v.legalName.toLowerCase().includes(q) || v.gstin.toLowerCase().includes(q) || v.city.toLowerCase().includes(q)
      ).slice(0, 4),
      pos: purchaseOrders.filter(
        p => p.poNumber.toLowerCase().includes(q) || p.vendorName.toLowerCase().includes(q)
      ).slice(0, 4),
      grns: goodsReceipts.filter(
        g => g.grnNumber.toLowerCase().includes(q) || g.poNumber.toLowerCase().includes(q) || g.deliveryChallanNo.toLowerCase().includes(q)
      ).slice(0, 4),
      invoices: invoices.filter(
        inv => inv.invoiceNumber.toLowerCase().includes(q) || inv.vendorName.toLowerCase().includes(q)
      ).slice(0, 4)
    };
  }, [query, items, vendors, purchaseOrders, goodsReceipts, invoices]);

  const totalResults = results.items.length + results.vendors.length + results.pos.length + results.grns.length + results.invoices.length;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="fixed inset-0" onClick={onClose} />

      <div className="relative w-full max-w-2xl bg-slate-900 border border-slate-700 rounded-xl shadow-2xl overflow-hidden z-10 flex flex-col">
        {/* Search Input */}
        <div className="flex items-center px-4 py-3.5 border-b border-slate-800 bg-slate-850">
          <Search className="w-5 h-5 text-slate-400 mr-3 shrink-0" />
          <input
            type="text"
            autoFocus
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search SKUs, POs, GRNs, Invoices, Vendors, GSTINs..."
            className="w-full bg-transparent text-sm text-white placeholder-slate-400 focus:outline-none"
          />
          {query && (
            <button onClick={() => setQuery('')} className="p-1 text-slate-400 hover:text-white mr-1">
              <X className="w-4 h-4" />
            </button>
          )}
          <kbd className="px-2 py-0.5 text-[10px] font-mono text-slate-400 bg-slate-800 border border-slate-700 rounded">
            ESC
          </kbd>
        </div>

        {/* Results Area */}
        <div className="max-h-[60vh] overflow-y-auto p-4 space-y-4">
          {query.trim() === '' ? (
            <div className="py-8 text-center text-xs text-slate-400">
              <p>Type keywords to search across inventory, procurement, and finance records.</p>
              <div className="flex justify-center gap-2 mt-3">
                <span className="px-2 py-1 bg-slate-800 rounded border border-slate-700 font-mono text-[11px] cursor-pointer" onClick={() => setQuery('CW-102')}>CW-102</span>
                <span className="px-2 py-1 bg-slate-800 rounded border border-slate-700 font-mono text-[11px] cursor-pointer" onClick={() => setQuery('PO-2026-0812')}>PO-2026-0812</span>
                <span className="px-2 py-1 bg-slate-800 rounded border border-slate-700 font-mono text-[11px] cursor-pointer" onClick={() => setQuery('Apex')}>Apex</span>
                <span className="px-2 py-1 bg-slate-800 rounded border border-slate-700 font-mono text-[11px] cursor-pointer" onClick={() => setQuery('INV-2026-9042')}>INV-2026-9042</span>
              </div>
            </div>
          ) : totalResults === 0 ? (
            <div className="py-8 text-center text-xs text-slate-400">
              No matching records found for "{query}".
            </div>
          ) : (
            <>
              {/* Items */}
              {results.items.length > 0 && (
                <div>
                  <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                    <Boxes className="w-3.5 h-3.5 text-blue-400" />
                    <span>Inventory Items</span>
                  </div>
                  <div className="space-y-1">
                    {results.items.map(item => (
                      <div
                        key={item.id}
                        onClick={() => { onNavigate('inventory', item); onClose(); }}
                        className="flex items-center justify-between p-2.5 rounded-lg hover:bg-slate-800 cursor-pointer text-xs transition-colors"
                      >
                        <div>
                          <div className="font-semibold text-white">{item.name}</div>
                          <div className="text-slate-400 font-mono text-[11px]">{item.sku} • {item.category} • Avail: {item.totalAvailableQty} {item.uom}</div>
                        </div>
                        <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Purchase Orders */}
              {results.pos.length > 0 && (
                <div>
                  <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                    <ShoppingCart className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Purchase Orders</span>
                  </div>
                  <div className="space-y-1">
                    {results.pos.map(po => (
                      <div
                        key={po.id}
                        onClick={() => { onNavigate('procurement', po); onClose(); }}
                        className="flex items-center justify-between p-2.5 rounded-lg hover:bg-slate-800 cursor-pointer text-xs transition-colors"
                      >
                        <div>
                          <div className="font-semibold text-white font-mono">{po.poNumber} — {po.vendorName}</div>
                          <div className="text-slate-400 text-[11px]">Total: ₹{po.grandTotal.toLocaleString('en-IN')} • Status: {po.status}</div>
                        </div>
                        <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Invoices */}
              {results.invoices.length > 0 && (
                <div>
                  <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                    <FileCheck2 className="w-3.5 h-3.5 text-rose-400" />
                    <span>Vendor Invoices</span>
                  </div>
                  <div className="space-y-1">
                    {results.invoices.map(inv => (
                      <div
                        key={inv.id}
                        onClick={() => { onNavigate('invoice-matching', inv); onClose(); }}
                        className="flex items-center justify-between p-2.5 rounded-lg hover:bg-slate-800 cursor-pointer text-xs transition-colors"
                      >
                        <div>
                          <div className="font-semibold text-white font-mono">{inv.invoiceNumber} — {inv.vendorName}</div>
                          <div className="text-slate-400 text-[11px]">₹{inv.grandTotal.toLocaleString('en-IN')} • Payment: {inv.paymentStatus}</div>
                        </div>
                        <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Vendors */}
              {results.vendors.length > 0 && (
                <div>
                  <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                    <Building2 className="w-3.5 h-3.5 text-amber-400" />
                    <span>Vendors</span>
                  </div>
                  <div className="space-y-1">
                    {results.vendors.map(ven => (
                      <div
                        key={ven.id}
                        onClick={() => { onNavigate('vendors', ven); onClose(); }}
                        className="flex items-center justify-between p-2.5 rounded-lg hover:bg-slate-800 cursor-pointer text-xs transition-colors"
                      >
                        <div>
                          <div className="font-semibold text-white">{ven.legalName}</div>
                          <div className="text-slate-400 text-[11px] font-mono">{ven.gstin} • {ven.city}, {ven.state}</div>
                        </div>
                        <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};
