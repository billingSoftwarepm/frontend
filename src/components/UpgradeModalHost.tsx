'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { onUpgrade, type UpgradeInfo } from '@/lib/upgrade';

const PLAN_LABEL: Record<string, string> = {
  STARTER: 'Starter (₹99/mo)',
  PRO: 'Pro (₹299/mo)',
};

/**
 * Global listener that shows an "Upgrade your plan" popup whenever the backend
 * rejects an action with a plan-limit (UPGRADE_REQUIRED) error. Mounted once in
 * the app shell / providers.
 */
export function UpgradeModalHost() {
  const router = useRouter();
  const [info, setInfo] = useState<UpgradeInfo | null>(null);

  useEffect(() => onUpgrade(setInfo), []);

  if (!info) return null;

  const close = () => setInfo(null);

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={close} />
      <div className="relative w-full max-w-md overflow-hidden rounded-3xl border border-surface-border bg-surface-card shadow-card-hover">
        {/* Accent header */}
        <div className="bg-brand-gradient px-6 py-5 text-white">
          <div className="mb-1 flex items-center gap-2">
            <svg
              width="22"
              height="22"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="m12 2 3 7h7l-5.5 4.5L18 21l-6-4-6 4 1.5-7.5L2 9h7z" />
            </svg>
            <h2 className="text-lg font-bold">Upgrade required</h2>
          </div>
          <p className="text-sm text-white/85">
            Unlock more with the {PLAN_LABEL[info.requiredPlan] ?? info.requiredPlan} plan.
          </p>
        </div>

        <div className="space-y-4 p-6">
          <p className="text-sm text-slate-300">{info.message}</p>

          <div className="flex flex-col gap-2 sm:flex-row sm:justify-end">
            <button
              onClick={close}
              className="rounded-xl border border-surface-borderlt bg-surface-card2 px-4 py-2.5 text-sm font-medium text-slate-300 transition hover:bg-surface-border"
            >
              Not now
            </button>
            <button
              onClick={() => {
                close();
                router.push('/subscription');
              }}
              className="rounded-xl bg-brand-gradient px-4 py-2.5 text-sm font-semibold text-white shadow-glow transition hover:opacity-90"
            >
              View plans
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
