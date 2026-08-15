'use client';

import { useMutation } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { createCustomer, CustomerInput } from '@/lib/api-customers';
import { Button } from '@/components/ui/Button';
import { Input, Field } from '@/components/ui/Input';
import { GeoFields } from '@/components/ui/GeoFields';

export default function NewCustomerPage() {
  const router = useRouter();
  const { register, handleSubmit, watch, setValue, formState } = useForm<CustomerInput>();

  const create = useMutation({
    mutationFn: (data: CustomerInput) => createCustomer(data),
    onSuccess: () => router.push('/customers'),
  });

  return (
    <div className="max-w-2xl">
      <h1 className="mb-6 text-2xl font-semibold text-white">Add Customer</h1>
      <form
        onSubmit={handleSubmit((data) => create.mutate(data))}
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

        {create.isError && (
          <p className="sm:col-span-2 text-sm text-red-400">
            Failed to save. Please try again.
          </p>
        )}

        <div className="sm:col-span-2 flex gap-3">
          <Button type="submit" disabled={create.isPending || formState.isSubmitting}>
            {create.isPending ? 'Saving…' : 'Save Customer'}
          </Button>
          <Button type="button" variant="secondary" onClick={() => router.back()}>
            Cancel
          </Button>
        </div>
      </form>
    </div>
  );
}
