import { api } from './api';

export interface ReportRange {
  from: string;
  to: string;
}

export interface OverviewReport {
  range: ReportRange;
  kpis: {
    totalInvoiced: number;
    totalCollected: number;
    totalOutstanding: number;
    invoiceCount: number;
    receiptCount: number;
    quotationCount: number;
    lrCount: number;
    customerCount: number;
    collectionRate: number;
  };
  trend: { month: string; invoiced: number; collected: number }[];
}

export interface AgingBucket {
  label: string;
  amount: number;
  count: number;
}

export interface ReceivablesReport {
  totalOutstanding: number;
  buckets: {
    current: AgingBucket;
    d31: AgingBucket;
    d61: AgingBucket;
    d90: AgingBucket;
  };
  rows: {
    id: string;
    number: string;
    customerName: string;
    billDate: string;
    dueDate?: string | null;
    total: number;
    paidAmount: number;
    balanceAmount: number;
    status: string;
    overdueDays: number;
    bucket: string;
  }[];
}

export interface CustomerReport {
  range: ReportRange;
  rows: {
    customerId: string;
    customerName: string;
    invoiced: number;
    collected: number;
    outstanding: number;
    invoiceCount: number;
  }[];
}

export interface CollectionsReport {
  range: ReportRange;
  total: number;
  byMode: { mode: string; amount: number; count: number }[];
  rows: {
    id: string;
    number: string;
    customerName: string;
    receiptDate: string;
    paymentType: string;
    referenceNo?: string | null;
    receivedAmount: number;
  }[];
}

export interface GstReport {
  range: ReportRange;
  totals: { taxable: number; cgst: number; sgst: number; igst: number; tax: number; total: number };
  rows: {
    id: string;
    number: string;
    customerName: string;
    customerGstNo?: string | null;
    billDate: string;
    chargesTotal: number;
    serviceCharge: number;
    cgstCharge: number;
    sgstCharge: number;
    igstCharge: number;
    total: number;
  }[];
}

export interface ConversionReport {
  range: ReportRange;
  total: number;
  converted: number;
  accepted: number;
  conversionRate: number;
  acceptanceRate: number;
  byStatus: { status: string; count: number; value: number }[];
}

const params = (from?: string, to?: string) => ({ params: { from, to } });

export async function getOverviewReport(from?: string, to?: string): Promise<OverviewReport> {
  const { data } = await api.get('/reports/overview', params(from, to));
  return data;
}

export async function getReceivablesReport(): Promise<ReceivablesReport> {
  const { data } = await api.get('/reports/receivables');
  return data;
}

export async function getCustomerReport(from?: string, to?: string): Promise<CustomerReport> {
  const { data } = await api.get('/reports/customers', params(from, to));
  return data;
}

export async function getCollectionsReport(from?: string, to?: string): Promise<CollectionsReport> {
  const { data } = await api.get('/reports/collections', params(from, to));
  return data;
}

export async function getGstReport(from?: string, to?: string): Promise<GstReport> {
  const { data } = await api.get('/reports/gst', params(from, to));
  return data;
}

export async function getConversionReport(from?: string, to?: string): Promise<ConversionReport> {
  const { data } = await api.get('/reports/quotation-conversion', params(from, to));
  return data;
}

/** Convert an array of flat objects into a downloadable CSV file. */
export function downloadCsv(filename: string, rows: Record<string, unknown>[]) {
  if (!rows.length) return;
  const headers = Object.keys(rows[0]);
  const escape = (v: unknown) => {
    const s = v == null ? '' : String(v);
    return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
  };
  const csv = [
    headers.join(','),
    ...rows.map((r) => headers.map((h) => escape(r[h])).join(',')),
  ].join('\n');
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}
