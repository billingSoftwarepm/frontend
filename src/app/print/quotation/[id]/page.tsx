'use client';

import { useQuery } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { getQuotation } from '@/lib/api-quotations';
import { getOrg } from '@/lib/api-org';
import { listBanks } from '@/lib/api-bank';
import { money, formatDate } from '@/lib/format';
import { shareOnWhatsApp } from '@/lib/share';

const CHARGE_LABELS: Record<string, string> = {
  transportation: 'Transportation Charges',
  packing: 'Packing Charges',
  unpacking: 'Unpacking Charges',
  loading: 'Loading Charges / Floor',
  unloading: 'Unloading Charges / Floor',
  insurance: 'Transit Insurance Coverage',
  storage: 'Storage Charges',
  service: 'Service Charges',
  other: 'Other Charges',
};

const MAROON = '#7b1113';

export default function QuotationPrintPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const { data: q, isLoading } = useQuery({
    queryKey: ['quotation', params.id],
    queryFn: () => getQuotation(params.id),
  });
  const { data: org } = useQuery({ queryKey: ['org'], queryFn: () => getOrg() });
  const { data: banks } = useQuery({ queryKey: ['banks'], queryFn: () => listBanks() });
  const primaryBank = banks?.find((b) => b.isPrimary) ?? banks?.[0];

  if (isLoading || !q) {
    return <div className="p-10 text-center text-slate-500">Loading document…</div>;
  }

  // Build the charge line items: freight first, then any non-zero charges.
  const rows: { label: string; amount: number }[] = [];
  if (Number(q.freightCharge) > 0) {
    rows.push({ label: 'Transportation Charges', amount: Number(q.freightCharge) });
  }
  Object.entries(q.charges || {})
    .filter(([, v]) => Number(v) > 0)
    .forEach(([k, v]) => rows.push({ label: CHARGE_LABELS[k] || `${k} Charges`, amount: Number(v) }));

  const route = [q.fromCity, q.toCity].filter(Boolean);

  function share() {
    if (!q) return;
    shareOnWhatsApp(
      `Hello ${q.customerName}, here is your moving quotation ${q.number} for ${money(q.total)}. Looking forward to serving you!`,
      q.phone,
    );
  }

  return (
    <div className="min-h-screen bg-slate-200 py-6">
      {/* Toolbar (screen only) */}
      <div className="no-print mx-auto mb-4 flex max-w-[210mm] items-center justify-between px-4">
        <button
          onClick={() => router.back()}
          className="rounded-lg bg-white px-4 py-2 text-sm font-semibold text-slate-700 shadow hover:bg-slate-50"
        >
          ← Back
        </button>
        <div className="flex gap-2">
          <button
            onClick={share}
            className="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white shadow hover:bg-emerald-500"
          >
            Share on WhatsApp
          </button>
          <button
            onClick={() => window.print()}
            className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow hover:bg-blue-500"
          >
            Print / Save PDF
          </button>
        </div>
      </div>

      {/* A4 sheet */}
      <div
        className="print-sheet mx-auto max-w-[210mm] bg-white p-8 text-[11px] leading-snug text-slate-800 shadow-xl"
        style={{ WebkitPrintColorAdjust: 'exact', printColorAdjust: 'exact' }}
      >
        {/* ── Header: logo + office details ─────────────────────────── */}
        <div className="flex items-start justify-between border-b-2 pb-3" style={{ borderColor: MAROON }}>
          <div className="flex items-center gap-3">
            {org?.logoUrl && (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={org.logoUrl} alt="logo" className="h-16 w-16 object-contain" />
            )}
            <div>
              <h1 className="text-2xl font-black tracking-tight" style={{ color: MAROON }}>
                {org?.name || 'Your Company'}
              </h1>
              {org?.legalName && <p className="text-[10px] text-slate-500">{org.legalName}</p>}
            </div>
          </div>
          <div className="text-right text-[10px] text-slate-700">
            {org?.address && <p className="font-semibold text-slate-800">Office Address: {org.address}</p>}
            {org?.phone && <p>Phone : {org.phone}</p>}
            {org?.email && <p>Email : {org.email}</p>}
            {org?.website && <p>Web : {org.website}</p>}
          </div>
        </div>

        {/* ── Title band ────────────────────────────────────────────── */}
        <div className="my-3 text-center">
          <h2 className="inline-block border-b-2 pb-0.5 text-sm font-bold uppercase tracking-wide text-slate-900" style={{ borderColor: MAROON }}>
            Quotation{q.movingType ? ` for ${q.movingType}` : ''}
          </h2>
        </div>

        {/* ── To + meta ─────────────────────────────────────────────── */}
        <div className="mb-3 flex items-start justify-between gap-6">
          <div className="max-w-[55%]">
            <p className="font-bold text-slate-900">To</p>
            <p className="font-bold text-slate-900">{q.customerName}</p>
            {q.partyAddress && <p className="text-slate-700">{q.partyAddress}</p>}
            {q.phone && <p className="text-slate-700">Ph: {q.phone}</p>}
          </div>
          <div className="text-[10px]">
            <table className="text-right">
              <tbody>
                <tr>
                  <td className="pr-2 font-semibold text-slate-500">Quote No :</td>
                  <td className="font-bold text-slate-900">{q.number}</td>
                </tr>
                <tr>
                  <td className="pr-2 font-semibold text-slate-500">Date :</td>
                  <td className="text-slate-900">{formatDate(q.quotationDate)}</td>
                </tr>
                {q.partyGstNo && (
                  <tr>
                    <td className="pr-2 font-semibold text-slate-500">Party GST :</td>
                    <td className="text-slate-900">{q.partyGstNo}</td>
                  </tr>
                )}
                {org?.gstin && (
                  <tr>
                    <td className="pr-2 font-semibold text-slate-500">GST No :</td>
                    <td className="text-slate-900">{org.gstin}</td>
                  </tr>
                )}
                {org?.pan && (
                  <tr>
                    <td className="pr-2 font-semibold text-slate-500">PAN No :</td>
                    <td className="text-slate-900">{org.pan}</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* ── Subject + greeting ───────────────────────────────────── */}
        <p className="mb-1">
          <span className="font-bold text-slate-900">Subject :</span> Packing, Moving and
          Transportation
          {route.length === 2 && (
            <>
              {' '}from <span className="font-bold" style={{ color: MAROON }}>{route[0]}</span> to{' '}
              <span className="font-bold" style={{ color: MAROON }}>{route[1]}</span>
            </>
          )}
        </p>
        <p className="mb-3 text-slate-700">
          Dear Sir/Madam, We thank you for the enquiry. We are providing the best price for the
          shifting services, and are pleased to quote our charges as follows:
        </p>

        {/* ── Charges table ─────────────────────────────────────────── */}
        <table className="w-full border-collapse text-[11px]">
          <thead>
            <tr style={{ backgroundColor: MAROON, color: '#fff' }}>
              <th className="border border-slate-300 px-2 py-1.5 text-center font-semibold">Sl No</th>
              <th className="border border-slate-300 px-2 py-1.5 text-left font-semibold">Description</th>
              <th className="border border-slate-300 px-2 py-1.5 text-right font-semibold">Amount (Rs.)</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r, idx) => (
              <tr key={idx}>
                <td className="border border-slate-300 px-2 py-1.5 text-center">{idx + 1}</td>
                <td className="border border-slate-300 px-2 py-1.5">{r.label}</td>
                <td className="border border-slate-300 px-2 py-1.5 text-right">{money(r.amount)}</td>
              </tr>
            ))}
            {/* filler row for visual balance like the sample */}
            <tr>
              <td className="border border-slate-300 px-2 py-1.5">&nbsp;</td>
              <td className="border border-slate-300 px-2 py-1.5"></td>
              <td className="border border-slate-300 px-2 py-1.5"></td>
            </tr>
          </tbody>
        </table>

        {/* ── Bank details + totals ─────────────────────────────────── */}
        <div className="mt-0 flex items-stretch justify-between">
          <div className="w-1/2 pr-4 pt-2 text-[10px]">
            {primaryBank && (
              <>
                <p className="font-bold" style={{ color: MAROON }}>Bank Details :</p>
                <p className="font-semibold text-slate-800">{primaryBank.accountHolder}</p>
                <p>A/c No : {primaryBank.accountNumber}, IFSC Code : {primaryBank.ifscCode}</p>
                <p>{primaryBank.bankName}{primaryBank.branch ? ` — ${primaryBank.branch}` : ''}</p>
                {primaryBank.upiId && <p>UPI : {primaryBank.upiId}</p>}
              </>
            )}
          </div>
          <div className="w-1/2">
            <table className="w-full border-collapse text-[11px]">
              <tbody>
                <tr>
                  <td className="border border-slate-300 px-2 py-1 text-right font-semibold italic">Sub Total</td>
                  <td className="border border-slate-300 px-2 py-1 text-right">{money(q.subTotal)}</td>
                </tr>
                {q.gstCharge > 0 && (
                  <tr>
                    <td className="border border-slate-300 px-2 py-1 text-right font-semibold italic">
                      GST {q.gstPercent}%{q.gstType ? ` (${q.gstType})` : ''}
                    </td>
                    <td className="border border-slate-300 px-2 py-1 text-right">{money(q.gstCharge)}</td>
                  </tr>
                )}
                <tr style={{ backgroundColor: MAROON, color: '#fff' }}>
                  <td className="border border-slate-300 px-2 py-1.5 text-right font-bold">Total</td>
                  <td className="border border-slate-300 px-2 py-1.5 text-right font-bold">{money(q.total)}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* ── Shifting items / materials ────────────────────────────── */}
        {q.shiftingItems && (
          <p className="mt-3 text-[10px]">
            <span className="font-bold" style={{ color: MAROON }}>Materials / Items : </span>
            <span className="text-slate-700">{q.shiftingItems}</span>
          </p>
        )}

        {/* ── Notes ─────────────────────────────────────────────────── */}
        {q.notes && (
          <p className="mt-2 text-[10px]">
            <span className="font-bold" style={{ color: MAROON }}>Note : </span>
            <span className="whitespace-pre-line text-slate-700">{q.notes}</span>
          </p>
        )}

        {/* ── Terms ─────────────────────────────────────────────────── */}
        {org?.terms && (
          <div className="mt-3 text-[10px]">
            <p className="font-bold text-slate-900">Terms and Conditions</p>
            <div className="whitespace-pre-line text-slate-700">{org.terms}</div>
          </div>
        )}

        {/* ── Signature ─────────────────────────────────────────────── */}
        <div className="mt-6 flex items-end justify-between">
          <p className="text-[10px] italic text-slate-600">Thank you for assuring our service</p>
          <div className="text-center">
            <p className="mb-1 text-[10px] font-semibold italic" style={{ color: MAROON }}>
              For {org?.name}
            </p>
            {org?.signatureUrl && (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={org.signatureUrl} alt="signature" className="mx-auto mb-1 max-h-14 object-contain" />
            )}
            <p className="border-t border-slate-400 px-6 pt-1 font-semibold text-slate-800">
              Authorized Signatory
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

