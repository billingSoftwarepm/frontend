'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import {
  listBanks,
  createBank,
  updateBank,
  deleteBank,
  BankDetail,
  BankInput,
} from '@/lib/api-bank';
import { Button } from '@/components/ui/Button';
import { Input, Field } from '@/components/ui/Input';
import { errorMessage } from '@/lib/error-message';
import { Banner, SettingsCard } from './shared';

export function BankTab() {
  const qc = useQueryClient();
  const { data: banks, isLoading } = useQuery({ queryKey: ['banks'], queryFn: () => listBanks() });
  const [editing, setEditing] = useState<BankDetail | null>(null);
  const [showForm, setShowForm] = useState(false);

  const del = useMutation({
    mutationFn: (id: string) => deleteBank(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['banks'] }),
  });

  function startAdd() {
    setEditing(null);
    setShowForm(true);
  }
  function startEdit(b: BankDetail) {
    setEditing(b);
    setShowForm(true);
  }

  if (isLoading) return <div className="text-slate-400">Loading…</div>;

  return (
    <div className="space-y-4">
      {!showForm && (
        <div className="flex justify-end">
          <Button onClick={startAdd}>+ Add Bank</Button>
        </div>
      )}

      {showForm && (
        <BankForm
          initial={editing}
          onClose={() => setShowForm(false)}
          onSaved={() => {
            setShowForm(false);
            qc.invalidateQueries({ queryKey: ['banks'] });
          }}
        />
      )}

      {(!banks || banks.length === 0) && !showForm && (
        <SettingsCard>
          <p className="text-center text-sm text-slate-400">
            No bank accounts yet. Add one so it can be printed on your invoices.
          </p>
        </SettingsCard>
      )}

      <div className="grid gap-3 sm:grid-cols-2">
        {banks?.map((b) => (
          <div
            key={b.id}
            className="rounded-2xl border border-surface-border bg-surface-card p-5 shadow-card"
          >
            <div className="mb-2 flex items-center justify-between">
              <h3 className="font-semibold text-white">{b.bankName}</h3>
              {b.isPrimary && (
                <span className="rounded-full bg-brand-500/15 px-2 py-0.5 text-xs font-medium text-brand-300 ring-1 ring-brand-500/30">
                  PRIMARY
                </span>
              )}
            </div>
            <dl className="space-y-1 text-sm text-slate-300">
              <div className="flex justify-between">
                <dt className="text-slate-500">Holder</dt>
                <dd>{b.accountHolder}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-slate-500">A/C No.</dt>
                <dd className="font-mono">{b.accountNumber}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-slate-500">IFSC</dt>
                <dd className="font-mono">{b.ifscCode}</dd>
              </div>
              {b.branch && (
                <div className="flex justify-between">
                  <dt className="text-slate-500">Branch</dt>
                  <dd>{b.branch}</dd>
                </div>
              )}
              {b.upiId && (
                <div className="flex justify-between">
                  <dt className="text-slate-500">UPI</dt>
                  <dd>{b.upiId}</dd>
                </div>
              )}
            </dl>
            <div className="mt-3 flex gap-2">
              <Button variant="secondary" onClick={() => startEdit(b)}>
                Edit
              </Button>
              <Button
                variant="ghost"
                onClick={() => {
                  if (confirm('Delete this bank account?')) del.mutate(b.id);
                }}
              >
                Delete
              </Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function BankForm({
  initial,
  onClose,
  onSaved,
}: {
  initial: BankDetail | null;
  onClose: () => void;
  onSaved: () => void;
}) {
  const { register, handleSubmit } = useForm<BankInput>({
    defaultValues: initial
      ? {
          accountHolder: initial.accountHolder,
          bankName: initial.bankName,
          accountNumber: initial.accountNumber,
          ifscCode: initial.ifscCode,
          branch: initial.branch,
          upiId: initial.upiId,
          isPrimary: initial.isPrimary,
        }
      : { isPrimary: false },
  });

  const save = useMutation({
    mutationFn: (input: BankInput) =>
      initial ? updateBank(initial.id, input) : createBank(input),
    onSuccess: onSaved,
  });

  return (
    <SettingsCard>
      <h3 className="mb-4 text-lg font-semibold text-white">
        {initial ? 'Edit Bank Account' : 'Add Bank Account'}
      </h3>
      <form onSubmit={handleSubmit((d) => save.mutate(d))} className="space-y-4">
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Account Holder's Name" required>
            <Input {...register('accountHolder', { required: true })} />
          </Field>
          <Field label="Bank Name" required>
            <Input {...register('bankName', { required: true })} placeholder="HDFC Bank" />
          </Field>
          <Field label="Account Number" required>
            <Input {...register('accountNumber', { required: true })} />
          </Field>
          <Field label="IFSC Code" required>
            <Input {...register('ifscCode', { required: true })} placeholder="HDFC0001234" />
          </Field>
          <Field label="Branch">
            <Input {...register('branch')} />
          </Field>
          <Field label="UPI ID">
            <Input {...register('upiId')} placeholder="name@okhdfcbank" />
          </Field>
        </div>
        <label className="flex items-center gap-2 text-sm text-slate-300">
          <input type="checkbox" {...register('isPrimary')} className="h-4 w-4 rounded border-surface-borderlt bg-surface-card2 [color-scheme:dark]" />
          Set as primary account (shown by default on documents)
        </label>

        {save.isError && <Banner kind="error">{errorMessage(save.error)}</Banner>}

        <div className="flex gap-3 pt-1">
          <Button type="submit" disabled={save.isPending}>
            {save.isPending ? 'Saving…' : initial ? 'Update' : 'Add Bank'}
          </Button>
          <Button type="button" variant="ghost" onClick={onClose}>
            Cancel
          </Button>
        </div>
      </form>
    </SettingsCard>
  );
}
