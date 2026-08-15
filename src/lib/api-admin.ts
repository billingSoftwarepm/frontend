import axios from 'axios';

/**
 * Separate Axios instance for the platform super-admin panel. It uses its own
 * token (stored under `adminToken`) so it never clashes with a normal user
 * session, and does not trigger the user 401 → /login redirect.
 */
const ADMIN_TOKEN_KEY = 'adminToken';

export function getAdminToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem(ADMIN_TOKEN_KEY);
}
export function setAdminToken(token: string) {
  if (typeof window !== 'undefined') localStorage.setItem(ADMIN_TOKEN_KEY, token);
}
export function clearAdminToken() {
  if (typeof window !== 'undefined') localStorage.removeItem(ADMIN_TOKEN_KEY);
}

const adminApi = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000/api',
  headers: { 'Content-Type': 'application/json' },
});

adminApi.interceptors.request.use((config) => {
  const token = getAdminToken();
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export interface OrgOwner {
  name: string;
  username: string;
  email: string | null;
  lastLogin: string | null;
}

export interface OrgCounts {
  users: number;
  customers: number;
  invoices: number;
  quotations: number;
  receipts: number;
  lorryReceipts: number;
}

export interface AdminOrgSummary {
  id: string;
  name: string;
  plan: string;
  isActive: boolean;
  expiryDate: string | null;
  createdAt: string;
  email: string | null;
  phone: string | null;
  city: string | null;
  state: string | null;
  owner: OrgOwner | null;
  counts: OrgCounts;
}

export interface AdminOrgUser {
  id: string;
  name: string;
  username: string;
  email: string | null;
  phone: string | null;
  role: string;
  isActive: boolean;
  lastLogin: string | null;
  createdAt: string;
}

export interface AdminOrgDetail extends Record<string, unknown> {
  id: string;
  name: string;
  legalName: string | null;
  gstin: string | null;
  pan: string | null;
  email: string | null;
  phone: string | null;
  website: string | null;
  address: string | null;
  city: string | null;
  state: string | null;
  pincode: string | null;
  plan: string;
  isActive: boolean;
  expiryDate: string | null;
  createdAt: string;
  updatedAt: string;
  users: AdminOrgUser[];
  counts: OrgCounts;
}

export async function adminLogin(username: string, password: string) {
  const { data } = await adminApi.post<{ accessToken: string }>('/admin/login', {
    username,
    password,
  });
  setAdminToken(data.accessToken);
  return data;
}

export async function adminListOrgs(): Promise<AdminOrgSummary[]> {
  const { data } = await adminApi.get('/admin/orgs');
  return data;
}

export async function adminGetOrg(id: string): Promise<AdminOrgDetail> {
  const { data } = await adminApi.get(`/admin/orgs/${id}`);
  return data;
}

export async function adminUpdateOrg(
  id: string,
  input: { isActive?: boolean; plan?: string; expiryDate?: string | null },
): Promise<{ id: string; isActive: boolean; plan: string; expiryDate: string | null }> {
  const { data } = await adminApi.patch(`/admin/orgs/${id}`, input);
  return data;
}

export async function adminResetPassword(
  id: string,
  newPassword: string,
  userId?: string,
): Promise<{ reset: boolean; username: string }> {
  const { data } = await adminApi.post(`/admin/orgs/${id}/reset-password`, {
    newPassword,
    userId,
  });
  return data;
}
