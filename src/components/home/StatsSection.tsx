'use client';
import { useLocale } from 'next-intl';
import { useEffect, useRef, useState } from 'react';

const STATS = [
  { value: 3,   suffix: '',   key_en: 'Higher Institutes',    key_fr: 'Instituts Supérieurs' },
  { value: 300, suffix: '+',  key_en: 'Students',             key_fr: 'Étudiants' },
  { value: 100, suffix: '',   key_en: 'Faculty Members',      key_fr: 'Enseignants' },
  { value: 100, suffix: '+',  key_en: 'Fields / Specialties', key_fr: 'Filières / Spécialités' },
  { value: 7,   suffix: '',   key_en: 'Schools',              key_fr: 'Écoles' },
  { value: 10,  suffix: '+',  key_en: 'Programmes',           key_fr: 'Programmes' },
];

function CountUp({ target, suffix }: { target: number; suffix: string }) {
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLDivElement>(null);
  const started = useRef(false);

  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting && !started.current) {
        started.current = true;
        const steps = 60;
        const increment = target / steps;
        let current = 0;
        const interval = setInterval(() => {
          current += increment;
          if (current >= target) { setCount(target); clearInterval(interval); }
          else setCount(Math.floor(current));
        }, 2000 / steps);
      }
    });
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [target]);

  return <div ref={ref}>{count}{suffix}</div>;
}

export default function StatsSection() {
  const locale = useLocale();
  const isFr = locale === 'fr';

  return (
    <section className="bg-[#0A1628] py-12 border-y border-[#C9A84C]/20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6 text-center">
          {STATS.map((stat, i) => (
            <div key={i} className="group">
              <div className="text-3xl md:text-4xl font-bold text-[#C9A84C] font-heading">
                <CountUp target={stat.value} suffix={stat.suffix} />
              </div>
              <div className="text-gray-400 text-xs mt-1 leading-tight">
                {isFr ? stat.key_fr : stat.key_en}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
