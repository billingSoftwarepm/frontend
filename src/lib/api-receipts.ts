import { api } from './api';

export interface Receipt {
  id: string;
  number: string;
  customerId?: string;
  invoiceId?: string;
  customerName: string;
  phone?: string;
  receiptDate: string;
  serviceName?: string;
  fromCity?: string;
  toCity?: string;
  shiftingStart?: string;
  shiftingEnd?: string;
  paymentType?: string;
  totalAmount: number;
  receivedAmount: number;
  balanceAmount: number;
  status: string;
  createdAt: string;
}

export interface ReceiptInput {
  customerName: string;
  customerId?: string;
  invoiceId?: string;
  phone?: string;
  receiptDate?: string;
  serviceName?: string;
  fromCity?: string;
  toCity?: string;
  shiftingStart?: string;
  shiftingEnd?: string;
  paymentType?: string;
  totalAmount?: number;
  receivedAmount?: number;
  status?: string;
}

export async function listReceipts(search?: string): Promise<Receipt[]> {
  const { data } = await api.get('/receipts', { params: { search } });
  return data;
}

export async function getReceipt(id: string): Promise<Receipt> {
  const { data } = await api.get(`/receipts/${id}`);
  return data;
}

export async function createReceipt(input: ReceiptInput): Promise<Receipt> {
  const { data } = await api.post('/receipts', input);
  return data;
}

export async function updateReceipt(id: string, input: Partial<ReceiptInput>) {
  const { data } = await api.patch(`/receipts/${id}`, input);
  return data;
}

export async function deleteReceipt(id: string) {
  const { data } = await api.delete(`/receipts/${id}`);
  return data;
}

export const PAYMENT_TYPES = ['Cash', 'Online', 'Cheque'];
