'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { clsx } from 'clsx';
import { isAuthenticated } from '@/lib/auth';
import { logout } from '@/lib/api-auth';
import { getOrg } from '@/lib/api-org';
import { ThemeToggle } from '@/components/ui/ThemeToggle';

const NAV = [
  { label: 'Dashboard', href: '/dashboard' },
  { label: 'Customers', href: '/customers' },
  { label: 'Quotations', href: '/quotations' },
  { label: 'Bills / Invoices', href: '/invoices' },
  { label: 'Receipts', href: '/receipts' },
  { label: 'Lorry Receipts', href: '/lr' },
  { label: 'Fleet', href: '/fleet' },
  { label: 'Reports', href: '/reports' },
  { label: 'Subscription', href: '/subscription' },
  { label: 'Settings', href: '/settings' },
];

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [ready, setReady] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  // Org info (for logo / name in the header). Enabled once authenticated.
  const { data: org } = useQuery({
    queryKey: ['org'],
    queryFn: () => getOrg(),
    enabled: ready,
  });

  // Route protection: redirect to /login if not authenticated
  useEffect(() => {
    if (!isAuthenticated()) {
      router.replace('/login');
    } else {
      setReady(true);
    }
  }, [router]);

  // Close the mobile drawer whenever the route changes.
  useEffect(() => {
    setMenuOpen(false);
  }, [pathname]);

  if (!ready) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-surface">
        <div className="flex items-center gap-3 text-slate-400">
          <span className="h-5 w-5 animate-spin rounded-full border-2 border-brand-500/30 border-t-brand-500" />
          Loading…
        </div>
      </div>
    );
  }

  function handleLogout() {
    logout();
    router.replace('/login');
  }

  return (
    <div className="flex min-h-screen bg-surface text-slate-200">
      {/* Mobile overlay behind the drawer */}
      {menuOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/60 backdrop-blur-sm lg:hidden"
          onClick={() => setMenuOpen(false)}
          aria-hidden
        />
      )}

      {/* Sidebar — off-canvas drawer on mobile, static column on lg+ */}
      <aside
        className={clsx(
          'fixed inset-y-0 left-0 z-40 flex w-64 flex-col border-r border-surface-border bg-sidebar-gradient text-slate-300 transition-transform duration-200 lg:static lg:z-auto lg:translate-x-0',
          menuOpen ? 'translate-x-0' : '-translate-x-full',
        )}
      >
        <div className="flex items-center gap-3 border-b border-surface-border px-5 py-6">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-gradient text-sm font-black tracking-tight text-white shadow-glow">
            PM
          </div>
          <div className="leading-tight">
            <div className="text-[15px] font-bold tracking-tight text-white">
              Packers <span className="text-brand-400">&amp;</span> Movers
            </div>
            <div className="text-[11px] font-medium uppercase tracking-[0.2em] text-slate-500">
              Billing Suite
            </div>
          </div>
        </div>
        <nav className="flex-1 space-y-1 overflow-y-auto p-3">
          <p className="px-3 pb-1 pt-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">
            Menu
          </p>
          {NAV.map((item) => {
            const active = pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMenuOpen(false)}
                className={clsx(
                  'group relative flex items-center gap-3 rounded-xl px-4 py-2.5 text-sm font-semibold tracking-tight transition',
                  active
                    ? 'bg-brand-gradient text-white shadow-card-hover'
                    : 'text-slate-400 hover:bg-white/5 hover:text-white',
                )}
              >
                <span
                  className={clsx(
                    'h-5 w-1 rounded-full transition',
                    active ? 'bg-white' : 'bg-transparent group-hover:bg-brand-500/60',
                  )}
                />
                {item.label}
              </Link>
            );
          })}
        </nav>
        <button
          onClick={handleLogout}
          className="m-3 flex items-center gap-2 rounded-xl px-4 py-2.5 text-left text-sm font-semibold tracking-tight text-slate-400 transition hover:bg-white/5 hover:text-white"
        >
          Logout
        </button>
      </aside>

      {/* Main */}
      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-10 flex h-16 items-center justify-between gap-3 border-b border-surface-border bg-surface-800/80 px-4 backdrop-blur sm:px-6">
          <div className="flex items-center gap-3">
            {/* Hamburger — visible below lg */}
            <button
              onClick={() => setMenuOpen(true)}
              className="rounded-lg border border-surface-border p-2 text-slate-300 hover:bg-white/5 lg:hidden"
              aria-label="Open menu"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                <line x1="3" y1="6" x2="21" y2="6" />
                <line x1="3" y1="12" x2="21" y2="12" />
                <line x1="3" y1="18" x2="21" y2="18" />
              </svg>
            </button>
            <div className="text-sm font-medium text-slate-500">
              {NAV.find((n) => pathname.startsWith(n.href))?.label ?? 'Dashboard'}
            </div>
          </div>
          <div className="flex items-center gap-3">
            <span className="hidden text-sm text-slate-400 sm:inline">Welcome back</span>
            <ThemeToggle />
            {org?.logoUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={org.logoUrl}
                alt={org.name ?? 'Company logo'}
                title={org.name}
                className="h-9 w-9 rounded-full border border-surface-borderlt bg-white object-contain p-0.5 shadow-glow"
              />
            ) : (
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-brand-gradient text-sm font-bold text-white shadow-glow">
                {org?.name?.trim()?.[0]?.toUpperCase() ?? 'U'}
              </div>
            )}
          </div>
        </header>
        <main className="relative flex-1 overflow-auto bg-app-glow bg-fixed p-4 sm:p-6">
          <div className="mx-auto max-w-6xl animate-fade-in-up">{children}</div>
        </main>
      </div>
    </div>
  );
}
