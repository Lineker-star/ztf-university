import { useTranslations } from 'next-intl';
import SectionTitle from '@/components/shared/SectionTitle';
import { Heart, Star, Map, Globe } from 'lucide-react';

export default function WhyZTF() {
  const t = useTranslations('why_ztf');

  const features = [
    { icon: Heart, key: 'faith', color: 'bg-red-50 text-red-600' },
    { icon: Star, key: 'excellence', color: 'bg-yellow-50 text-yellow-600' },
    { icon: Map, key: 'african', color: 'bg-green-50 text-green-600' },
    { icon: Globe, key: 'global', color: 'bg-blue-50 text-blue-600' },
  ];

  return (
    <section className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <SectionTitle title={t('title')} center />

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mt-12">
          {features.map(f => {
            const Icon = f.icon;
            return (
              <div key={f.key} className="text-center p-8 rounded-2xl border border-gray-100 hover:border-[#C9A84C]/30 hover:shadow-lg transition-all duration-300 group">
                <div className={`w-16 h-16 ${f.color} rounded-2xl flex items-center justify-center mx-auto mb-5 group-hover:scale-110 transition-transform`}>
                  <Icon className="w-8 h-8" />
                </div>
                <h3 className="font-bold text-[#0A1628] font-heading text-lg mb-3">
                  {t(`${f.key}.title` as 'faith.title')}
                </h3>
                <p className="text-gray-500 text-sm leading-relaxed">
                  {t(`${f.key}.desc` as 'faith.desc')}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
