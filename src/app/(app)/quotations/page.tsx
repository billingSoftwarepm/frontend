'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { listQuotations, deleteQuotation, convertQuotation, setQuotationStatus } from '@/lib/api-quotations';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { StatusMenu } from '@/components/ui/StatusMenu';
import { DeleteIconButton, LockIconButton } from '@/components/ui/DeleteIconButton';

export default function QuotationsPage() {
  const qc = useQueryClient();
  const router = useRouter();
  const [search, setSearch] = useState('');
  const { data, isLoading } = useQuery({
    queryKey: ['quotations', search],
    queryFn: () => listQuotations(search),
  });

  const del = useMutation({
    mutationFn: (id: string) => deleteQuotation(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['quotations'] }),
  });

  const convert = useMutation({
    mutationFn: (id: string) => convertQuotation(id),
    onSuccess: (inv) => {
      qc.invalidateQueries({ queryKey: ['quotations'] });
      qc.invalidateQueries({ queryKey: ['invoices'] });
      router.push(`/invoices/${inv.id}/edit`);
    },
  });

  const changeStatus = useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) =>
      setQuotationStatus(id, status),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['quotations'] }),
    onError: (e: any) =>
      alert(e?.response?.data?.message ?? 'Could not update status'),
  });

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight text-white">Quotations</h1>
        <Link href="/quotations/new">
          <Button>+ Create Quotation</Button>
        </Link>
      </div>

      <div className="mb-4 max-w-sm">
        <Input
          placeholder="Search by number or customer…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      <div className="overflow-x-auto rounded-2xl border border-surface-border bg-surface-card shadow-card">
        <table className="w-full min-w-[680px] text-sm">
          <thead className="bg-surface-card2/60 text-left text-slate-400">
            <tr>
              <th className="px-4 py-3 font-medium">Number</th>
              <th className="px-4 py-3 font-medium">Customer</th>
              <th className="px-4 py-3 font-medium">Moving Type</th>
              <th className="px-4 py-3 font-medium">Total</th>
              <th className="w-px whitespace-nowrap px-4 py-3 font-medium">Status</th>
              <th className="w-px whitespace-nowrap px-4 py-3 text-right font-medium">Actions</th>
            </tr>
          </thead>
          <tbody>
            {isLoading && (
              <tr>
                <td className="px-4 py-8 text-center text-slate-500" colSpan={6}>
                  Loading…
                </td>
              </tr>
            )}
            {data?.map((q) => (
              <tr
                key={q.id}
                onClick={() =>
                  router.push(
                    q.status === 'CONVERTED'
                      ? `/print/quotation/${q.id}`
                      : `/quotations/${q.id}/edit`,
                  )
                }
                className="cursor-pointer border-t border-surface-border text-slate-300 hover:bg-white/5"
              >
                <td className="px-4 py-3 font-semibold text-white">{q.number}</td>
                <td className="px-4 py-3">{q.customerName}</td>
                <td className="px-4 py-3">{q.movingType || '—'}</td>
                <td className="px-4 py-3 font-medium text-slate-200">
                  ₹{q.total.toLocaleString('en-IN')}
                </td>
                <td className="w-px whitespace-nowrap px-4 py-3">
                  <StatusBadge
                    status={q.displayStatus ?? q.status}
                    extra={q.isExpired && q.status !== 'CONVERTED' ? undefined : undefined}
                  />
                </td>
                <td className="w-px whitespace-nowrap px-4 py-3 text-right" onClick={(e) => e.stopPropagation()}>
                  <div className="flex items-center justify-end gap-3">
                    <StatusMenu
                      type="quotation"
                      current={q.displayStatus ?? q.status}
                      disabled={changeStatus.isPending}
                      onChange={(status) => changeStatus.mutate({ id: q.id, status })}
                    />
                    {q.status !== 'CONVERTED' && (
                      <button
                        onClick={() => {
                          if (confirm(`Convert ${q.number} into an invoice?`)) convert.mutate(q.id);
                        }}
                        disabled={convert.isPending}
                        className="text-sm font-semibold text-amber-400 hover:underline disabled:opacity-50"
                      >
                        Convert
                      </button>
                    )}
                    <Link
                      href={`/print/quotation/${q.id}`}
                      className="text-sm font-semibold text-emerald-400 hover:underline"
                    >
                      Print
                    </Link>
                    {q.status !== 'CONVERTED' ? (
                      <DeleteIconButton onClick={() => del.mutate(q.id)} label="Delete quotation" />
                    ) : (
                      <LockIconButton label="Converted to invoice — locked" />
                    )}
                  </div>
                </td>
              </tr>
            ))}
            {!isLoading && !data?.length && (
              <tr>
                <td className="px-4 py-8 text-center text-slate-500" colSpan={6}>
                  No quotations yet
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
