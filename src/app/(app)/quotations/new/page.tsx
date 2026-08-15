'use client';

import { useMutation } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { AxiosError } from 'axios';
import { createQuotation, QuotationInput } from '@/lib/api-quotations';
import { QuotationForm } from '@/components/QuotationForm';

export default function NewQuotationPage() {
  const router = useRouter();
  const [errorText, setErrorText] = useState<string | null>(null);

  const create = useMutation({
    mutationFn: (data: QuotationInput) => createQuotation(data),
    onSuccess: () => router.push('/quotations'),
    onError: (err: unknown) => {
      const ax = err as AxiosError<{ message?: string | string[] }>;
      const m = ax?.response?.data?.message;
      setErrorText(Array.isArray(m) ? m.join(', ') : m || 'Failed to save. Please try again.');
    },
  });

  return (
    <div className="max-w-4xl">
      <h1 className="mb-6 text-2xl font-semibold text-white">Create Quotation</h1>
      <QuotationForm
        mode="create"
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
