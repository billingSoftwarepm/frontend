'use client';

import { useQuery } from '@tanstack/react-query';
import Link from 'next/link';
import { listInvoices } from '@/lib/api-invoices';
import { listCustomers } from '@/lib/api-customers';
import { listQuotations } from '@/lib/api-quotations';
import { listReceipts } from '@/lib/api-receipts';
import { listLrs } from '@/lib/api-lr';

export default function DashboardPage() {
  const invoices = useQuery({ queryKey: ['invoices'], queryFn: () => listInvoices() });
  const customers = useQuery({ queryKey: ['customers'], queryFn: () => listCustomers() });
  const quotations = useQuery({ queryKey: ['quotations'], queryFn: () => listQuotations() });
  const receipts = useQuery({ queryKey: ['receipts'], queryFn: () => listReceipts() });
  const lrs = useQuery({ queryKey: ['lrs'], queryFn: () => listLrs() });

  const totalRevenue =
    invoices.data?.reduce((sum, i) => sum + (i.total || 0), 0) ?? 0;

  const cards = [
    {
      label: 'Total Invoices',
      value: invoices.data?.length ?? '…',
      href: '/invoices',
      tag: 'INV',
      accent: 'from-blue-500 to-indigo-500',
    },
    {
      label: 'Total Quotations',
      value: quotations.data?.length ?? '…',
      href: '/quotations',
      tag: 'QT',
      accent: 'from-violet-500 to-purple-500',
    },
    {
      label: 'Total Receipts',
      value: receipts.data?.length ?? '…',
      href: '/receipts',
      tag: 'RCP',
      accent: 'from-amber-500 to-orange-500',
    },
    {
      label: 'Total LR',
      value: lrs.data?.length ?? '…',
      href: '/lr',
      tag: 'LR',
      accent: 'from-rose-500 to-pink-500',
    },
    {
      label: 'Total Customers',
      value: customers.data?.length ?? '…',
      href: '/customers',
      tag: 'CUS',
      accent: 'from-cyan-500 to-sky-500',
    },
    {
      label: 'Total Revenue',
      value: `₹${totalRevenue.toLocaleString('en-IN')}`,
      href: '/invoices',
      tag: 'REV',
      accent: 'from-emerald-500 to-teal-500',
    },
  ];

  return (
    <div>
      <h1 className="mb-1 text-3xl font-bold tracking-tight text-white">Dashboard</h1>
      <p className="mb-6 text-sm text-slate-400">
        Overview of your packers &amp; movers business
      </p>

      {/* Hero earning card */}
      <div className="relative mb-6 overflow-hidden rounded-3xl bg-brand-gradient p-6 shadow-card-hover">
        <div className="absolute -right-8 -top-10 h-40 w-40 rounded-full bg-white/10 blur-2xl" />
        <div className="absolute -bottom-12 right-24 h-32 w-32 rounded-full bg-white/10 blur-2xl" />
        <div className="relative flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-white/70">
              Total Earning
            </p>
            <p className="mt-2 text-4xl font-bold tracking-tight text-white">
              ₹{totalRevenue.toLocaleString('en-IN')}
            </p>
            <p className="mt-2 text-sm text-white/70">
              Across {invoices.data?.length ?? 0} invoices
            </p>
          </div>
          <div className="flex items-end gap-1.5">
            {[40, 65, 45, 80, 55, 90, 70].map((h, idx) => (
              <span
                key={idx}
                className="w-3 rounded-full bg-white/70"
                style={{ height: `${h}px` }}
              />
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {cards.map((c) => (
          <Link
            key={c.label}
            href={c.href}
            className="group relative overflow-hidden rounded-2xl border border-surface-border bg-card-gradient p-5 shadow-card transition hover:-translate-y-0.5 hover:border-brand-500/40 hover:shadow-card-hover"
          >
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">
                  {c.label}
                </p>
                <p className="mt-3 text-3xl font-bold tracking-tight text-white">{c.value}</p>
              </div>
              <span
                className={`rounded-lg bg-gradient-to-br ${c.accent} px-2.5 py-1 text-[11px] font-bold tracking-widest text-white shadow-glow`}
              >
                {c.tag}
              </span>
            </div>
          </Link>
        ))}
      </div>

      <div className="mt-8">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-lg font-semibold tracking-tight text-white">Recent Invoices</h2>
          <Link href="/invoices/new" className="text-sm font-semibold text-brand-400 hover:text-brand-300">
            + Create Invoice
          </Link>
        </div>
        <div className="overflow-x-auto rounded-2xl border border-surface-border bg-surface-card shadow-card">
          <table className="w-full min-w-[680px] text-sm">
            <thead className="bg-surface-card2/60 text-left text-slate-400">
              <tr>
                <th className="px-4 py-3 font-medium">Number</th>
                <th className="px-4 py-3 font-medium">Customer</th>
                <th className="px-4 py-3 font-medium">Total</th>
                <th className="px-4 py-3 font-medium">Status</th>
              </tr>
            </thead>
            <tbody>
              {invoices.data?.slice(0, 5).map((i) => (
                <tr key={i.id} className="border-t border-surface-border text-slate-300 hover:bg-white/5">
                  <td className="px-4 py-3 font-semibold text-white">{i.number}</td>
                  <td className="px-4 py-3">{i.customerName}</td>
                  <td className="px-4 py-3">₹{i.total.toLocaleString('en-IN')}</td>
                  <td className="px-4 py-3">
                    <span className="rounded-full bg-brand-500/15 px-2.5 py-0.5 text-xs font-medium text-brand-300 ring-1 ring-brand-500/30">
                      {i.status}
                    </span>
                  </td>
                </tr>
              ))}
              {!invoices.data?.length && (
                <tr>
                  <td className="px-4 py-8 text-center text-slate-500" colSpan={4}>
                    No data available
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
