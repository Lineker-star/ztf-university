import Link from 'next/link';
import { useTranslations, useLocale } from 'next-intl';
import { GraduationCap, ArrowRight, CheckCircle } from 'lucide-react';

export default function AdmissionCTA() {
  const locale = useLocale();

  return (
    <section className="py-20 bg-[#C9A84C]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <GraduationCap className="w-16 h-16 text-[#0A1628] mx-auto mb-6" />
        <h2 className="text-4xl md:text-5xl font-bold text-[#0A1628] font-heading mb-4">
          Apply Today for 2025–2026
        </h2>
        <p className="text-[#0A1628]/80 text-lg mb-8 max-w-2xl mx-auto">
          Begin your academic journey at ZTF University Institute — where faith meets excellence in the heart of Central Africa.
        </p>

        <div className="flex flex-wrap justify-center gap-4 mb-10">
          {['Faith-integrated education', 'Internationally recognized', 'Affordable tuition', 'English & French programs'].map(f => (
            <div key={f} className="flex items-center gap-2 bg-[#0A1628]/10 text-[#0A1628] px-4 py-2 rounded-full text-sm font-semibold">
              <CheckCircle className="w-4 h-4" />
              {f}
            </div>
          ))}
        </div>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            href={`/${locale}/admission/apply`}
            className="inline-flex items-center gap-2 bg-[#0A1628] text-white font-bold px-10 py-4 rounded-xl hover:bg-[#162845] transition text-lg shadow-lg"
          >
            Start Your Application <ArrowRight className="w-5 h-5" />
          </Link>
          <Link
            href={`/${locale}/admission`}
            className="inline-flex items-center gap-2 border-2 border-[#0A1628] text-[#0A1628] font-bold px-10 py-4 rounded-xl hover:bg-[#0A1628]/10 transition text-lg"
          >
            Learn About Admission
          </Link>
        </div>
      </div>
    </section>
  );
}
