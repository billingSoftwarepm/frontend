'use client';

import { useEffect, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { AxiosError } from 'axios';
import {
  adminGetOrg,
  adminListOrgs,
  adminLogin,
  adminResetPassword,
  adminUpdateOrg,
  clearAdminToken,
  getAdminToken,
} from '@/lib/api-admin';

function fmtDate(v?: string | null) {
  if (!v) return '—';
  return new Date(v).toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
}

function errMsg(err: unknown): string {
  const ax = err as AxiosError<{ message?: string | string[] }>;
  const m = ax?.response?.data?.message;
  if (Array.isArray(m)) return m.join(', ');
  if (m) return m;
  if (ax?.request) return 'Cannot reach the server (is the backend running on :4000?).';
  return 'Something went wrong.';
}

export default function AdminPage() {
  const [authed, setAuthed] = useState(false);
  const [checked, setChecked] = useState(false);

  useEffect(() => {
    setAuthed(!!getAdminToken());
    setChecked(true);
  }, []);

  if (!checked) return null;
  if (!authed) return <AdminLogin onSuccess={() => setAuthed(true)} />;
  return <AdminDashboard onLogout={() => setAuthed(false)} />;
}

/* -------------------------------------------------------------------------- */
/*  Login                                                                      */
/* -------------------------------------------------------------------------- */
function AdminLogin({ onSuccess }: { onSuccess: () => void }) {
  const [username, setUsername] = useState('admin');
  const [password, setPassword] = useState('');

  const login = useMutation({
    mutationFn: () => adminLogin(username, password),
    onSuccess,
  });

  return (
    <div className="flex min-h-screen items-center justify-center bg-auth-gradient p-4">
      <form
        onSubmit={(e) => {
          e.preventDefault();
          login.mutate();
        }}
        className="w-full max-w-sm rounded-3xl border border-white/10 bg-surface-card/80 p-8 shadow-card-hover backdrop-blur-xl"
      >
        <div className="mb-6 text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-brand-gradient text-lg font-black text-white shadow-glow">
            ★
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-white">Admin Console</h1>
          <p className="mt-1.5 text-sm text-slate-400">Platform administration — sign in</p>
        </div>

        <label className="mb-3 block">
          <span className="mb-1.5 block text-sm font-medium text-slate-300">Username</span>
          <input
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="w-full rounded-xl border border-surface-borderlt bg-surface-card2 px-3.5 py-2.5 text-sm text-slate-100 outline-none focus:border-brand-500 focus:ring-4 focus:ring-brand-500/20"
            placeholder="admin"
          />
        </label>
        <label className="mb-4 block">
          <span className="mb-1.5 block text-sm font-medium text-slate-300">Password</span>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full rounded-xl border border-surface-borderlt bg-surface-card2 px-3.5 py-2.5 text-sm text-slate-100 outline-none focus:border-brand-500 focus:ring-4 focus:ring-brand-500/20"
            placeholder="••••••••"
          />
        </label>

        {login.isError && (
          <p className="mb-3 rounded-lg bg-red-500/10 px-3 py-2 text-sm text-red-300 ring-1 ring-red-500/30">
            {errMsg(login.error)}
          </p>
        )}

        <button
          type="submit"
          disabled={login.isPending}
          className="w-full rounded-xl bg-brand-gradient px-4 py-2.5 text-sm font-semibold text-white shadow-glow transition hover:opacity-90 disabled:opacity-60"
        >
          {login.isPending ? 'Signing in…' : 'Log In'}
        </button>
      </form>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*  Dashboard                                                                  */
/* -------------------------------------------------------------------------- */
function AdminDashboard({ onLogout }: { onLogout: () => void }) {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const orgs = useQuery({ queryKey: ['admin', 'orgs'], queryFn: adminListOrgs });

  const totalOrgs = orgs.data?.length ?? 0;
  const activeOrgs = orgs.data?.filter((o) => o.isActive).length ?? 0;

  return (
    <div className="min-h-screen bg-surface bg-app-glow bg-fixed text-slate-200">
      <header className="sticky top-0 z-10 flex h-16 items-center justify-between border-b border-surface-border bg-surface-800/80 px-4 backdrop-blur sm:px-6">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand-gradient text-sm font-black text-white shadow-glow">
            ★
          </div>
          <div>
            <div className="text-sm font-bold text-white">Admin Console</div>
            <div className="text-[11px] uppercase tracking-[0.18em] text-slate-500">
              Platform Administration
            </div>
          </div>
        </div>
        <button
          onClick={() => {
            clearAdminToken();
            onLogout();
          }}
          className="rounded-lg border border-surface-border px-3 py-1.5 text-sm font-medium text-slate-300 hover:bg-white/5"
        >
          Logout
        </button>
      </header>

      <main className="mx-auto max-w-6xl p-4 sm:p-6">
        {/* KPIs */}
        <div className="mb-6 grid grid-cols-2 gap-4 sm:grid-cols-3">
          <Kpi label="Total Organizations" value={totalOrgs} />
          <Kpi label="Active" value={activeOrgs} accent="text-emerald-400" />
          <Kpi label="Restricted" value={totalOrgs - activeOrgs} accent="text-red-400" />
        </div>

        <h2 className="mb-3 text-lg font-semibold text-white">Organizations</h2>

        {orgs.isLoading ? (
          <div className="text-slate-400">Loading…</div>
        ) : orgs.isError ? (
          <div className="rounded-xl bg-red-500/10 px-4 py-3 text-sm text-red-300 ring-1 ring-red-500/30">
            {errMsg(orgs.error)}
          </div>
        ) : (
          <div className="overflow-x-auto rounded-2xl border border-surface-border bg-surface-card shadow-card">
            <table className="w-full min-w-[760px] text-sm">
              <thead className="bg-surface-card2/60 text-left text-slate-400">
                <tr>
                  <th className="px-4 py-3 font-medium">Organization</th>
                  <th className="px-4 py-3 font-medium">Owner</th>
                  <th className="px-4 py-3 font-medium">Plan</th>
                  <th className="px-4 py-3 font-medium">Status</th>
                  <th className="px-4 py-3 font-medium">Created</th>
                  <th className="px-4 py-3 font-medium">Records</th>
                </tr>
              </thead>
              <tbody>
                {orgs.data!.map((o) => (
                  <tr
                    key={o.id}
                    onClick={() => setSelectedId(o.id)}
                    className="cursor-pointer border-t border-surface-border text-slate-300 hover:bg-white/5"
                  >
                    <td className="px-4 py-3">
                      <div className="font-semibold text-white">{o.name}</div>
                      <div className="text-xs text-slate-500">{o.email ?? '—'}</div>
                    </td>
                    <td className="px-4 py-3">
                      {o.owner ? (
                        <div>
                          <div>{o.owner.name}</div>
                          <div className="text-xs text-slate-500">@{o.owner.username}</div>
                        </div>
                      ) : (
                        '—'
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <PlanBadge plan={o.plan} />
                    </td>
                    <td className="px-4 py-3">
                      <StatusBadge active={o.isActive} />
                    </td>
                    <td className="px-4 py-3">{fmtDate(o.createdAt)}</td>
                    <td className="px-4 py-3 text-xs text-slate-400">
                      {o.counts.invoices} inv · {o.counts.customers} cust
                    </td>
                  </tr>
                ))}
                {!orgs.data!.length && (
                  <tr>
                    <td colSpan={6} className="px-4 py-8 text-center text-slate-500">
                      No organizations yet.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </main>

      {selectedId && (
        <OrgDetailDrawer orgId={selectedId} onClose={() => setSelectedId(null)} />
      )}
    </div>
  );
}

function Kpi({ label, value, accent }: { label: string; value: number; accent?: string }) {
  return (
    <div className="rounded-2xl border border-surface-border bg-card-gradient p-4 shadow-card">
      <div className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">
        {label}
      </div>
      <div className={`mt-1 text-3xl font-bold ${accent ?? 'text-white'}`}>{value}</div>
    </div>
  );
}

function PlanBadge({ plan }: { plan: string }) {
  const map: Record<string, string> = {
    FREE: 'bg-slate-500/15 text-slate-300 ring-slate-400/30',
    STARTER: 'bg-brand-500/15 text-brand-300 ring-brand-500/30',
    PRO: 'bg-amber-500/15 text-amber-300 ring-amber-500/30',
  };
  return (
    <span
      className={`rounded-full px-2.5 py-0.5 text-xs font-medium ring-1 ${map[plan] ?? map.FREE}`}
    >
      {plan}
    </span>
  );
}

function StatusBadge({ active }: { active: boolean }) {
  return (
    <span
      className={`rounded-full px-2.5 py-0.5 text-xs font-medium ring-1 ${
        active
          ? 'bg-emerald-500/15 text-emerald-300 ring-emerald-500/30'
          : 'bg-red-500/15 text-red-300 ring-red-500/30'
      }`}
    >
      {active ? 'Active' : 'Restricted'}
    </span>
  );
}

/* -------------------------------------------------------------------------- */
/*  Org detail drawer                                                          */
/* -------------------------------------------------------------------------- */
function OrgDetailDrawer({ orgId, onClose }: { orgId: string; onClose: () => void }) {
  const qc = useQueryClient();
  const org = useQuery({ queryKey: ['admin', 'org', orgId], queryFn: () => adminGetOrg(orgId) });
  const [newPassword, setNewPassword] = useState('');
  const [resetMsg, setResetMsg] = useState<string | null>(null);

  const invalidate = () => {
    qc.invalidateQueries({ queryKey: ['admin', 'org', orgId] });
    qc.invalidateQueries({ queryKey: ['admin', 'orgs'] });
  };

  const update = useMutation({
    mutationFn: (input: { isActive?: boolean; plan?: string; expiryDate?: string | null }) =>
      adminUpdateOrg(orgId, input),
    onSuccess: invalidate,
  });

  const reset = useMutation({
    mutationFn: () => adminResetPassword(orgId, newPassword),
    onSuccess: (r) => {
      setResetMsg(`Password reset for @${r.username}.`);
      setNewPassword('');
    },
  });

  const d = org.data;

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative h-full w-full max-w-xl overflow-y-auto border-l border-surface-border bg-surface-900 shadow-2xl">
        <div className="sticky top-0 flex items-center justify-between border-b border-surface-border bg-surface-800/90 px-5 py-4 backdrop-blur">
          <h3 className="text-lg font-semibold text-white">
            {d ? d.name : 'Organization'}
          </h3>
          <button
            onClick={onClose}
            className="rounded-lg border border-surface-border px-2.5 py-1 text-sm text-slate-300 hover:bg-white/5"
          >
            Close
          </button>
        </div>

        {org.isLoading || !d ? (
          <div className="p-6 text-slate-400">Loading…</div>
        ) : (
          <div className="space-y-6 p-5">
            {/* Status + controls */}
            <section className="rounded-2xl border border-surface-border bg-surface-card p-4">
              <div className="mb-3 flex items-center justify-between">
                <h4 className="text-sm font-semibold uppercase tracking-wide text-slate-400">
                  Access & Subscription
                </h4>
                <StatusBadge active={d.isActive} />
              </div>

              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => update.mutate({ isActive: !d.isActive })}
                  disabled={update.isPending}
                  className={`rounded-lg px-3 py-1.5 text-sm font-semibold transition disabled:opacity-60 ${
                    d.isActive
                      ? 'bg-red-500/15 text-red-300 ring-1 ring-red-500/30 hover:bg-red-500/25'
                      : 'bg-emerald-500/15 text-emerald-300 ring-1 ring-emerald-500/30 hover:bg-emerald-500/25'
                  }`}
                >
                  {d.isActive ? 'Restrict (Suspend) Org' : 'Reactivate Org'}
                </button>
              </div>

              <div className="mt-4 grid grid-cols-2 gap-3">
                <label className="block">
                  <span className="mb-1 block text-xs font-medium text-slate-400">Plan</span>
                  <select
                    value={d.plan}
                    onChange={(e) => update.mutate({ plan: e.target.value })}
                    className="w-full rounded-lg border border-surface-borderlt bg-surface-card2 px-3 py-2 text-sm text-slate-100 outline-none focus:border-brand-500"
                  >
                    <option value="FREE">FREE</option>
                    <option value="STARTER">STARTER</option>
                    <option value="PRO">PRO</option>
                  </select>
                </label>
                <label className="block">
                  <span className="mb-1 block text-xs font-medium text-slate-400">
                    Expiry Date
                  </span>
                  <input
                    type="date"
                    defaultValue={d.expiryDate ? d.expiryDate.slice(0, 10) : ''}
                    onChange={(e) =>
                      update.mutate({ expiryDate: e.target.value || null })
                    }
                    className="w-full rounded-lg border border-surface-borderlt bg-surface-card2 px-3 py-2 text-sm text-slate-100 outline-none focus:border-brand-500 [color-scheme:dark]"
                  />
                </label>
              </div>
              {update.isError && (
                <p className="mt-2 text-sm text-red-300">{errMsg(update.error)}</p>
              )}
            </section>

            {/* Org info */}
            <section className="rounded-2xl border border-surface-border bg-surface-card p-4">
              <h4 className="mb-3 text-sm font-semibold uppercase tracking-wide text-slate-400">
                Organization Details
              </h4>
              <dl className="grid grid-cols-2 gap-x-4 gap-y-3 text-sm">
                <Info label="Created" value={fmtDate(d.createdAt)} />
                <Info label="Plan" value={d.plan} />
                <Info label="GSTIN" value={d.gstin ?? '—'} />
                <Info label="PAN" value={d.pan ?? '—'} />
                <Info label="Email" value={d.email ?? '—'} />
                <Info label="Phone" value={d.phone ?? '—'} />
                <Info label="Website" value={d.website ?? '—'} />
                <Info
                  label="Location"
                  value={[d.city, d.state, d.pincode].filter(Boolean).join(', ') || '—'}
                />
                <Info label="Address" value={d.address ?? '—'} full />
              </dl>
            </section>

            {/* Usage */}
            <section className="rounded-2xl border border-surface-border bg-surface-card p-4">
              <h4 className="mb-3 text-sm font-semibold uppercase tracking-wide text-slate-400">
                Usage
              </h4>
              <div className="grid grid-cols-3 gap-3 text-center">
                <Stat label="Users" value={d.counts.users} />
                <Stat label="Customers" value={d.counts.customers} />
                <Stat label="Invoices" value={d.counts.invoices} />
                <Stat label="Quotations" value={d.counts.quotations} />
                <Stat label="Receipts" value={d.counts.receipts} />
                <Stat label="Lorry Rcpts" value={d.counts.lorryReceipts} />
              </div>
            </section>

            {/* Users */}
            <section className="rounded-2xl border border-surface-border bg-surface-card p-4">
              <h4 className="mb-3 text-sm font-semibold uppercase tracking-wide text-slate-400">
                Users & Login
              </h4>
              <div className="space-y-2">
                {d.users.map((u) => (
                  <div
                    key={u.id}
                    className="flex items-center justify-between rounded-xl border border-surface-borderlt bg-surface-card2 px-3 py-2"
                  >
                    <div>
                      <div className="font-medium text-white">
                        {u.name}{' '}
                        <span className="text-xs font-normal text-slate-500">({u.role})</span>
                      </div>
                      <div className="text-xs text-slate-400">
                        username: <span className="text-slate-200">@{u.username}</span> ·{' '}
                        {u.email ?? 'no email'}
                      </div>
                      <div className="text-[11px] text-slate-500">
                        Joined {fmtDate(u.createdAt)} · Last login {fmtDate(u.lastLogin)}
                      </div>
                    </div>
                    <StatusBadge active={u.isActive} />
                  </div>
                ))}
              </div>

              {/* Reset password (owner) */}
              <div className="mt-4 rounded-xl border border-surface-borderlt bg-surface-card2 p-3">
                <p className="mb-2 text-xs text-slate-400">
                  Passwords are encrypted and cannot be displayed. Set a new password for the
                  owner account instead:
                </p>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="New owner password (min 6)"
                    className="flex-1 rounded-lg border border-surface-borderlt bg-surface-900 px-3 py-2 text-sm text-slate-100 outline-none focus:border-brand-500"
                  />
                  <button
                    onClick={() => reset.mutate()}
                    disabled={reset.isPending || newPassword.length < 6}
                    className="rounded-lg bg-brand-gradient px-3 py-2 text-sm font-semibold text-white disabled:opacity-50"
                  >
                    Reset
                  </button>
                </div>
                {resetMsg && <p className="mt-2 text-sm text-emerald-300">{resetMsg}</p>}
                {reset.isError && (
                  <p className="mt-2 text-sm text-red-300">{errMsg(reset.error)}</p>
                )}
              </div>
            </section>
          </div>
        )}
      </div>
    </div>
  );
}

function Info({ label, value, full }: { label: string; value: string; full?: boolean }) {
  return (
    <div className={full ? 'col-span-2' : ''}>
      <dt className="text-xs text-slate-500">{label}</dt>
      <dd className="text-slate-200">{value}</dd>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-xl border border-surface-borderlt bg-surface-card2 p-3">
      <div className="text-2xl font-bold text-white">{value}</div>
      <div className="text-[11px] uppercase tracking-wide text-slate-500">{label}</div>
    </div>
  );
}
