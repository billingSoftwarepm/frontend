'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useRouter, useParams } from 'next/navigation';
import { useState } from 'react';
import { AxiosError } from 'axios';
import { getQuotation, updateQuotation, QuotationInput } from '@/lib/api-quotations';
import { QuotationForm } from '@/components/QuotationForm';

function toDateInput(v?: string): string | undefined {
  if (!v) return undefined;
  return v.slice(0, 10);
}

export default function EditQuotationPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;
  const qc = useQueryClient();
  const [errorText, setErrorText] = useState<string | null>(null);

  const { data, isLoading } = useQuery({
    queryKey: ['quotation', id],
    queryFn: () => getQuotation(id),
    enabled: !!id,
  });

  const update = useMutation({
    mutationFn: (payload: QuotationInput) => updateQuotation(id, payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['quotations'] });
      qc.invalidateQueries({ queryKey: ['quotation', id] });
      router.push('/quotations');
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

  const defaults: Partial<QuotationInput> = {
    customerName: data.customerName,
    phone: data.phone,
    quotationDate: toDateInput(data.quotationDate),
    movingType: data.movingType,
    partyGstNo: data.partyGstNo,
    packingStart: toDateInput(data.packingStart),
    movingEnd: toDateInput(data.movingEnd),
    partyAddress: data.partyAddress,
    fromState: data.fromState,
    fromCity: data.fromCity,
    fromFloor: data.fromFloor,
    fromLift: data.fromLift,
    fromAddress: data.fromAddress,
    toState: data.toState,
    toCity: data.toCity,
    toFloor: data.toFloor,
    toLift: data.toLift,
    toAddress: data.toAddress,
    shiftingItems: data.shiftingItems,
    freightCharge: data.freightCharge,
    charges: data.charges,
    gstMode: data.gstMode,
    gstType: data.gstType,
    gstPercent: data.gstPercent,
    notes: data.notes,
  };

  return (
    <div className="max-w-4xl">
      <h1 className="mb-6 text-2xl font-semibold text-white">
        Edit Quotation <span className="text-slate-400">#{data.number}</span>
      </h1>
      <QuotationForm
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
