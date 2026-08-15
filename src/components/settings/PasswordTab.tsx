'use client';

import { useMutation } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { changePassword, ChangePasswordInput } from '@/lib/api-auth';
import { Button } from '@/components/ui/Button';
import { Input, Field } from '@/components/ui/Input';
import { errorMessage } from '@/lib/error-message';
import { Banner, SettingsCard } from './shared';

interface PasswordForm extends ChangePasswordInput {
  confirmPassword: string;
}

export function PasswordTab() {
  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors },
  } = useForm<PasswordForm>();
  const newPassword = watch('newPassword');

  const change = useMutation({
    mutationFn: (input: ChangePasswordInput) => changePassword(input),
    onSuccess: () => reset(),
  });

  return (
    <form
      onSubmit={handleSubmit((d) =>
        change.mutate({ oldPassword: d.oldPassword, newPassword: d.newPassword }),
      )}
      className="max-w-lg"
    >
      <SettingsCard>
        <div className="space-y-4">
          <Field label="Current Password" required>
            <Input type="password" {...register('oldPassword', { required: true })} />
          </Field>
          <Field label="New Password" required>
            <Input
              type="password"
              {...register('newPassword', {
                required: true,
                minLength: { value: 6, message: 'At least 6 characters' },
              })}
            />
            {errors.newPassword && (
              <span className="mt-1 block text-xs text-red-400">{errors.newPassword.message}</span>
            )}
          </Field>
          <Field label="Confirm New Password" required>
            <Input
              type="password"
              {...register('confirmPassword', {
                required: true,
                validate: (v) => v === newPassword || 'Passwords do not match',
              })}
            />
            {errors.confirmPassword && (
              <span className="mt-1 block text-xs text-red-400">
                {errors.confirmPassword.message}
              </span>
            )}
          </Field>

          {change.isError && <Banner kind="error">{errorMessage(change.error)}</Banner>}
          {change.isSuccess && <Banner kind="success">Password changed successfully.</Banner>}

          <Button type="submit" disabled={change.isPending}>
            {change.isPending ? 'Updating…' : 'Change Password'}
          </Button>
        </div>
      </SettingsCard>
    </form>
  );
}
