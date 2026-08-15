'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import Link from 'next/link';
import { useState } from 'react';
import { listCustomers, deleteCustomer } from '@/lib/api-customers';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { DeleteIconButton } from '@/components/ui/DeleteIconButton';

export default function CustomersPage() {
  const qc = useQueryClient();
  const [search, setSearch] = useState('');
  const { data, isLoading } = useQuery({
    queryKey: ['customers', search],
    queryFn: () => listCustomers(search),
  });

  const del = useMutation({
    mutationFn: (id: string) => deleteCustomer(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['customers'] }),
  });

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight text-white">Customers</h1>
        <Link href="/customers/new">
          <Button>+ Add Customer</Button>
        </Link>
      </div>

      <div className="mb-4 max-w-sm">
        <Input
          placeholder="Search by name, phone, email…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      <div className="overflow-x-auto rounded-2xl border border-surface-border bg-surface-card shadow-card">
        <table className="w-full min-w-[680px] text-sm">
          <thead className="bg-surface-card2/60 text-left text-slate-400">
            <tr>
              <th className="px-4 py-3 font-medium">Name</th>
              <th className="px-4 py-3 font-medium">Phone</th>
              <th className="px-4 py-3 font-medium">Email</th>
              <th className="px-4 py-3 font-medium">City</th>
              <th className="w-px whitespace-nowrap px-4 py-3 text-right font-medium">Actions</th>
            </tr>
          </thead>
          <tbody>
            {isLoading && (
              <tr>
                <td className="px-4 py-8 text-center text-slate-500" colSpan={5}>
                  Loading…
                </td>
              </tr>
            )}
            {data?.map((c) => (
              <tr key={c.id} className="border-t border-surface-border text-slate-300 hover:bg-white/5">
                <td className="px-4 py-3 font-semibold text-white">{c.name}</td>
                <td className="px-4 py-3">{c.phone || '—'}</td>
                <td className="px-4 py-3">{c.email || '—'}</td>
                <td className="px-4 py-3">{c.city || '—'}</td>
                <td className="w-px whitespace-nowrap px-4 py-3 text-right">
                  <div className="flex items-center justify-end">
                    <DeleteIconButton onClick={() => del.mutate(c.id)} label="Delete customer" />
                  </div>
                </td>
              </tr>
            ))}
            {!isLoading && !data?.length && (
              <tr>
                <td className="px-4 py-8 text-center text-slate-500" colSpan={5}>
                  No customers yet
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
