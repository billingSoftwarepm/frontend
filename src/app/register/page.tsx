'use client';

import { useMutation } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { AxiosError } from 'axios';
import { register as registerUser, RegisterInput } from '@/lib/api-auth';
import { Button } from '@/components/ui/Button';
import { Input, Field } from '@/components/ui/Input';
import { ThemeToggle } from '@/components/ui/ThemeToggle';

function errorMessage(err: unknown): string {
  const ax = err as AxiosError<{ message?: string | string[] }>;
  if (ax?.response) {
    const m = ax.response.data?.message;
    if (Array.isArray(m)) return m.join(', ');
    if (m) return m;
    return `Request failed (${ax.response.status})`;
  }
  if (ax?.request) {
    return 'Cannot reach the server. Is the backend running on http://localhost:4000, and are you using a normal browser (not the VS Code Simple Browser)?';
  }
  return 'Something went wrong. Please try again.';
}

export default function RegisterPage() {
  const router = useRouter();
  const { register, handleSubmit } = useForm<RegisterInput>();

  const doRegister = useMutation({
    mutationFn: (data: RegisterInput) => registerUser(data),
    onSuccess: () => router.push('/dashboard'),
  });

  return (
    <div className="flex min-h-screen items-center justify-center bg-auth-gradient p-4">
      <div className="absolute right-4 top-4">
        <ThemeToggle />
      </div>
      <div className="w-full max-w-lg animate-fade-in-up rounded-3xl border border-white/10 bg-surface-card/80 p-8 shadow-card-hover backdrop-blur-xl">
        <div className="mb-6 flex flex-col items-center text-center">
          <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-brand-gradient text-lg font-black tracking-tight text-white shadow-glow">
            PM
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-white">Create your account</h1>
          <p className="mt-1.5 text-sm text-slate-400">
            Start managing your packers &amp; movers business
          </p>
        </div>

        <form
          onSubmit={handleSubmit((d) => doRegister.mutate(d))}
          className="grid grid-cols-1 gap-4 sm:grid-cols-2"
        >
          <Field label="Company Name" required>
            <Input {...register('companyName', { required: true })} />
          </Field>
          <Field label="Full Name" required>
            <Input {...register('fullName', { required: true })} />
          </Field>
          <Field label="Email" required>
            <Input type="email" {...register('email', { required: true })} />
          </Field>
          <Field label="Phone">
            <Input {...register('phone')} />
          </Field>
          <Field label="Company GST">
            <Input {...register('gstin')} />
          </Field>
          <Field label="Company Website">
            <Input {...register('website')} />
          </Field>
          <div className="sm:col-span-2">
            <Field label="Company Address">
              <Input {...register('address')} />
            </Field>
          </div>
          <Field label="Username" required>
            <Input {...register('username', { required: true })} />
          </Field>
          <Field label="Password" required>
            <Input type="password" {...register('password', { required: true })} />
          </Field>

          {doRegister.isError && (
            <p className="sm:col-span-2 rounded-lg bg-red-500/10 px-3 py-2 text-sm text-red-300 ring-1 ring-red-500/30">
              {errorMessage(doRegister.error)}
            </p>
          )}

          <div className="sm:col-span-2">
            <Button type="submit" className="w-full" disabled={doRegister.isPending}>
              {doRegister.isPending ? 'Creating…' : 'Registration'}
            </Button>
          </div>
        </form>

        <p className="mt-6 text-center text-sm text-slate-400">
          Already a user?{' '}
          <Link href="/login" className="font-semibold text-brand-400 hover:text-brand-300">
            Login
          </Link>
        </p>
      </div>
    </div>
  );
}
