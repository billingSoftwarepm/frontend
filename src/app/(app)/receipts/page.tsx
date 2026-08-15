'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { listReceipts, deleteReceipt } from '@/lib/api-receipts';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { DeleteIconButton } from '@/components/ui/DeleteIconButton';

export default function ReceiptsPage() {
  const qc = useQueryClient();
  const router = useRouter();
  const [search, setSearch] = useState('');
  const { data, isLoading } = useQuery({
    queryKey: ['receipts', search],
    queryFn: () => listReceipts(search),
  });

  const del = useMutation({
    mutationFn: (id: string) => deleteReceipt(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['receipts'] }),
  });

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight text-white">Receipts</h1>
        <Link href="/receipts/new">
          <Button>+ Create Receipt</Button>
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
              <th className="px-4 py-3 font-medium">Payment</th>
              <th className="px-4 py-3 font-medium">Total</th>
              <th className="px-4 py-3 font-medium">Balance</th>
              <th className="w-px whitespace-nowrap px-4 py-3 font-medium">Status</th>
              <th className="w-px whitespace-nowrap px-4 py-3 text-right font-medium">Actions</th>
            </tr>
          </thead>
          <tbody>
            {isLoading && (
              <tr>
                <td className="px-4 py-8 text-center text-slate-500" colSpan={7}>
                  Loading…
                </td>
              </tr>
            )}
            {data?.map((r) => (
              <tr
                key={r.id}
                onClick={() => router.push(`/receipts/${r.id}/edit`)}
                className="cursor-pointer border-t border-surface-border text-slate-300 hover:bg-white/5"
              >
                <td className="px-4 py-3 font-semibold text-white">{r.number}</td>
                <td className="px-4 py-3">{r.customerName}</td>
                <td className="px-4 py-3">{r.paymentType || '—'}</td>
                <td className="px-4 py-3 font-medium text-slate-200">
                  ₹{r.totalAmount.toLocaleString('en-IN')}
                </td>
                <td className="px-4 py-3">₹{r.balanceAmount.toLocaleString('en-IN')}</td>
                <td className="w-px whitespace-nowrap px-4 py-3">
                  <StatusBadge status={r.status} />
                </td>
                <td className="w-px whitespace-nowrap px-4 py-3 text-right" onClick={(e) => e.stopPropagation()}>
                  <div className="flex items-center justify-end gap-3">
                    <Link
                      href={`/print/receipt/${r.id}`}
                      className="text-sm font-semibold text-emerald-400 hover:underline"
                    >
                      Print
                    </Link>
                    <DeleteIconButton onClick={() => del.mutate(r.id)} label="Delete receipt" />
                  </div>
                </td>
              </tr>
            ))}
            {!isLoading && !data?.length && (
              <tr>
                <td className="px-4 py-8 text-center text-slate-500" colSpan={7}>
                  No receipts yet
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
