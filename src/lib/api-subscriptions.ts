import { api } from './api';

export interface PlanLimits {
  invoicesPerMonth: number | 'unlimited';
  users: number | 'unlimited';
}

export interface Plan {
  id: string;
  name: string;
  price: number;
  cycleDays: number;
  highlight?: boolean;
  features: string[];
  limits: PlanLimits;
}

export interface CurrentSubscription {
  planId: string;
  planName: string;
  price: number;
  expiryDate: string | null;
  isActive: boolean;
  expired: boolean;
  plan: Plan;
}

export async function fetchPlans(): Promise<Plan[]> {
  const { data } = await api.get('/subscriptions/plans');
  return data;
}

export async function fetchCurrentSubscription(): Promise<CurrentSubscription> {
  const { data } = await api.get('/subscriptions/current');
  return data;
}

export async function subscribePlan(planId: string): Promise<{
  planId: string;
  planName: string;
  price: number;
  expiryDate: string | null;
  message: string;
}> {
  const { data } = await api.post('/subscriptions/subscribe', { planId });
  return data;
}
