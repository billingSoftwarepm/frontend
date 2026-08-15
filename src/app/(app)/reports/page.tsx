'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  getOverviewReport,
  getReceivablesReport,
  getCustomerReport,
  getCollectionsReport,
  getGstReport,
  getConversionReport,
  downloadCsv,
} from '@/lib/api-reports';
import { money, formatDate } from '@/lib/format';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';

type TabId = 'overview' | 'receivables' | 'customers' | 'collections' | 'gst' | 'conversion';

const TABS: { id: TabId; label: string }[] = [
  { id: 'overview', label: 'Overview' },
  { id: 'receivables', label: 'Receivables Aging' },
  { id: 'customers', label: 'Customers' },
  { id: 'collections', label: 'Collections' },
  { id: 'gst', label: 'GST Summary' },
  { id: 'conversion', label: 'Quotation Conversion' },
];

/** First day of the month, 11 months ago — the default report window start. */
function defaultFrom(): string {
  const d = new Date();
  d.setMonth(d.getMonth() - 11, 1);
  return d.toISOString().slice(0, 10);
}
function today(): string {
  return new Date().toISOString().slice(0, 10);
}

const pct = (n: number) => `${(n * 100).toFixed(1)}%`;

export default function ReportsPage() {
  const [tab, setTab] = useState<TabId>('overview');
  const [from, setFrom] = useState(defaultFrom());
  const [to, setTo] = useState(today());

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-white">Reports</h1>
          <p className="mt-1 text-sm text-slate-400">
            Business insights — revenue, dues, collections and tax.
          </p>
        </div>
        {tab !== 'receivables' && (
          <div className="flex items-end gap-2">
            <label className="text-xs text-slate-400">
              From
              <Input type="date" value={from} onChange={(e) => setFrom(e.target.value)} className="mt-1" />
            </label>
            <label className="text-xs text-slate-400">
              To
              <Input type="date" value={to} onChange={(e) => setTo(e.target.value)} className="mt-1" />
            </label>
          </div>
        )}
      </div>

      {/* Tabs */}
      <div className="mb-6 flex flex-wrap gap-2 border-b border-surface-border">
        {TABS.map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`-mb-px border-b-2 px-4 py-2 text-sm font-semibold transition ${
              tab === t.id
                ? 'border-brand-500 text-white'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {tab === 'overview' && <OverviewTab from={from} to={to} />}
      {tab === 'receivables' && <ReceivablesTab />}
      {tab === 'customers' && <CustomersTab from={from} to={to} />}
      {tab === 'collections' && <CollectionsTab from={from} to={to} />}
      {tab === 'gst' && <GstTab from={from} to={to} />}
      {tab === 'conversion' && <ConversionTab from={from} to={to} />}
    </div>
  );
}

/* ------------------------------- shared UI ------------------------------- */

function Card({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`rounded-2xl border border-surface-border bg-surface-card p-5 shadow-card ${className}`}>
      {children}
    </div>
  );
}

function Kpi({ label, value, sub, accent }: { label: string; value: string; sub?: string; accent?: string }) {
  return (
    <Card>
      <div className="text-sm text-slate-400">{label}</div>
      <div className={`mt-1 text-2xl font-bold ${accent ?? 'text-white'}`}>{value}</div>
      {sub && <div className="mt-1 text-xs text-slate-500">{sub}</div>}
    </Card>
  );
}

function Loading() {
  return <div className="text-slate-400">Loading…</div>;
}

function Empty({ label }: { label: string }) {
  return <Card><div className="py-8 text-center text-slate-500">{label}</div></Card>;
}

/* ------------------------------- Overview -------------------------------- */

function OverviewTab({ from, to }: { from: string; to: string }) {
  const { data, isLoading } = useQuery({
    queryKey: ['report-overview', from, to],
    queryFn: () => getOverviewReport(from, to),
  });
  if (isLoading) return <Loading />;
  if (!data) return <Empty label="No data" />;
  const k = data.kpis;
  const maxTrend = Math.max(1, ...data.trend.map((t) => Math.max(t.invoiced, t.collected)));

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <Kpi label="Total Invoiced" value={money(k.totalInvoiced)} sub={`${k.invoiceCount} invoices`} />
        <Kpi label="Collected" value={money(k.totalCollected)} accent="text-emerald-400" sub={`${k.receiptCount} receipts`} />
        <Kpi label="Outstanding" value={money(k.totalOutstanding)} accent="text-amber-400" />
        <Kpi label="Collection Rate" value={pct(k.collectionRate)} sub="collected ÷ invoiced" />
      </div>
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <Kpi label="Quotations" value={String(k.quotationCount)} />
        <Kpi label="Lorry Receipts" value={String(k.lrCount)} />
        <Kpi label="Customers" value={String(k.customerCount)} />
        <Kpi label="Avg Invoice" value={money(k.invoiceCount ? k.totalInvoiced / k.invoiceCount : 0)} />
      </div>

      {/* Monthly trend — simple CSS bar chart (invoiced vs collected) */}
      <Card>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-white">Monthly Trend</h2>
          <div className="flex items-center gap-4 text-xs">
            <span className="flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-sm bg-brand-500" /> Invoiced</span>
            <span className="flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-sm bg-emerald-500" /> Collected</span>
          </div>
        </div>
        <div className="flex h-56 items-end gap-2 overflow-x-auto">
          {data.trend.map((t) => (
            <div key={t.month} className="flex min-w-[42px] flex-1 flex-col items-center gap-1">
              <div className="flex h-44 w-full items-end justify-center gap-1">
                <div
                  className="w-1/2 rounded-t bg-brand-500"
                  style={{ height: `${(t.invoiced / maxTrend) * 100}%` }}
                  title={`Invoiced ${money(t.invoiced)}`}
                />
                <div
                  className="w-1/2 rounded-t bg-emerald-500"
                  style={{ height: `${(t.collected / maxTrend) * 100}%` }}
                  title={`Collected ${money(t.collected)}`}
                />
              </div>
              <div className="text-[10px] text-slate-500">{t.month.slice(2)}</div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}

/* ----------------------------- Receivables ------------------------------- */

function ReceivablesTab() {
  const { data, isLoading } = useQuery({
    queryKey: ['report-receivables'],
    queryFn: () => getReceivablesReport(),
  });
  if (isLoading) return <Loading />;
  if (!data || !data.rows.length) return <Empty label="No outstanding invoices — you're all paid up! 🎉" />;
  const b = data.buckets;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-5">
        <Kpi label="Total Outstanding" value={money(data.totalOutstanding)} accent="text-amber-400" />
        <Kpi label={b.current.label} value={money(b.current.amount)} sub={`${b.current.count} invoices`} />
        <Kpi label={b.d31.label} value={money(b.d31.amount)} sub={`${b.d31.count} invoices`} />
        <Kpi label={b.d61.label} value={money(b.d61.amount)} sub={`${b.d61.count} invoices`} accent="text-orange-400" />
        <Kpi label={b.d90.label} value={money(b.d90.amount)} sub={`${b.d90.count} invoices`} accent="text-red-400" />
      </div>

      <Card className="p-0">
        <div className="flex items-center justify-between p-4">
          <h2 className="text-lg font-semibold text-white">Outstanding Invoices</h2>
          <Button variant="secondary" onClick={() => downloadCsv('receivables.csv', data.rows as any)}>
            Export CSV
          </Button>
        </div>
        <table className="w-full text-sm">
          <thead className="bg-surface-card2/60 text-left text-slate-400">
            <tr>
              <th className="px-4 py-3 font-medium">Invoice</th>
              <th className="px-4 py-3 font-medium">Customer</th>
              <th className="px-4 py-3 font-medium">Bill Date</th>
              <th className="px-4 py-3 font-medium">Due</th>
              <th className="px-4 py-3 font-medium">Balance</th>
              <th className="px-4 py-3 font-medium">Overdue</th>
              <th className="px-4 py-3 font-medium">Bucket</th>
            </tr>
          </thead>
          <tbody>
            {data.rows.map((r) => (
              <tr key={r.id} className="border-t border-surface-border text-slate-300">
                <td className="px-4 py-3 font-semibold text-white">{r.number}</td>
                <td className="px-4 py-3">{r.customerName}</td>
                <td className="px-4 py-3">{formatDate(r.billDate)}</td>
                <td className="px-4 py-3">{formatDate(r.dueDate ?? undefined)}</td>
                <td className="px-4 py-3 font-medium text-amber-300">{money(r.balanceAmount)}</td>
                <td className="px-4 py-3">{r.overdueDays > 0 ? `${r.overdueDays}d` : '—'}</td>
                <td className="px-4 py-3">{r.bucket}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>
    </div>
  );
}

/* ------------------------------ Customers -------------------------------- */

function CustomersTab({ from, to }: { from: string; to: string }) {
  const { data, isLoading } = useQuery({
    queryKey: ['report-customers', from, to],
    queryFn: () => getCustomerReport(from, to),
  });
  if (isLoading) return <Loading />;
  if (!data || !data.rows.length) return <Empty label="No invoices in this period" />;

  return (
    <Card className="p-0">
      <div className="flex items-center justify-between p-4">
        <h2 className="text-lg font-semibold text-white">Customer Summary</h2>
        <Button variant="secondary" onClick={() => downloadCsv('customers-report.csv', data.rows as any)}>
          Export CSV
        </Button>
      </div>
      <table className="w-full text-sm">
        <thead className="bg-surface-card2/60 text-left text-slate-400">
          <tr>
            <th className="px-4 py-3 font-medium">Customer</th>
            <th className="px-4 py-3 font-medium">Invoices</th>
            <th className="px-4 py-3 font-medium">Invoiced</th>
            <th className="px-4 py-3 font-medium">Collected</th>
            <th className="px-4 py-3 font-medium">Outstanding</th>
          </tr>
        </thead>
        <tbody>
          {data.rows.map((r) => (
            <tr key={r.customerId || r.customerName} className="border-t border-surface-border text-slate-300">
              <td className="px-4 py-3 font-semibold text-white">{r.customerName}</td>
              <td className="px-4 py-3">{r.invoiceCount}</td>
              <td className="px-4 py-3">{money(r.invoiced)}</td>
              <td className="px-4 py-3 text-emerald-300">{money(r.collected)}</td>
              <td className="px-4 py-3 text-amber-300">{money(r.outstanding)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </Card>
  );
}

/* ----------------------------- Collections ------------------------------- */

function CollectionsTab({ from, to }: { from: string; to: string }) {
  const { data, isLoading } = useQuery({
    queryKey: ['report-collections', from, to],
    queryFn: () => getCollectionsReport(from, to),
  });
  if (isLoading) return <Loading />;
  if (!data || !data.rows.length) return <Empty label="No payments received in this period" />;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <Kpi label="Total Collected" value={money(data.total)} accent="text-emerald-400" sub={`${data.rows.length} receipts`} />
        {data.byMode.map((m) => (
          <Kpi key={m.mode} label={m.mode} value={money(m.amount)} sub={`${m.count} payments`} />
        ))}
      </div>

      <Card className="p-0">
        <div className="flex items-center justify-between p-4">
          <h2 className="text-lg font-semibold text-white">Payments</h2>
          <Button variant="secondary" onClick={() => downloadCsv('collections.csv', data.rows as any)}>
            Export CSV
          </Button>
        </div>
        <table className="w-full text-sm">
          <thead className="bg-surface-card2/60 text-left text-slate-400">
            <tr>
              <th className="px-4 py-3 font-medium">Receipt</th>
              <th className="px-4 py-3 font-medium">Customer</th>
              <th className="px-4 py-3 font-medium">Date</th>
              <th className="px-4 py-3 font-medium">Mode</th>
              <th className="px-4 py-3 font-medium">Reference</th>
              <th className="px-4 py-3 font-medium">Amount</th>
            </tr>
          </thead>
          <tbody>
            {data.rows.map((r) => (
              <tr key={r.id} className="border-t border-surface-border text-slate-300">
                <td className="px-4 py-3 font-semibold text-white">{r.number}</td>
                <td className="px-4 py-3">{r.customerName}</td>
                <td className="px-4 py-3">{formatDate(r.receiptDate)}</td>
                <td className="px-4 py-3">{r.paymentType}</td>
                <td className="px-4 py-3">{r.referenceNo || '—'}</td>
                <td className="px-4 py-3 font-medium text-emerald-300">{money(r.receivedAmount)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>
    </div>
  );
}

/* -------------------------------- GST ------------------------------------ */

function GstTab({ from, to }: { from: string; to: string }) {
  const { data, isLoading } = useQuery({
    queryKey: ['report-gst', from, to],
    queryFn: () => getGstReport(from, to),
  });
  if (isLoading) return <Loading />;
  if (!data || !data.rows.length) return <Empty label="No taxable invoices in this period" />;
  const t = data.totals;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-5">
        <Kpi label="Taxable Value" value={money(t.taxable)} />
        <Kpi label="CGST" value={money(t.cgst)} />
        <Kpi label="SGST" value={money(t.sgst)} />
        <Kpi label="IGST" value={money(t.igst)} />
        <Kpi label="Total Tax" value={money(t.tax)} accent="text-brand-300" />
      </div>

      <Card className="p-0">
        <div className="flex items-center justify-between p-4">
          <h2 className="text-lg font-semibold text-white">Tax by Invoice</h2>
          <Button variant="secondary" onClick={() => downloadCsv('gst-summary.csv', data.rows as any)}>
            Export CSV
          </Button>
        </div>
        <table className="w-full text-sm">
          <thead className="bg-surface-card2/60 text-left text-slate-400">
            <tr>
              <th className="px-4 py-3 font-medium">Invoice</th>
              <th className="px-4 py-3 font-medium">Customer</th>
              <th className="px-4 py-3 font-medium">GSTIN</th>
              <th className="px-4 py-3 font-medium">Date</th>
              <th className="px-4 py-3 font-medium">Taxable</th>
              <th className="px-4 py-3 font-medium">CGST</th>
              <th className="px-4 py-3 font-medium">SGST</th>
              <th className="px-4 py-3 font-medium">IGST</th>
              <th className="px-4 py-3 font-medium">Total</th>
            </tr>
          </thead>
          <tbody>
            {data.rows.map((r) => (
              <tr key={r.id} className="border-t border-surface-border text-slate-300">
                <td className="px-4 py-3 font-semibold text-white">{r.number}</td>
                <td className="px-4 py-3">{r.customerName}</td>
                <td className="px-4 py-3">{r.customerGstNo || '—'}</td>
                <td className="px-4 py-3">{formatDate(r.billDate)}</td>
                <td className="px-4 py-3">{money((r.chargesTotal || 0) + (r.serviceCharge || 0))}</td>
                <td className="px-4 py-3">{money(r.cgstCharge)}</td>
                <td className="px-4 py-3">{money(r.sgstCharge)}</td>
                <td className="px-4 py-3">{money(r.igstCharge)}</td>
                <td className="px-4 py-3 font-medium text-slate-200">{money(r.total)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>
    </div>
  );
}

/* ----------------------------- Conversion -------------------------------- */

function ConversionTab({ from, to }: { from: string; to: string }) {
  const { data, isLoading } = useQuery({
    queryKey: ['report-conversion', from, to],
    queryFn: () => getConversionReport(from, to),
  });
  if (isLoading) return <Loading />;
  if (!data || !data.total) return <Empty label="No quotations in this period" />;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <Kpi label="Quotations" value={String(data.total)} />
        <Kpi label="Accepted" value={String(data.accepted)} sub={pct(data.acceptanceRate)} accent="text-sky-300" />
        <Kpi label="Converted" value={String(data.converted)} accent="text-emerald-400" />
        <Kpi label="Win Rate" value={pct(data.conversionRate)} sub="converted ÷ total" />
      </div>

      <Card>
        <h2 className="mb-4 text-lg font-semibold text-white">By Status</h2>
        <div className="space-y-3">
          {data.byStatus.map((s) => {
            const width = data.total ? (s.count / data.total) * 100 : 0;
            return (
              <div key={s.status}>
                <div className="mb-1 flex justify-between text-xs text-slate-400">
                  <span>{s.status}</span>
                  <span>{s.count} · {money(s.value)}</span>
                </div>
                <div className="h-2.5 w-full overflow-hidden rounded-full bg-surface-card2">
                  <div className="h-full rounded-full bg-brand-500" style={{ width: `${width}%` }} />
                </div>
              </div>
            );
          })}
        </div>
      </Card>
    </div>
  );
}
