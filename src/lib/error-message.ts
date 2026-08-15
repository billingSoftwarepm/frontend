import { AxiosError } from 'axios';

/** Normalizes NestJS validation errors (string | string[]) into one message. */
export function errorMessage(err: unknown, fallback = 'Something went wrong. Please try again.'): string {
  const ax = err as AxiosError<{ message?: string | string[] }>;
  const m = ax?.response?.data?.message;
  if (Array.isArray(m)) return m.join(', ');
  return m || fallback;
}
