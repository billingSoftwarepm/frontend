'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useRouter, useParams } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { useEffect } from 'react';
import { AxiosError } from 'axios';
import {
  getCustomer,
  updateCustomer,
  CustomerInput,
} from '@/lib/api-customers';
import { Button } from '@/components/ui/Button';
import { Input, Field } from '@/components/ui/Input';
import { GeoFields } from '@/components/ui/GeoFields';

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

export default function EditCustomerPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;
  const qc = useQueryClient();

  const { register, handleSubmit, reset, watch, setValue } = useForm<CustomerInput>();

  const { data, isLoading } = useQuery({
    queryKey: ['customer', id],
    queryFn: () => getCustomer(id),
    enabled: !!id,
  });

  // Populate the form once the customer loads
  useEffect(() => {
    if (data) {
      reset({
        name: data.name,
        phone: data.phone ?? '',
        email: data.email ?? '',
        gstin: data.gstin ?? '',
        city: data.city ?? '',
        state: data.state ?? '',
        pincode: data.pincode ?? '',
        address: data.address ?? '',
      });
    }
  }, [data, reset]);

  const update = useMutation({
    mutationFn: (input: CustomerInput) => updateCustomer(id, input),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['customers'] });
      qc.invalidateQueries({ queryKey: ['customer', id] });
      router.push('/customers');
    },
  });

  if (isLoading) {
    return <div className="text-slate-400">Loading…</div>;
  }

  return (
    <div className="max-w-2xl">
      <h1 className="mb-6 text-2xl font-semibold text-white">Edit Customer</h1>
      <form
        onSubmit={handleSubmit((d) => update.mutate(d))}
        className="grid grid-cols-1 gap-4 rounded-2xl border border-surface-border bg-surface-card p-6 shadow-card sm:grid-cols-2"
      >
        <Field label="Name" required>
          <Input {...register('name', { required: true })} placeholder="Customer name" />
        </Field>
        <Field label="Phone">
          <Input {...register('phone')} placeholder="9876543210" />
        </Field>
        <Field label="Email">
          <Input {...register('email')} placeholder="name@example.com" />
        </Field>
        <Field label="GSTIN">
          <Input {...register('gstin')} placeholder="29ABCDE1234F1Z5" />
        </Field>
        <GeoFields
          register={register}
          watch={watch}
          setValue={setValue}
          stateField="state"
          cityField="city"
          pincodeField="pincode"
        />
        <div className="sm:col-span-2">
          <Field label="Address">
            <Input {...register('address')} />
          </Field>
        </div>

        {update.isError && (
          <p className="sm:col-span-2 text-sm text-red-400">
            {errorMessage(update.error)}
          </p>
        )}

        <div className="sm:col-span-2 flex gap-3">
          <Button type="submit" disabled={update.isPending}>
            {update.isPending ? 'Saving…' : 'Update Customer'}
          </Button>
          <Button type="button" variant="secondary" onClick={() => router.back()}>
            Cancel
          </Button>
        </div>
      </form>
    </div>
  );
}
