import { useTranslations, useLocale } from 'next-intl';
import Link from 'next/link';
import Image from 'next/image';
import SectionTitle from '@/components/shared/SectionTitle';
import { Award, BookOpen, Users, Globe } from 'lucide-react';

export default function FounderSection() {
  const t = useTranslations('about');
  const locale = useLocale();

  const achievements = [
    { icon: Award, label: 'Doctor of Science', sub: 'University of Durham, UK (2005)', color: 'text-[#C9A84C]' },
    { icon: BookOpen, label: '160+ Publications', sub: 'International scientific journals', color: 'text-blue-500' },
    { icon: Users, label: '100+ Theses Supervised', sub: "Master's & Doctoral students", color: 'text-green-500' },
    { icon: Globe, label: '350+ Books Written', sub: '10M+ copies in 100+ languages', color: 'text-purple-500' },
  ];

  return (
    <section className="py-20 bg-[#0A1628]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-14 items-center">
          {/* Left — Image & achievements */}
          <div>
            <div className="relative">
              <div className="w-80 h-96 mx-auto lg:mx-0 rounded-2xl overflow-hidden border-2 border-[#C9A84C]/30 shadow-2xl relative">
                <Image
                  src="/images/Founder.jpeg"
                  alt="Prof. Zacharias Tanee Fomum"
                  fill
                  className="object-cover object-top"
                />
                <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-[#0A1628]/90 to-transparent px-5 py-4">
                  <p className="font-bold text-white font-heading text-base leading-tight">Prof. Zacharias Tanee Fomum</p>
                  <p className="text-[#C9A84C] text-xs mt-0.5">1945 – 2009</p>
                </div>
              </div>
              <div className="absolute -bottom-4 -right-4 bg-[#C9A84C] text-[#0A1628] px-4 py-2 rounded-xl font-bold text-sm shadow-lg">
                Our Founding Inspiration
              </div>
            </div>

            {/* Achievement grid */}
            <div className="grid grid-cols-2 gap-4 mt-10">
              {achievements.map(a => {
                const Icon = a.icon;
                return (
                  <div key={a.label} className="bg-white/5 rounded-xl p-4 border border-white/10">
                    <Icon className={`w-6 h-6 ${a.color} mb-2`} />
                    <div className="text-white font-bold text-sm">{a.label}</div>
                    <div className="text-gray-400 text-xs mt-0.5">{a.sub}</div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Right — Bio */}
          <div>
            <div className="inline-block bg-[#C9A84C]/10 text-[#C9A84C] text-xs font-bold px-4 py-2 rounded-full border border-[#C9A84C]/30 mb-4 uppercase tracking-wider">
              Our Namesake & Inspiration
            </div>
            <SectionTitle
              title={t('founder_title')}
              subtitle="A man of extraordinary academic achievement and unwavering faith"
              light
            />
            <p className="text-gray-300 leading-relaxed mb-6 text-sm">{t('founder_bio')}</p>
            <blockquote className="border-l-4 border-[#C9A84C] pl-6 my-6">
              <p className="text-gray-300 italic text-sm leading-relaxed">
                &ldquo;God desires excellence from His children. Mediocrity is not an option when you have been called to university studies.&rdquo;
              </p>
              <footer className="text-[#C9A84C] text-xs mt-2 font-semibold">— Prof. Zacharias Tanee Fomum</footer>
            </blockquote>
            <Link
              href={`/${locale}/about`}
              className="inline-flex items-center gap-2 bg-[#C9A84C] text-[#0A1628] font-bold px-6 py-3 rounded-xl hover:bg-[#E8C96A] transition"
            >
              Learn More About Our Founder
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
