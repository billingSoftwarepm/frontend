'use client';

import { ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { getOrg } from '@/lib/api-org';
import { listBanks } from '@/lib/api-bank';

/**
 * Shared printable document shell. Renders a white A4 sheet with:
 *  - a screen-only toolbar (Back / Print-to-PDF / WhatsApp share)
 *  - a company header (name, GST, contact) from the org profile
 *  - the document body (passed as children)
 *  - a footer with bank details, terms and signature
 *
 * The `.print-sheet` / `.no-print` classes are targeted by the print CSS in
 * globals.css so the browser's "Save as PDF" yields a clean document.
 */
export function DocumentShell({
  title,
  onShare,
  children,
}: {
  title: string;
  onShare: () => void;
  children: ReactNode;
}) {
  const router = useRouter();
  const { data: org } = useQuery({ queryKey: ['org'], queryFn: () => getOrg() });
  const { data: banks } = useQuery({ queryKey: ['banks'], queryFn: () => listBanks() });
  const primaryBank = banks?.find((b) => b.isPrimary) ?? banks?.[0];

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
            onClick={onShare}
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
      <div className="print-sheet mx-auto max-w-[210mm] bg-white p-10 text-slate-800 shadow-xl">
        {/* Header */}
        <div className="flex items-start justify-between border-b-2 border-slate-800 pb-4">
          <div className="flex items-center gap-3">
            {org?.logoUrl && (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={org.logoUrl} alt="logo" className="h-14 w-14 object-contain" />
            )}
            <div>
              <h1 className="text-2xl font-bold text-slate-900">{org?.name || 'Your Company'}</h1>
              {org?.address && <p className="text-xs text-slate-600">{org.address}</p>}
              <p className="text-xs text-slate-600">
                {[org?.phone && `Ph: ${org.phone}`, org?.email].filter(Boolean).join('  •  ')}
              </p>
              {org?.gstin && <p className="text-xs text-slate-600">GSTIN: {org.gstin}</p>}
            </div>
          </div>
          <div className="text-right">
            <h2 className="text-xl font-bold uppercase tracking-wide text-slate-900">{title}</h2>
          </div>
        </div>

        {/* Body */}
        <div className="mt-6">{children}</div>

        {/* Footer: bank + terms + signature */}
        <div className="mt-10 grid grid-cols-2 gap-6 border-t border-slate-300 pt-4 text-xs text-slate-600">
          <div>
            {primaryBank && (
              <>
                <p className="mb-1 font-semibold text-slate-800">Bank Details</p>
                <p>{primaryBank.bankName}</p>
                <p>A/C: {primaryBank.accountNumber}</p>
                <p>IFSC: {primaryBank.ifscCode}</p>
                {primaryBank.upiId && <p>UPI: {primaryBank.upiId}</p>}
              </>
            )}
            {org?.terms && (
              <div className="mt-3">
                <p className="mb-1 font-semibold text-slate-800">Terms &amp; Conditions</p>
                <p className="whitespace-pre-line">{org.terms}</p>
              </div>
            )}
          </div>
          <div className="flex flex-col items-end justify-end text-right">
            {org?.signatureUrl && (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={org.signatureUrl} alt="signature" className="mb-1 max-h-16 object-contain" />
            )}
            <p className="border-t border-slate-400 pt-1">Authorized Signatory</p>
            <p className="font-semibold text-slate-800">{org?.name}</p>
          </div>
        </div>
      </div>
    </div>
  );
}

/** A labelled party block (customer/consignor/consignee) used in documents. */
export function PartyBlock({
  heading,
  name,
  lines,
}: {
  heading: string;
  name?: string;
  lines: (string | undefined)[];
}) {
  return (
    <div>
      <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">{heading}</p>
      <p className="font-semibold text-slate-900">{name || '—'}</p>
      {lines.filter(Boolean).map((l, i) => (
        <p key={i} className="text-sm text-slate-600">
          {l}
        </p>
      ))}
    </div>
  );
}
