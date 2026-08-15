import { api } from './api';

export interface Driver {
  id: string;
  name: string;
  mobile?: string;
  licenceNo?: string;
  address?: string;
  isActive: boolean;
  createdAt: string;
}

export interface DriverInput {
  name: string;
  mobile?: string;
  licenceNo?: string;
  address?: string;
  isActive?: boolean;
}

export async function listDrivers(search?: string): Promise<Driver[]> {
  const { data } = await api.get('/drivers', { params: { search } });
  return data;
}

export async function createDriver(input: DriverInput): Promise<Driver> {
  const { data } = await api.post('/drivers', input);
  return data;
}

export async function updateDriver(id: string, input: Partial<DriverInput>): Promise<Driver> {
  const { data } = await api.patch(`/drivers/${id}`, input);
  return data;
}

export async function deleteDriver(id: string): Promise<{ deleted: boolean }> {
  const { data } = await api.delete(`/drivers/${id}`);
  return data;
}
