'use client';

import { useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { getOrg, updateOrg } from '@/lib/api-org';
import { Button } from '@/components/ui/Button';
import { Field } from '@/components/ui/Input';
import { ImageUpload } from '@/components/ui/ImageUpload';
import { errorMessage } from '@/lib/error-message';
import { Banner, SettingsCard } from './shared';

interface SignatureForm {
  signatureUrl?: string;
}

export function SignatureTab() {
  const qc = useQueryClient();
  const { data, isLoading } = useQuery({ queryKey: ['org'], queryFn: () => getOrg() });
  const { register, handleSubmit, reset, watch, setValue } = useForm<SignatureForm>();
  const url = watch('signatureUrl');

  useEffect(() => {
    if (data) reset({ signatureUrl: data.signatureUrl });
  }, [data, reset]);

  const update = useMutation({
    mutationFn: (input: SignatureForm) => updateOrg(input),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['org'] }),
  });

  if (isLoading) return <div className="text-slate-400">Loading…</div>;

  return (
    <form onSubmit={handleSubmit((d) => update.mutate(d))}>
      <SettingsCard>
        <p className="mb-4 text-sm text-slate-400">
          Upload your authorized signatory image. It will be printed on invoices and lorry
          receipts. A transparent PNG works best.
        </p>
        <Field label="Signature Image">
          <ImageUpload
            value={url || ''}
            onChange={(u) => setValue('signatureUrl', u, { shouldDirty: true })}
            hint="Transparent PNG recommended · up to 5MB"
            previewClassName="h-24"
          />
        </Field>
        <input type="hidden" {...register('signatureUrl')} />

        <div className="mt-4 space-y-3">
          {update.isError && <Banner kind="error">{errorMessage(update.error)}</Banner>}
          {update.isSuccess && <Banner kind="success">Signature updated successfully.</Banner>}
          <Button type="submit" disabled={update.isPending}>
            {update.isPending ? 'Saving…' : 'Save Signature'}
          </Button>
        </div>
      </SettingsCard>
    </form>
  );
}
