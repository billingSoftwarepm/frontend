'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useRouter, useParams } from 'next/navigation';
import { AxiosError } from 'axios';
import { getInvoice, updateInvoice, InvoiceInput } from '@/lib/api-invoices';
import { InvoiceForm, InvoiceFormValues } from '@/components/InvoiceForm';

function errorMessage(err: unknown): string {
  const ax = err as AxiosError<{ message?: string | string[] }>;
  if (ax?.response) {
    const m = ax.response.data?.message;
    if (Array.isArray(m)) return m.join(', ');
    if (m) return m;
    return `Request failed (${ax.response.status})`;
  }
  if (ax?.request) return 'Cannot reach the server.';
  return 'Something went wrong. Please try again.';
}

/** ISO datetime -> yyyy-mm-dd for date inputs. */
function toDateInput(v?: string): string | undefined {
  if (!v) return undefined;
  return v.slice(0, 10);
}

export default function EditInvoicePage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;
  const qc = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ['invoice', id],
    queryFn: () => getInvoice(id),
    enabled: !!id,
  });

  const update = useMutation({
    mutationFn: (payload: InvoiceInput) => updateInvoice(id, payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['invoices'] });
      qc.invalidateQueries({ queryKey: ['invoice', id] });
      router.push('/invoices');
    },
  });

  if (isLoading || !data) {
    return <div className="text-slate-400">Loading…</div>;
  }

  const defaults: Partial<InvoiceFormValues> = {
    customerName: data.customerName,
    customerId: data.customerId,
    phone: data.phone,
    billDate: toDateInput(data.billDate),
    customerGstNo: data.customerGstNo,
    customerAddress: data.customerAddress,
    serviceName: data.serviceName,
    fromCity: data.fromCity,
    toCity: data.toCity,
    shiftingStart: toDateInput(data.shiftingStart),
    shiftingEnd: toDateInput(data.shiftingEnd),
    shiftingItems: data.shiftingItems,
    transportation: data.charges?.transportation,
    packing: data.charges?.packing,
    unpacking: data.charges?.unpacking,
    loading: data.charges?.loading,
    unloading: data.charges?.unloading,
    insurance: data.charges?.insurance,
    storage: data.charges?.storage,
    other: data.charges?.other,
    sgstPercent: data.sgstPercent,
    cgstPercent: data.cgstPercent,
    igstPercent: data.igstPercent,
    serviceCharge: data.serviceCharge,
  };

  return (
    <div className="max-w-4xl">
      <h1 className="mb-6 text-2xl font-semibold text-white">
        Edit Invoice{' '}
        <span className="text-slate-400">#{data.number}</span>
      </h1>
      <InvoiceForm
        mode="edit"
        defaultValues={defaults}
        submitting={update.isPending}
        errorText={update.isError ? errorMessage(update.error) : null}
        onSave={(payload) => update.mutate(payload)}
        onCancel={() => router.back()}
      />
    </div>
  );
}
