'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useRouter, useParams } from 'next/navigation';
import { useState } from 'react';
import { AxiosError } from 'axios';
import { getReceipt, updateReceipt, ReceiptInput } from '@/lib/api-receipts';
import { ReceiptForm } from '@/components/ReceiptForm';

function toDateInput(v?: string): string | undefined {
  if (!v) return undefined;
  return v.slice(0, 10);
}

export default function EditReceiptPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;
  const qc = useQueryClient();
  const [errorText, setErrorText] = useState<string | null>(null);

  const { data, isLoading } = useQuery({
    queryKey: ['receipt', id],
    queryFn: () => getReceipt(id),
    enabled: !!id,
  });

  const update = useMutation({
    mutationFn: (payload: ReceiptInput) => updateReceipt(id, payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['receipts'] });
      qc.invalidateQueries({ queryKey: ['receipt', id] });
      router.push('/receipts');
    },
    onError: (err: unknown) => {
      const ax = err as AxiosError<{ message?: string | string[] }>;
      const m = ax?.response?.data?.message;
      setErrorText(Array.isArray(m) ? m.join(', ') : m || 'Failed to save.');
    },
  });

  if (isLoading || !data) {
    return <div className="text-slate-400">Loading…</div>;
  }

  const defaults: Partial<ReceiptInput> = {
    customerName: data.customerName,
    phone: data.phone,
    invoiceId: data.invoiceId,
    receiptDate: toDateInput(data.receiptDate),
    serviceName: data.serviceName,
    fromCity: data.fromCity,
    toCity: data.toCity,
    shiftingStart: toDateInput(data.shiftingStart),
    shiftingEnd: toDateInput(data.shiftingEnd),
    paymentType: data.paymentType,
    totalAmount: data.totalAmount,
    receivedAmount: data.receivedAmount,
  };

  return (
    <div className="max-w-3xl">
      <h1 className="mb-6 text-2xl font-semibold text-white">
        Edit Receipt <span className="text-slate-400">#{data.number}</span>
      </h1>
      <ReceiptForm
        mode="edit"
        defaultValues={defaults}
        submitting={update.isPending}
        errorText={errorText}
        onSubmit={(payload) => {
          setErrorText(null);
          update.mutate(payload);
        }}
        onCancel={() => router.back()}
      />
    </div>
  );
}
