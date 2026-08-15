'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { AxiosError } from 'axios';
import { createInvoice, InvoiceInput } from '@/lib/api-invoices';
import { InvoiceForm } from '@/components/InvoiceForm';

function errorMessage(err: unknown): string {
  const ax = err as AxiosError<{ message?: string | string[] }>;
  if (ax?.response) {
    const m = ax.response.data?.message;
    if (Array.isArray(m)) return m.join(', ');
    if (m) return m;
    return `Request failed (${ax.response.status})`;
  }
  if (ax?.request) return 'Cannot reach the server.';
  return 'Something went wrong. Please try again.';
}

export default function NewInvoicePage() {
  const router = useRouter();
  const qc = useQueryClient();

  const create = useMutation({
    mutationFn: (payload: InvoiceInput) => createInvoice(payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['invoices'] });
      router.push('/invoices');
    },
  });

  return (
    <div className="max-w-4xl">
      <h1 className="mb-6 text-2xl font-semibold text-white">Create Bill / Invoice</h1>
      <InvoiceForm
        mode="create"
        submitting={create.isPending}
        errorText={create.isError ? errorMessage(create.error) : null}
        onSave={(payload) => create.mutate(payload)}
        onCancel={() => router.back()}
      />
    </div>
  );
}
