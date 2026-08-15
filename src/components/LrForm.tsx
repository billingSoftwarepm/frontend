'use client';

import { useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import { useQuery } from '@tanstack/react-query';
import { Button } from '@/components/ui/Button';
import { Input, Select, Textarea, Field } from '@/components/ui/Input';
import { GeoFields } from '@/components/ui/GeoFields';
import { createCustomer } from '@/lib/api-customers';
import { listVehicles } from '@/lib/api-vehicles';
import { listDrivers } from '@/lib/api-drivers';
import {
  useCustomerLink,
  CustomerOptions,
  CustomerConfirmModal,
} from '@/components/customer-link';
import {
  LrInput,
  RISK_TYPES,
  WEIGHT_UNITS,
  GST_PERCENT_OPTIONS,
  GST_PAID_BY,
  INSURANCE_OPTIONS,
  DEMURRAGE_UNITS,
  DEMURRAGE_AFTER,
} from '@/lib/api-lr';

interface Props {
  mode: 'create' | 'edit';
  defaultValues?: Partial<LrInput>;
  submitting?: boolean;
  errorText?: string | null;
  onSubmit: (data: LrInput) => void | Promise<void>;
  onCancel: () => void;
}

const num = (v: unknown) => Number(v) || 0;
const int = (v: unknown) => (v === '' || v == null ? undefined : parseInt(String(v), 10) || 0);

const NUMERIC_FIELDS: (keyof LrInput)[] = [
  'freightToBeBilled',
  'freightPaid',
  'freightToPay',
  'totalBasicFreight',
  'loadingCharge',
  'unloadingCharge',
  'stCharge',
  'otherCharges',
  'lrCnCharges',
  'gstPercent',
  'actualWeight',
  'chargedWeight',
  'demurrageCharge',
];

export function LrForm({
  mode,
  defaultValues,
  submitting,
  errorText,
  onSubmit,
  onCancel,
}: Props) {
  const { register, handleSubmit, watch, setValue } = useForm<LrInput>({ defaultValues });
  const { customers, matchCustomer } = useCustomerLink();

  // Fleet masters for the vehicle/driver pickers
  const { data: vehicles } = useQuery({ queryKey: ['vehicles'], queryFn: () => listVehicles() });
  const { data: drivers } = useQuery({ queryKey: ['drivers'], queryFn: () => listDrivers() });

  function onVehiclePick(id: string) {
    setValue('vehicleId', id || undefined);
    const v = vehicles?.find((x) => x.id === id);
    if (v) setValue('vehicleNo', v.vehicleNo);
  }

  function onDriverPick(id: string) {
    setValue('driverId', id || undefined);
    const d = drivers?.find((x) => x.id === id);
    if (d) {
      setValue('driverName', d.name);
      if (d.mobile) setValue('driverMobile', d.mobile);
      if (d.licenceNo) setValue('driverLicence', d.licenceNo);
    }
  }

  const [confirmData, setConfirmData] = useState<LrInput | null>(null);
  const [creating, setCreating] = useState(false);

  // Live totals
  const base =
    num(watch('totalBasicFreight')) +
    num(watch('loadingCharge')) +
    num(watch('unloadingCharge')) +
    num(watch('stCharge')) +
    num(watch('otherCharges')) +
    num(watch('lrCnCharges'));
  const gstPercent = num(watch('gstPercent'));
  const gstCharge = useMemo(() => (base * gstPercent) / 100, [base, gstPercent]);
  const total = base + gstCharge;

  function buildPayload(data: LrInput, customerId?: string): LrInput {
    const out: any = { ...data, customerId };
    NUMERIC_FIELDS.forEach((f) => (out[f] = num(data[f])));
    out.noOfPackage = int(data.noOfPackage);
    return out as LrInput;
  }

  function onConsignorChange(name: string) {
    const match = matchCustomer(name);
    if (match) {
      setValue('customerId', match.id);
      if (match.phone) setValue('consignorPhone', match.phone);
      if (match.gstin) setValue('consignorGstin', match.gstin);
      if (match.address) setValue('fromAddress', match.address);
      if (match.city) setValue('fromCity', match.city);
      if (match.state) setValue('fromState', match.state);
    } else {
      setValue('customerId', undefined);
    }
  }

  function submit(data: LrInput) {
    const match = matchCustomer(data.consignorName);
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
        name: confirmData.consignorName,
        phone: confirmData.consignorPhone,
        gstin: confirmData.consignorGstin,
        address: confirmData.fromAddress,
        city: confirmData.fromCity,
        state: confirmData.fromState,
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
        {/* LR Details */}
        <section className={section}>
          <h2 className={heading}>LR Details</h2>
          <div className={grid}>
            <Field label="LR Number">
              <Input {...register('lrNumber')} />
            </Field>
            <Field label="LR Date">
              <Input type="date" {...register('lrDate')} />
            </Field>
            <Field label="Risk Type">
              <Select {...register('riskType')}>
                <option value="">Select…</option>
                {RISK_TYPES.map((r) => (
                  <option key={r} value={r}>
                    {r}
                  </option>
                ))}
              </Select>
            </Field>
            <Field label="Truck / Vehicle No.">
              <Input {...register('vehicleNo')} />
            </Field>
            {vehicles && vehicles.length > 0 && (
              <Field label="Select from Fleet">
                <Select defaultValue="" onChange={(e) => onVehiclePick(e.target.value)}>
                  <option value="">Choose a saved vehicle…</option>
                  {vehicles.map((v) => (
                    <option key={v.id} value={v.id}>
                      {v.vehicleNo}
                      {v.type ? ` · ${v.type}` : ''}
                    </option>
                  ))}
                </Select>
              </Field>
            )}
          </div>
        </section>

        {/* Driver Information */}
        <section className={section}>
          <h2 className={heading}>Driver Information</h2>
          <div className={grid}>
            {drivers && drivers.length > 0 && (
              <Field label="Select from Fleet">
                <Select defaultValue="" onChange={(e) => onDriverPick(e.target.value)}>
                  <option value="">Choose a saved driver…</option>
                  {drivers.map((d) => (
                    <option key={d.id} value={d.id}>
                      {d.name}
                      {d.mobile ? ` · ${d.mobile}` : ''}
                    </option>
                  ))}
                </Select>
              </Field>
            )}
            <Field label="Driver Name">
              <Input {...register('driverName')} />
            </Field>
            <Field label="Driver's Mobile No.">
              <Input {...register('driverMobile')} />
            </Field>
            <Field label="Driver's Licence No.">
              <Input {...register('driverLicence')} />
            </Field>
          </div>
        </section>

        {/* Consignor / Move From */}
        <section className={section}>
          <h2 className={heading}>Consignor / Move From</h2>
          <div className={grid}>
            <Field label="Consignor Name" required>
              <Input
                list="customer-options"
                placeholder="Select or type a customer…"
                {...register('consignorName', {
                  required: true,
                  onChange: (e) => onConsignorChange(e.target.value),
                })}
              />
              <CustomerOptions customers={customers} />
              <p className="mt-1 text-xs text-slate-500">
                Pick an existing customer, or type a new name (you&apos;ll be asked to create it).
              </p>
            </Field>
            <Field label="Consignor Phone">
              <Input {...register('consignorPhone')} />
            </Field>
            <Field label="Consignor GSTIN">
              <Input {...register('consignorGstin')} />
            </Field>
            <GeoFields
              register={register}
              watch={watch}
              setValue={setValue}
              stateField="fromState"
              cityField="fromCity"
              labels={{ state: 'From State', city: 'From City' }}
            />
            <div className="sm:col-span-2">
              <Field label="From Address">
                <Input {...register('fromAddress')} />
              </Field>
            </div>
          </div>
        </section>

        {/* Consignee / Move To */}
        <section className={section}>
          <h2 className={heading}>Consignee / Move To</h2>
          <div className={grid}>
            <Field label="Consignee Name">
              <Input {...register('consigneeName')} />
            </Field>
            <Field label="Consignee Phone">
              <Input {...register('consigneePhone')} />
            </Field>
            <Field label="Consignee GSTIN">
              <Input {...register('consigneeGstin')} />
            </Field>
            <GeoFields
              register={register}
              watch={watch}
              setValue={setValue}
              stateField="toState"
              cityField="toCity"
              labels={{ state: 'To State', city: 'To City' }}
            />
            <div className="sm:col-span-2">
              <Field label="To Address">
                <Input {...register('toAddress')} />
              </Field>
            </div>
          </div>
        </section>

        {/* Package Details */}
        <section className={section}>
          <h2 className={heading}>Package Details</h2>
          <div className={grid}>
            <Field label="No. Of Package">
              <Input type="number" {...register('noOfPackage')} />
            </Field>
            <div />
            <Field label="Actual Weight">
              <Input type="number" step="0.01" {...register('actualWeight')} />
            </Field>
            <Field label="Actual Weight Unit">
              <Select {...register('actualWeightUnit')}>
                <option value="">Select…</option>
                {WEIGHT_UNITS.map((u) => (
                  <option key={u} value={u}>
                    {u}
                  </option>
                ))}
              </Select>
            </Field>
            <Field label="Charged Weight">
              <Input type="number" step="0.01" {...register('chargedWeight')} />
            </Field>
            <Field label="Charged Weight Unit">
              <Select {...register('chargedWeightUnit')}>
                <option value="">Select…</option>
                {WEIGHT_UNITS.map((u) => (
                  <option key={u} value={u}>
                    {u}
                  </option>
                ))}
              </Select>
            </Field>
            <div className="sm:col-span-2">
              <Field label="Receive Package Condition">
                <Input
                  placeholder="ALL ITEMS IN GOOD CONDITION"
                  {...register('packageCondition')}
                />
              </Field>
            </div>
            <div className="sm:col-span-2">
              <Field label="Package Description">
                <Input {...register('packageDescription')} />
              </Field>
            </div>
            <div className="sm:col-span-2">
              <Field label="Remark">
                <Textarea rows={2} {...register('remark')} />
              </Field>
            </div>
          </div>
        </section>

        {/* Freight / Charges */}
        <section className={section}>
          <h2 className={heading}>Freight / Charges</h2>
          <div className={grid}>
            <Field label="Freight To Be Billed">
              <Input type="number" step="0.01" {...register('freightToBeBilled')} />
            </Field>
            <Field label="Freight Paid">
              <Input type="number" step="0.01" {...register('freightPaid')} />
            </Field>
            <Field label="Freight To Pay">
              <Input type="number" step="0.01" {...register('freightToPay')} />
            </Field>
            <Field label="Total Basic Freight">
              <Input type="number" step="0.01" {...register('totalBasicFreight')} />
            </Field>
            <Field label="Loading Charge">
              <Input type="number" step="0.01" {...register('loadingCharge')} />
            </Field>
            <Field label="Unloading Charge">
              <Input type="number" step="0.01" {...register('unloadingCharge')} />
            </Field>
            <Field label="S.T Charge">
              <Input type="number" step="0.01" {...register('stCharge')} />
            </Field>
            <Field label="Other Charges">
              <Input type="number" step="0.01" {...register('otherCharges')} />
            </Field>
            <Field label="LR / CN Charges">
              <Input type="number" step="0.01" {...register('lrCnCharges')} />
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
            <Field label="GST Paid By">
              <Select {...register('gstPaidBy')}>
                <option value="">Select…</option>
                {GST_PAID_BY.map((g) => (
                  <option key={g} value={g}>
                    {g}
                  </option>
                ))}
              </Select>
            </Field>
          </div>

          <div className="mt-6 flex items-center justify-between rounded-xl bg-brand-gradient px-5 py-4 text-white shadow-card-hover">
            <span className="font-medium">Grand Total (incl. GST)</span>
            <span className="text-2xl font-bold">₹{total.toLocaleString('en-IN')}</span>
          </div>
        </section>

        {/* Insurance */}
        <section className={section}>
          <h2 className={heading}>Insurance</h2>
          <div className={grid}>
            <Field label="Material Insurance">
              <Select {...register('materialInsurance')}>
                <option value="">Select…</option>
                {INSURANCE_OPTIONS.map((i) => (
                  <option key={i} value={i}>
                    {i}
                  </option>
                ))}
              </Select>
            </Field>
            <Field label="Insurance Company">
              <Input {...register('insuranceCompany')} />
            </Field>
            <Field label="Policy Number">
              <Input {...register('policyNumber')} />
            </Field>
            <Field label="Insurance Date">
              <Input type="date" {...register('insuranceDate')} />
            </Field>
            <Field label="Insured Amount">
              <Input {...register('insuredAmount')} />
            </Field>
            <Field label="Insurance Risk">
              <Input {...register('insuranceRisk')} />
            </Field>
          </div>
        </section>

        {/* Demurrage */}
        <section className={section}>
          <h2 className={heading}>Demurrage Charge</h2>
          <div className={grid}>
            <Field label="Demurrage Charge">
              <Input type="number" step="0.01" {...register('demurrageCharge')} />
            </Field>
            <Field label="Unit">
              <Select {...register('demurrageUnit')}>
                <option value="">Select…</option>
                {DEMURRAGE_UNITS.map((u) => (
                  <option key={u} value={u}>
                    {u}
                  </option>
                ))}
              </Select>
            </Field>
            <Field label="Applicable After">
              <Select {...register('demurrageAfter')}>
                <option value="">Select…</option>
                {DEMURRAGE_AFTER.map((d) => (
                  <option key={d} value={d}>
                    {d}
                  </option>
                ))}
              </Select>
            </Field>
          </div>
        </section>

        {errorText && <p className="text-sm text-red-400">{errorText}</p>}

        <div className="flex gap-3">
          <Button type="submit" disabled={submitting}>
            {submitting ? 'Saving…' : mode === 'create' ? 'Submit' : 'Update LR'}
          </Button>
          <Button type="button" variant="secondary" onClick={onCancel}>
            Cancel
          </Button>
        </div>
      </form>

      {confirmData && (
        <CustomerConfirmModal
          name={confirmData.consignorName}
          creating={creating}
          onCancel={() => setConfirmData(null)}
          onConfirm={createAndSave}
        />
      )}
    </>
  );
}
