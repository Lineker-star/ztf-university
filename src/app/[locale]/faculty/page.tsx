export const dynamic = 'force-dynamic';


import Image from 'next/image';
import Link from 'next/link';
import FacultyGrid from './FacultyGrid';
import { GraduationCap, Users, Award, BookOpen, Monitor, DollarSign, FileText, ArrowRight } from 'lucide-react';

const SAMPLE_FACULTY = [
  { id: '1', full_name: 'Dr. Emmanuel NKOULOU', title: 'Lecturer', department: 'Agricultural Sciences', school: 'HIACOMST', bio_en: 'Specialist in sustainable agronomy and tropical crop science.', bio_fr: 'Spécialiste en agronomie durable et cultures tropicales.', qualifications: ['Ph.D. Agronomy, University of Yaoundé I'], specializations: ['Agronomy', 'Crop Science', 'Sustainable Farming'], photo_url: null, email: 'e.nkoulou@ztfuniversity.com', publications_count: 8, is_active: true, display_order: 1, created_at: '' },
  { id: '2', full_name: 'Dr. Marie BELLO', title: 'Senior Lecturer', department: 'Computer Engineering', school: 'HIACOMST', bio_en: 'Software engineer specializing in AI and African digital transformation.', bio_fr: 'Ingénieure logicielle spécialisée en IA et transformation numérique africaine.', qualifications: ['Ph.D. Computer Science', 'M.Sc. Software Engineering'], specializations: ['Software Engineering', 'Cyber Security', 'AI'], photo_url: null, email: 'm.bello@ztfuniversity.com', publications_count: 12, is_active: true, display_order: 2, created_at: '' },
  { id: '3', full_name: 'Dr. Paul MANGA', title: 'Associate Professor', department: 'Health Sciences', school: 'HIHS', bio_en: 'Public health specialist with expertise in tropical medicine.', bio_fr: 'Spécialiste en santé publique avec expertise en médecine tropicale.', qualifications: ['M.D. Medicine', 'MPH Public Health'], specializations: ['Tropical Medicine', 'Community Health', 'Epidemiology'], photo_url: null, email: 'p.manga@ztfuniversity.com', publications_count: 21, is_active: true, display_order: 3, created_at: '' },
  { id: '4', full_name: 'Dr. Sophie ATEBA', title: 'Lecturer', department: 'Business Management', school: 'HILEPMAH', bio_en: 'Business management expert focused on African entrepreneurship.', bio_fr: 'Experte en gestion des affaires axée sur l\'entrepreneuriat africain.', qualifications: ['Ph.D. Business Administration'], specializations: ['Business Management', 'Entrepreneurship', 'African Economics'], photo_url: null, email: 's.ateba@ztfuniversity.com', publications_count: 7, is_active: true, display_order: 4, created_at: '' },
  { id: '5', full_name: 'Dr. Jean ESSAMA', title: 'Senior Lecturer', department: 'Law', school: 'HILEPMAH', bio_en: 'Legal scholar specializing in African constitutional law and human rights.', bio_fr: 'Juriste spécialisé en droit constitutionnel africain et droits de l\'homme.', qualifications: ['Ph.D. Law, University of Yaoundé II', 'LLM International Law'], specializations: ['Constitutional Law', 'Human Rights', 'International Law'], photo_url: null, email: 'j.essama@ztfuniversity.com', publications_count: 15, is_active: true, display_order: 5, created_at: '' },
  { id: '6', full_name: 'Dr. Grace FOUDA', title: 'Lecturer', department: 'Nursing Sciences', school: 'SHP', bio_en: 'Registered nurse and educator dedicated to nursing excellence in Cameroon.', bio_fr: 'Infirmière diplômée et enseignante dédiée à l\'excellence des soins au Cameroun.', qualifications: ['M.Sc. Nursing Sciences', 'BSc Nursing'], specializations: ['Nursing Sciences', 'Midwifery', 'Community Health'], photo_url: null, email: 'g.fouda@ztfuniversity.com', publications_count: 5, is_active: true, display_order: 6, created_at: '' },
  { id: '7', full_name: 'Dr. Pierre MVONDO', title: 'Lecturer', department: 'Communication', school: 'HIACOMST', bio_en: 'Media expert and former broadcaster with experience in African media development.', bio_fr: 'Expert médias et ancien journaliste avec expérience dans les médias africains.', qualifications: ['Ph.D. Communication Sciences', 'M.A. Journalism'], specializations: ['Journalism', 'Digital Media', 'Film Production'], photo_url: null, email: 'p.mvondo@ztfuniversity.com', publications_count: 9, is_active: true, display_order: 7, created_at: '' },
  { id: '8', full_name: 'Dr. Anne BIKELE', title: 'Assistant Professor', department: 'Applied Economics', school: 'HILEPMAH', bio_en: 'Development economist researching microfinance and inclusive growth in Central Africa.', bio_fr: 'Économiste du développement spécialisée en microfinance et croissance inclusive.', qualifications: ['Ph.D. Economics', 'M.Sc. Development Economics'], specializations: ['Applied Economics', 'Microfinance', 'Development Economics'], photo_url: null, email: 'a.bikele@ztfuniversity.com', publications_count: 11, is_active: true, display_order: 8, created_at: '' },
];

