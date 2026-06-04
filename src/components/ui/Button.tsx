'use client';
import { cn } from '@/lib/utils';
import { ButtonHTMLAttributes, forwardRef } from 'react';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'gold' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', size = 'md', children, ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={cn(
          'inline-flex items-center justify-center font-semibold rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed',
          {
            'bg-[#0A1628] text-white hover:bg-[#162845]': variant === 'primary',
            'bg-gray-100 text-[#0A1628] hover:bg-gray-200': variant === 'secondary',
            'border-2 border-[#0A1628] text-[#0A1628] hover:bg-[#0A1628] hover:text-white': variant === 'outline',
            'bg-[#C9A84C] text-[#0A1628] hover:bg-[#E8C96A]': variant === 'gold',
            'text-[#0A1628] hover:bg-gray-100': variant === 'ghost',
          },
          {
            'px-4 py-2 text-sm': size === 'sm',
            'px-6 py-3 text-base': size === 'md',
            'px-8 py-4 text-lg': size === 'lg',
          },
          className
        )}
        {...props}
      >
        {children}
      </button>
    );
  }
);

Button.displayName = 'Button';
export default Button;
