import { cn } from '@/lib/utils';

interface BadgeProps {
  children: React.ReactNode;
  variant?: 'default' | 'gold' | 'green' | 'red' | 'blue' | 'orange' | 'purple';
  className?: string;
}

export default function Badge({ children, variant = 'default', className }: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wide',
        {
          'bg-gray-100 text-gray-700': variant === 'default',
          'bg-[#C9A84C]/20 text-[#A8893E]': variant === 'gold',
          'bg-green-100 text-green-800': variant === 'green',
          'bg-red-100 text-red-800': variant === 'red',
          'bg-blue-100 text-blue-800': variant === 'blue',
          'bg-orange-100 text-orange-800': variant === 'orange',
          'bg-purple-100 text-purple-800': variant === 'purple',
        },
        className
      )}
    >
      {children}
    </span>
  );
}
