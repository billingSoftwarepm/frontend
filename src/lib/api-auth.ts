import { api } from './api';
import { setToken, clearToken } from './auth';

export interface AuthUser {
  id: string;
  username: string;
  orgId: string;
  role: string;
}

export interface RegisterInput {
  companyName: string;
  fullName: string;
  email: string;
  username: string;
  password: string;
  phone?: string;
  gstin?: string;
  website?: string;
  address?: string;
}

export interface LoginInput {
  username: string;
  password: string;
}

export async function register(input: RegisterInput): Promise<AuthUser> {
  const { data } = await api.post('/auth/register', input);
  setToken(data.accessToken);
  return data.user;
}

export async function login(input: LoginInput): Promise<AuthUser> {
  const { data } = await api.post('/auth/login', input);
  setToken(data.accessToken);
  return data.user;
}

export async function fetchMe() {
  const { data } = await api.get('/auth/me');
  return data;
}

export interface ChangePasswordInput {
  oldPassword: string;
  newPassword: string;
}

export async function changePassword(input: ChangePasswordInput): Promise<{ changed: boolean }> {
  const { data } = await api.post('/auth/change-password', input);
  return data;
}

export function logout() {
  clearToken();
}
