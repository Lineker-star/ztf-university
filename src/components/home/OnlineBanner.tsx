import Link from 'next/link';
import { useTranslations, useLocale } from 'next-intl';
import { Monitor, ArrowRight } from 'lucide-react';

export default function OnlineBanner() {
  const t = useTranslations('online');
  const locale = useLocale();

  return (
    <section className="py-16 bg-gradient-to-r from-[#0D1F3C] to-[#162845]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="flex items-center gap-6">
            <div className="w-16 h-16 bg-[#C9A84C]/20 rounded-2xl flex items-center justify-center flex-shrink-0">
              <Monitor className="w-8 h-8 text-[#C9A84C]" />
            </div>
            <div>
              <h3 className="text-2xl font-bold text-white font-heading">{t('title')}</h3>
              <p className="text-gray-400 mt-1 max-w-xl">{t('desc')}</p>
            </div>
          </div>
          <Link
            href={`/${locale}/programs?mode=online`}
            className="flex-shrink-0 inline-flex items-center gap-2 bg-[#C9A84C] text-[#0A1628] font-bold px-8 py-3 rounded-xl hover:bg-[#E8C96A] transition"
          >
            {t('cta')} <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </section>
  );
}
