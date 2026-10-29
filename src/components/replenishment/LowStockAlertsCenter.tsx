import React, { useState } from 'react';
import { 
  BellRing, 
  AlertTriangle, 
  Mail, 
  ShoppingCart, 
  CheckCircle2, 
  Building2, 
  Clock, 
  Send, 
  Plus, 
  ArrowRight,
  Info,
  Check
} from 'lucide-react';
import { StockAlert, UserProfile, PurchaseOrder } from '../../types';
import { StatusBadge } from '../common/StatusBadge';
import { VendorEmailPreviewModal } from './VendorEmailPreviewModal';
import { formatDate, formatDateTime } from '../../lib/utils';

interface LowStockAlertsCenterProps {
  alerts: StockAlert[];
  onSimulateSendEmail: (alertId: string, emailData: { recipient: string; subject: string; body: string }) => Promise<void>;
  onConvertToPO: (alert: StockAlert, orderQty?: number) => Promise<PurchaseOrder>;
  currentUser: UserProfile;
  onNavigateToPO?: (po: PurchaseOrder) => void;
  onRunScan: () => Promise<void>;
}

export const LowStockAlertsCenter: React.FC<LowStockAlertsCenterProps> = ({
  alerts,
  onSimulateSendEmail,
  onConvertToPO,
  currentUser,
  onNavigateToPO,
  onRunScan
}) => {
  const [selectedAlertForEmail, setSelectedAlertForEmail] = useState<StockAlert | null>(null);
  const [convertingAlertId, setConvertingAlertId] = useState<string | null>(null);
  const [filterStatus, setFilterStatus] = useState<string>('ACTIVE'); // 'ACTIVE' or 'ALL' or 'RESOLVED'

  const activeAlerts = alerts.filter(a => a.status !== 'RESOLVED');
  const resolvedAlerts = alerts.filter(a => a.status === 'RESOLVED');

  const displayedAlerts = filterStatus === 'ACTIVE' 
    ? activeAlerts 
    : (filterStatus === 'RESOLVED' ? resolvedAlerts : alerts);

  const handleConvert = async (alert: StockAlert) => {
    try {
      setConvertingAlertId(alert.id);
      const newPO = await onConvertToPO(alert);
      if (onNavigateToPO) {
        onNavigateToPO(newPO);
      }
    } catch (err: any) {
      window.alert(`Error creating Purchase Order: ${err.message}`);
    } finally {
      setConvertingAlertId(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold text-white tracking-tight">Automated Vendor Replenishment Control</h1>
            <span className="px-2 py-0.5 rounded bg-blue-500/20 text-blue-400 border border-blue-500/30 text-[11px] font-bold">
              Core Differentiator
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Proactive threshold monitoring, transparent formula calculation & automated supplier RFQ generation.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={onRunScan}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-lg text-xs font-medium transition-colors"
          >
            <Clock className="w-3.5 h-3.5 text-blue-400" />
            <span>Re-scan Thresholds</span>
          </button>
        </div>
      </div>

      {/* Formula & Rule Transparency Banner */}
      <div className="p-4 bg-slate-900 border border-slate-800 rounded-xl space-y-2">
        <div className="flex items-center gap-2 text-xs font-semibold text-white">
          <Info className="w-4 h-4 text-blue-400" />
          <span>Replenishment Quantity Formula & Anti-Duplication Safeguards:</span>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs pt-1">
          <div className="p-2.5 bg-slate-850 rounded-lg border border-slate-800">
            <span className="text-slate-400 text-[11px] block font-medium">Mathematical Formula:</span>
            <code className="text-amber-400 font-mono text-[11px] font-bold mt-1 block">
              Qty = Target Stock - Available Stock - OnOrder Qty
            </code>
          </div>
          <div className="p-2.5 bg-slate-850 rounded-lg border border-slate-800">
            <span className="text-slate-400 text-[11px] block font-medium">De-duplication Policy:</span>
            <span className="text-slate-300 text-[11px] mt-1 block leading-tight">
              Page refreshes do not duplicate open alerts for the same item/warehouse pair.
            </span>
          </div>
          <div className="p-2.5 bg-slate-850 rounded-lg border border-slate-800">
            <span className="text-slate-400 text-[11px] block font-medium">Lifecycle Tracking:</span>
            <span className="text-slate-300 text-[11px] mt-1 block leading-tight font-mono">
              Detected → Review → Drafted → Approved → PO Created → Resolved
            </span>
          </div>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 text-xs border-b border-slate-800 pb-2">
        <button
          onClick={() => setFilterStatus('ACTIVE')}
          className={`px-3 py-1.5 rounded-lg font-medium transition-colors ${
            filterStatus === 'ACTIVE'
              ? 'bg-blue-600 text-white'
              : 'text-slate-400 hover:text-white hover:bg-slate-800'
          }`}
        >
          Active Exceptions ({activeAlerts.length})
        </button>
        <button
          onClick={() => setFilterStatus('RESOLVED')}
          className={`px-3 py-1.5 rounded-lg font-medium transition-colors ${
            filterStatus === 'RESOLVED'
              ? 'bg-blue-600 text-white'
              : 'text-slate-400 hover:text-white hover:bg-slate-800'
          }`}
        >
          Resolved History ({resolvedAlerts.length})
        </button>
        <button
          onClick={() => setFilterStatus('ALL')}
          className={`px-3 py-1.5 rounded-lg font-medium transition-colors ${
            filterStatus === 'ALL'
              ? 'bg-blue-600 text-white'
              : 'text-slate-400 hover:text-white hover:bg-slate-800'
          }`}
        >
          All Notifications ({alerts.length})
        </button>
      </div>

      {/* Alerts Grid */}
      <div className="space-y-4">
        {displayedAlerts.length === 0 ? (
          <div className="py-12 text-center text-xs text-slate-400 bg-slate-900 border border-slate-800 rounded-xl">
            <CheckCircle2 className="w-8 h-8 text-emerald-400 mx-auto mb-2" />
            <p className="font-semibold text-white">All inventory levels are currently healthy!</p>
            <p className="text-slate-400 mt-1">No pending replenishment alerts for the selected filter.</p>
          </div>
        ) : (
          displayedAlerts.map(alert => {
            const isResolved = alert.status === 'RESOLVED';
            const isPoCreated = alert.status === 'PO_CREATED';

            return (
              <div
                key={alert.id}
                className={`p-5 rounded-xl border transition-all ${
                  isResolved
                    ? 'bg-slate-900/60 border-slate-800 opacity-75'
                    : alert.urgency === 'CRITICAL'
                      ? 'bg-slate-900 border-amber-500/40 shadow-sm'
                      : 'bg-slate-900 border-slate-800'
                }`}
              >
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                  {/* Item and Trigger details */}
                  <div className="space-y-2 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-mono text-xs font-bold text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/30">
                        {alert.sku}
                      </span>
                      <h3 className="font-bold text-white text-sm">{alert.itemName}</h3>
                      <StatusBadge status={alert.status} />
                      <span className="text-slate-400 text-xs">at {alert.warehouseName}</span>
                    </div>

                    {/* Numbers breakdown */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs pt-2">
                      <div className="bg-slate-850 p-2.5 rounded-lg border border-slate-800">
                        <span className="text-slate-400 text-[11px] block">Current Available:</span>
                        <span className="font-bold text-rose-400 text-sm mt-0.5 block">
                          {alert.currentAvailableQty} {alert.uom}
                        </span>
                        <span className="text-[10px] text-slate-400">Min Threshold: {alert.minThreshold} {alert.uom}</span>
                      </div>

                      <div className="bg-slate-850 p-2.5 rounded-lg border border-slate-800">
                        <span className="text-slate-400 text-[11px] block">Target Stock Level:</span>
                        <span className="font-bold text-slate-200 text-sm mt-0.5 block">
                          {alert.targetStock} {alert.uom}
                        </span>
                        <span className="text-[10px] text-slate-400">Open on Order: {alert.quantityOnOrder} {alert.uom}</span>
                      </div>

                      <div className="bg-slate-850 p-2.5 rounded-lg border border-amber-500/20">
                        <span className="text-amber-400 text-[11px] font-semibold block">Suggested Replenish:</span>
                        <span className="font-bold text-amber-300 text-base mt-0.5 block">
                          {alert.suggestedReplenishmentQty} {alert.uom}
                        </span>
                        <span className="text-[10px] text-slate-400">Formula evaluated</span>
                      </div>

                      <div className="bg-slate-850 p-2.5 rounded-lg border border-slate-800">
                        <span className="text-slate-400 text-[11px] block">Preferred Supplier:</span>
                        <span className="font-semibold text-white text-xs truncate block mt-0.5">
                          {alert.preferredVendorName}
                        </span>
                        <span className="text-[10px] text-slate-400 font-mono truncate block">{alert.preferredVendorEmail}</span>
                      </div>
                    </div>

                    {/* Notes / Email Dispatch status */}
                    <div className="flex items-center gap-3 text-[11px] text-slate-400 pt-1">
                      <span>Detected: {formatDateTime(alert.createdAt)}</span>
                      {alert.vendorEmailDraft.isSimulatedSent && (
                        <span className="text-emerald-400 flex items-center gap-1 font-medium">
                          <Check className="w-3.5 h-3.5" />
                          <span>Simulated RFQ Dispatched to {alert.preferredVendorEmail}</span>
                        </span>
                      )}
                      {alert.linkedPoId && (
                        <span className="text-blue-400 font-medium">
                          Linked PO: {alert.linkedPoId}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Actions Column */}
                  {!isResolved && (
                    <div className="flex flex-row lg:flex-col gap-2 shrink-0 justify-end">
                      <button
                        onClick={() => setSelectedAlertForEmail(alert)}
                        className="flex items-center justify-center gap-1.5 px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-lg text-xs font-medium transition-colors"
                      >
                        <Mail className="w-3.5 h-3.5 text-blue-400" />
                        <span>Draft Vendor Email</span>
                      </button>

                      <button
                        disabled={convertingAlertId === alert.id || isPoCreated}
                        onClick={() => handleConvert(alert)}
                        className="flex items-center justify-center gap-1.5 px-3 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-semibold shadow-sm transition-colors disabled:opacity-50"
                      >
                        <ShoppingCart className="w-3.5 h-3.5" />
                        <span>{convertingAlertId === alert.id ? 'Creating...' : (isPoCreated ? 'PO Created' : 'Convert to PO')}</span>
                      </button>
                    </div>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Vendor Email Preview Modal */}
      <VendorEmailPreviewModal
        isOpen={!!selectedAlertForEmail}
        onClose={() => setSelectedAlertForEmail(null)}
        alert={selectedAlertForEmail}
        onSimulateSend={onSimulateSendEmail}
      />
    </div>
  );
};
