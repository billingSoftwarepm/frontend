'use client';

import { useState } from 'react';
import { clsx } from 'clsx';
import { VehiclesTab } from '@/components/fleet/VehiclesTab';
import { DriversTab } from '@/components/fleet/DriversTab';

const TABS = [
  { id: 'vehicles', label: 'Vehicles' },
  { id: 'drivers', label: 'Drivers' },
] as const;

type TabId = (typeof TABS)[number]['id'];

export default function FleetPage() {
  const [tab, setTab] = useState<TabId>('vehicles');

  return (
    <div className="max-w-4xl">
      <h1 className="mb-1 text-3xl font-bold tracking-tight text-white">Fleet</h1>
      <p className="mb-6 text-sm text-slate-400">
        Manage your vehicles and drivers. These can be selected when creating lorry receipts.
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

      {tab === 'vehicles' && <VehiclesTab />}
      {tab === 'drivers' && <DriversTab />}
    </div>
  );
}
