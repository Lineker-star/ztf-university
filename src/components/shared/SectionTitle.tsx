import { cn } from '@/lib/utils';

interface SectionTitleProps {
  title: string;
  subtitle?: string;
  center?: boolean;
  light?: boolean;
  className?: string;
}

export default function SectionTitle({ title, subtitle, center = false, light = false, className }: SectionTitleProps) {
  return (
    <div className={cn('mb-10', center && 'text-center', className)}>
      <h2 className={cn('text-3xl md:text-4xl font-bold font-heading mb-3', light ? 'text-white' : 'text-[#0A1628]')}>
        {title}
      </h2>
      {subtitle && (
        <p className={cn('text-lg max-w-2xl', center && 'mx-auto', light ? 'text-gray-300' : 'text-gray-600')}>
          {subtitle}
        </p>
      )}
      <div className={cn('mt-4 h-1 w-16 rounded-full bg-[#C9A84C]', center && 'mx-auto')} />
    </div>
  );
}