const INSTITUTES_CODES = [
  { code: 'HIACOMST', label_en: 'HIACOMST', label_fr: 'ISASCOMT', desc: 'Agronomy, Engineering & Communication' },
  { code: 'HILEPMAH', label_en: 'HILEPMAH', label_fr: 'ISMEDMAH', desc: 'Law, Economics & Humanities' },
  { code: 'HIHS', label_en: 'HIHS', label_fr: 'ISSS', desc: 'Health Sciences' },
  { code: 'SHP', label_en: 'SHP / EMS', label_fr: 'EMS', desc: 'Health Professions' },
];

const HOD_SCHOOLS = [
  { en: 'School of Agronomy and Biotechnology', fr: 'École d\'Agronomie et de Biotechnologie', institute: 'HIACOMST' },
  { en: 'School of Engineering & Applied Technology', fr: 'École d\'Ingénierie et de Technologie Appliquée', institute: 'HIACOMST' },
  { en: 'School of Communication', fr: 'École de Communication', institute: 'HIACOMST' },
  { en: 'School of Legal Professions', fr: 'École des Métiers du Droit', institute: 'HILEPMAH' },
  { en: 'School of Applied Economic Sciences', fr: 'École des Sciences Économiques Appliquées', institute: 'HILEPMAH' },
  { en: 'School of Applied Human Sciences', fr: 'École des Sciences Humaines Appliquées', institute: 'HILEPMAH' },
  { en: 'School of Health Sciences', fr: 'École des Sciences de la Santé', institute: 'HIHS' },
];

const ADMIN_DEPTS = [
  { en: 'Registry & Student Affairs', fr: 'Scolarité & Affaires Étudiantes', icon: FileText },
  { en: 'Finance & Accounting', fr: 'Finance & Comptabilité', icon: DollarSign },
  { en: 'Library & Documentation', fr: 'Bibliothèque & Documentation', icon: BookOpen },
  { en: 'IT & Technical Support', fr: 'Informatique & Support Technique', icon: Monitor },
  { en: 'Communications & PR', fr: 'Communication & Relations Publiques', icon: Users },
];

