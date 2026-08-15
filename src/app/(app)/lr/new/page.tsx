'use client';

import { useMutation } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { AxiosError } from 'axios';
import { createLr, LrInput } from '@/lib/api-lr';
import { LrForm } from '@/components/LrForm';

export default function NewLrPage() {
  const router = useRouter();
  const [errorText, setErrorText] = useState<string | null>(null);

  const create = useMutation({
    mutationFn: (data: LrInput) => createLr(data),
    onSuccess: () => router.push('/lr'),
    onError: (err: unknown) => {
      const ax = err as AxiosError<{ message?: string | string[] }>;
      const m = ax?.response?.data?.message;
      setErrorText(Array.isArray(m) ? m.join(', ') : m || 'Failed to save. Please try again.');
    },
  });

  return (
    <div className="max-w-4xl">
      <h1 className="mb-6 text-2xl font-semibold text-white">Create Lorry Receipt</h1>
      <LrForm
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
