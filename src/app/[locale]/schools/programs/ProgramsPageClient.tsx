'use client';
import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ChevronRight, Clock, ArrowRight } from 'lucide-react';

const ALL_PROGRAMS = [
  // HIACOMST
  { id: '1', name_en: 'Agronomy and Biotechnology', name_fr: 'Agronomie et Biotechnologie', institute: 'HIACOMST', school_en: 'School of Agronomy and Biotechnology', school_fr: "École d'Agronomie et de Biotechnologie", level: 'BSc / HND', duration: 3, tuition: 450000 },
  { id: '2', name_en: 'Food Science & Biotechnology', name_fr: 'Sciences Alimentaires et Biotechnologie', institute: 'HIACOMST', school_en: 'School of Agronomy and Biotechnology', school_fr: "École d'Agronomie et de Biotechnologie", level: 'BSc', duration: 3, tuition: 450000 },
  { id: '3', name_en: 'Software Engineering', name_fr: 'Génie Logiciel', institute: 'HIACOMST', school_en: 'School of Engineering & Applied Technology', school_fr: "École d'Ingénierie et de Technologie Appliquée", level: 'BSc / HND', duration: 3, tuition: 550000 },
  { id: '4', name_en: 'Cyber Security', name_fr: 'Cybersécurité', institute: 'HIACOMST', school_en: 'School of Engineering & Applied Technology', school_fr: "École d'Ingénierie et de Technologie Appliquée", level: 'BSc', duration: 3, tuition: 550000 },
  { id: '5', name_en: 'Civil & Architectural Engineering', name_fr: 'Génie Civil et Architecture', institute: 'HIACOMST', school_en: 'School of Engineering & Applied Technology', school_fr: "École d'Ingénierie et de Technologie Appliquée", level: 'BSc', duration: 4, tuition: 550000 },
  { id: '6', name_en: 'Journalism & Mass Communication', name_fr: 'Journalisme & Communication de Masse', institute: 'HIACOMST', school_en: 'School of Communication', school_fr: 'École de Communication', level: 'BSc / HND', duration: 3, tuition: 400000 },
  { id: '7', name_en: 'Translation & Interpretation', name_fr: 'Traduction & Interprétation', institute: 'HIACOMST', school_en: 'School of Communication', school_fr: 'École de Communication', level: 'BSc', duration: 3, tuition: 400000 },
  // HILEPMAH
  { id: '8', name_en: 'Business & Corporate Law', name_fr: 'Droit des Affaires et des Entreprises', institute: 'HILEPMAH', school_en: 'School of Legal Professions', school_fr: 'École des Métiers du Droit', level: 'BSc / HND', duration: 4, tuition: 480000 },
  { id: '9', name_en: 'Human Rights & Social Justice', name_fr: 'Droits de l\'Homme et Justice Sociale', institute: 'HILEPMAH', school_en: 'School of Legal Professions', school_fr: 'École des Métiers du Droit', level: 'BSc', duration: 3, tuition: 480000 },
  { id: '10', name_en: 'Accountancy', name_fr: 'Comptabilité', institute: 'HILEPMAH', school_en: 'School of Applied Economic Sciences', school_fr: 'École des Sciences Économiques Appliquées', level: 'BSc / HND', duration: 3, tuition: 450000 },
  { id: '11', name_en: 'Business Management', name_fr: 'Gestion des Affaires', institute: 'HILEPMAH', school_en: 'School of Applied Economic Sciences', school_fr: 'École des Sciences Économiques Appliquées', level: 'BSc / HND', duration: 3, tuition: 450000 },
  { id: '12', name_en: 'Human Resource Management', name_fr: 'Gestion des Ressources Humaines', institute: 'HILEPMAH', school_en: 'School of Applied Human Sciences', school_fr: 'École des Sciences Humaines Appliquées', level: 'BSc', duration: 3, tuition: 400000 },
  { id: '13', name_en: 'Psychology', name_fr: 'Psychologie', institute: 'HILEPMAH', school_en: 'School of Applied Human Sciences', school_fr: 'École des Sciences Humaines Appliquées', level: 'BSc', duration: 3, tuition: 400000 },
  // HIHS
  { id: '14', name_en: 'Nursing Sciences', name_fr: 'Sciences Infirmières', institute: 'HIHS', school_en: 'School of Health Sciences', school_fr: 'École des Sciences de la Santé', level: 'BSc', duration: 3, tuition: 500000 },
  { id: '15', name_en: 'Pharmaceutical Sciences', name_fr: 'Sciences Pharmaceutiques', institute: 'HIHS', school_en: 'School of Health Sciences', school_fr: 'École des Sciences de la Santé', level: 'BSc', duration: 4, tuition: 550000 },
  { id: '16', name_en: 'Public Health', name_fr: 'Santé Publique', institute: 'HIHS', school_en: 'School of Health Sciences', school_fr: 'École des Sciences de la Santé', level: 'BSc / MSc', duration: 3, tuition: 500000 },
  // SHP
  { id: '17', name_en: 'Nursing / Infirmerie', name_fr: 'Infirmerie', institute: 'SHP', school_en: 'School of Health Professions (SHP/EMS)', school_fr: 'École des Métiers de la Santé (EMS)', level: 'HND', duration: 2, tuition: 350000 },
  { id: '18', name_en: 'Midwifery / Sage-femme', name_fr: 'Sage-femme', institute: 'SHP', school_en: 'School of Health Professions (SHP/EMS)', school_fr: 'École des Métiers de la Santé (EMS)', level: 'HND', duration: 2, tuition: 350000 },
  { id: '19', name_en: 'Medical Lab Technology', name_fr: 'Technologie de Laboratoire Médical', institute: 'SHP', school_en: 'School of Health Professions (SHP/EMS)', school_fr: 'École des Métiers de la Santé (EMS)', level: 'HND', duration: 2, tuition: 350000 },
  { id: '20', name_en: 'Online Business Management', name_fr: 'Gestion des Affaires en Ligne', institute: 'HILEPMAH', school_en: 'School of Applied Economic Sciences', school_fr: 'École des Sciences Économiques Appliquées', level: 'Diploma', duration: 2, tuition: 300000, online: true },
];

