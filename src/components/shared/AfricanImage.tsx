import Image from 'next/image';
import { cn } from '@/lib/utils';

const IMAGES = {
  hero: 'https://images.unsplash.com/photo-1580582932707-520aed937b7b?w=1600&q=80&fit=crop',
  campus: 'https://images.unsplash.com/photo-1562774053-701939374585?w=1200&q=80&fit=crop',
  students: 'https://images.unsplash.com/photo-1509062522246-3755977927d7?w=1200&q=80&fit=crop',
  classroom: 'https://images.unsplash.com/photo-1524178232363-1fb2b075b655?w=1200&q=80&fit=crop',
  lab: 'https://images.unsplash.com/photo-1532187863486-abf9dbad1b69?w=1200&q=80&fit=crop',
  graduation: 'https://images.unsplash.com/photo-1523580494863-6f3031224c94?w=1200&q=80&fit=crop',
  library: 'https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=1200&q=80&fit=crop',
  group: 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=1200&q=80&fit=crop',
};

interface AfricanImageProps {
  type?: keyof typeof IMAGES;
  src?: string;
  alt: string;
  className?: string;
  fill?: boolean;
  width?: number;
  height?: number;
  priority?: boolean;
}

export default function AfricanImage({
  type = 'campus',
  src,
  alt,
  className,
  fill = false,
  width = 800,
  height = 600,
  priority = false,
}: AfricanImageProps) {
  const imgSrc = src || IMAGES[type];

  if (fill) {
    return (
      <Image
        src={imgSrc}
        alt={alt}
        fill
        className={cn('object-cover', className)}
        priority={priority}
      />
    );
  }

  return (
    <Image
      src={imgSrc}
      alt={alt}
      width={width}
      height={height}
      className={cn('object-cover', className)}
      priority={priority}
    />
  );
}
