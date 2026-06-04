import Link from 'next/link';
import { useTranslations, useLocale } from 'next-intl';
import SectionTitle from '@/components/shared/SectionTitle';
import { ArrowRight, Leaf, Radio, Cpu, Heart, BarChart3, Scale, Users, Wrench, Globe } from 'lucide-react';

const SCHOOLS = [
  { key: 'agri', icon: Leaf, color: 'text-green-600', bg: 'bg-green-50' },
  { key: 'comm', icon: Radio, color: 'text-blue-600', bg: 'bg-blue-50' },
  { key: 'eng', icon: Cpu, color: 'text-orange-600', bg: 'bg-orange-50' },
  { key: 'health', icon: Heart, color: 'text-red-600', bg: 'bg-red-50' },
  { key: 'econ', icon: BarChart3, color: 'text-purple-600', bg: 'bg-purple-50' },
  { key: 'law', icon: Scale, color: 'text-indigo-600', bg: 'bg-indigo-50' },
  { key: 'hum', icon: Users, color: 'text-pink-600', bg: 'bg-pink-50' },
  { key: 'vti_dev', icon: Wrench, color: 'text-yellow-600', bg: 'bg-yellow-50' },
  { key: 'vti_hum', icon: Globe, color: 'text-teal-600', bg: 'bg-teal-50' },
];

export default function SchoolsPreview() {
  const t = useTranslations('schools');
  const locale = useLocale();

  return (
    <section className="py-20 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <SectionTitle
          title={t('title')}
          subtitle={t('subtitle')}
          center
        />

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mt-12">
          {SCHOOLS.map(school => {
            const Icon = school.icon;
            return (
              <div
                key={school.key}
                className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-300 group"
              >
                <div className={`w-12 h-12 ${school.bg} ${school.color} rounded-xl flex items-center justify-center mb-4`}>
                  <Icon className="w-6 h-6" />
                </div>
                <h3 className="font-bold text-[#0A1628] mb-2 font-heading text-lg leading-snug">
                  {t(`school_list.${school.key}.name` as 'school_list.agri.name')}
                </h3>
                <p className="text-gray-500 text-sm mb-4 line-clamp-2">
                  {t(`school_list.${school.key}.desc` as 'school_list.agri.desc')}
                </p>
                <Link
                  href={`/${locale}/schools`}
                  className="inline-flex items-center gap-1 text-[#C9A84C] font-semibold text-sm hover:gap-2 transition-all"
                >
                  {t('view_programs')} <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            );
          })}
        </div>

        <div className="text-center mt-10">
          <Link
            href={`/${locale}/schools`}
            className="inline-flex items-center gap-2 bg-[#0A1628] text-white font-bold px-8 py-4 rounded-xl hover:bg-[#162845] transition"
          >
            View All Schools & Institutes <ArrowRight className="w-5 h-5" />
          </Link>
        </div>
      </div>
    </section>
  );
}
