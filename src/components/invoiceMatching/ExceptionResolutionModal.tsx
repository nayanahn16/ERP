import React, { useState } from 'react';
import { ShieldAlert, CheckCircle2, FileText, AlertCircle } from 'lucide-react';
import { Modal } from '../common/Modal';
import { ThreeWayMatchResult, UserProfile } from '../../types';

interface ExceptionResolutionModalProps {
  isOpen: boolean;
  onClose: () => void;
  matchResult: ThreeWayMatchResult | null;
  currentUser: UserProfile;
  onResolve: (
    matchId: string,
    action: 'CREDIT_NOTE_REQUESTED' | 'OVERRIDDEN_APPROVED' | 'RESOLVED',
    notes: string
  ) => Promise<void>;
}

export const ExceptionResolutionModal: React.FC<ExceptionResolutionModalProps> = ({
  isOpen,
  onClose,
  matchResult,
  currentUser,
  onResolve
}) => {
  const [actionType, setActionType] = useState<'CREDIT_NOTE_REQUESTED' | 'OVERRIDDEN_APPROVED' | 'RESOLVED'>('CREDIT_NOTE_REQUESTED');
  const [resolutionNotes, setResolutionNotes] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!matchResult) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!resolutionNotes.trim()) {
      setError('A documented resolution note or authorization reason is required.');
      return;
    }

    try {
      setLoading(true);
      await onResolve(matchResult.id, actionType, resolutionNotes);
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to resolve discrepancy');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Resolve Three-Way Matching Discrepancy"
      subtitle={`Invoice: ${matchResult.invoiceNumber} • PO: ${matchResult.poNumber}`}
      maxWidth="lg"
    >
      <form onSubmit={handleSubmit} className="space-y-4 text-xs">
        {error && (
          <div className="p-3 bg-rose-500/15 border border-rose-500/30 rounded-lg text-rose-300 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Active Discrepancy Summary */}
        <div className="p-3 bg-rose-500/10 border border-rose-500/30 rounded-xl space-y-1.5">
          <div className="flex items-center gap-2 text-rose-400 font-semibold text-xs">
            <ShieldAlert className="w-4 h-4 shrink-0" />
            <span>{matchResult.matchStatus.replace(/_/g, ' ')}</span>
          </div>
          {matchResult.discrepancies.map((d, i) => (
            <p key={i} className="text-slate-300 text-[11px] leading-relaxed">
              {d.description}
            </p>
          ))}
        </div>

        {/* Resolution Options */}
        <div>
          <label className="block text-slate-400 font-medium mb-1.5">Resolution Action</label>
          <div className="space-y-2">
            <label className={`flex items-start gap-3 p-3 rounded-xl border cursor-pointer transition-colors ${
              actionType === 'CREDIT_NOTE_REQUESTED'
                ? 'bg-blue-600/10 border-blue-500 text-white'
                : 'bg-slate-850 border-slate-700 text-slate-300 hover:bg-slate-800'
            }`}>
              <input
                type="radio"
                name="action"
                value="CREDIT_NOTE_REQUESTED"
                checked={actionType === 'CREDIT_NOTE_REQUESTED'}
                onChange={() => setActionType('CREDIT_NOTE_REQUESTED')}
                className="mt-0.5 text-blue-600"
              />
              <div>
                <span className="font-semibold block text-xs">Request Vendor Credit Note (Maintain Payment Hold)</span>
                <span className="text-[11px] text-slate-400 block mt-0.5">
                  Keep invoice on hold until vendor issues a credit note or revised invoice for delivered portion.
                </span>
              </div>
            </label>

            <label className={`flex items-start gap-3 p-3 rounded-xl border cursor-pointer transition-colors ${
              actionType === 'OVERRIDDEN_APPROVED'
                ? 'bg-amber-500/10 border-amber-500 text-white'
                : 'bg-slate-850 border-slate-700 text-slate-300 hover:bg-slate-800'
            }`}>
              <input
                type="radio"
                name="action"
                value="OVERRIDDEN_APPROVED"
                checked={actionType === 'OVERRIDDEN_APPROVED'}
                onChange={() => setActionType('OVERRIDDEN_APPROVED')}
                className="mt-0.5 text-amber-500"
              />
              <div>
                <span className="font-semibold block text-xs">Authorized Commercial Override (Approve for Payment)</span>
                <span className="text-[11px] text-slate-400 block mt-0.5">
                  Approve payment under authorized management discretion. Produces mandatory audit event.
                </span>
              </div>
            </label>
          </div>
        </div>

        {/* Resolution Justification */}
        <div>
          <label className="block text-slate-400 font-medium mb-1">
            Mandatory Authorization Justification / Reference Notes *
          </label>
          <textarea
            required
            rows={4}
            value={resolutionNotes}
            onChange={(e) => setResolutionNotes(e.target.value)}
            placeholder="Document reference (e.g. Vendor email agreement dated 24-Oct or Credit note #CN-992)"
            className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2.5 text-white focus:outline-none focus:border-blue-500 text-xs"
          />
        </div>

        <div className="p-3 bg-slate-850 rounded-lg border border-slate-800 text-[11px] text-slate-400 flex items-center justify-between">
          <span>Authorizing User: <strong className="text-white">{currentUser.name}</strong> ({currentUser.role})</span>
          <span className="text-blue-400">Append-Only Audit Logged</span>
        </div>

        <div className="pt-3 border-t border-slate-800 flex items-center justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white font-semibold rounded-lg transition-colors shadow-sm disabled:opacity-50"
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>{loading ? 'Submitting...' : 'Record Exception Resolution'}</span>
          </button>
        </div>
      </form>
    </Modal>
  );
};
