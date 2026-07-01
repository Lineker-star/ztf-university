export const dynamic = 'force-dynamic';

import { getTranslations } from 'next-intl/server';
import Image from 'next/image';
import ApplicationForm from '@/components/admission/ApplicationForm';
import { FileCheck, Check, AlertCircle, MapPin } from 'lucide-react';

const ADMISSION_REQUIREMENTS = [
  { en: "An academic registration form (obtained from the school)", fr: "Une fiche d'inscription académique (à retirer à la scolarité)" },
  { en: "A certified true copy of the Baccalaureate, GCE A Level, or any other equivalent", fr: "Deux (02) photocopies certifiées conformes du diplôme le plus élevé ou du relevé de notes" },
  { en: "Two (02) certified photocopies of the birth certificate less than three months old", fr: "Deux (02) photocopies certifiées conformes de l'acte de naissance datant de moins de trois mois" },
  { en: "Four (04) 4x4 photos bearing the surname, first name, course, nationality, region of origin, date and place of birth on the back", fr: "Quatre (04) photos 4x4 portant le nom et prénom, parcours, nationalité, région d'origine, date et lieu de naissance, au verso" },
  { en: "A receipt attesting to payment of the pre-registration fee of 35,000 FCFA to the Institute's registration department", fr: "Un quitus attestant le paiement des frais de pré-inscription d'un montant de 35 000 FCFA au service des inscriptions de l'Institut" },
  { en: "A photocopy of the national identity card or equivalent document", fr: "Une photocopie de la carte nationale d'identité ou d'un document équivalent" },
  { en: "The receipt for the medical examination issued by a Hope Clinic doctor (to be deposited with the School after the medical examination)", fr: "Le quitus de la visite médicale délivré par un médecin de la Hope Clinic (à déposer à la Scolarité après la visite médicale)" },
  { en: "An A4 envelope and a cardboard folder, both bearing the candidate's address", fr: "Une enveloppe A4 et une chemise cartonnée, les deux portant l'adresse du candidat" }
];

const FOREIGN_DIPLOMA_DOCS = [
  { en: "A certified copy (typed) of the birth certificate", fr: "Une copie (dactylographiée) certifiée conforme d'acte de naissance" },
  { en: "A certified photocopy of the diploma authenticated by competent authorities", fr: "Une photocopie certifiée conforme du diplôme authentifié par les autorités compétentes" },
  { en: "An A4 envelope bearing the candidate's name and address", fr: "Une enveloppe au format A4 portant le nom et l'adresse du candidat" }
];

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

      <section className="bg-gradient-to-br from-ztf-navyDeep to-ztf-navy py-16 sm:py-20 text-white">
        <div className="container max-w-4xl mx-auto px-4">

          {/* Header */}
          <div className="text-center mb-10">
            <span className="inline-flex items-center gap-2 bg-ztf-gold/20 border border-ztf-gold/40 text-ztf-goldLight px-4 py-1.5 rounded-full text-sm font-medium mb-4">
              <FileCheck className="w-4 h-4" />
              {isFr ? 'Documents Requis' : 'Required Documents'}
            </span>
            <h2 className="text-3xl sm:text-4xl font-bold text-white mb-3">
              {t('admission_req_title')}
            </h2>
            <p className="text-white/70 text-lg">
              {t('admission_req_subtitle')}
            </p>
          </div>

          {/* Checklist */}
          <div className="glass-card-dark rounded-2xl p-6 sm:p-8 mb-6">
            <ul className="space-y-3">
              {ADMISSION_REQUIREMENTS.map((req, i) => (
                <li key={i} className="flex items-start gap-3">
                  <div className="flex-shrink-0 w-6 h-6 rounded-full bg-ztf-gold/20 border border-ztf-gold/40 flex items-center justify-center mt-0.5">
                    <Check className="w-3.5 h-3.5 text-ztf-gold" />
                  </div>
                  <span className="text-white/85 text-sm sm:text-base leading-relaxed">
                    {isFr ? req.fr : req.en}
                  </span>
                </li>
              ))}
            </ul>
          </div>

          {/* Fee banner */}
          <div className="bg-ztf-gold rounded-2xl p-5 sm:p-6 mb-6 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div>
              <p className="text-ztf-navyDeep font-bold text-lg sm:text-xl">
                {t('admission_req_fees')}
              </p>
              <p className="text-ztf-navyDeep/70 text-sm mt-1">
                {t('admission_req_covers_title')}
              </p>
              <p className="text-ztf-navyDeep/80 text-sm font-medium mt-1">
                {t('admission_req_covers')}
              </p>
            </div>
            <div className="text-ztf-navyDeep text-3xl sm:text-4xl font-extrabold whitespace-nowrap">
              {t('admission_req_fees_amount')}
            </div>
          </div>

          {/* Foreign diplomas notice */}
          <div className="border border-amber-400/30 bg-amber-400/10 rounded-2xl p-5 sm:p-6 mb-6">
            <div className="flex items-start gap-3 mb-3">
              <AlertCircle className="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-amber-300 font-semibold">{t('admission_req_foreign_title')}</p>
                <p className="text-white/70 text-sm mt-1">{t('admission_req_foreign_text')}</p>
              </div>
            </div>
            <ul className="space-y-2 ml-8">
              {FOREIGN_DIPLOMA_DOCS.map((doc, i) => (
                <li key={i} className="flex items-start gap-2 text-sm text-white/75">
                  <span className="text-amber-400 mt-1">—</span>
                  {isFr ? doc.fr : doc.en}
                </li>
              ))}
            </ul>
          </div>

          {/* Location */}
          <div className="text-center text-white/60 text-sm">
            <MapPin className="w-4 h-4 inline mr-1.5 text-ztf-gold" />
            {isFr
              ? 'Koumé - Bertoua, En Face la Hope Clinic · Tél: 691 459 611 | 690 355 329 | 657 546 543'
              : 'Koumé - Bertoua, Opposite Hope Clinic · Tel: 691 459 611 | 690 355 329 | 657 546 543'}
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
