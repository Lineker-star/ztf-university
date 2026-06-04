import Image from 'next/image';

interface PageHeroProps {
  title: string;
  subtitle?: string;
  backgroundImage?: string;
  image?: string;
  badge?: string;
}

export default function PageHero({ title, subtitle, backgroundImage, image, badge }: PageHeroProps) {
  const bg = backgroundImage || image || '/images/1.jpg';

  return (
    <section className="relative pt-16 lg:pt-20">
      <div className="relative h-64 md:h-80 overflow-hidden">
        <Image src={bg} alt={title} fill className="object-cover" priority />
        <div className="absolute inset-0 bg-[#0A1628]/70" />
        <div className="relative h-full flex flex-col items-center justify-center text-center px-4">
          {badge && (
            <span className="inline-block bg-[#C9A84C] text-[#0A1628] text-xs font-bold px-4 py-1 rounded-full mb-4 uppercase tracking-wider">
              {badge}
            </span>
          )}
          <h1 className="text-3xl md:text-5xl font-bold text-white font-heading mb-3">{title}</h1>
          {subtitle && <p className="text-gray-300 text-lg max-w-2xl">{subtitle}</p>}
        </div>
      </div>
    </section>
  );
}
