'use client';

import { useQuery } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { useMemo, useState } from 'react';
import {
  InvoiceInput,
  SERVICE_OPTIONS,
} from '@/lib/api-invoices';
import {
  listCustomers,
  createCustomer,
  Customer,
} from '@/lib/api-customers';
import { Button } from '@/components/ui/Button';
import { Input, Select, Textarea, Field } from '@/components/ui/Input';
import { ALL_CITIES } from '@/lib/india-geo';

export interface InvoiceFormValues {
  customerName: string;
  customerId?: string;
  phone?: string;
  billDate?: string;
  customerGstNo?: string;
  customerAddress?: string;
  serviceName?: string;
  fromCity?: string;
  toCity?: string;
  shiftingStart?: string;
  shiftingEnd?: string;
  shiftingItems?: string;
  transportation?: number;
  packing?: number;
  unpacking?: number;
  loading?: number;
  unloading?: number;
  insurance?: number;
  storage?: number;
  other?: number;
  sgstPercent?: number;
  cgstPercent?: number;
  igstPercent?: number;
  serviceCharge?: number;
}

const CHARGE_FIELDS: { key: keyof InvoiceFormValues; label: string }[] = [
  { key: 'transportation', label: 'Transportation Charge' },
  { key: 'packing', label: 'Packing Charge' },
  { key: 'unpacking', label: 'Unpacking Charge' },
  { key: 'loading', label: 'Loading Charge' },
  { key: 'unloading', label: 'Unloading Charge' },
  { key: 'insurance', label: 'Insurance Charge' },
  { key: 'storage', label: 'Storage Charge' },
  { key: 'other', label: 'Other Charge' },
];

const GST_HALF_STEPS = Array.from({ length: 30 }, (_, i) => i * 0.5); // 0 .. 14.5
const IGST_STEPS = [0, 5, 12, 18, 28];
const num = (v: unknown) => Number(v) || 0;

function buildPayload(data: InvoiceFormValues, customerId?: string): InvoiceInput {
  return {
    customerName: data.customerName,
    customerId,
    phone: data.phone,
    billDate: data.billDate,
    customerGstNo: data.customerGstNo,
    customerAddress: data.customerAddress,
    serviceName: data.serviceName,
    fromCity: data.fromCity,
    toCity: data.toCity,
    shiftingStart: data.shiftingStart,
    shiftingEnd: data.shiftingEnd,
    shiftingItems: data.shiftingItems,
    charges: {
      transportation: num(data.transportation),
      packing: num(data.packing),
      unpacking: num(data.unpacking),
      loading: num(data.loading),
      unloading: num(data.unloading),
      insurance: num(data.insurance),
      storage: num(data.storage),
      other: num(data.other),
    },
    sgstPercent: num(data.sgstPercent),
    cgstPercent: num(data.cgstPercent),
    igstPercent: num(data.igstPercent),
    serviceCharge: num(data.serviceCharge),
  };
}

interface Props {
  mode: 'create' | 'edit';
  defaultValues?: Partial<InvoiceFormValues>;
  submitting?: boolean;
  errorText?: string | null;
  onSave: (payload: InvoiceInput) => void | Promise<void>;
  onCancel: () => void;
}

