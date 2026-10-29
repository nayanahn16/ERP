import React from 'react';
import { cn } from '../../lib/utils';

interface StatusBadgeProps {
  status: string;
  size?: 'sm' | 'md';
  className?: string;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, size = 'sm', className }) => {
  const getStyle = (s: string) => {
    switch (s.toUpperCase()) {
      // Stock Health
      case 'HEALTHY':
      case 'FULLY_RECEIVED':
      case 'FULLY_MATCHED':
      case 'MATCHED':
      case 'RESOLVED':
      case 'APPROVED_FOR_PAYMENT':
      case 'PAID':
      case 'RECONCILED':
      case 'ELIGIBLE_VERIFIED':
      case 'ACTIVE':
        return 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30';

      case 'APPROACHING_THRESHOLD':
      case 'PARTIALLY_RECEIVED':
      case 'MATCHED_WITHIN_TOLERANCE':
      case 'UNDER_REVIEW':
      case 'REVIEW_REQUIRED':
      case 'PARTIALLY_PAID':
      case 'PENDING_APPROVAL':
        return 'bg-amber-500/15 text-amber-400 border-amber-500/30';

      case 'REORDER_REQUIRED':
      case 'SHORTAGE_FLAGGED':
      case 'AWAITING_RECEIPT':
      case 'AWAITING_MATCH':
      case 'DRAFTED':
      case 'PO_CREATED':
      case 'AMOUNT_MISMATCH':
        return 'bg-blue-500/15 text-blue-400 border-blue-500/30';

      case 'CRITICAL_SHORTAGE':
      case 'OUT_OF_STOCK':
      case 'QUANTITY_MISMATCH':
      case 'PRICE_MISMATCH':
      case 'TAX_MISMATCH':
      case 'MISSING_RECEIPT':
      case 'DUPLICATE_INVOICE':
      case 'DISCREPANCY_HOLD':
      case 'DISCREPANCY_FLAGGED':
      case 'INELIGIBLE':
      case 'ON_HOLD':
      case 'DAMAGED_ITEMS':
      case 'EXCESS_FLAGGED':
        return 'bg-rose-500/15 text-rose-400 border-rose-500/30';

      case 'DRAFT':
      case 'SENT_TO_VENDOR':
      case 'CLOSED':
      case 'CANCELLED':
      default:
        return 'bg-slate-700/40 text-slate-300 border-slate-600/40';
    }
  };

  const formatText = (s: string) => {
    return s.replace(/_/g, ' ');
  };

  return (
    <span
      className={cn(
        'inline-flex items-center font-medium border rounded-full capitalize transition-colors',
        size === 'sm' ? 'px-2 py-0.5 text-xs' : 'px-2.5 py-1 text-xs',
        getStyle(status),
        className
      )}
    >
      <span className="w-1.5 h-1.5 rounded-full bg-current mr-1.5 opacity-80" />
      {formatText(status)}
    </span>
  );
};
