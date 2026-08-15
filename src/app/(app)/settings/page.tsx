'use client';

import { useState } from 'react';
import { clsx } from 'clsx';
import { ProfileTab } from '@/components/settings/ProfileTab';
import { BankTab } from '@/components/settings/BankTab';
import { SignatureTab } from '@/components/settings/SignatureTab';
import { TermsTab } from '@/components/settings/TermsTab';
import { PasswordTab } from '@/components/settings/PasswordTab';

const TABS = [
  { id: 'profile', label: 'Profile' },
  { id: 'bank', label: 'Bank Details' },
  { id: 'signature', label: 'Signature' },
  { id: 'terms', label: 'Terms' },
  { id: 'password', label: 'Change Password' },
] as const;

type TabId = (typeof TABS)[number]['id'];

export default function SettingsPage() {
  const [tab, setTab] = useState<TabId>('profile');

  return (
    <div className="max-w-4xl">
      <h1 className="mb-1 text-3xl font-bold tracking-tight text-white">Company Settings</h1>
      <p className="mb-6 text-sm text-slate-400">
        Manage your business profile, bank accounts, signature and document terms.
      </p>

      <div className="mb-6 flex flex-wrap gap-1 border-b border-surface-border">
        {TABS.map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={clsx(
              'relative px-4 py-2.5 text-sm font-medium transition-colors',
              tab === t.id ? 'text-white' : 'text-slate-400 hover:text-slate-200',
            )}
          >
            {t.label}
            {tab === t.id && (
              <span className="absolute inset-x-2 -bottom-px h-0.5 rounded-full bg-brand-gradient" />
            )}
          </button>
        ))}
      </div>

      {tab === 'profile' && <ProfileTab />}
      {tab === 'bank' && <BankTab />}
      {tab === 'signature' && <SignatureTab />}
      {tab === 'terms' && <TermsTab />}
      {tab === 'password' && <PasswordTab />}
    </div>
  );
}
