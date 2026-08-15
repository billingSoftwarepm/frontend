import { api } from './api';

export interface Vehicle {
  id: string;
  vehicleNo: string;
  type?: string;
  capacity?: string;
  ownerName?: string;
  ownerPhone?: string;
  isActive: boolean;
  createdAt: string;
}

export interface VehicleInput {
  vehicleNo: string;
  type?: string;
  capacity?: string;
  ownerName?: string;
  ownerPhone?: string;
  isActive?: boolean;
}

export async function listVehicles(search?: string): Promise<Vehicle[]> {
  const { data } = await api.get('/vehicles', { params: { search } });
  return data;
}

export async function createVehicle(input: VehicleInput): Promise<Vehicle> {
  const { data } = await api.post('/vehicles', input);
  return data;
}

export async function updateVehicle(id: string, input: Partial<VehicleInput>): Promise<Vehicle> {
  const { data } = await api.patch(`/vehicles/${id}`, input);
  return data;
}

export async function deleteVehicle(id: string): Promise<{ deleted: boolean }> {
  const { data } = await api.delete(`/vehicles/${id}`);
  return data;
}

export const VEHICLE_TYPES = ['Truck', 'Tempo', 'Container', 'Trailer'];
