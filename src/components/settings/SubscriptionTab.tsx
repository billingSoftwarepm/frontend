'use client';

import { useMemo, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { clsx } from 'clsx';
import {
  fetchCurrentSubscription,
  fetchPlans,
  subscribePlan,
  type Plan,
} from '@/lib/api-subscriptions';
import { errorMessage } from '@/lib/error-message';
import { Banner } from './shared';

function fmtDate(v?: string | null) {
  if (!v) return null;
  return new Date(v).toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
}

export function SubscriptionTab() {
  const qc = useQueryClient();
  const plans = useQuery({ queryKey: ['plans'], queryFn: fetchPlans });
  const current = useQuery({ queryKey: ['subscription'], queryFn: fetchCurrentSubscription });
  const [pendingId, setPendingId] = useState<string | null>(null);

  const subscribe = useMutation({
    mutationFn: (planId: string) => subscribePlan(planId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['subscription'] });
      qc.invalidateQueries({ queryKey: ['org'] });
    },
    onSettled: () => setPendingId(null),
  });

  const currentPlanId = current.data?.planId ?? 'FREE';
  const expiry = fmtDate(current.data?.expiryDate);

  const sorted = useMemo(
    () => (plans.data ? [...plans.data].sort((a, b) => a.price - b.price) : []),
    [plans.data],
  );

  if (plans.isLoading || current.isLoading) {
    return <div className="text-slate-400">Loading…</div>;
  }

  return (
    <div className="space-y-6">
      {/* Current status */}
      <div className="rounded-2xl border border-surface-border bg-card-gradient p-5 shadow-card">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">
              Current Plan
            </p>
            <p className="mt-1 text-2xl font-bold text-white">
              {current.data?.planName ?? 'Free'}
              {current.data && current.data.price > 0 && (
                <span className="ml-2 text-sm font-medium text-slate-400">
                  ₹{current.data.price}/mo
                </span>
              )}
            </p>
          </div>
          <div className="text-right">
            {current.data?.expired ? (
              <span className="rounded-full bg-red-500/15 px-3 py-1 text-xs font-semibold text-red-300 ring-1 ring-red-500/30">
                Expired
              </span>
            ) : expiry ? (
              <p className="text-sm text-slate-400">
                Renews / valid until <span className="text-slate-200">{expiry}</span>
              </p>
            ) : (
              <span className="rounded-full bg-emerald-500/15 px-3 py-1 text-xs font-semibold text-emerald-300 ring-1 ring-emerald-500/30">
                Active
              </span>
            )}
          </div>
        </div>
      </div>

      {subscribe.isError && <Banner kind="error">{errorMessage(subscribe.error)}</Banner>}
      {subscribe.isSuccess && <Banner kind="success">{subscribe.data.message}</Banner>}

      {/* Plans */}
      <div className="grid gap-4 md:grid-cols-3">
        {sorted.map((plan) => (
          <PlanCard
            key={plan.id}
            plan={plan}
            current={plan.id === currentPlanId}
            loading={pendingId === plan.id && subscribe.isPending}
            disabled={subscribe.isPending}
            onSelect={() => {
              setPendingId(plan.id);
              subscribe.mutate(plan.id);
            }}
          />
        ))}
      </div>

      <p className="text-xs text-slate-500">
        Prices are in INR and billed monthly. This is a demo checkout — subscribing activates the
        plan immediately without a payment step. A payment gateway (e.g. Razorpay/Stripe) can be
        connected here for live billing.
      </p>
    </div>
  );
}

function PlanCard({
  plan,
  current,
  loading,
  disabled,
  onSelect,
}: {
  plan: Plan;
  current: boolean;
  loading: boolean;
  disabled: boolean;
  onSelect: () => void;
}) {
  return (
    <div
      className={clsx(
        'relative flex flex-col rounded-2xl border p-5 shadow-card transition',
        current
          ? 'border-brand-500 bg-brand-500/5'
          : plan.highlight
            ? 'border-brand-500/40 bg-surface-card'
            : 'border-surface-border bg-surface-card',
      )}
    >
      {plan.highlight && !current && (
        <span className="absolute -top-2.5 right-4 rounded-full bg-brand-gradient px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wide text-white shadow-glow">
          Popular
        </span>
      )}

      <h3 className="text-lg font-bold text-white">{plan.name}</h3>
      <div className="mt-1 flex items-baseline gap-1">
        <span className="text-3xl font-extrabold text-white">
          {plan.price === 0 ? 'Free' : `₹${plan.price}`}
        </span>
        {plan.price > 0 && <span className="text-sm text-slate-400">/mo</span>}
      </div>

      <ul className="mt-4 flex-1 space-y-2 text-sm text-slate-300">
        {plan.features.map((f) => (
          <li key={f} className="flex items-start gap-2">
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="mt-0.5 shrink-0 text-brand-400"
            >
              <polyline points="20 6 9 17 4 12" />
            </svg>
            {f}
          </li>
        ))}
      </ul>

      <button
        type="button"
        disabled={current || disabled}
        onClick={onSelect}
        className={clsx(
          'mt-5 rounded-xl px-4 py-2.5 text-sm font-semibold transition',
          current
            ? 'cursor-default bg-surface-card2 text-slate-400 ring-1 ring-surface-borderlt'
            : 'bg-brand-gradient text-white shadow-glow hover:opacity-90 disabled:opacity-60',
        )}
      >
        {current
          ? 'Current Plan'
          : loading
            ? 'Processing…'
            : plan.price === 0
              ? 'Switch to Free'
              : `Subscribe · ₹${plan.price}/mo`}
      </button>
    </div>
  );
}
