import React, { useState } from 'react';
import { Mail, Copy, Check, Send, AlertCircle, Info } from 'lucide-react';
import { Modal } from '../common/Modal';
import { StockAlert } from '../../types';

interface VendorEmailPreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  alert: StockAlert | null;
  onSimulateSend: (alertId: string, emailData: { recipient: string; subject: string; body: string }) => Promise<void>;
}

export const VendorEmailPreviewModal: React.FC<VendorEmailPreviewModalProps> = ({
  isOpen,
  onClose,
  alert,
  onSimulateSend
}) => {
  if (!alert) return null;

  const [recipient, setRecipient] = useState(alert.vendorEmailDraft.recipientEmail);
  const [subject, setSubject] = useState(alert.vendorEmailDraft.subject);
  const [body, setBody] = useState(alert.vendorEmailDraft.body);
  const [copied, setCopied] = useState(false);
  const [sending, setSending] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(`To: ${recipient}\nSubject: ${subject}\n\n${body}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSend = async () => {
    try {
      setSending(true);
      await onSimulateSend(alert.id, { recipient, subject, body });
      onClose();
    } catch (err) {
      console.error(err);
    } finally {
      setSending(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Automated Vendor Replenishment Notification"
      subtitle="Review & draft formal RFQ email for supplier"
      maxWidth="2xl"
    >
      <div className="space-y-4 text-xs">
        {/* Notice of simulated environment per Section 6 */}
        <div className="p-3 bg-blue-950/20 border border-blue-900/40 rounded-lg text-slate-300 flex items-start gap-2.5">
          <Info className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" />
          <p className="text-[11px] leading-relaxed">
            <strong>Demonstration Transmission Safeguard:</strong> Production email provider is simulated locally. You can copy the generated text or simulate transmission. Never claims an external email was sent when processed locally.
          </p>
        </div>

        {/* Recipient */}
        <div>
          <label className="block text-slate-400 font-medium mb-1">To (Preferred Vendor Contact)</label>
          <div className="flex items-center gap-2">
            <input
              type="email"
              value={recipient}
              onChange={(e) => setRecipient(e.target.value)}
              className="flex-1 bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white font-mono text-xs focus:outline-none focus:border-blue-500"
            />
            <span className="text-[11px] text-slate-400 font-semibold px-2 py-1 bg-slate-850 rounded border border-slate-800">
              {alert.preferredVendorName}
            </span>
          </div>
        </div>

        {/* Subject */}
        <div>
          <label className="block text-slate-400 font-medium mb-1">Subject</label>
          <input
            type="text"
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white font-medium text-xs focus:outline-none focus:border-blue-500"
          />
        </div>

        {/* Body */}
        <div>
          <div className="flex items-center justify-between mb-1">
            <label className="text-slate-400 font-medium">Email Content</label>
            <button
              type="button"
              onClick={handleCopy}
              className="flex items-center gap-1 text-[11px] text-blue-400 hover:text-blue-300"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'Copied to clipboard' : 'Copy Email'}</span>
            </button>
          </div>
          <textarea
            rows={10}
            value={body}
            onChange={(e) => setBody(e.target.value)}
            className="w-full bg-slate-850 border border-slate-700 rounded-lg p-3 text-slate-200 font-mono text-[11px] leading-relaxed focus:outline-none focus:border-blue-500"
          />
        </div>

        {/* Footer Actions */}
        <div className="pt-3 border-t border-slate-800 flex items-center justify-between">
          <div className="text-[11px] text-slate-400">
            Suggested Replenishment Qty: <strong className="text-amber-400">{alert.suggestedReplenishmentQty} {alert.uom}</strong>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              type="button"
              disabled={sending}
              onClick={handleSend}
              className="flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white font-semibold rounded-lg transition-colors shadow-sm disabled:opacity-50"
            >
              <Send className="w-3.5 h-3.5" />
              <span>{sending ? 'Simulating Dispatch...' : 'Approve & Simulate Vendor Dispatch'}</span>
            </button>
          </div>
        </div>
      </div>
    </Modal>
  );
};
