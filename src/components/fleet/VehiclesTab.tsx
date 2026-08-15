'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import {
  listVehicles,
  createVehicle,
  updateVehicle,
  deleteVehicle,
  Vehicle,
  VehicleInput,
  VEHICLE_TYPES,
} from '@/lib/api-vehicles';
import { Button } from '@/components/ui/Button';
import { Input, Select, Field } from '@/components/ui/Input';
import { errorMessage } from '@/lib/error-message';
import { Banner, SettingsCard } from '@/components/settings/shared';

export function VehiclesTab() {
  const qc = useQueryClient();
  const { data: vehicles, isLoading } = useQuery({
    queryKey: ['vehicles'],
    queryFn: () => listVehicles(),
  });
  const [editing, setEditing] = useState<Vehicle | null>(null);
  const [showForm, setShowForm] = useState(false);

  const del = useMutation({
    mutationFn: (id: string) => deleteVehicle(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['vehicles'] }),
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
            + Add Vehicle
          </Button>
        </div>
      )}

      {showForm && (
        <VehicleForm
          initial={editing}
          onClose={() => setShowForm(false)}
          onSaved={() => {
            setShowForm(false);
            qc.invalidateQueries({ queryKey: ['vehicles'] });
          }}
        />
      )}

      {(!vehicles || vehicles.length === 0) && !showForm && (
        <SettingsCard>
          <p className="text-center text-sm text-slate-400">
            No vehicles yet. Add your fleet so they can be selected on lorry receipts.
          </p>
        </SettingsCard>
      )}

      {vehicles && vehicles.length > 0 && (
        <div className="overflow-hidden rounded-2xl border border-surface-border bg-surface-card shadow-card">
          <table className="w-full text-sm">
            <thead className="bg-surface-card2/60 text-left text-slate-400">
              <tr>
                <th className="px-4 py-3 font-medium">Vehicle No.</th>
                <th className="px-4 py-3 font-medium">Type</th>
                <th className="px-4 py-3 font-medium">Capacity</th>
                <th className="px-4 py-3 font-medium">Owner</th>
                <th className="px-4 py-3 text-right font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {vehicles.map((v) => (
                <tr key={v.id} className="border-t border-surface-border text-slate-300 hover:bg-white/5">
                  <td className="px-4 py-3 font-semibold text-white">{v.vehicleNo}</td>
                  <td className="px-4 py-3">{v.type || '—'}</td>
                  <td className="px-4 py-3">{v.capacity || '—'}</td>
                  <td className="px-4 py-3">
                    {v.ownerName || '—'}
                    {v.ownerPhone && <span className="text-slate-500"> · {v.ownerPhone}</span>}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <button
                      onClick={() => {
                        setEditing(v);
                        setShowForm(true);
                      }}
                      className="mr-3 text-sm font-semibold text-brand-400 hover:underline"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => {
                        if (confirm('Delete this vehicle?')) del.mutate(v.id);
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

function VehicleForm({
  initial,
  onClose,
  onSaved,
}: {
  initial: Vehicle | null;
  onClose: () => void;
  onSaved: () => void;
}) {
  const { register, handleSubmit } = useForm<VehicleInput>({
    defaultValues: initial
      ? {
          vehicleNo: initial.vehicleNo,
          type: initial.type,
          capacity: initial.capacity,
          ownerName: initial.ownerName,
          ownerPhone: initial.ownerPhone,
        }
      : {},
  });

  const save = useMutation({
    mutationFn: (input: VehicleInput) =>
      initial ? updateVehicle(initial.id, input) : createVehicle(input),
    onSuccess: onSaved,
  });

  return (
    <SettingsCard>
      <h3 className="mb-4 text-lg font-semibold text-white">
        {initial ? 'Edit Vehicle' : 'Add Vehicle'}
      </h3>
      <form onSubmit={handleSubmit((d) => save.mutate(d))} className="space-y-4">
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Vehicle Number" required>
            <Input {...register('vehicleNo', { required: true })} placeholder="GJ01AB1234" />
          </Field>
          <Field label="Type">
            <Select {...register('type')}>
              <option value="">Select type…</option>
              {VEHICLE_TYPES.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </Select>
          </Field>
          <Field label="Capacity">
            <Input {...register('capacity')} placeholder="9 Ton" />
          </Field>
          <Field label="Owner Name">
            <Input {...register('ownerName')} />
          </Field>
          <Field label="Owner Phone">
            <Input {...register('ownerPhone')} />
          </Field>
        </div>

        {save.isError && <Banner kind="error">{errorMessage(save.error)}</Banner>}

        <div className="flex gap-3 pt-1">
          <Button type="submit" disabled={save.isPending}>
            {save.isPending ? 'Saving…' : initial ? 'Update' : 'Add Vehicle'}
          </Button>
          <Button type="button" variant="ghost" onClick={onClose}>
            Cancel
          </Button>
        </div>
      </form>
    </SettingsCard>
  );
}
