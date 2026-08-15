import { api } from './api';

export interface Organization {
  id: string;
  name: string;
  legalName?: string;
  gstin?: string;
  pan?: string;
  email?: string;
  phone?: string;
  website?: string;
  address?: string;
  city?: string;
  state?: string;
  pincode?: string;
  logoUrl?: string;
  signatureUrl?: string;
  terms?: string;
  expiryDate?: string;
  createdAt: string;
}

export interface OrgInput {
  name?: string;
  legalName?: string;
  gstin?: string;
  pan?: string;
  email?: string;
  phone?: string;
  website?: string;
  address?: string;
  city?: string;
  state?: string;
  pincode?: string;
  logoUrl?: string;
  signatureUrl?: string;
  terms?: string;
}

export async function getOrg(): Promise<Organization> {
  const { data } = await api.get('/org');
  return data;
}

export async function updateOrg(input: OrgInput): Promise<Organization> {
  const { data } = await api.patch('/org', input);
  return data;
}
