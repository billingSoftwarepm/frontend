import { api } from './api';

export interface Customer {
  id: string;
  name: string;
  phone?: string;
  email?: string;
  gstin?: string;
  address?: string;
  city?: string;
  state?: string;
  pincode?: string;
  createdAt: string;
}

export type CustomerInput = Omit<Customer, 'id' | 'createdAt'>;

export async function listCustomers(search?: string): Promise<Customer[]> {
  const { data } = await api.get('/customers', { params: { search } });
  return data;
}

export async function getCustomer(id: string): Promise<Customer> {
  const { data } = await api.get(`/customers/${id}`);
  return data;
}

export async function createCustomer(input: CustomerInput): Promise<Customer> {
  const { data } = await api.post('/customers', input);
  return data;
}

export async function updateCustomer(id: string, input: Partial<CustomerInput>) {
  const { data } = await api.patch(`/customers/${id}`, input);
  return data;
}

export async function deleteCustomer(id: string) {
  const { data } = await api.delete(`/customers/${id}`);
  return data;
}
