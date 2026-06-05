import React from 'react';
import { twMerge } from 'tailwind-merge';
interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'success' | 'warning' | 'danger' | 'premium' | 'sale';
}
export function Badge({
  className,
  variant = 'default',
  children,
  ...props
}: BadgeProps) {
  const baseStyles =
  'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold transition-colors';
  const variants = {
    default: 'bg-zinc-800 text-zinc-100',
    success: 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20',
    warning: 'bg-amber-500/10 text-amber-400 border border-amber-500/20',
    danger: 'bg-red-500/10 text-red-400 border border-red-500/20',
    premium:
    'bg-gradient-to-r from-amber-200/10 via-yellow-400/10 to-amber-500/10 text-amber-300 border border-amber-500/30',
    sale:
    'bg-gradient-to-r from-fuchsia-500/15 via-rose-500/15 to-orange-500/15 text-rose-100 border border-rose-400/20 shadow-[0_0_18px_rgba(244,63,94,0.18)]'
  };
  return (
    <div
      className={twMerge(baseStyles, variants[variant], className)}
      {...props}>
      
      {children}
    </div>);

}