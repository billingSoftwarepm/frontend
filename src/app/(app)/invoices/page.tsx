'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { listInvoices, deleteInvoice, setInvoiceStatus } from '@/lib/api-invoices';
import { Button } from '@/components/ui/Button';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { StatusMenu } from '@/components/ui/StatusMenu';
import { DeleteIconButton, LockIconButton } from '@/components/ui/DeleteIconButton';
export default function InvoicesPage() {
  const qc = useQueryClient();
  const router = useRouter();
  const { data, isLoading } = useQuery({
    queryKey: ['invoices'],
    queryFn: () => listInvoices(),
  });

  const del = useMutation({
    mutationFn: (id: string) => deleteInvoice(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['invoices'] }),
  });

  const changeStatus = useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) =>
      setInvoiceStatus(id, status),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['invoices'] }),
    onError: (e: any) =>
      alert(e?.response?.data?.message ?? 'Could not update status'),
  });

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight text-white">Bills / Invoices</h1>
        <Link href="/invoices/new">
          <Button>+ Create Invoice</Button>
        </Link>
      </div>

      <div className="overflow-x-auto rounded-2xl border border-surface-border bg-surface-card shadow-card">
        <table className="w-full min-w-[680px] text-sm">
          <thead className="bg-surface-card2/60 text-left text-slate-400">
            <tr>
              <th className="px-4 py-3 font-medium">Number</th>
              <th className="px-4 py-3 font-medium">Customer</th>
              <th className="px-4 py-3 font-medium">Service</th>
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
            {data?.map((i) => (
              <tr
                key={i.id}
                onClick={() =>
                  router.push(
                    i.status === 'PAID'
                      ? `/print/invoice/${i.id}`
                      : `/invoices/${i.id}/edit`,
                  )
                }
                className="cursor-pointer border-t border-surface-border text-slate-300 hover:bg-white/5"
              >
                <td className="px-4 py-3 font-semibold text-white">{i.number}</td>
                <td className="px-4 py-3">{i.customerName}</td>
                <td className="px-4 py-3">{i.serviceName || '—'}</td>
                <td className="px-4 py-3 font-medium text-slate-200">₹{i.total.toLocaleString('en-IN')}</td>
                <td className="w-px whitespace-nowrap px-4 py-3">
                  <StatusBadge
                    status={i.status}
                    extra={i.isOverdue ? 'OVERDUE' : undefined}
                  />
                </td>
                <td className="w-px whitespace-nowrap px-4 py-3 text-right" onClick={(e) => e.stopPropagation()}>
                  <div className="flex items-center justify-end gap-3">
                    <StatusMenu
                      type="invoice"
                      current={i.status}
                      disabled={changeStatus.isPending}
                      onChange={(status) => changeStatus.mutate({ id: i.id, status })}
                    />
                    {i.status !== 'PAID' && i.status !== 'CANCELLED' && (
                      <Link
                        href={`/receipts/new?invoiceId=${i.id}`}
                        className="text-sm font-semibold text-amber-400 hover:underline"
                      >
                        Record Payment
                      </Link>
                    )}
                    <Link
                      href={`/print/invoice/${i.id}`}
                      className="text-sm font-semibold text-emerald-400 hover:underline"
                    >
                      Print
                    </Link>
                    {i.status === 'PAID' ? (
                      <LockIconButton label="Fully paid — locked. Remove the linked receipt(s) to edit." />
                    ) : (
                      <DeleteIconButton onClick={() => del.mutate(i.id)} label="Delete invoice" />
                    )}
                  </div>
                </td>
              </tr>
            ))}
            {!isLoading && !data?.length && (
              <tr>
                <td className="px-4 py-8 text-center text-slate-500" colSpan={6}>
                  No invoices yet
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
