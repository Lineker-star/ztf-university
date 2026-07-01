export const dynamic = 'force-dynamic';

import { getTranslations } from 'next-intl/server';
import Image from 'next/image';
import ApplicationForm from '@/components/admission/ApplicationForm';

const ADMISSION_REQUIREMENTS = [
  { en: "An academic registration form (obtained from the school)", fr: "Une fiche d'inscription académique (à retirer à la scolarité)" },
  { en: "A certified true copy of the Baccalaureate, GCE A Level, or any other equivalent", fr: "Deux (02) photocopies certifiées conformes du diplôme le plus élevé ou du relevé de notes" },
  { en: "Two (02) certified photocopies of the birth certificate less than three months old", fr: "Deux (02) photocopies certifiées conformes de l'acte de naissance datant de moins de trois mois" },
  { en: "Four (04) 4x4 photos — surname, first name, course, nationality, region of origin, date and place of birth written on the back", fr: "Quatre (04) photos 4x4 portant le nom et prénom, parcours, nationalité, région d'origine, date et lieu de naissance, au verso" },
  { en: "A receipt attesting payment of the pre-registration fee of 35,000 FCFA to the Institute's registration department", fr: "Un quitus attestant le paiement des frais de pré-inscription d'un montant de 35 000 FCFA au service des inscriptions de l'Institut" },
  { en: "A photocopy of the national identity card or equivalent document", fr: "Une photocopie de la carte nationale d'identité ou d'un document équivalent" },
  { en: "The receipt for the medical examination issued by a Hope Clinic doctor (deposited with the School after the medical examination)", fr: "Le quitus de la visite médicale délivré par un médecin de la Hope Clinic (à déposer à la Scolarité après la visite médicale)" },
  { en: "An A4 envelope and a cardboard folder, both bearing the candidate's address", fr: "Une enveloppe A4 et une chemise cartonnée, les deux portant l'adresse du candidat" },
];

const FOREIGN_DIPLOMA_DOCS = [
  { en: "A certified copy (typed) of the birth certificate", fr: "Une copie (dactylographiée) certifiée conforme d'acte de naissance" },
  { en: "A certified photocopy of the diploma authenticated by competent authorities", fr: "Une photocopie certifiée conforme du diplôme authentifié par les autorités compétentes" },
  { en: "An A4 envelope bearing the candidate's name and address", fr: "Une enveloppe au format A4 portant le nom et l'adresse du candidat" },
];