export default async function FacultyPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const isFr = locale === 'fr';

  return (
    <>
      {/* SECTION 1 — Hero */}
      <section className="relative pt-16 lg:pt-20">
        <div className="relative h-64 md:h-80 overflow-hidden">
          <Image src="/images/2.jpg" alt="Faculty & Staff" fill className="object-cover" />
          <div className="absolute inset-0 bg-[#0A1628]/70" />
          <div className="relative h-full flex flex-col items-center justify-center text-center px-4">
            <h1 className="text-3xl md:text-5xl font-bold text-white font-heading mb-3">
              {isFr ? 'Corps Enseignant & Personnel' : 'Faculty & Staff'}
            </h1>
            <p className="text-gray-300 text-base md:text-lg max-w-2xl">
              {isFr
                ? 'Rencontrez l\'équipe dédiée qui façonne la prochaine génération de leaders africains'
                : 'Meet the dedicated team shaping the next generation of African leaders'}
            </p>
            <Link href={`/${locale}/faculty/profiles`}
              className="mt-4 inline-flex items-center gap-1 text-[#C9A84C] text-sm font-semibold hover:underline">
              {isFr ? 'Voir les Profils Académiques' : 'View Academic Profiles'} <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* SECTION 2 — Rectorate / University Leadership */}
      <section className="py-16 bg-[#0A1628]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-white font-heading mb-10 text-center">
            {isFr ? 'Direction de l\'Université' : 'University Leadership'}
          </h2>

          {/* President — full width, gold border */}
          <div className="mb-8">
            <div className="bg-gradient-to-r from-[#0D1F3C] to-[#162845] border-2 border-[#C9A84C] rounded-3xl p-8 max-w-3xl mx-auto hover:-translate-y-1 transition-transform shadow-xl">
              <div className="flex flex-col sm:flex-row items-center gap-6">
                <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-[#C9A84C] flex-shrink-0">
                  <Image src="/images/President & Promoter.png" alt="Pastor Theodore ANDOSEH" width={128} height={128} className="object-cover w-full h-full" />
                </div>
                <div className="text-center sm:text-left">
                  <span className="inline-block bg-[#C9A84C] text-[#0A1628] text-xs font-bold px-4 py-1 rounded-full mb-2 uppercase">
                    {isFr ? 'Président & Promoteur' : 'President & Promoter'}
                  </span>
                  <h3 className="text-2xl font-bold text-white font-heading">Pastor Theodore ANDOSEH</h3>
                  <p className="text-[#C9A84C] font-semibold text-sm mb-3">
                    {isFr ? 'Président de la Fondation ZTF' : 'President, ZTF Foundation'}
                  </p>
                  <p className="text-gray-300 text-sm leading-relaxed">
                    {isFr
                      ? 'Fondateur visionnaire de l\'IU-ZTF, le Pasteur Andoseh perpétue l\'héritage du Prof. ZTF dans l\'enseignement supérieur en Afrique.'
                      : 'Visionary founder of ZTF-UI, Pastor Andoseh carries forward Prof. ZTF\'s legacy into higher education across Africa.'}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Rector & Vice-Rector */}
          <div className="grid sm:grid-cols-2 gap-6 max-w-3xl mx-auto">
            <div className="bg-white/5 border border-white/20 rounded-2xl p-6 text-center hover:-translate-y-1 transition-transform">
              <div className="w-24 h-24 rounded-full overflow-hidden mx-auto mb-4 border-3 border-[#C9A84C]">
                <Image src="/images/Rector.png" alt="Prof. Dieudonnée NJAMEN" width={96} height={96} className="object-cover w-full h-full" />
              </div>
              <span className="inline-block bg-[#C9A84C] text-[#0A1628] text-xs font-bold px-3 py-1 rounded-full mb-2">
                {isFr ? 'Recteur' : 'Rector / Vice-Chancellor'}
              </span>
              <h3 className="font-bold text-white font-heading text-lg">Prof. Dieudonnée NJAMEN</h3>
              <p className="text-gray-400 text-xs mt-1">{isFr ? 'Chimie, Université de Yaoundé I' : 'Chemistry, University of Yaoundé I'}</p>
              <p className="text-gray-500 text-xs mt-2 italic">
                {isFr ? 'A étudié sous la direction du Prof. ZTF' : 'Supervised under Prof. ZTF at University of Yaoundé I'}
              </p>
            </div>
            <div className="bg-white/5 border border-white/20 rounded-2xl p-6 text-center hover:-translate-y-1 transition-transform">
              <div className="w-24 h-24 rounded-full overflow-hidden mx-auto mb-4 border-3 border-[#C9A84C]">
                <Image src="/images/Vice Rector.jpg" alt="Prof. Moïse ADAMOU" width={96} height={96} className="object-cover w-full h-full" />
              </div>
              <span className="inline-block bg-[#C9A84C] text-[#0A1628] text-xs font-bold px-3 py-1 rounded-full mb-2">
                {isFr ? 'Vice-Recteur' : 'Vice-Rector / DVC'}
              </span>
              <h3 className="font-bold text-white font-heading text-lg">Prof. Moïse ADAMOU</h3>
              <p className="text-gray-400 text-xs mt-1">{isFr ? 'Sciences Appliquées' : 'Applied Sciences'}</p>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 3 — Directors of Higher Institutes */}
      <section className="py-14 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl font-bold text-[#0A1628] font-heading mb-8">
            {isFr ? 'Directeurs des Instituts Supérieurs' : 'Directors of Higher Institutes'}
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {INSTITUTES_CODES.map(inst => (
              <div key={inst.code} className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm text-center">
                <div className="w-14 h-14 bg-[#C9A84C]/10 rounded-full mx-auto mb-3 flex items-center justify-center">
                  <GraduationCap className="w-7 h-7 text-[#C9A84C]" />
                </div>
                <div className="inline-block bg-gray-100 text-gray-600 text-xs font-bold px-2 py-0.5 rounded-full mb-2">
                  {isFr ? inst.label_fr : inst.label_en}
                </div>
                <p className="text-xs text-gray-500 mb-3">{inst.desc}</p>
                <span className="inline-block bg-yellow-100 text-yellow-700 text-xs font-bold px-3 py-1 rounded-full">TBA</span>
                <p className="text-xs text-gray-400 mt-2">
                  {isFr ? 'Poste à Annoncer' : 'Position to be Announced'}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* SECTION 4 — Heads of Department */}
      <section className="py-14 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl font-bold text-[#0A1628] font-heading mb-8">
            {isFr ? 'Chefs de Département (HOD)' : 'Heads of Department (HOD)'}
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {HOD_SCHOOLS.map(school => (
              <div key={school.en} className="bg-gray-50 rounded-xl p-4 border border-gray-100">
                <p className="text-xs font-bold text-[#0A1628] leading-tight mb-1">
                  {isFr ? school.fr : school.en}
                </p>
                <p className="text-xs text-gray-400 mb-2">{school.institute}</p>
                <span className="inline-block bg-yellow-100 text-yellow-700 text-xs font-semibold px-2 py-0.5 rounded-full">TBA</span>
                <Link href={`/${locale}/contact`} className="block text-xs text-[#C9A84C] mt-2 hover:underline">
                  {isFr ? 'Rejoindre notre équipe →' : 'Join Our Team →'}
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* SECTION 5 — Faculty Members */}
      <section className="py-14 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl font-bold text-[#0A1628] font-heading mb-8">
            {isFr ? 'Notre Corps Enseignant' : 'Our Faculty'}
          </h2>
          <FacultyGrid faculty={SAMPLE_FACULTY} />
        </div>
      </section>

      {/* SECTION 6 — Administrative Staff */}
      <section className="py-14 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl font-bold text-[#0A1628] font-heading mb-8">
            {isFr ? 'Personnel Administratif & de Soutien' : 'Administrative & Support Staff'}
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
            {ADMIN_DEPTS.map(dept => {
              const Icon = dept.icon;
              return (
                <div key={dept.en} className="bg-gray-50 rounded-2xl p-5 border border-gray-100 text-center hover:shadow-md transition">
                  <div className="w-12 h-12 bg-[#C9A84C]/10 rounded-xl flex items-center justify-center mx-auto mb-3">
                    <Icon className="w-6 h-6 text-[#C9A84C]" />
                  </div>
                  <p className="font-bold text-[#0A1628] text-sm">{isFr ? dept.fr : dept.en}</p>
                  <Link href={`/${locale}/contact`} className="text-xs text-[#C9A84C] mt-2 block hover:underline">
                    {isFr ? 'Contacter →' : 'Contact →'}
                  </Link>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* SECTION 7 — Join CTA */}
      <section className="py-16 bg-[#C9A84C]">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <Award className="w-12 h-12 text-[#0A1628] mx-auto mb-4" />
          <h3 className="text-3xl font-bold text-[#0A1628] font-heading mb-3">
            {isFr ? 'Rejoignez Notre Équipe' : 'Join Our Team'}
          </h3>
          <p className="text-[#0A1628]/80 mb-6 max-w-xl mx-auto">
            {isFr
              ? 'Nous cherchons toujours des académiciens et professionnels passionnés pour rejoindre l\'Institut Universitaire ZTF.'
              : 'We are always looking for passionate academics and professionals to join ZTF University Institute.'}
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href={`/${locale}/contact`}
              className="inline-flex items-center gap-2 bg-[#0A1628] text-white font-bold px-8 py-3 rounded-xl hover:bg-[#162845] transition">
              {isFr ? 'Voir les Postes Ouverts' : 'View Open Positions'} <ArrowRight className="w-5 h-5" />
            </Link>
            <Link href={`/${locale}/faculty/profiles`}
              className="inline-flex items-center gap-2 border-2 border-[#0A1628] text-[#0A1628] font-bold px-8 py-3 rounded-xl hover:bg-[#0A1628] hover:text-white transition">
              {isFr ? 'Profils Académiques' : 'Academic Profiles'}
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
