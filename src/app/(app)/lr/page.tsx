'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { listLrs, deleteLr, setLrStatus } from '@/lib/api-lr';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { StatusMenu } from '@/components/ui/StatusMenu';
import { DeleteIconButton } from '@/components/ui/DeleteIconButton';

export default function LrPage() {
  const qc = useQueryClient();
  const router = useRouter();
  const [search, setSearch] = useState('');
  const { data, isLoading } = useQuery({
    queryKey: ['lrs', search],
    queryFn: () => listLrs(search),
  });

  const del = useMutation({
    mutationFn: (id: string) => deleteLr(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['lrs'] }),
  });

  const changeStatus = useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) =>
      setLrStatus(id, status),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['lrs'] }),
    onError: (e: any) =>
      alert(e?.response?.data?.message ?? 'Could not update status'),
  });

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight text-white">Lorry Receipts</h1>
        <Link href="/lr/new">
          <Button>+ Create LR</Button>
        </Link>
      </div>

      <div className="mb-4 max-w-sm">
        <Input
          placeholder="Search by number, LR no. or consignor…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      <div className="overflow-x-auto rounded-2xl border border-surface-border bg-surface-card shadow-card">
        <table className="w-full min-w-[680px] text-sm">
          <thead className="bg-surface-card2/60 text-left text-slate-400">
            <tr>
              <th className="px-4 py-3 font-medium">Number</th>
              <th className="px-4 py-3 font-medium">LR No.</th>
              <th className="px-4 py-3 font-medium">Consignor</th>
              <th className="px-4 py-3 font-medium">Vehicle</th>
              <th className="px-4 py-3 font-medium">Total</th>
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
            {data?.map((lr) => (
              <tr
                key={lr.id}
                onClick={() => router.push(`/lr/${lr.id}/edit`)}
                className="cursor-pointer border-t border-surface-border text-slate-300 hover:bg-white/5"
              >
                <td className="px-4 py-3 font-semibold text-white">{lr.number}</td>
                <td className="px-4 py-3">{lr.lrNumber || '—'}</td>
                <td className="px-4 py-3">{lr.consignorName}</td>
                <td className="px-4 py-3">{lr.vehicleNo || '—'}</td>
                <td className="px-4 py-3 font-medium text-slate-200">
                  ₹{lr.total.toLocaleString('en-IN')}
                </td>
                <td className="w-px whitespace-nowrap px-4 py-3">
                  <StatusBadge status={lr.status} />
                </td>
                <td className="w-px whitespace-nowrap px-4 py-3 text-right" onClick={(e) => e.stopPropagation()}>
                  <div className="flex items-center justify-end gap-3">
                    <StatusMenu
                      type="lr"
                      current={lr.status}
                      disabled={changeStatus.isPending}
                      onChange={(status) => changeStatus.mutate({ id: lr.id, status })}
                    />
                    <Link
                      href={`/print/lr/${lr.id}`}
                      className="text-sm font-semibold text-emerald-400 hover:underline"
                    >
                      Print
                    </Link>
                    <DeleteIconButton onClick={() => del.mutate(lr.id)} label="Delete lorry receipt" />
                  </div>
                </td>
              </tr>
            ))}
            {!isLoading && !data?.length && (
              <tr>
                <td className="px-4 py-8 text-center text-slate-500" colSpan={7}>
                  No lorry receipts yet
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
