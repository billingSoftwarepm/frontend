'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useRouter, useParams } from 'next/navigation';
import { useState } from 'react';
import { AxiosError } from 'axios';
import { getLr, updateLr, LrInput } from '@/lib/api-lr';
import { LrForm } from '@/components/LrForm';

function toDateInput(v?: string): string | undefined {
  if (!v) return undefined;
  return v.slice(0, 10);
}

export default function EditLrPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;
  const qc = useQueryClient();
  const [errorText, setErrorText] = useState<string | null>(null);

  const { data, isLoading } = useQuery({
    queryKey: ['lr', id],
    queryFn: () => getLr(id),
    enabled: !!id,
  });

  const update = useMutation({
    mutationFn: (payload: LrInput) => updateLr(id, payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['lrs'] });
      qc.invalidateQueries({ queryKey: ['lr', id] });
      router.push('/lr');
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

  const defaults: Partial<LrInput> = {
    ...data,
    lrDate: toDateInput(data.lrDate),
    insuranceDate: toDateInput(data.insuranceDate),
  };

  return (
    <div className="max-w-4xl">
      <h1 className="mb-6 text-2xl font-semibold text-white">
        Edit Lorry Receipt <span className="text-slate-400">#{data.number}</span>
      </h1>
      <LrForm
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
