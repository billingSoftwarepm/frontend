'use client';

import { useMutation } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { AxiosError } from 'axios';
import { login, LoginInput } from '@/lib/api-auth';
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

export default function LoginPage() {
  const router = useRouter();
  const { register, handleSubmit } = useForm<LoginInput>();

  const doLogin = useMutation({
    mutationFn: (data: LoginInput) => login(data),
    onSuccess: () => router.push('/dashboard'),
  });

  return (
    <div className="flex min-h-screen items-center justify-center bg-auth-gradient p-4">
      <div className="absolute right-4 top-4">
        <ThemeToggle />
      </div>
      <div className="w-full max-w-md animate-fade-in-up rounded-3xl border border-white/10 bg-surface-card/80 p-8 shadow-card-hover backdrop-blur-xl">
        <div className="mb-6 flex flex-col items-center text-center">
          <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-brand-gradient text-lg font-black tracking-tight text-white shadow-glow">
            PM
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-white">Welcome back</h1>
          <p className="mt-1.5 text-sm text-slate-400">Sign in to continue to your dashboard</p>
        </div>

        <form onSubmit={handleSubmit((d) => doLogin.mutate(d))} className="space-y-4">
          <Field label="Username" required>
            <Input {...register('username', { required: true })} placeholder="username" />
          </Field>
          <Field label="Password" required>
            <Input type="password" {...register('password', { required: true })} placeholder="••••••••" />
          </Field>

          {doLogin.isError && (
            <p className="rounded-lg bg-red-500/10 px-3 py-2 text-sm text-red-300 ring-1 ring-red-500/30">
              {errorMessage(doLogin.error)}
            </p>
          )}

          <Button type="submit" className="w-full" disabled={doLogin.isPending}>
            {doLogin.isPending ? 'Signing in…' : 'Log In'}
          </Button>
        </form>

        <p className="mt-6 text-center text-sm text-slate-400">
          Don&apos;t have an account?{' '}
          <Link href="/register" className="font-semibold text-brand-400 hover:text-brand-300">
            Register
          </Link>
        </p>
      </div>
    </div>
  );
}
