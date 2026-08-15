'use client';

import { useQuery } from '@tanstack/react-query';
import { getInvoice } from '@/lib/api-invoices';
import { DocumentShell, PartyBlock } from '@/components/print/DocumentShell';
import { money, formatDate } from '@/lib/format';
import { shareOnWhatsApp } from '@/lib/share';

const CHARGE_LABELS: Record<string, string> = {
  transportation: 'Transportation',
  packing: 'Packing',
  unpacking: 'Unpacking',
  loading: 'Loading',
  unloading: 'Unloading',
  insurance: 'Insurance',
  storage: 'Storage',
  other: 'Other',
};

export default function InvoicePrintPage({ params }: { params: { id: string } }) {
  const { data: inv, isLoading } = useQuery({
    queryKey: ['invoice', params.id],
    queryFn: () => getInvoice(params.id),
  });

  if (isLoading || !inv) {
    return <div className="p-10 text-center text-slate-500">Loading document…</div>;
  }

  const chargeRows = Object.entries(inv.charges || {}).filter(([, v]) => Number(v) > 0);

  function share() {
    if (!inv) return;
    shareOnWhatsApp(
      `Hello ${inv.customerName}, please find your invoice ${inv.number} for ${money(inv.total)}. Thank you for choosing us!`,
      inv.phone,
    );
  }

  return (
    <DocumentShell title="Tax Invoice" onShare={share}>
      {/* Meta row */}
      <div className="mb-6 flex items-start justify-between">
        <PartyBlock
          heading="Bill To"
          name={inv.customerName}
          lines={[
            inv.phone && `Ph: ${inv.phone}`,
            inv.customerGstNo && `GSTIN: ${inv.customerGstNo}`,
            inv.customerAddress,
          ]}
        />
        <div className="text-right text-sm">
          <p>
            <span className="text-slate-500">Invoice No: </span>
            <span className="font-semibold text-slate-900">{inv.number}</span>
          </p>
          <p>
            <span className="text-slate-500">Date: </span>
            {formatDate(inv.billDate)}
          </p>
          <p>
            <span className="text-slate-500">Status: </span>
            <span className="font-semibold">{inv.status}</span>
          </p>
        </div>
      </div>

      {/* Shifting summary */}
      {(inv.serviceName || inv.fromCity || inv.toCity) && (
        <div className="mb-4 rounded-lg bg-slate-50 p-3 text-sm">
          <span className="text-slate-500">Service: </span>
          <span className="font-medium">{inv.serviceName || '—'}</span>
          {(inv.fromCity || inv.toCity) && (
            <span className="ml-4">
              <span className="text-slate-500">Route: </span>
              {inv.fromCity || '—'} → {inv.toCity || '—'}
            </span>
          )}
        </div>
      )}

      {/* Charges table */}
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-slate-300 text-left text-slate-500">
            <th className="py-2">Description</th>
            <th className="py-2 text-right">Amount</th>
          </tr>
        </thead>
        <tbody>
          {chargeRows.map(([k, v]) => (
            <tr key={k} className="border-b border-slate-100">
              <td className="py-2">{CHARGE_LABELS[k] || k} Charge</td>
              <td className="py-2 text-right">{money(Number(v))}</td>
            </tr>
          ))}
          {inv.serviceCharge > 0 && (
            <tr className="border-b border-slate-100">
              <td className="py-2">Service Charge</td>
              <td className="py-2 text-right">{money(inv.serviceCharge)}</td>
            </tr>
          )}
        </tbody>
      </table>

      {/* Totals */}
      <div className="mt-4 flex justify-end">
        <div className="w-64 space-y-1 text-sm">
          <Row label="Subtotal" value={money(inv.chargesTotal + inv.serviceCharge)} />
          {inv.sgstCharge > 0 && <Row label={`SGST (${inv.sgstPercent}%)`} value={money(inv.sgstCharge)} />}
          {inv.cgstCharge > 0 && <Row label={`CGST (${inv.cgstPercent}%)`} value={money(inv.cgstCharge)} />}
          {inv.igstCharge > 0 && <Row label={`IGST (${inv.igstPercent}%)`} value={money(inv.igstCharge)} />}
          <div className="mt-1 flex justify-between border-t border-slate-800 pt-2 text-base font-bold text-slate-900">
            <span>Grand Total</span>
            <span>{money(inv.total)}</span>
          </div>
        </div>
      </div>
    </DocumentShell>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between">
      <span className="text-slate-500">{label}</span>
      <span>{value}</span>
    </div>
  );
}
