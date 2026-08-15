import { clsx } from 'clsx';
import { ButtonHTMLAttributes } from 'react';

type Variant = 'primary' | 'secondary' | 'danger' | 'ghost';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
}

const styles: Record<Variant, string> = {
  primary:
    'bg-brand-gradient text-white shadow-sm hover:shadow-card-hover hover:brightness-110 active:brightness-95',
  secondary:
    'bg-surface-card2 text-slate-200 border border-surface-borderlt hover:bg-surface-border hover:border-brand-500/40',
  danger: 'bg-red-500/90 text-white shadow-sm hover:bg-red-500',
  ghost: 'bg-transparent text-slate-300 hover:bg-white/5',
};

export function Button({ variant = 'primary', className, ...props }: ButtonProps) {
  return (
    <button
      className={clsx(
        'inline-flex items-center justify-center rounded-xl px-4 py-2.5 text-sm font-semibold transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-brand-500/40 disabled:cursor-not-allowed disabled:opacity-50',
        styles[variant],
        className,
      )}
      {...props}
    />
  );
}
