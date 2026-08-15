'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import {
  listDrivers,
  createDriver,
  updateDriver,
  deleteDriver,
  Driver,
  DriverInput,
} from '@/lib/api-drivers';
import { Button } from '@/components/ui/Button';
import { Input, Field } from '@/components/ui/Input';
import { errorMessage } from '@/lib/error-message';
import { Banner, SettingsCard } from '@/components/settings/shared';

export function DriversTab() {
  const qc = useQueryClient();
  const { data: drivers, isLoading } = useQuery({
    queryKey: ['drivers'],
    queryFn: () => listDrivers(),
  });
  const [editing, setEditing] = useState<Driver | null>(null);
  const [showForm, setShowForm] = useState(false);

  const del = useMutation({
    mutationFn: (id: string) => deleteDriver(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['drivers'] }),
  });

  if (isLoading) return <div className="text-slate-400">Loading…</div>;

  return (
    <div className="space-y-4">
      {!showForm && (
        <div className="flex justify-end">
          <Button
            onClick={() => {
              setEditing(null);
              setShowForm(true);
            }}
          >
            + Add Driver
          </Button>
        </div>
      )}

      {showForm && (
        <DriverForm
          initial={editing}
          onClose={() => setShowForm(false)}
          onSaved={() => {
            setShowForm(false);
            qc.invalidateQueries({ queryKey: ['drivers'] });
          }}
        />
      )}

      {(!drivers || drivers.length === 0) && !showForm && (
        <SettingsCard>
          <p className="text-center text-sm text-slate-400">
            No drivers yet. Add drivers so they can be selected on lorry receipts.
          </p>
        </SettingsCard>
      )}

      {drivers && drivers.length > 0 && (
        <div className="overflow-hidden rounded-2xl border border-surface-border bg-surface-card shadow-card">
          <table className="w-full text-sm">
            <thead className="bg-surface-card2/60 text-left text-slate-400">
              <tr>
                <th className="px-4 py-3 font-medium">Name</th>
                <th className="px-4 py-3 font-medium">Mobile</th>
                <th className="px-4 py-3 font-medium">Licence No.</th>
                <th className="px-4 py-3 text-right font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {drivers.map((d) => (
                <tr key={d.id} className="border-t border-surface-border text-slate-300 hover:bg-white/5">
                  <td className="px-4 py-3 font-semibold text-white">{d.name}</td>
                  <td className="px-4 py-3">{d.mobile || '—'}</td>
                  <td className="px-4 py-3">{d.licenceNo || '—'}</td>
                  <td className="px-4 py-3 text-right">
                    <button
                      onClick={() => {
                        setEditing(d);
                        setShowForm(true);
                      }}
                      className="mr-3 text-sm font-semibold text-brand-400 hover:underline"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => {
                        if (confirm('Delete this driver?')) del.mutate(d.id);
                      }}
                      className="text-sm font-semibold text-red-400 hover:underline"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

function DriverForm({
  initial,
  onClose,
  onSaved,
}: {
  initial: Driver | null;
  onClose: () => void;
  onSaved: () => void;
}) {
  const { register, handleSubmit } = useForm<DriverInput>({
    defaultValues: initial
      ? {
          name: initial.name,
          mobile: initial.mobile,
          licenceNo: initial.licenceNo,
          address: initial.address,
        }
      : {},
  });

  const save = useMutation({
    mutationFn: (input: DriverInput) =>
      initial ? updateDriver(initial.id, input) : createDriver(input),
    onSuccess: onSaved,
  });

  return (
    <SettingsCard>
      <h3 className="mb-4 text-lg font-semibold text-white">
        {initial ? 'Edit Driver' : 'Add Driver'}
      </h3>
      <form onSubmit={handleSubmit((d) => save.mutate(d))} className="space-y-4">
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Driver Name" required>
            <Input {...register('name', { required: true })} />
          </Field>
          <Field label="Mobile">
            <Input {...register('mobile')} />
          </Field>
          <Field label="Licence No.">
            <Input {...register('licenceNo')} />
          </Field>
          <Field label="Address">
            <Input {...register('address')} />
          </Field>
        </div>

        {save.isError && <Banner kind="error">{errorMessage(save.error)}</Banner>}

        <div className="flex gap-3 pt-1">
          <Button type="submit" disabled={save.isPending}>
            {save.isPending ? 'Saving…' : initial ? 'Update' : 'Add Driver'}
          </Button>
          <Button type="button" variant="ghost" onClick={onClose}>
            Cancel
          </Button>
        </div>
      </form>
    </SettingsCard>
  );
}