const INSTITUTES_FILTER = [
  { key: 'all', en: 'All', fr: 'Tous' },
  { key: 'HIACOMST', en: 'HIACOMST', fr: 'ISASCOMT' },
  { key: 'HILEPMAH', en: 'HILEPMAH', fr: 'ISMEDMAH' },
  { key: 'HIHS', en: 'HIHS / Health Sciences', fr: 'ISSS / Sciences Santé' },
  { key: 'SHP', en: 'SHP / Health Professions', fr: 'EMS / Métiers Santé' },
];

const LEVEL_BADGE: Record<string, string> = {
  'BSc': 'bg-blue-100 text-blue-800',
  'BSc / HND': 'bg-blue-100 text-blue-800',
  'BSc / MSc': 'bg-purple-100 text-purple-800',
  'HND': 'bg-green-100 text-green-800',
  'Diploma': 'bg-yellow-100 text-yellow-800',
};

export default function ProgramsPageClient({
  locale,
  institute: defaultInstitute,
}: {
  locale: string;
  institute?: string;
  school?: string;
}) {
  const isFr = locale === 'fr';
  const [filterInstitute, setFilterInstitute] = useState(defaultInstitute || 'all');
  const [filterMode, setFilterMode] = useState('all');
  const [search, setSearch] = useState('');

  const filtered = ALL_PROGRAMS.filter(p => {
    if (filterInstitute !== 'all' && p.institute !== filterInstitute) return false;
    if (filterMode === 'online' && !('online' in p && p.online)) return false;
    if (filterMode === 'campus' && ('online' in p && p.online)) return false;
    if (search) {
      const q = search.toLowerCase();
      return p.name_en.toLowerCase().includes(q) || p.name_fr.toLowerCase().includes(q);
    }
    return true;
  });

  return (
    <>
      {/* Hero */}
      <section className="relative pt-16 lg:pt-20">
        <div className="relative h-56 overflow-hidden">
          <Image src="/images/4.jpg" alt="Programs" fill className="object-cover object-top" />
          <div className="absolute inset-0 bg-[#0A1628]/70" />
          <div className="relative h-full flex flex-col items-center justify-center text-center px-4">
            <h1 className="text-3xl md:text-4xl font-bold text-white font-heading mb-2">
              {isFr ? 'Programmes Académiques' : 'Academic Programs'}
            </h1>
            <p className="text-gray-300 text-sm">
              {isFr ? 'Excellence, foi et pertinence africaine' : 'Excellence, faith, and African relevance'}
            </p>
          </div>
        </div>
      </section>

      {/* Breadcrumb */}
      <div className="bg-gray-50 border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center gap-2 text-sm text-gray-500">
          <Link href={`/${locale}`} className="hover:text-[#C9A84C] transition">{isFr ? 'Accueil' : 'Home'}</Link>
          <ChevronRight className="w-4 h-4" />
          <Link href={`/${locale}/schools`} className="hover:text-[#C9A84C] transition">{isFr ? 'Écoles & Instituts' : 'Schools & Institutes'}</Link>
          <ChevronRight className="w-4 h-4" />
          <span className="text-[#0A1628] font-semibold">{isFr ? 'Programmes' : 'Programs'}</span>
        </div>
      </div>

      <section className="py-12 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Filters */}
          <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm mb-8 flex flex-wrap gap-4">
            <div className="flex-1 min-w-[180px]">
              <label className="text-xs font-bold text-gray-500 uppercase block mb-1.5">{isFr ? 'Institut' : 'Institute'}</label>
              <select value={filterInstitute} onChange={e => setFilterInstitute(e.target.value)}
                className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:border-[#C9A84C] outline-none">
                {INSTITUTES_FILTER.map(f => (
                  <option key={f.key} value={f.key}>{isFr ? f.fr : f.en}</option>
                ))}
              </select>
            </div>
            <div className="flex-1 min-w-[140px]">
              <label className="text-xs font-bold text-gray-500 uppercase block mb-1.5">{isFr ? 'Mode' : 'Mode'}</label>
              <select value={filterMode} onChange={e => setFilterMode(e.target.value)}
                className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:border-[#C9A84C] outline-none">
                <option value="all">{isFr ? 'Tous' : 'All'}</option>
                <option value="campus">{isFr ? 'Présentiel' : 'On Campus'}</option>
                <option value="online">{isFr ? 'En Ligne' : 'Online'}</option>
              </select>
            </div>
            <div className="flex-1 min-w-[200px]">
              <label className="text-xs font-bold text-gray-500 uppercase block mb-1.5">{isFr ? 'Rechercher' : 'Search'}</label>
              <input value={search} onChange={e => setSearch(e.target.value)}
                placeholder={isFr ? 'Nom du programme...' : 'Program name...'}
                className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:border-[#C9A84C] outline-none" />
            </div>
          </div>

          <p className="text-gray-500 text-sm mb-5">
            {filtered.length} {isFr ? 'programme(s) trouvé(s)' : 'program(s) found'}
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {filtered.map(prog => (
              <div key={prog.id} className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all flex flex-col">
                <div className="flex items-start justify-between mb-2">
                  <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${LEVEL_BADGE[prog.level] || 'bg-gray-100 text-gray-700'}`}>
                    {prog.level}
                  </span>
                  {'online' in prog && prog.online && (
                    <span className="text-xs bg-blue-50 text-blue-600 font-bold px-2 py-0.5 rounded-full">
                      {isFr ? 'En ligne' : 'Online'}
                    </span>
                  )}
                </div>
                <h3 className="font-bold text-[#0A1628] font-heading text-base mb-1 leading-snug">
                  {isFr ? prog.name_fr : prog.name_en}
                </h3>
                <p className="text-[#C9A84C] text-xs font-semibold mb-3">
                  {isFr ? prog.school_fr : prog.school_en}
                </p>
                <div className="flex gap-3 text-xs text-gray-400 mb-4">
                  <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {prog.duration} {prog.duration === 1 ? (isFr ? 'an' : 'year') : (isFr ? 'ans' : 'years')}</span>
                  <span className="text-[#C9A84C] font-bold">{prog.tuition.toLocaleString()} {isFr ? 'FCFA/an' : 'XAF/yr'}</span>
                </div>
                <Link
                  href={`/${locale}/admission/apply?program=${encodeURIComponent(prog.name_en)}&school=${encodeURIComponent(prog.school_en)}`}
                  className="mt-auto w-full inline-flex items-center justify-center gap-2 bg-[#0A1628] text-white font-semibold py-2.5 rounded-xl hover:bg-[#C9A84C] hover:text-[#0A1628] transition text-sm">
                  {isFr ? 'Postuler' : 'Apply Now'} <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            ))}
          </div>

          {filtered.length === 0 && (
            <div className="text-center py-16 text-gray-400">
              <p className="text-lg font-semibold mb-2">{isFr ? 'Aucun programme trouvé' : 'No programs found'}</p>
            </div>
          )}
        </div>
      </section>
    </>
  );
}
