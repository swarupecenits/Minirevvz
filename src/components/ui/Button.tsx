import React, { forwardRef } from 'react';
import { twMerge } from 'tailwind-merge';
interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'whatsapp';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
}
export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
  {
    className,
    variant = 'primary',
    size = 'md',
    isLoading,
    children,
    ...props
  },
  ref) =>
  {
    const baseStyles =
    'inline-flex min-w-0 items-center justify-center gap-2 rounded-xl font-medium transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-zinc-950 disabled:opacity-50 disabled:pointer-events-none';
    const variants = {
      primary:
      'bg-zinc-100 text-zinc-900 hover:bg-white hover:shadow-[0_0_20px_rgba(255,255,255,0.3)] focus:ring-zinc-100',
      secondary:
      'bg-zinc-800 text-zinc-100 hover:bg-zinc-700 focus:ring-zinc-700',
      outline:
      'border border-zinc-700 text-zinc-100 hover:bg-zinc-800 focus:ring-zinc-700',
      ghost:
      'text-zinc-300 hover:text-zinc-100 hover:bg-white/5 focus:ring-zinc-700',
      whatsapp:
      'bg-[#25D366] text-white hover:bg-[#20bd5a] hover:shadow-[0_0_20px_rgba(37,211,102,0.4)] focus:ring-[#25D366]'
    };
    const sizes = {
      sm: 'h-9 px-4 text-sm',
      md: 'h-11 px-6 text-base',
      lg: 'h-14 px-8 text-lg'
    };
    return (
      <button
        ref={ref}
        className={twMerge(
          baseStyles,
          variants[variant],
          sizes[size],
          className
        )}
        disabled={isLoading || props.disabled}
        {...props}>
        
        {isLoading ?
        <svg
          className="animate-spin -ml-1 mr-2 h-4 w-4"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24">
          
            <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4">
          </circle>
            <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z">
          </path>
          </svg> :
        null}
        {children}
      </button>);

  }
);
Button.displayName = 'Button';