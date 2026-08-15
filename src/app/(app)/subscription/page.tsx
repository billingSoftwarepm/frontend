'use client';

import { SubscriptionTab } from '@/components/settings/SubscriptionTab';

export default function SubscriptionPage() {
  return (
    <div className="max-w-5xl">
      <h1 className="mb-1 text-3xl font-bold tracking-tight text-white">Subscription</h1>
      <p className="mb-6 text-sm text-slate-400">
        Choose the plan that fits your business. Upgrade or downgrade anytime.
      </p>
      <SubscriptionTab />
    </div>
  );
}
