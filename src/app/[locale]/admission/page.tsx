export const dynamic = 'force-dynamic';

import { getTranslations } from 'next-intl/server';
import Link from 'next/link';
import Image from 'next/image';
import ApplicationStatus from '@/components/admission/ApplicationStatus';
import { CheckCircle, ArrowRight, FileText, Upload, CreditCard, Clock, Mail, GraduationCap, MapPin } from 'lucide-react';

const REQUIREMENTS = [
  { number: 1, en: 'An individually filled out form duly stamped at 1,500 XAF by the candidate', fr: 'Un formulaire individuel dûment rempli et timbré à 1 500 FCFA par le candidat' },
  { number: 2, en: 'Four passport-sized photos 4×4 cm (write your name on the back)', fr: "Quatre photos d'identité 4×4 cm (écrire le nom au dos)" },
  { number: 3, en: 'A certified true copy of the birth certificate issued within the last 3 months', fr: "Une copie certifiée conforme de l'acte de naissance délivré dans les 3 derniers mois" },
  { number: 4, en: 'A certified true copy of the Baccalaureate, GCE A Level, or equivalent recognized diploma', fr: 'Une copie certifiée conforme du Baccalauréat, GCE A Level, ou tout autre diplôme équivalent reconnu' },
  { number: 5, en: 'Payment receipt of the non-refundable pre-registration fee of 35,000 XAF (bank account details provided on request)', fr: "Reçu de paiement des frais de préinscription non remboursables de 35 000 FCFA (coordonnées bancaires fournies sur demande)" },
  { number: 6, en: 'One stamped A4 envelope with postage corresponding to the weight of attached documents', fr: 'Une enveloppe format A4 timbrée avec affranchissement correspondant au poids des documents joints' },
];

