import React, { useState, useMemo } from 'react';
import { 
  ArrowLeft, 
  PlusCircle, 
  Building2, 
  Truck, 
  Package, 
  Receipt, 
  CheckCircle2, 
  Calculator 
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { formatINR } from '../../utils/formatters';

export const NewOrderScreen: React.FC = () => {
  const { 
    goBack, 
    manufacturers, 
    vendors, 
    selectedManufacturerId, 
    createPurchaseOrder, 
    navigate, 
    showToast 
  } = useApp();

  const [mfgId, setMfgId] = useState(selectedManufacturerId === 'ALL' ? 'MFG001' : selectedManufacturerId);
  const [vendorId, setVendorId] = useState(vendors[0]?.vendor_id || 'VEN001');
  const [materialId, setMaterialId] = useState('RM007');
  const [quantity, setQuantity] = useState(250);
  const [unitPrice, setUnitPrice] = useState(950);
  const [gstRate, setGstRate] = useState(18);

  const selectedMfg = manufacturers.find(m => m.manufacturer_id === mfgId) || manufacturers[0];
  const selectedVendor = vendors.find(v => v.vendor_id === vendorId) || vendors[0];

  const materialsList = useMemo(() => {
    return [
      { id: 'RM001', name: 'Mild Steel Sheet', unit: 'kg', defaultPrice: 72, hsn: '7208' },
      { id: 'RM002', name: 'Aluminium Rod', unit: 'kg', defaultPrice: 255, hsn: '7604' },
      { id: 'RM003', name: 'Copper Wire', unit: 'kg', defaultPrice: 710, hsn: '7408' },
      { id: 'RM004', name: 'Plastic Granules', unit: 'kg', defaultPrice: 108, hsn: '3901' },
      { id: 'RM005', name: 'Cotton Fabric', unit: 'meter', defaultPrice: 88, hsn: '5208' },
      { id: 'RM006', name: 'Corrugated Packaging Box', unit: 'piece', defaultPrice: 14.5, hsn: '4819' },
      { id: 'RM007', name: 'Wooden Board', unit: 'sheet', defaultPrice: 980, hsn: '4410' },
      { id: 'RM008', name: 'Rubber Seal', unit: 'piece', defaultPrice: 22.5, hsn: '4016' },
      { id: 'RM009', name: 'Electronic Component', unit: 'piece', defaultPrice: 168, hsn: '8542' },
      { id: 'RM010', name: 'Industrial Fastener', unit: 'piece', defaultPrice: 3.6, hsn: '7318' },
      { id: 'RM011', name: 'Food-grade Ingredient', unit: 'kg', defaultPrice: 125, hsn: '2106' },
      { id: 'RM012', name: 'Paint and Coating', unit: 'liter', defaultPrice: 218, hsn: '3208' },
    ];
  }, []);

  const selectedMaterial = materialsList.find(m => m.id === materialId) || materialsList[0];

  const handleMaterialChange = (newMatId: string) => {
    setMaterialId(newMatId);
    const m = materialsList.find(item => item.id === newMatId);
    if (m) {
      setUnitPrice(m.defaultPrice);
    }
  };

  const isSameState = selectedMfg?.state_code === selectedVendor?.state_code;
  const taxableValue = Math.round(quantity * unitPrice * 100) / 100;
  const taxAmount = Math.round(taxableValue * (gstRate / 100) * 100) / 100;
  const cgst = isSameState ? Math.round((taxAmount / 2) * 100) / 100 : 0;
  const sgst = isSameState ? Math.round((taxAmount / 2) * 100) / 100 : 0;
  const igst = isSameState ? 0 : taxAmount;
  const invoiceTotal = Math.round((taxableValue + taxAmount) * 100) / 100;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const createdPO = createPurchaseOrder({
      invoice_number: `INV-${selectedVendor.vendor_id}-${String(Date.now()).slice(-5)}`,
      invoice_date: new Date().toISOString().split('T')[0],
      manufacturer_id: mfgId,
      vendor_id: selectedVendor.vendor_id,
      material_id: selectedMaterial.id,
      material_name: selectedMaterial.name,
      hsn_code_example: selectedMaterial.hsn,
      quantity_ordered: quantity,
      unit: selectedMaterial.unit,
      unit_price_inr: unitPrice,
      taxable_value_inr: taxableValue,
      gst_rate_percent_example: gstRate,
      tax_type: isSameState ? 'CGST+SGST' : 'IGST',
      cgst_inr: cgst,
      sgst_inr: sgst,
      igst_inr: igst,
      invoice_total_inr: invoiceTotal,
      goods_receipt_status: 'Pending',
      invoice_reconciliation_status: 'Not Checked',
      payment_status: 'Unpaid',
      itc_review_status: 'Potentially Eligible'
    });

    navigate('order-detail', { orderId: createdPO.purchase_id });
  };

  return (
    <div className="space-y-4 pb-24 text-slate-800">
      <div className="bg-white border border-slate-200 rounded-3xl p-4 sm:p-5 shadow-sm">
        <h2 className="text-lg font-black text-slate-900 tracking-tight flex items-center gap-2">
          <PlusCircle className="w-5 h-5 text-teal-600" />
          <span>Create New Purchase Order</span>
        </h2>
        <p className="text-xs text-slate-500 mt-1">
          Issue a formal procurement order to approved vendor with automatic statutory GST calculation.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-3.5">
        {/* Manufacturer Selector */}
        <div className="bg-white border border-slate-200 rounded-2xl p-3.5 space-y-1.5 shadow-2xs">
          <label className="text-[11px] font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
            <Building2 className="w-3.5 h-3.5 text-teal-600" />
            <span>Buyer Facility (Manufacturer)</span>
          </label>
          <select
            value={mfgId}
            onChange={(e) => setMfgId(e.target.value)}
            className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-bold text-slate-800 focus:outline-none focus:border-teal-500 shadow-inner"
          >
            {manufacturers.map(m => (
              <option key={m.manufacturer_id} value={m.manufacturer_id}>
                {m.manufacturer_id} · {m.business_name} ({m.city}, {m.state} - {m.state_code})
              </option>
            ))}
          </select>
          <div className="text-[10px] text-slate-500">
            Location: {selectedMfg?.city}, {selectedMfg?.state} (State Code {selectedMfg?.state_code}) · GSTIN: {selectedMfg?.gstin}
          </div>
        </div>

        {/* Vendor Selector */}
        <div className="bg-white border border-slate-200 rounded-2xl p-3.5 space-y-1.5 shadow-2xs">
          <label className="text-[11px] font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
            <Truck className="w-3.5 h-3.5 text-teal-600" />
            <span>Supplier (Vendor)</span>
          </label>
          <select
            value={vendorId}
            onChange={(e) => setVendorId(e.target.value)}
            className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-bold text-slate-800 focus:outline-none focus:border-teal-500 shadow-inner"
          >
            {vendors.map(v => (
              <option key={v.vendor_id} value={v.vendor_id}>
                {v.vendor_id} · {v.vendor_name} ({v.city}, {v.state} - {v.state_code})
              </option>
            ))}
          </select>
          <div className="text-[10px] text-slate-500 flex items-center justify-between">
            <span>Location: {selectedVendor?.city}, {selectedVendor?.state} ({selectedVendor?.state_code})</span>
            <span className="font-bold text-teal-700">Rating: ⭐ {selectedVendor?.reliability_score_1_to_5}</span>
          </div>
        </div>

        {/* Material Selector & Quantity */}
        <div className="bg-white border border-slate-200 rounded-2xl p-3.5 space-y-3 shadow-2xs">
          <label className="text-[11px] font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
            <Package className="w-3.5 h-3.5 text-teal-600" />
            <span>Material & Commercial Terms</span>
          </label>

          <div>
            <label className="text-[10px] text-slate-500 font-semibold block mb-1">Select Raw Material</label>
            <select
              value={materialId}
              onChange={(e) => handleMaterialChange(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-bold text-slate-800 focus:outline-none focus:border-teal-500 shadow-inner"
            >
              {materialsList.map(mat => (
                <option key={mat.id} value={mat.id}>
                  {mat.id} · {mat.name} ({mat.unit})
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-2.5">
            <div>
              <label className="text-[10px] text-slate-500 font-semibold block mb-1">
                Order Quantity ({selectedMaterial.unit})
              </label>
              <input
                type="number"
                min="1"
                value={quantity}
                onChange={(e) => setQuantity(Math.max(1, Number(e.target.value)))}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-bold text-slate-800 focus:outline-none focus:border-teal-500 shadow-inner"
              />
            </div>

            <div>
              <label className="text-[10px] text-slate-500 font-semibold block mb-1">
                Unit Price (₹)
              </label>
              <input
                type="number"
                step="0.01"
                min="0.1"
                value={unitPrice}
                onChange={(e) => setUnitPrice(Math.max(0.1, Number(e.target.value)))}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-bold text-slate-800 focus:outline-none focus:border-teal-500 shadow-inner"
              />
            </div>
          </div>

          <div>
            <label className="text-[10px] text-slate-500 font-semibold block mb-1">
              GST Rate (% Tax)
            </label>
            <select
              value={gstRate}
              onChange={(e) => setGstRate(Number(e.target.value))}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-bold text-slate-800 focus:outline-none focus:border-teal-500 shadow-inner"
            >
              <option value={18}>18% (Standard Industrial Goods)</option>
              <option value={5}>5% (Textiles, Fabric, Food Ingredients)</option>
              <option value={12}>12% (Intermediate Products)</option>
              <option value={28}>28% (Specialized Equipment)</option>
            </select>
          </div>
        </div>

        {/* Live Tax Computation Summary Card */}
        <div className="bg-gradient-to-br from-teal-50/70 via-white to-emerald-50/50 border border-teal-200 rounded-2xl p-4 space-y-2 text-xs shadow-sm">
          <div className="flex items-center justify-between">
            <span className="font-bold text-teal-900 flex items-center gap-1.5">
              <Calculator className="w-3.5 h-3.5 text-teal-600" />
              <span>Live Statutory GST Calculation</span>
            </span>
            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
              isSameState ? 'bg-teal-100 text-teal-800 border border-teal-200' : 'bg-emerald-100 text-emerald-800 border border-emerald-200'
            }`}>
              {isSameState ? 'Intra-State (CGST + SGST)' : 'Inter-State (IGST)'}
            </span>
          </div>

          <div className="space-y-1 text-slate-700 pt-1">
            <div className="flex justify-between">
              <span className="text-slate-500">Taxable Subtotal:</span>
              <span className="font-semibold">{formatINR(taxableValue)}</span>
            </div>

            {isSameState ? (
              <>
                <div className="flex justify-between text-teal-700">
                  <span>CGST ({gstRate / 2}%):</span>
                  <span>{formatINR(cgst)}</span>
                </div>
                <div className="flex justify-between text-teal-700">
                  <span>SGST ({gstRate / 2}%):</span>
                  <span>{formatINR(sgst)}</span>
                </div>
              </>
            ) : (
              <div className="flex justify-between text-teal-800">
                <span>IGST ({gstRate}%):</span>
                <span>{formatINR(igst)}</span>
              </div>
            )}

            <div className="flex justify-between text-teal-900 font-black pt-1.5 border-t border-teal-100 text-sm">
              <span>Total Estimated Payable:</span>
              <span className="text-teal-700">{formatINR(invoiceTotal)}</span>
            </div>
          </div>
        </div>

        {/* Submit Button (Teal Green) */}
        <button
          type="submit"
          className="w-full py-3 px-4 bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-500 hover:to-emerald-500 text-white font-bold text-sm rounded-2xl shadow-xl shadow-teal-600/25 flex items-center justify-center gap-2 transition-all active:scale-95"
        >
          <CheckCircle2 className="w-4 h-4" />
          <span>Confirm & Issue Purchase Order</span>
        </button>
      </form>
    </div>
  );
};
