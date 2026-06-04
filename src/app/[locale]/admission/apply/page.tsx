export const dynamic = 'force-dynamic';

import { getTranslations } from 'next-intl/server';
import Image from 'next/image';
import ApplicationForm from '@/components/admission/ApplicationForm';

export default async function ApplyPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'admission' });
  const isFr = locale === 'fr';

  return (
    <>
      <section className="relative pt-16 lg:pt-20">
        <div className="relative h-56 overflow-hidden">
          <Image src="/images/3.jpg" alt="Apply" fill className="object-cover object-top" />
          <div className="absolute inset-0 bg-[#0A1628]/70" />
          <div className="relative h-full flex flex-col items-center justify-center text-center px-4">
            <span className="inline-block bg-[#C9A84C] text-[#0A1628] text-xs font-bold px-4 py-1 rounded-full mb-3 uppercase">
              {isFr ? 'Admissions 2026–2027 Ouvertes' : '2026–2027 Applications Open'}
            </span>
            <h1 className="text-3xl md:text-4xl font-bold text-white font-heading mb-2">
              {t('apply_title')}
            </h1>
            <p className="text-gray-300 text-sm max-w-xl">
              {isFr
                ? "Remplissez le formulaire ci-dessous pour postuler à l'Institut Universitaire ZTF pour l'année 2026–2027."
                : 'Fill out the form below to apply to ZTF University Institute for the 2026–2027 academic year.'}
            </p>
          </div>
        </div>
      </section>
      <section className="py-12 bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <ApplicationForm />
        </div>
      </section>
    </>
  );
}