export function InvoiceForm({
  mode,
  defaultValues,
  submitting,
  errorText,
  onSave,
  onCancel,
}: Props) {
  const { register, handleSubmit, watch, setValue } = useForm<InvoiceFormValues>({
    defaultValues,
  });

  const { data: customers } = useQuery({
    queryKey: ['customers'],
    queryFn: () => listCustomers(),
  });

  const [confirmCustomer, setConfirmCustomer] = useState<InvoiceFormValues | null>(null);
  const [creatingCustomer, setCreatingCustomer] = useState(false);

  const values = watch();

  const totals = useMemo(() => {
    const chargesTotal = CHARGE_FIELDS.reduce(
      (sum, f) => sum + num(values[f.key]),
      0,
    );
    const base = chargesTotal + num(values.serviceCharge);
    const sgst = (base * num(values.sgstPercent)) / 100;
    const cgst = (base * num(values.cgstPercent)) / 100;
    const igst = (base * num(values.igstPercent)) / 100;
    return { chargesTotal, sgst, cgst, igst, total: base + sgst + cgst + igst };
  }, [values]);

  /** Find an existing customer whose name matches (case-insensitive). */
  function matchCustomer(name: string): Customer | undefined {
    const n = name.trim().toLowerCase();
    return customers?.find((c) => c.name.trim().toLowerCase() === n);
  }

  /** When a known customer name is chosen, auto-fill their details. */
  function onCustomerNameChange(name: string) {
    const match = matchCustomer(name);
    if (match) {
      setValue('customerId', match.id);
      if (match.phone) setValue('phone', match.phone);
      if (match.gstin) setValue('customerGstNo', match.gstin);
      if (match.address) setValue('customerAddress', match.address);
    } else {
      setValue('customerId', undefined);
    }
  }

  async function proceedSave(data: InvoiceFormValues, customerId?: string) {
    await onSave(buildPayload(data, customerId));
  }

  function submit(data: InvoiceFormValues) {
    const match = matchCustomer(data.customerName);
    if (match) {
      // Customer exists → save directly
      void proceedSave(data, match.id);
    } else {
      // New name → ask whether to create the customer first
      setConfirmCustomer(data);
    }
  }

  async function handleCreateCustomerAndSave() {
    if (!confirmCustomer) return;
    setCreatingCustomer(true);
    try {
      const created = await createCustomer({
        name: confirmCustomer.customerName,
        phone: confirmCustomer.phone,
        gstin: confirmCustomer.customerGstNo,
        address: confirmCustomer.customerAddress,
        city: confirmCustomer.fromCity,
      });
      await proceedSave(confirmCustomer, created.id);
      setConfirmCustomer(null);
    } finally {
      setCreatingCustomer(false);
    }
  }

  const section = 'rounded-2xl border border-surface-border bg-surface-card p-6 shadow-card';
  const grid = 'grid grid-cols-1 gap-4 sm:grid-cols-2';

  return (
    <>
      <form onSubmit={handleSubmit(submit)} className="space-y-6">
        {/* General Details */}
        <section className={section}>
          <h2 className="mb-4 font-semibold text-white">General Details</h2>
          <div className={grid}>
            <Field label="Customer Name" required>
              <Input
                list="customer-options"
                placeholder="Select or type a customer…"
                {...register('customerName', {
                  required: true,
                  onChange: (e) => onCustomerNameChange(e.target.value),
                })}
              />
              <datalist id="customer-options">
                {customers?.map((c) => (
                  <option key={c.id} value={c.name} />
                ))}
              </datalist>
              <p className="mt-1 text-xs text-slate-400">
                Pick an existing customer, or type a new name (you&apos;ll be asked to
                create it).
              </p>
            </Field>
            <Field label="Phone">
              <Input {...register('phone')} />
            </Field>
            <Field label="Bill Date">
              <Input type="date" {...register('billDate')} />
            </Field>
            <Field label="Customer GST No.">
              <Input {...register('customerGstNo')} />
            </Field>
            <div className="sm:col-span-2">
              <Field label="Customer Address">
                <Textarea rows={2} {...register('customerAddress')} />
              </Field>
            </div>
          </div>
        </section>

        {/* Shifting Details */}
        <section className={section}>
          <h2 className="mb-4 font-semibold text-white">Shifting Details</h2>
          <div className={grid}>
            <Field label="Service Name">
              <Select {...register('serviceName')}>
                <option value="">Select service…</option>
                {SERVICE_OPTIONS.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </Select>
            </Field>
            <Field label="Shifting Items">
              <Input {...register('shiftingItems')} />
            </Field>
            <Field label="From City/Area">
              <Input list="inv-cities" {...register('fromCity')} />
            </Field>
            <Field label="To City/Area">
              <Input list="inv-cities" {...register('toCity')} />
            </Field>
            <datalist id="inv-cities">
              {ALL_CITIES.map((c) => (
                <option key={c} value={c} />
              ))}
            </datalist>
            <Field label="Shifting Start Date">
              <Input type="date" {...register('shiftingStart')} />
            </Field>
            <Field label="Shifting End Date">
              <Input type="date" {...register('shiftingEnd')} />
            </Field>
          </div>
        </section>

        {/* Shifting Charges */}
        <section className={section}>
          <h2 className="mb-4 font-semibold text-white">Shifting Charges</h2>
          <div className={grid}>
            {CHARGE_FIELDS.map((f) => (
              <Field key={f.key} label={f.label}>
                <Input type="number" step="0.01" {...register(f.key)} />
              </Field>
            ))}
          </div>
          <p className="mt-4 text-sm text-slate-400">
            Charges Total:{' '}
            <span className="font-semibold text-white">
              ₹{totals.chargesTotal.toLocaleString('en-IN')}
            </span>
          </p>
        </section>

        {/* Tax Charges */}
        <section className={section}>
          <h2 className="mb-4 font-semibold text-white">Tax Charges</h2>
          <div className={grid}>
            <Field label="SGST %">
              <Select {...register('sgstPercent')}>
                {GST_HALF_STEPS.map((p) => (
                  <option key={p} value={p}>
                    {p}%
                  </option>
                ))}
              </Select>
            </Field>
            <Field label="SGST Charge">
              <Input value={totals.sgst.toFixed(2)} readOnly />
            </Field>
            <Field label="CGST %">
              <Select {...register('cgstPercent')}>
                {GST_HALF_STEPS.map((p) => (
                  <option key={p} value={p}>
                    {p}%
                  </option>
                ))}
              </Select>
            </Field>
            <Field label="CGST Charge">
              <Input value={totals.cgst.toFixed(2)} readOnly />
            </Field>
            <Field label="IGST %">
              <Select {...register('igstPercent')}>
                {IGST_STEPS.map((p) => (
                  <option key={p} value={p}>
                    {p}%
                  </option>
                ))}
              </Select>
            </Field>
            <Field label="IGST Charge">
              <Input value={totals.igst.toFixed(2)} readOnly />
            </Field>
            <Field label="Service Charge">
              <Input type="number" step="0.01" {...register('serviceCharge')} />
            </Field>
          </div>

          <div className="mt-6 flex items-center justify-between rounded-xl bg-brand-gradient px-5 py-4 text-white shadow-card-hover">
            <span className="font-medium">Grand Total</span>
            <span className="text-2xl font-bold">
              ₹{totals.total.toLocaleString('en-IN')}
            </span>
          </div>
        </section>

        {errorText && <p className="text-sm text-red-400">{errorText}</p>}

        <div className="flex gap-3">
          <Button type="submit" disabled={submitting}>
            {submitting ? 'Saving…' : mode === 'create' ? 'Submit' : 'Update Invoice'}
          </Button>
          <Button type="button" variant="secondary" onClick={onCancel}>
            Cancel
          </Button>
        </div>
      </form>

      {/* Confirm-create-customer modal */}
      {confirmCustomer && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md animate-fade-in-up rounded-2xl border border-surface-border bg-surface-card p-6 shadow-card-hover">
            <div className="mb-3 inline-flex items-center rounded-lg bg-amber-400/15 px-3 py-1 text-xs font-bold uppercase tracking-widest text-amber-300 ring-1 ring-amber-400/30">
              New Customer
            </div>
            <h3 className="text-lg font-semibold tracking-tight text-white">Customer not found</h3>
            <p className="mt-2 text-sm text-slate-400">
              &quot;<span className="font-medium">{confirmCustomer.customerName}</span>&quot;
              is not in your customer list. Do you want to create this customer and then
              save the invoice?
            </p>
            <div className="mt-6 flex justify-end gap-3">
              <Button
                type="button"
                variant="secondary"
                onClick={() => setConfirmCustomer(null)}
                disabled={creatingCustomer}
              >
                No, cancel
              </Button>
              <Button
                type="button"
                onClick={handleCreateCustomerAndSave}
                disabled={creatingCustomer}
              >
                {creatingCustomer ? 'Creating…' : 'Yes, create & save'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
