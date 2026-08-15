import { api } from './api';

export interface InvoiceCharges {
  transportation?: number;
  packing?: number;
  unpacking?: number;
  loading?: number;
  unloading?: number;
  insurance?: number;
  storage?: number;
  other?: number;
}

export interface Invoice {
  id: string;
  number: string;
  customerName: string;
  customerId?: string;
  phone?: string;
  billDate: string;
  customerGstNo?: string;
  customerAddress?: string;
  serviceName?: string;
  fromCity?: string;
  toCity?: string;
  shiftingStart?: string;
  shiftingEnd?: string;
  shiftingItems?: string;
  charges: InvoiceCharges;
  chargesTotal: number;
  sgstPercent: number;
  sgstCharge: number;
  cgstPercent: number;
  cgstCharge: number;
  igstPercent: number;
  igstCharge: number;
  serviceCharge: number;
  total: number;
  status: string;
  createdAt: string;
  dueDate?: string;
  paidAmount?: number;
  balanceAmount?: number;
  isOverdue?: boolean;
}

export interface InvoiceInput {
  customerName: string;
  customerId?: string;
  phone?: string;
  billDate?: string;
  customerGstNo?: string;
  customerAddress?: string;
  serviceName?: string;
  fromCity?: string;
  toCity?: string;
  shiftingStart?: string;
  shiftingEnd?: string;
  shiftingItems?: string;
  charges?: InvoiceCharges;
  sgstPercent?: number;
  cgstPercent?: number;
  igstPercent?: number;
  serviceCharge?: number;
  status?: string;
}

export async function listInvoices(search?: string): Promise<Invoice[]> {
  const { data } = await api.get('/invoices', { params: { search } });
  return data;
}

export async function getInvoice(id: string): Promise<Invoice> {
  const { data } = await api.get(`/invoices/${id}`);
  return data;
}

export async function createInvoice(input: InvoiceInput): Promise<Invoice> {
  const { data } = await api.post('/invoices', input);
  return data;
}

export async function updateInvoice(id: string, input: Partial<InvoiceInput>) {
  const { data } = await api.patch(`/invoices/${id}`, input);
  return data;
}

export async function deleteInvoice(id: string) {
  const { data } = await api.delete(`/invoices/${id}`);
  return data;
}

/** Move the invoice along its workflow (Sent / Cancelled). */
export async function setInvoiceStatus(id: string, status: string): Promise<Invoice> {
  const { data } = await api.patch(`/invoices/${id}/status`, { status });
  return data;
}

/** Service / Moving Types from the analysis doc (§5.1) */
export const SERVICE_OPTIONS = [
  'House Hold Goods',
  'Local',
  'Domestic',
  'International',
  'Office Shifting',
  'Industrial Goods Shifting',
  'Car Shifting',
  'House Hold Goods And Car Shifting',
  'Bike Shifting',
  'House Hold Goods And Bike Shifting',
  'Car and Bike Shifting',
  'House Hold Goods, Bike And Car Shifting',
  'Pet Relocation',
  'House Hold Goods, Bike And Car Shifting, Pet Relocation',
];
