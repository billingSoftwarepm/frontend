import { api } from './api';

export interface BankDetail {
  id: string;
  accountHolder: string;
  bankName: string;
  accountNumber: string;
  ifscCode: string;
  branch?: string;
  upiId?: string;
  isPrimary: boolean;
  createdAt: string;
}

export interface BankInput {
  accountHolder: string;
  bankName: string;
  accountNumber: string;
  ifscCode: string;
  branch?: string;
  upiId?: string;
  isPrimary?: boolean;
}

export async function listBanks(): Promise<BankDetail[]> {
  const { data } = await api.get('/bank-details');
  return data;
}

export async function createBank(input: BankInput): Promise<BankDetail> {
  const { data } = await api.post('/bank-details', input);
  return data;
}

export async function updateBank(id: string, input: Partial<BankInput>): Promise<BankDetail> {
  const { data } = await api.patch(`/bank-details/${id}`, input);
  return data;
}

export async function deleteBank(id: string): Promise<{ deleted: boolean }> {
  const { data } = await api.delete(`/bank-details/${id}`);
  return data;
}