export default async function AdmissionPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'admission' });
  const isFr = locale === 'fr';

  const steps = [
    { icon: FileText, text: t('step1') },
    { icon: Upload, text: t('step2') },
    { icon: CreditCard, text: t('step3') },
    { icon: Clock, text: t('step4') },
    { icon: Mail, text: t('step5') },
    { icon: GraduationCap, text: t('step6') },
  ];

  return (
    <>
      {/* Hero */}
      <section className="relative pt-16 lg:pt-20">
        <div className="relative h-64 md:h-80 overflow-hidden">
          <Image src="/images/3.jpg" alt="Admission" fill className="object-cover object-top" />
          <div className="absolute inset-0 bg-[#0A1628]/65" />
          <div className="relative h-full flex flex-col items-center justify-center text-center px-4">
            <span className="inline-block bg-[#C9A84C] text-[#0A1628] text-xs font-bold px-4 py-1 rounded-full mb-4 uppercase">
              {isFr ? 'Admissions 2026–2027 Ouvertes' : '2026–2027 Admissions Open'}
            </span>
            <h1 className="text-3xl md:text-5xl font-bold text-white font-heading mb-3">{t('title')}</h1>
            <p className="text-gray-300 text-base md:text-lg max-w-2xl">{t('subtitle')}</p>
          </div>
        </div>
      </section>

      {/* Application File Requirements */}
      <section className="py-14 bg-[#0A1628]">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl font-bold text-white font-heading mb-2 text-center">
            {isFr ? 'Dossier de Candidature' : 'Application File Requirements'}
          </h2>
          <p className="text-gray-400 text-center text-sm mb-8">
            {isFr ? 'Rassemblez tous les documents suivants avant de postuler.' : 'Gather all the following documents before applying.'}
          </p>
          <div className="space-y-3">
            {REQUIREMENTS.map(req => (
              <div key={req.number} className="flex gap-4 items-start bg-white/5 border border-white/10 rounded-xl p-4">
                <div className="w-8 h-8 bg-[#C9A84C] rounded-full flex items-center justify-center flex-shrink-0 font-bold text-[#0A1628] text-sm">
                  {req.number}
                </div>
                <p className="text-gray-300 text-sm leading-relaxed">{isFr ? req.fr : req.en}</p>
              </div>
            ))}
          </div>

          {/* Submission locations */}
          <div className="mt-8 bg-[#C9A84C]/10 border border-[#C9A84C]/30 rounded-2xl p-6">
            <h3 className="font-bold text-[#C9A84C] font-heading mb-3">
              {isFr ? 'Où Déposer votre Dossier' : 'Where to Submit Your Application'}
            </h3>
            <div className="grid sm:grid-cols-2 gap-3">
              {[
                { en: 'Koumé campus (Opposite Hope Clinic) — Bertoua', fr: 'Campus de Koumé (En face de la Clinique Hope) — Bertoua' },
                { en: 'Ndoumbi campus — Bertoua', fr: 'Campus de Ndoumbi — Bertoua' },
              ].map(loc => (
                <div key={loc.en} className="flex items-start gap-3">
                  <MapPin className="w-4 h-4 text-[#C9A84C] flex-shrink-0 mt-0.5" />
                  <span className="text-gray-300 text-sm">{isFr ? loc.fr : loc.en}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-16 items-start">
            {/* Left: Apply CTA + Steps */}
            <div>
              <h2 className="text-2xl font-bold text-[#0A1628] font-heading mb-4">{t('apply_title')}</h2>
              <p className="text-gray-600 mb-8 text-sm leading-relaxed">
                {isFr
                  ? "L'Institut Universitaire ZTF accueille les candidatures d'étudiants déterminés qui souhaitent une éducation académiquement excellente et intégrée à la foi."
                  : 'ZTF University Institute welcomes applications from committed students who desire faith-integrated, academically excellent education.'}
              </p>

              <div className="space-y-4 mb-8">
                {steps.map((step, i) => {
                  const Icon = step.icon;
                  return (
                    <div key={i} className="flex gap-4 items-start">
                      <div className="w-10 h-10 bg-[#0A1628] rounded-xl flex items-center justify-center flex-shrink-0">
                        <Icon className="w-5 h-5 text-[#C9A84C]" />
                      </div>
                      <div>
                        <span className="text-xs text-gray-400 font-bold uppercase">{isFr ? `Étape ${i + 1}` : `Step ${i + 1}`}</span>
                        <p className="text-gray-700 text-sm">{step.text}</p>
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="flex flex-col sm:flex-row gap-3">
                <Link href={`/${locale}/admission/apply`}
                  className="inline-flex items-center gap-2 bg-[#C9A84C] text-[#0A1628] font-bold px-8 py-4 rounded-xl hover:bg-[#E8C96A] transition text-base shadow-lg">
                  <GraduationCap className="w-5 h-5" />
                  {t('apply_title')} <ArrowRight className="w-4 h-4" />
                </Link>
                <Link href={`/${locale}/schools/programs`}
                  className="inline-flex items-center gap-2 border border-[#0A1628] text-[#0A1628] font-bold px-6 py-4 rounded-xl hover:bg-gray-50 transition text-sm">
                  {isFr ? 'Voir les Programmes' : 'View Programs'}
                </Link>
              </div>
            </div>

            {/* Right: Status Checker */}
            <div>
              <ApplicationStatus />

              {/* Quick info */}
              <div className="mt-6 bg-gray-50 rounded-2xl p-6 border border-gray-100">
                <h3 className="font-bold text-[#0A1628] font-heading mb-3 text-sm">
                  {isFr ? 'Informations Importantes' : 'Important Information'}
                </h3>
                <ul className="space-y-2">
                  {[
                    { en: 'Pre-registration fee: 35,000 XAF (non-refundable)', fr: 'Frais de préinscription : 35 000 FCFA (non remboursables)' },
                    { en: 'Processing time: 7–14 business days', fr: 'Délai de traitement : 7 à 14 jours ouvrables' },
                    { en: 'Academic year: 2026–2027', fr: 'Année académique : 2026–2027' },
                    { en: 'All programmes offered in English & French', fr: "Tous les programmes offerts en anglais et en français" },
                  ].map(item => (
                    <li key={item.en} className="flex items-start gap-2 text-sm text-gray-600">
                      <CheckCircle className="w-4 h-4 text-[#C9A84C] flex-shrink-0 mt-0.5" />
                      {isFr ? item.fr : item.en}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
