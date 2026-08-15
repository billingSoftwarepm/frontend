'use client';

import { useId } from 'react';
import type {
  UseFormRegister,
  UseFormWatch,
  UseFormSetValue,
  FieldValues,
  Path,
} from 'react-hook-form';
import { Input, Field } from '@/components/ui/Input';
import {
  INDIAN_STATES,
  citiesForState,
  validatePincode,
} from '@/lib/india-geo';

interface GeoFieldsProps<T extends FieldValues> {
  register: UseFormRegister<T>;
  watch: UseFormWatch<T>;
  setValue: UseFormSetValue<T>;
  stateField: Path<T>;
  cityField: Path<T>;
  /** Optional PIN code field; omit to hide the PIN column entirely. */
  pincodeField?: Path<T>;
  labels?: { state?: string; city?: string; pincode?: string };
  required?: boolean;
}

/**
 * Cascading State → City → Pincode selector wired to react-hook-form.
 *
 * - State and City are searchable comboboxes (native `<input list>` +
 *   `<datalist>`), so users can type to filter but still enter a value that
 *   isn't in the suggestion list.
 * - The City suggestions are driven by the currently selected State.
 * - Changing the State clears a City that doesn't belong to the new State.
 * - The PIN code is validated for 6-digit format and against the state's
 *   India Post regional first-digit (see `validatePincode`). The validation is
 *   also registered with RHF so an invalid PIN blocks form submission.
 */
export function GeoFields<T extends FieldValues>({
  register,
  watch,
  setValue,
  stateField,
  cityField,
  pincodeField,
  labels,
  required,
}: GeoFieldsProps<T>) {
  const uid = useId();
  const stateListId = `states-${uid}`;
  const cityListId = `cities-${uid}`;

  const stateValue = watch(stateField) as unknown as string | undefined;
  const cityValue = watch(cityField) as unknown as string | undefined;
  const pincodeValue = pincodeField
    ? (watch(pincodeField) as unknown as string | undefined)
    : undefined;

  const cityOptions = citiesForState(stateValue);
  const pinError = pincodeField
    ? validatePincode(pincodeValue, stateValue)
    : null;

  const stateReg = register(stateField, required ? { required: true } : undefined);

  return (
    <>
      <Field label={labels?.state ?? 'State'} required={required}>
        <Input
          list={stateListId}
          placeholder="Type or select state…"
          {...stateReg}
          onChange={(e) => {
            stateReg.onChange(e);
            // If the chosen state no longer contains the current city, clear it.
            const cities = citiesForState(e.target.value);
            if (cityValue && cities.length && !cities.includes(cityValue)) {
              setValue(cityField, '' as any, { shouldDirty: true });
            }
          }}
        />
        <datalist id={stateListId}>
          {INDIAN_STATES.map((s) => (
            <option key={s} value={s} />
          ))}
        </datalist>
      </Field>

      <Field label={labels?.city ?? 'City'} required={required}>
        <Input
          list={cityListId}
          placeholder={stateValue ? 'Type or select city…' : 'Select a state first'}
          {...register(cityField, required ? { required: true } : undefined)}
        />
        <datalist id={cityListId}>
          {cityOptions.map((c) => (
            <option key={c} value={c} />
          ))}
        </datalist>
      </Field>

      {pincodeField && (
        <Field label={labels?.pincode ?? 'Pincode'}>
          <Input
            inputMode="numeric"
            maxLength={6}
            placeholder="6-digit PIN"
            aria-invalid={pinError ? true : undefined}
            className={pinError ? 'border-red-500 focus:border-red-500 focus:ring-red-500/20' : ''}
            {...register(pincodeField, {
              validate: (v: any) => validatePincode(v, stateValue) === null,
            })}
          />
          {pinError && (
            <span className="mt-1 block text-xs font-medium text-red-400">{pinError}</span>
          )}
        </Field>
      )}
    </>
  );
}