export default async function ApplyPage({ params }: { params: Promise<{ locale: string }> }) {
  const resolvedParams = await params;
  const locale = resolvedParams?.locale ?? 'en';
  const t = await getTranslations({ locale, namespace: 'admission' });

  return (
    <>
      <section className="relative pt-16 lg:pt-20">
        <div className="relative h-56 overflow-hidden">
          <Image src="/images/3.jpg" alt="Apply" fill className="object-cover object-top" />
          <div className="absolute inset-0 bg-[#0A1628]/70" />
          <div className="relative h-full flex flex-col items-center justify-center text-center px-4">
            <span className="inline-block bg-[#C9A84C] text-[#0A1628] text-xs font-bold px-4 py-1 rounded-full mb-3 uppercase">
              {locale === 'fr' ? 'Admissions 2026–2027 Ouvertes' : '2026–2027 Applications Open'}
            </span>
            <h1 className="text-3xl md:text-4xl font-bold text-white font-heading mb-2">
              {t('apply_title')}
            </h1>
            <p className="text-gray-300 text-sm max-w-xl">
              {locale === 'fr'
                ? "Remplissez le formulaire ci-dessous pour postuler à l'Institut Universitaire ZTF pour l'année 2026–2027."
                : 'Fill out the form below to apply to ZTF University Institute for the 2026–2027 academic year.'}
            </p>
          </div>
        </div>
      </section>

      <section className="py-12 px-4 bg-navy-900" style={{ background: 'linear-gradient(135deg, #0a1628 0%, #132240 100%)' }}>
        <div className="max-w-3xl mx-auto">

          {/* Header */}
          <div className="text-center mb-8">
            <span className="inline-block bg-yellow-500/20 border border-yellow-500/40 text-yellow-300 px-4 py-1 rounded-full text-sm font-medium mb-3">
              {locale === 'fr' ? '📋 Documents Requis' : '📋 Required Documents'}
            </span>
            <h2 className="text-2xl sm:text-3xl font-bold text-white mb-2">
              {locale === 'fr' ? "Conditions d'Admission" : 'Admission Requirements'}
            </h2>
            <p className="text-white/60 text-sm sm:text-base">
              {locale === 'fr'
                ? 'Les documents suivants sont obligatoires pour votre admission'
                : 'The following documents are required for admission'}
            </p>
          </div>

          {/* Warning banner */}
          <div className="bg-orange-500/10 border border-orange-400/30 rounded-xl p-4 mb-6 flex gap-3">
            <span className="text-orange-400 text-lg flex-shrink-0">⚠️</span>
            <p className="text-orange-200 text-sm leading-relaxed">
              {locale === 'fr'
                ? "Préparez TOUS ces documents physiques avant de soumettre votre candidature en ligne. Les originaux doivent être déposés au siège de l'Université : Koumé, Bertoua — En Face la Hope Clinic."
                : "Prepare ALL these physical documents before submitting your online application. Originals must be deposited at the University head office: Koumé, Bertoua — Opposite Hope Clinic."}
            </p>
          </div>

          {/* Main checklist */}
          <div className="bg-white/5 border border-white/10 rounded-2xl p-6 mb-6">
            <ul className="space-y-4">
              {ADMISSION_REQUIREMENTS.map((req, i) => (
                <li key={i} className="flex items-start gap-3">
                  <div className="flex-shrink-0 w-6 h-6 rounded-full border-2 border-yellow-500/60 bg-yellow-500/10 flex items-center justify-center mt-0.5">
                    <svg className="w-3 h-3 text-yellow-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <span className="text-white/80 text-sm sm:text-base leading-relaxed">
                    {locale === 'fr' ? req.fr : req.en}
                  </span>
                </li>
              ))}
            </ul>
          </div>

          {/* Fee box */}
          <div className="bg-yellow-500 rounded-2xl p-5 mb-6 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div>
              <p className="text-yellow-900 font-bold text-base sm:text-lg">
                {locale === 'fr' ? 'Frais de Pré-inscription' : 'Pre-Registration Fees'}
              </p>
              <p className="text-yellow-800 text-sm mt-1">
                {locale === 'fr'
                  ? "Couvre : Visite médicale · Carte d'étudiant · Code de conduite · T-Shirt de l'école"
                  : "Covers: Medical check-up · Student card · Code of conduct · School T-shirt"}
              </p>
            </div>
            <div className="text-yellow-900 text-3xl sm:text-4xl font-extrabold whitespace-nowrap">
              35 000 FCFA
            </div>
          </div>

          {/* Foreign diploma notice */}
          <div className="bg-amber-400/10 border border-amber-400/30 rounded-2xl p-5 mb-6">
            <div className="flex items-start gap-3 mb-3">
              <span className="text-amber-400 text-lg flex-shrink-0">ⓘ</span>
              <div>
                <p className="text-amber-300 font-semibold text-sm sm:text-base">
                  {locale === 'fr'
                    ? 'N.B. — Candidats Titulaires de Diplômes Étrangers'
                    : 'N.B. — Candidates Holding Foreign Diplomas'}
                </p>
                <p className="text-white/60 text-sm mt-1">
                  {locale === 'fr'
                    ? 'Doivent obligatoirement déposer en plus du dossier :'
                    : 'Must submit the following additional documents:'}
                </p>
              </div>
            </div>
            <ul className="space-y-2 ml-8">
              {FOREIGN_DIPLOMA_DOCS.map((doc, i) => (
                <li key={i} className="flex items-start gap-2 text-sm text-white/70">
                  <span className="text-amber-400 mt-0.5 flex-shrink-0">—</span>
                  <span>{locale === 'fr' ? doc.fr : doc.en}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Location footer */}
          <div className="text-center text-white/50 text-sm">
            📍 {locale === 'fr'
              ? 'Koumé - Bertoua, En Face la Hope Clinic'
              : 'Koumé - Bertoua, Opposite Hope Clinic'}
            {' · '}📞 691 459 611 | 690 355 329 | 657 546 543
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
