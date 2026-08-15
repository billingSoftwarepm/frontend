/**
 * Front-end mirror of the backend status state-machines (functional spec §3–§6).
 * Provides colour styling for badges and the list of allowed next-status
 * actions per document type so list pages can render a consistent workflow menu.
 */

export type DocType = 'quotation' | 'invoice' | 'lr';

interface StatusMeta {
  label: string;
  /** Tailwind classes for the badge (text + background + ring). */
  className: string;
}

const NEUTRAL = 'text-slate-300 bg-slate-500/15 ring-slate-400/30';

export const STATUS_META: Record<string, StatusMeta> = {
  DRAFT: { label: 'Draft', className: NEUTRAL },
  SENT: { label: 'Sent', className: 'text-sky-300 bg-sky-500/15 ring-sky-400/30' },
  ACCEPTED: { label: 'Accepted', className: 'text-emerald-300 bg-emerald-500/15 ring-emerald-400/30' },
  REJECTED: { label: 'Rejected', className: 'text-red-300 bg-red-500/15 ring-red-400/30' },
  EXPIRED: { label: 'Expired', className: 'text-amber-300 bg-amber-500/15 ring-amber-400/30' },
  CONVERTED: { label: 'Converted', className: 'text-violet-300 bg-violet-500/15 ring-violet-400/30' },
  // Invoice
  PARTIAL: { label: 'Partially Paid', className: 'text-amber-300 bg-amber-500/15 ring-amber-400/30' },
  PAID: { label: 'Paid', className: 'text-emerald-300 bg-emerald-500/15 ring-emerald-400/30' },
  CANCELLED: { label: 'Cancelled', className: 'text-red-300 bg-red-500/15 ring-red-400/30' },
  // LR
  ISSUED: { label: 'Issued', className: 'text-sky-300 bg-sky-500/15 ring-sky-400/30' },
  IN_TRANSIT: { label: 'In Transit', className: 'text-indigo-300 bg-indigo-500/15 ring-indigo-400/30' },
  DELIVERED: { label: 'Delivered', className: 'text-emerald-300 bg-emerald-500/15 ring-emerald-400/30' },
  OVERDUE: { label: 'Overdue', className: 'text-orange-300 bg-orange-500/15 ring-orange-400/30' },
};

export function statusMeta(status: string): StatusMeta {
  return STATUS_META[status] ?? { label: status, className: NEUTRAL };
}

/** Allowed manual next-status actions per document type (mirrors backend maps). */
const TRANSITIONS: Record<DocType, Record<string, string[]>> = {
  quotation: {
    DRAFT: ['SENT', 'ACCEPTED', 'REJECTED'],
    SENT: ['ACCEPTED', 'REJECTED'],
    ACCEPTED: ['REJECTED'],
    REJECTED: ['DRAFT'],
    EXPIRED: ['DRAFT'],
    CONVERTED: [],
  },
  invoice: {
    DRAFT: ['SENT', 'CANCELLED'],
    SENT: ['CANCELLED'],
    PARTIAL: ['CANCELLED'],
    PAID: [],
    CANCELLED: [],
  },
  lr: {
    DRAFT: ['ISSUED', 'CANCELLED'],
    ISSUED: ['IN_TRANSIT', 'CANCELLED'],
    IN_TRANSIT: ['DELIVERED', 'CANCELLED'],
    DELIVERED: [],
    CANCELLED: [],
  },
};

export function nextStatuses(type: DocType, current: string): string[] {
  return TRANSITIONS[type][current] ?? [];
}
