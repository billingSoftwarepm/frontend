'use client';

import { Suspense } from 'react';
import { useMutation } from '@tanstack/react-query';
import { useRouter, useSearchParams } from 'next/navigation';
import { useState } from 'react';
import { AxiosError } from 'axios';
import { createReceipt, ReceiptInput } from '@/lib/api-receipts';
import { ReceiptForm } from '@/components/ReceiptForm';

function NewReceiptInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const invoiceId = searchParams.get('invoiceId') ?? undefined;
  const [errorText, setErrorText] = useState<string | null>(null);

  const create = useMutation({
    mutationFn: (data: ReceiptInput) => createReceipt(data),
    onSuccess: () => router.push('/receipts'),
    onError: (err: unknown) => {
      const ax = err as AxiosError<{ message?: string | string[] }>;
      const m = ax?.response?.data?.message;
      setErrorText(Array.isArray(m) ? m.join(', ') : m || 'Failed to save. Please try again.');
    },
  });

  return (
    <div className="max-w-3xl">
      <h1 className="mb-6 text-2xl font-semibold text-white">Create Receipt</h1>
      <ReceiptForm
        mode="create"
        defaultValues={invoiceId ? { invoiceId } : undefined}
        submitting={create.isPending}
        errorText={errorText}
        onSubmit={(data) => {
          setErrorText(null);
          create.mutate(data);
        }}
        onCancel={() => router.back()}
      />
    </div>
  );
}

export default function NewReceiptPage() {
  return (
    <Suspense fallback={<div className="text-slate-400">Loading…</div>}>
      <NewReceiptInner />
    </Suspense>
  );
}
