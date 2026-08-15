'use client';

import { useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { getOrg, updateOrg } from '@/lib/api-org';
import { Button } from '@/components/ui/Button';
import { Textarea, Field } from '@/components/ui/Input';
import { errorMessage } from '@/lib/error-message';
import { Banner, SettingsCard } from './shared';

interface TermsForm {
  terms?: string;
}

const DEFAULT_TERMS = `1. Goods are transported at owner's risk.
2. Payment due within 7 days of delivery.
3. Company is not liable for damage due to natural calamities.
4. All disputes subject to local jurisdiction.`;

export function TermsTab() {
  const qc = useQueryClient();
  const { data, isLoading } = useQuery({ queryKey: ['org'], queryFn: () => getOrg() });
  const { register, handleSubmit, reset, setValue } = useForm<TermsForm>();

  useEffect(() => {
    if (data) reset({ terms: data.terms });
  }, [data, reset]);

  const update = useMutation({
    mutationFn: (input: TermsForm) => updateOrg(input),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['org'] }),
  });

  if (isLoading) return <div className="text-slate-400">Loading…</div>;

  return (
    <form onSubmit={handleSubmit((d) => update.mutate(d))}>
      <SettingsCard>
        <div className="mb-2 flex items-center justify-between">
          <p className="text-sm text-slate-400">
            These terms print at the bottom of quotations, invoices and lorry receipts.
          </p>
          <button
            type="button"
            onClick={() => setValue('terms', DEFAULT_TERMS)}
            className="text-xs font-medium text-brand-400 hover:text-brand-300"
          >
            Insert sample
          </button>
        </div>
        <Field label="Terms & Conditions">
          <Textarea rows={8} {...register('terms')} placeholder="Enter your default terms…" />
        </Field>

        <div className="mt-4 space-y-3">
          {update.isError && <Banner kind="error">{errorMessage(update.error)}</Banner>}
          {update.isSuccess && <Banner kind="success">Terms updated successfully.</Banner>}
          <Button type="submit" disabled={update.isPending}>
            {update.isPending ? 'Saving…' : 'Save Terms'}
          </Button>
        </div>
      </SettingsCard>
    </form>
  );
}
