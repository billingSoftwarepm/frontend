'use client';

import { useEffect, useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import { useQuery } from '@tanstack/react-query';
import { Button } from '@/components/ui/Button';
import { Input, Select, Field } from '@/components/ui/Input';
import { ALL_CITIES } from '@/lib/india-geo';
import { ReceiptInput, PAYMENT_TYPES } from '@/lib/api-receipts';
import { SERVICE_OPTIONS, listInvoices, Invoice } from '@/lib/api-invoices';
import { createCustomer } from '@/lib/api-customers';
import {
  useCustomerLink,
  CustomerOptions,
  CustomerConfirmModal,
} from '@/components/customer-link';

interface Props {
  mode: 'create' | 'edit';
  defaultValues?: Partial<ReceiptInput>;
  submitting?: boolean;
  errorText?: string | null;
  onSubmit: (data: ReceiptInput) => void | Promise<void>;
  onCancel: () => void;
}

const num = (v: unknown) => Number(v) || 0;

export function ReceiptForm({
  mode,
  defaultValues,
  submitting,
  errorText,
  onSubmit,
  onCancel,
}: Props) {
  const { register, handleSubmit, watch, setValue } = useForm<ReceiptInput>({
    defaultValues,
  });
  const { customers, matchCustomer } = useCustomerLink();

  // Load invoices so a receipt can be mapped to the bill it settles.
  const { data: invoices } = useQuery({
    queryKey: ['invoices'],
    queryFn: () => listInvoices(),
  });

  const selectedInvoiceId = watch('invoiceId');

  /** Invoices worth showing: those still owing money, plus the one already
   *  linked to this receipt (so an edit doesn't drop its selection). */
  const invoiceOptions = useMemo(() => {
    const list = invoices ?? [];
    return list.filter(
      (inv) =>
        inv.id === defaultValues?.invoiceId ||
        (inv.status !== 'CANCELLED' &&
          inv.status !== 'PAID' &&
          (inv.balanceAmount ?? inv.total) > 0),
    );
  }, [invoices, defaultValues?.invoiceId]);

  /** Fill customer + amounts from the chosen invoice. */
  function applyInvoice(inv: Invoice) {
    const outstanding = Math.max(inv.balanceAmount ?? inv.total, 0);
    setValue('invoiceId', inv.id);
    setValue('customerName', inv.customerName);
    if (inv.customerId) setValue('customerId', inv.customerId);
    if (inv.phone) setValue('phone', inv.phone);
    if (inv.serviceName) setValue('serviceName', inv.serviceName);
    if (inv.fromCity) setValue('fromCity', inv.fromCity);
    if (inv.toCity) setValue('toCity', inv.toCity);
    // Work against the outstanding balance so "Balance Due" reflects what's
    // actually left to collect (not the full invoice total).
    setValue('totalAmount', outstanding);
    setValue('receivedAmount', outstanding);
  }

  function onInvoiceChange(id: string) {
    if (!id) {
      setValue('invoiceId', undefined);
      return;
    }
    const inv = (invoices ?? []).find((i) => i.id === id);
    if (inv) applyInvoice(inv);
  }

  // When arriving via "Record Payment" (invoiceId preset) and invoices have
  // loaded, prefill the customer + balance once.
  const [prefilled, setPrefilled] = useState(false);
  useEffect(() => {
    if (prefilled) return;
    const preId = defaultValues?.invoiceId;
    if (preId && invoices && !defaultValues?.customerName) {
      const inv = invoices.find((i) => i.id === preId);
      if (inv) {
        applyInvoice(inv);
        setPrefilled(true);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [invoices, defaultValues?.invoiceId]);

  const [confirmData, setConfirmData] = useState<ReceiptInput | null>(null);
  const [creating, setCreating] = useState(false);

  const total = num(watch('totalAmount'));
  const received = num(watch('receivedAmount'));
  const balance = useMemo(() => Math.max(total - received, 0), [total, received]);

  // The invoice this receipt is linked to (if any), and how much it still owes.
  const linkedInvoice = useMemo(
    () => (invoices ?? []).find((i) => i.id === selectedInvoiceId),
    [invoices, selectedInvoiceId],
  );
  const outstanding = linkedInvoice
    ? Math.max(linkedInvoice.balanceAmount ?? linkedInvoice.total, 0)
    : undefined;

  // Overpayment guard: can't receive more than what's owed.
  const overpayLimit = outstanding ?? total;
  const isOverpaying = received > overpayLimit + 0.001;

  /** Convert string form fields into the numeric payload the API expects. */
  function buildPayload(data: ReceiptInput, customerId?: string): ReceiptInput {
    return {
      ...data,
      customerId,
      totalAmount: num(data.totalAmount),
      receivedAmount: num(data.receivedAmount),
    };
  }

  function onCustomerNameChange(name: string) {
    const match = matchCustomer(name);
    if (match) {
      setValue('customerId', match.id);
      if (match.phone) setValue('phone', match.phone);
    } else {
      setValue('customerId', undefined);
    }
  }

  function submit(data: ReceiptInput) {
    // Block overpayment before anything else.
    if (isOverpaying) return;
    // If this receipt is linked to an invoice (Record Payment flow) or already
    // has a resolved customerId, skip the "create customer" prompt.
    if (data.customerId || data.invoiceId) {
      void onSubmit(buildPayload(data, data.customerId));
      return;
    }
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
        <section className={section}>
          <h2 className={heading}>General Details</h2>
          <div className={grid}>
            <Field label="Against Invoice (optional)">
              <Select
                value={selectedInvoiceId ?? ''}
                onChange={(e) => onInvoiceChange(e.target.value)}
              >
                <option value="">Not linked to an invoice</option>
                {invoiceOptions.map((inv) => (
                  <option key={inv.id} value={inv.id}>
                    #{inv.number} — {inv.customerName} — ₹
                    {(inv.balanceAmount ?? inv.total).toLocaleString('en-IN')} due
                  </option>
                ))}
              </Select>
              <input type="hidden" {...register('invoiceId')} />
              <p className="mt-1 text-xs text-slate-500">
                Link this payment to a bill; the invoice is marked Paid/Partial automatically.
              </p>
            </Field>
            <Field label="Customer Name" required>
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
            <Field label="Receipt Date">
              <Input type="date" {...register('receiptDate')} />
            </Field>
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
            <Field label="From City/Area">
              <Input list="rcp-cities" {...register('fromCity')} />
            </Field>
            <Field label="To City/Area">
              <Input list="rcp-cities" {...register('toCity')} />
            </Field>
            <datalist id="rcp-cities">
              {ALL_CITIES.map((c) => (
                <option key={c} value={c} />
              ))}
            </datalist>
          </div>
        </section>

        <section className={section}>
          <h2 className={heading}>Payment Details</h2>
          {linkedInvoice && (
            <div className="mb-4 grid grid-cols-3 gap-3 rounded-xl border border-surface-border bg-surface-card2/40 p-4 text-center text-sm">
              <div>
                <p className="text-xs uppercase tracking-wide text-slate-500">Invoice Total</p>
                <p className="mt-1 font-semibold text-slate-200">
                  ₹{linkedInvoice.total.toLocaleString('en-IN')}
                </p>
              </div>
              <div>
                <p className="text-xs uppercase tracking-wide text-slate-500">Already Paid</p>
                <p className="mt-1 font-semibold text-emerald-400">
                  ₹{(linkedInvoice.paidAmount ?? 0).toLocaleString('en-IN')}
                </p>
              </div>
              <div>
                <p className="text-xs uppercase tracking-wide text-slate-500">Outstanding</p>
                <p className="mt-1 font-semibold text-amber-400">
                  ₹{(outstanding ?? 0).toLocaleString('en-IN')}
                </p>
              </div>
            </div>
          )}
          <div className={grid}>
            <Field label="Shifting Start Date">
              <Input type="date" {...register('shiftingStart')} />
            </Field>
            <Field label="Shifting End Date">
              <Input type="date" {...register('shiftingEnd')} />
            </Field>
            <Field label="Payment Type">
              <Select {...register('paymentType')}>
                <option value="">Select…</option>
                {PAYMENT_TYPES.map((p) => (
                  <option key={p} value={p}>
                    {p}
                  </option>
                ))}
              </Select>
            </Field>
            <Field label="Total Amount">
              <Input type="number" step="0.01" {...register('totalAmount')} />
            </Field>
            <Field label="Received Amount">
              <Input type="number" step="0.01" {...register('receivedAmount')} />
            </Field>
          </div>

          <div className="mt-6 flex items-center justify-between rounded-xl bg-brand-gradient px-5 py-4 text-white shadow-card-hover">
            <span className="font-medium">Balance Due</span>
            <span className="text-2xl font-bold">₹{balance.toLocaleString('en-IN')}</span>
          </div>

          {isOverpaying && (
            <p className="mt-3 text-sm font-medium text-red-400">
              Received amount (₹{received.toLocaleString('en-IN')}) cannot exceed{' '}
              {linkedInvoice ? 'the outstanding balance' : 'the total amount'} of ₹
              {overpayLimit.toLocaleString('en-IN')}.
            </p>
          )}
        </section>

        {errorText && <p className="text-sm text-red-400">{errorText}</p>}

        <div className="flex gap-3">
          <Button type="submit" disabled={submitting || isOverpaying}>
            {submitting ? 'Saving…' : mode === 'create' ? 'Submit' : 'Update Receipt'}
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
