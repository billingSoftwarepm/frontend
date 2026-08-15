'use client';

import { useQuery } from '@tanstack/react-query';
import { listCustomers, Customer } from '@/lib/api-customers';
import { Button } from '@/components/ui/Button';

/** Shared hook: loads customers and matches by name (case-insensitive). */
export function useCustomerLink() {
  const { data: customers } = useQuery({
    queryKey: ['customers'],
    queryFn: () => listCustomers(),
  });

  function matchCustomer(name?: string): Customer | undefined {
    if (!name) return undefined;
    const n = name.trim().toLowerCase();
    return customers?.find((c) => c.name.trim().toLowerCase() === n);
  }

  return { customers, matchCustomer };
}

/** Datalist of customer names to attach to an <Input list="customer-options" />. */
export function CustomerOptions({ customers }: { customers?: Customer[] }) {
  return (
    <datalist id="customer-options">
      {customers?.map((c) => (
        <option key={c.id} value={c.name} />
      ))}
    </datalist>
  );
}

/** Confirm-create-customer modal shared by invoice, quotation and receipt forms. */
export function CustomerConfirmModal({
  name,
  creating,
  onCancel,
  onConfirm,
}: {
  name: string;
  creating: boolean;
  onCancel: () => void;
  onConfirm: () => void;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 p-4 backdrop-blur-sm">
      <div className="w-full max-w-md animate-fade-in-up rounded-2xl border border-surface-border bg-surface-card p-6 shadow-card-hover">
        <div className="mb-3 inline-flex items-center rounded-lg bg-amber-400/15 px-3 py-1 text-xs font-bold uppercase tracking-widest text-amber-300 ring-1 ring-amber-400/30">
          New Customer
        </div>
        <h3 className="text-lg font-semibold tracking-tight text-white">Customer not found</h3>
        <p className="mt-2 text-sm text-slate-400">
          &quot;<span className="font-medium text-slate-200">{name}</span>&quot; is not in your
          customer list. Create this customer and continue saving?
        </p>
        <div className="mt-6 flex justify-end gap-3">
          <Button type="button" variant="secondary" onClick={onCancel} disabled={creating}>
            No, cancel
          </Button>
          <Button type="button" onClick={onConfirm} disabled={creating}>
            {creating ? 'Creating…' : 'Yes, create & save'}
          </Button>
        </div>
      </div>
    </div>
  );
}
