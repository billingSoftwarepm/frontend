import axios from 'axios';
import { getToken, clearToken } from './auth';
import { getUpgradeInfo, emitUpgrade } from './upgrade';

/**
 * Shared Axios instance pointed at the NestJS backend API.
 * Base URL comes from NEXT_PUBLIC_API_URL (see .env.example).
 */
export const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000/api',
  headers: { 'Content-Type': 'application/json' },
});

// Attach JWT access token if present (client-side)
api.interceptors.request.use((config) => {
  const token = getToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// On 401, clear token and redirect to login
api.interceptors.response.use(
  (res) => res,
  (error) => {
    // Surface plan-limit errors as a global "upgrade" popup.
    const upgrade = getUpgradeInfo(error);
    if (upgrade) {
      emitUpgrade(upgrade);
    }
    if (typeof window !== 'undefined' && error?.response?.status === 401) {
      clearToken();
      if (!window.location.pathname.startsWith('/login')) {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  },
);

