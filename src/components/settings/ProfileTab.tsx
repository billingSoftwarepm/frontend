'use client';

import { useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { getOrg, updateOrg, OrgInput } from '@/lib/api-org';
import { Button } from '@/components/ui/Button';
import { Input, Textarea, Field } from '@/components/ui/Input';
import { GeoFields } from '@/components/ui/GeoFields';
import { ImageUpload } from '@/components/ui/ImageUpload';
import { errorMessage } from '@/lib/error-message';
import { Banner, SettingsCard } from './shared';

export function ProfileTab() {
  const qc = useQueryClient();
  const { data, isLoading } = useQuery({ queryKey: ['org'], queryFn: () => getOrg() });
  const { register, handleSubmit, reset, watch, setValue } = useForm<OrgInput>();

  useEffect(() => {
    if (data) {
      reset({
        name: data.name,
        legalName: data.legalName,
        gstin: data.gstin,
        pan: data.pan,
        email: data.email,
        phone: data.phone,
        website: data.website,
        address: data.address,
        city: data.city,
        state: data.state,
        pincode: data.pincode,
        logoUrl: data.logoUrl,
      });
    }
  }, [data, reset]);

  const update = useMutation({
    mutationFn: (input: OrgInput) => updateOrg(input),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['org'] }),
  });

  if (isLoading) return <div className="text-slate-400">Loading…</div>;

  return (
    <form onSubmit={handleSubmit((d) => update.mutate(d))}>
      <SettingsCard>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Company Name" required>
            <Input {...register('name', { required: true })} />
          </Field>
          <Field label="Legal / Trade Name">
            <Input {...register('legalName')} />
          </Field>
          <Field label="Company GST">
            <Input {...register('gstin')} placeholder="29ABCDE1234F1Z5" />
          </Field>
          <Field label="PAN">
            <Input {...register('pan')} placeholder="ABCDE1234F" />
          </Field>
          <Field label="Email">
            <Input type="email" {...register('email')} placeholder="info@company.com" />
          </Field>
          <Field label="Phone">
            <Input {...register('phone')} placeholder="9876543210" />
          </Field>
          <Field label="Website">
            <Input {...register('website')} placeholder="https://example.com" />
          </Field>
          <GeoFields
            register={register}
            watch={watch}
            setValue={setValue}
            stateField="state"
            cityField="city"
            pincodeField="pincode"
          />
        </div>

        <div className="mt-4">
          <Field label="Company Logo">
            <ImageUpload
              value={watch('logoUrl') || ''}
              onChange={(url) =>
                setValue('logoUrl', url, { shouldDirty: true, shouldValidate: true })
              }
              hint="Shown on invoices, quotations & lorry receipts · PNG/JPG/SVG up to 5MB"
            />
          </Field>
          {/* Hidden field keeps logoUrl part of the form payload */}
          <input type="hidden" {...register('logoUrl')} />
        </div>
        <div className="mt-4">
          <Field label="Address">
            <Textarea rows={3} {...register('address')} />
          </Field>
        </div>

        <div className="mt-4 space-y-3">
          {update.isError && <Banner kind="error">{errorMessage(update.error)}</Banner>}
          {update.isSuccess && <Banner kind="success">Business info updated successfully.</Banner>}
          <Button type="submit" disabled={update.isPending}>
            {update.isPending ? 'Saving…' : 'Save Changes'}
          </Button>
        </div>
      </SettingsCard>
    </form>
  );
}
