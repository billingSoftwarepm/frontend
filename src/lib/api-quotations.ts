import { api } from './api';

export interface QuotationCharges {
  transportation?: number;
  packing?: number;
  unpacking?: number;
  loading?: number;
  unloading?: number;
  insurance?: number;
  storage?: number;
  service?: number;
  other?: number;
}

export interface Quotation {
  id: string;
  number: string;
  customerId?: string;
  customerName: string;
  phone?: string;
  quotationDate: string;
  movingType?: string;
  partyGstNo?: string;
  packingStart?: string;
  movingEnd?: string;
  partyAddress?: string;
  fromState?: string;
  fromCity?: string;
  fromFloor?: string;
  fromLift?: string;
  fromAddress?: string;
  toState?: string;
  toCity?: string;
  toFloor?: string;
  toLift?: string;
  toAddress?: string;
  shiftingItems?: string;
  freightCharge: number;
  charges: QuotationCharges;
  subTotal: number;
  gstMode?: string;
  gstType?: string;
  gstPercent: number;
  gstCharge: number;
  notes?: string;
  total: number;
  status: string;
  createdAt: string;
  isExpired?: boolean;
  displayStatus?: string;
  locked?: boolean;
}

export type QuotationInput = Omit<
  Quotation,
  | 'id'
  | 'number'
  | 'subTotal'
  | 'gstCharge'
  | 'total'
  | 'createdAt'
  | 'charges'
> & { charges?: QuotationCharges };

export async function listQuotations(search?: string): Promise<Quotation[]> {
  const { data } = await api.get('/quotations', { params: { search } });
  return data;
}

export async function getQuotation(id: string): Promise<Quotation> {
  const { data } = await api.get(`/quotations/${id}`);
  return data;
}

export async function createQuotation(input: QuotationInput): Promise<Quotation> {
  const { data } = await api.post('/quotations', input);
  return data;
}

export async function updateQuotation(id: string, input: Partial<QuotationInput>) {
  const { data } = await api.patch(`/quotations/${id}`, input);
  return data;
}

export async function deleteQuotation(id: string) {
  const { data } = await api.delete(`/quotations/${id}`);
  return data;
}

/** Converts an accepted quotation into a linked invoice; returns the invoice. */
export async function convertQuotation(id: string): Promise<{ id: string; number: string }> {
  const { data } = await api.post(`/quotations/${id}/convert`);
  return data;
}

/** Move the quotation along its workflow (Sent / Accepted / Rejected …). */
export async function setQuotationStatus(id: string, status: string): Promise<Quotation> {
  const { data } = await api.patch(`/quotations/${id}/status`, { status });
  return data;
}

export const FLOOR_OPTIONS = [
  'Ground Floor',
  ...Array.from({ length: 30 }, (_, i) => String(i + 1)),
  '30+',
];

export const LIFT_OPTIONS = ['Service Lift', 'Passenger Lift', 'Stairs'];

export const GST_MODE_OPTIONS = [
  'GST Charge Show',
  'Without GST Quotation',
  'GST Included in Freight Charge',
];

export const GST_TYPE_OPTIONS = ['CGST/SGST', 'IGST'];

export const GST_PERCENT_OPTIONS = [0, 5, 12, 18, 28];
