'use client';

import { useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import { Button } from '@/components/ui/Button';
import { Input, Select, Textarea, Field } from '@/components/ui/Input';
import { GeoFields } from '@/components/ui/GeoFields';
import { SERVICE_OPTIONS } from '@/lib/api-invoices';
import { createCustomer } from '@/lib/api-customers';
import {
  useCustomerLink,
  CustomerOptions,
  CustomerConfirmModal,
} from '@/components/customer-link';
import {
  QuotationInput,
  FLOOR_OPTIONS,
  LIFT_OPTIONS,
  GST_MODE_OPTIONS,
  GST_TYPE_OPTIONS,
  GST_PERCENT_OPTIONS,
} from '@/lib/api-quotations';

interface Props {
  mode: 'create' | 'edit';
  defaultValues?: Partial<QuotationInput>;
  submitting?: boolean;
  errorText?: string | null;
  onSubmit: (data: QuotationInput) => void | Promise<void>;
  onCancel: () => void;
}

const num = (v: unknown) => Number(v) || 0;

const CHARGE_FIELDS: { key: keyof NonNullable<QuotationInput['charges']>; label: string }[] = [
  { key: 'transportation', label: 'Transportation Charge' },
  { key: 'packing', label: 'Packing Charge' },
  { key: 'unpacking', label: 'Unpacking Charge' },
  { key: 'loading', label: 'Loading Charge' },
  { key: 'unloading', label: 'Unloading Charge' },
  { key: 'insurance', label: 'Insurance Charge' },
  { key: 'storage', label: 'Storage Charge' },
  { key: 'service', label: 'Service Charge' },
  { key: 'other', label: 'Other Charge' },
];

export function QuotationForm({
  mode,
  defaultValues,
  submitting,
  errorText,
  onSubmit,
  onCancel,
}: Props) {
  const { register, handleSubmit, watch, setValue } = useForm<QuotationInput>({
    defaultValues,
  });
  const { customers, matchCustomer } = useCustomerLink();

  const [confirmData, setConfirmData] = useState<QuotationInput | null>(null);
  const [creating, setCreating] = useState(false);

  const freight = num(watch('freightCharge'));
  const charges = watch('charges') || {};
  const extra = CHARGE_FIELDS.reduce((sum, f) => sum + num((charges as any)[f.key]), 0);
  const subTotal = freight + extra;
  const gstMode = watch('gstMode');
  const gstPercent = num(watch('gstPercent'));
  const applyGst = gstMode && gstMode !== 'Without GST Quotation';
  const gstCharge = useMemo(
    () => (applyGst ? (subTotal * gstPercent) / 100 : 0),
    [applyGst, subTotal, gstPercent],
  );
  const total = subTotal + gstCharge;

  /** Convert string form fields into the numeric payload the API expects. */
  function buildPayload(data: QuotationInput, customerId?: string): QuotationInput {
    return {
      ...data,
      customerId,
      freightCharge: num(data.freightCharge),
      gstPercent: num(data.gstPercent),
      charges: CHARGE_FIELDS.reduce(
        (acc, f) => ({ ...acc, [f.key]: num((data.charges as any)?.[f.key]) }),
        {} as NonNullable<QuotationInput['charges']>,
      ),
    };
  }

  function onCustomerNameChange(name: string) {
    const match = matchCustomer(name);
    if (match) {
      setValue('customerId', match.id);
      if (match.phone) setValue('phone', match.phone);
      if (match.gstin) setValue('partyGstNo', match.gstin);
      if (match.address) setValue('partyAddress', match.address);
    } else {
      setValue('customerId', undefined);
    }
  }

  function submit(data: QuotationInput) {
    const match = matchCustomer(data.customerName);
    if (match) {
      void onSubmit(buildPayload(data, match.id));
    } else {
      setConfirmData(data);
    }
  }

  async function createAndSave() {
    if (!confirmData) return;
    setCreating(true);
    try {
      const created = await createCustomer({
        name: confirmData.customerName,
        phone: confirmData.phone,
        gstin: confirmData.partyGstNo,
        address: confirmData.partyAddress,
        city: confirmData.fromCity,
      });
      await onSubmit(buildPayload(confirmData, created.id));
      setConfirmData(null);
    } finally {
      setCreating(false);
    }
  }

  const section = 'rounded-2xl border border-surface-border bg-surface-card p-6 shadow-card';
  const grid = 'grid grid-cols-1 gap-4 sm:grid-cols-2';
  const heading = 'mb-4 text-xs font-semibold uppercase tracking-[0.16em] text-brand-400';

  return (
    <>
      <form onSubmit={handleSubmit(submit)} className="space-y-6">
      {/* General */}
      <section className={section}>
        <h2 className={heading}>General Details</h2>
        <div className={grid}>
          <Field label="Company / Party Name" required>
            <Input
              list="customer-options"
              placeholder="Select or type a customer…"
              {...register('customerName', {
                required: true,
                onChange: (e) => onCustomerNameChange(e.target.value),
              })}
            />
            <CustomerOptions customers={customers} />
            <p className="mt-1 text-xs text-slate-500">
              Pick an existing customer, or type a new name (you&apos;ll be asked to create it).
            </p>
          </Field>
          <Field label="Phone">
            <Input {...register('phone')} />
          </Field>
          <Field label="Quotation Date">
            <Input type="date" {...register('quotationDate')} />
          </Field>
          <Field label="Moving Type">
            <Select {...register('movingType')}>
              <option value="">Select service…</option>
              {SERVICE_OPTIONS.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </Select>
          </Field>
          <Field label="Party GST No.">
            <Input {...register('partyGstNo')} />
          </Field>
          <Field label="Packing Start Date">
            <Input type="date" {...register('packingStart')} />
          </Field>
          <Field label="Moving End Date">
            <Input type="date" {...register('movingEnd')} />
          </Field>
          <div className="sm:col-span-2">
            <Field label="Party Address">
              <Textarea rows={2} {...register('partyAddress')} />
            </Field>
          </div>
        </div>
      </section>

      {/* Move From */}
      <section className={section}>
        <h2 className={heading}>Move From</h2>
        <div className={grid}>
          <GeoFields
            register={register}
            watch={watch}
            setValue={setValue}
            stateField="fromState"
            cityField="fromCity"
            labels={{ state: 'From State', city: 'From City' }}
          />
          <Field label="From Floor">
            <Select {...register('fromFloor')}>
              <option value="">Select…</option>
              {FLOOR_OPTIONS.map((f) => (
                <option key={f} value={f}>
                  {f}
                </option>
              ))}
            </Select>
          </Field>
          <Field label="Lift Available">
            <Select {...register('fromLift')}>
              <option value="">Select…</option>
              {LIFT_OPTIONS.map((l) => (
                <option key={l} value={l}>
                  {l}
                </option>
              ))}
            </Select>
          </Field>
          <div className="sm:col-span-2">
            <Field label="From Address">
              <Input {...register('fromAddress')} />
            </Field>
          </div>
        </div>
      </section>

      {/* Move To */}
      <section className={section}>
        <h2 className={heading}>Move To</h2>
        <div className={grid}>
          <GeoFields
            register={register}
            watch={watch}
            setValue={setValue}
            stateField="toState"
            cityField="toCity"
            labels={{ state: 'To State', city: 'To City' }}
          />
          <Field label="To Floor">
            <Select {...register('toFloor')}>
              <option value="">Select…</option>
              {FLOOR_OPTIONS.map((f) => (
                <option key={f} value={f}>
                  {f}
                </option>
              ))}
            </Select>
          </Field>
          <Field label="Lift Available">
            <Select {...register('toLift')}>
              <option value="">Select…</option>
              {LIFT_OPTIONS.map((l) => (
                <option key={l} value={l}>
                  {l}
                </option>
              ))}
            </Select>
          </Field>
          <div className="sm:col-span-2">
            <Field label="To Address">
              <Input {...register('toAddress')} />
            </Field>
          </div>
          <div className="sm:col-span-2">
            <Field label="Shifting Items">
              <Input {...register('shiftingItems')} />
            </Field>
          </div>
        </div>
      </section>

      {/* Charges */}
      <section className={section}>
        <h2 className={heading}>Shifting Charges</h2>
        <div className={grid}>
          <Field label="Freight Charge (Agreed Total)">
            <Input type="number" step="0.01" {...register('freightCharge')} />
          </Field>
          {CHARGE_FIELDS.map((f) => (
            <Field key={f.key} label={f.label}>
              <Input type="number" step="0.01" {...register(`charges.${f.key}` as const)} />
            </Field>
          ))}
        </div>
        <p className="mt-4 text-sm text-slate-400">
          Sub Total:{' '}
          <span className="font-semibold text-white">
            ₹{subTotal.toLocaleString('en-IN')}
          </span>
        </p>
      </section>

      {/* Tax */}
      <section className={section}>
        <h2 className={heading}>Tax Charges</h2>
        <div className={grid}>
          <Field label="GST Mode">
            <Select {...register('gstMode')}>
              <option value="">Select…</option>
              {GST_MODE_OPTIONS.map((m) => (
                <option key={m} value={m}>
                  {m}
                </option>
              ))}
            </Select>
          </Field>
          <Field label="GST Type">
            <Select {...register('gstType')}>
              <option value="">Select…</option>
              {GST_TYPE_OPTIONS.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </Select>
          </Field>
          <Field label="GST %">
            <Select {...register('gstPercent')}>
              {GST_PERCENT_OPTIONS.map((p) => (
                <option key={p} value={p}>
                  {p}%
                </option>
              ))}
            </Select>
          </Field>
          <Field label="GST Charge">
            <Input value={gstCharge.toFixed(2)} readOnly />
          </Field>
          <div className="sm:col-span-2">
            <Field label="Notes">
              <Textarea rows={2} {...register('notes')} />
            </Field>
          </div>
        </div>

        <div className="mt-6 flex items-center justify-between rounded-xl bg-brand-gradient px-5 py-4 text-white shadow-card-hover">
          <span className="font-medium">Grand Total</span>
          <span className="text-2xl font-bold">₹{total.toLocaleString('en-IN')}</span>
        </div>
      </section>

      {errorText && <p className="text-sm text-red-400">{errorText}</p>}

      <div className="flex gap-3">
        <Button type="submit" disabled={submitting}>
          {submitting ? 'Saving…' : mode === 'create' ? 'Submit' : 'Update Quotation'}
        </Button>
        <Button type="button" variant="secondary" onClick={onCancel}>
          Cancel
        </Button>
      </div>
    </form>

      {confirmData && (
        <CustomerConfirmModal
          name={confirmData.customerName}
          creating={creating}
          onCancel={() => setConfirmData(null)}
          onConfirm={createAndSave}
        />
      )}
    </>
  );
}
