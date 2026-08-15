'use client';

import { useQuery } from '@tanstack/react-query';
import { getReceipt } from '@/lib/api-receipts';
import { DocumentShell, PartyBlock } from '@/components/print/DocumentShell';
import { money, formatDate } from '@/lib/format';
import { shareOnWhatsApp } from '@/lib/share';

export default function ReceiptPrintPage({ params }: { params: { id: string } }) {
  const { data: r, isLoading } = useQuery({
    queryKey: ['receipt', params.id],
    queryFn: () => getReceipt(params.id),
  });

  if (isLoading || !r) {
    return <div className="p-10 text-center text-slate-500">Loading document…</div>;
  }

  function share() {
    if (!r) return;
    shareOnWhatsApp(
      `Hello ${r.customerName}, we have received ${money(r.receivedAmount)} against receipt ${r.number}. Thank you!`,
      r.phone,
    );
  }

  return (
    <DocumentShell title="Payment Receipt" onShare={share}>
      <div className="mb-6 flex items-start justify-between">
        <PartyBlock
          heading="Received From"
          name={r.customerName}
          lines={[r.phone && `Ph: ${r.phone}`, r.serviceName]}
        />
        <div className="text-right text-sm">
          <p>
            <span className="text-slate-500">Receipt No: </span>
            <span className="font-semibold text-slate-900">{r.number}</span>
          </p>
          <p>
            <span className="text-slate-500">Date: </span>
            {formatDate(r.receiptDate)}
          </p>
          {r.paymentType && (
            <p>
              <span className="text-slate-500">Mode: </span>
              {r.paymentType}
            </p>
          )}
        </div>
      </div>

      {(r.fromCity || r.toCity) && (
        <div className="mb-4 rounded-lg bg-slate-50 p-3 text-sm">
          <span className="text-slate-500">Route: </span>
          {r.fromCity || '—'} → {r.toCity || '—'}
        </div>
      )}

      <div className="mt-4 flex justify-end">
        <div className="w-64 space-y-1 text-sm">
          <div className="flex justify-between">
            <span className="text-slate-500">Total Amount</span>
            <span>{money(r.totalAmount)}</span>
          </div>
          <div className="flex justify-between font-semibold text-emerald-700">
            <span>Received</span>
            <span>{money(r.receivedAmount)}</span>
          </div>
          <div className="mt-1 flex justify-between border-t border-slate-800 pt-2 text-base font-bold text-slate-900">
            <span>Balance Due</span>
            <span>{money(r.balanceAmount)}</span>
          </div>
        </div>
      </div>

      <p className="mt-8 text-center text-xs text-slate-500">
        This is a computer-generated receipt.
      </p>
    </DocumentShell>
  );
}
