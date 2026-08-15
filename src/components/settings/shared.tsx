'use client';

import { ReactNode } from 'react';

export function Banner({ kind, children }: { kind: 'error' | 'success'; children: ReactNode }) {
  const styles =
    kind === 'error'
      ? 'bg-red-500/10 text-red-300 ring-red-500/30'
      : 'bg-emerald-500/10 text-emerald-300 ring-emerald-500/30';
  return <p className={`rounded-lg px-3 py-2 text-sm ring-1 ${styles}`}>{children}</p>;
}

export function SettingsCard({ children }: { children: ReactNode }) {
  return (
    <div className="rounded-2xl border border-surface-border bg-surface-card p-6 shadow-card">
      {children}
    </div>
  );
}
