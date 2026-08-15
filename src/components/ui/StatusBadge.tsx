'use client';

import { statusMeta } from '@/lib/status';

/**
 * Colored pill for a document status. Optionally overlays a secondary badge
 * (e.g. Overdue on an invoice, Expired on a quotation) so the underlying
 * paid/unpaid or workflow state is never lost (spec §5).
 */
export function StatusBadge({
  status,
  extra,
}: {
  status: string;
  extra?: string;
}) {
  const meta = statusMeta(status);
  return (
    <span className="inline-flex items-center gap-1.5">
      <span
        className={`rounded-full px-2.5 py-0.5 text-xs font-medium ring-1 ${meta.className}`}
      >
        {meta.label}
      </span>
      {extra && (
        <span
          className={`rounded-full px-2.5 py-0.5 text-xs font-medium ring-1 ${statusMeta(extra).className}`}
        >
          {statusMeta(extra).label}
        </span>
      )}
    </span>
  );
}
