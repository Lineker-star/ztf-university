'use client';
import { useState } from 'react';
import Link from 'next/link';
import { useLocale } from 'next-intl';
import type { Program } from '@/types/database';
import Badge from '@/components/ui/Badge';
import { motion, AnimatePresence } from 'framer-motion';
import { Clock, ChevronDown, ChevronUp, ArrowRight } from 'lucide-react';

const DEGREE_INFO: Record<string, {
  en: { name: string; duration: string; entry: string; desc: string };
  fr: { name: string; duration: string; entry: string; desc: string };
}> = {
  BTS: {
    en: { name: 'BTS — Brevet de Technicien Supérieur', duration: '2 years', entry: 'GCE A/L or BACC', desc: 'Professional higher technician certificate. Highly vocational, industry-focused qualification that prepares students for immediate employment. Equivalent to an HND in the Anglo-Saxon system.' },
    fr: { name: 'BTS — Brevet de Technicien Supérieur', duration: '2 ans', entry: 'GCE A/L ou BACC', desc: 'Diplôme de technicien supérieur professionnel. Qualification très professionnelle, axée sur l\'industrie, qui prépare les étudiants à un emploi immédiat.' },
  },
  HND: {
    en: { name: 'HND — Higher National Diploma', duration: '2 years', entry: 'GCE A/L or BACC', desc: 'Practical, skills-based higher education qualification equivalent to BTS. Combines theoretical knowledge with extensive hands-on training. Widely recognized in Cameroon and across Africa.' },
    fr: { name: 'HND — Higher National Diploma', duration: '2 ans', entry: 'GCE A/L ou BACC', desc: 'Qualification d\'enseignement supérieur pratique, équivalent au BTS. Combine connaissances théoriques et formation pratique approfondie.' },
  },
  bachelor: {
    en: { name: 'Licence / BSc — Bachelor of Science', duration: '3 years', entry: 'GCE A/L / BACC or HND/BTS', desc: 'Standard 3-year undergraduate degree in sciences. Develops deep theoretical and analytical skills. Follows the LMD (Licence-Master-Doctorat) system used across Francophone Africa.' },
    fr: { name: 'Licence / BSc — Licence ès Sciences', duration: '3 ans', entry: 'GCE A/L / BACC ou HND/BTS', desc: 'Diplôme de premier cycle standard de 3 ans en sciences. Développe des compétences théoriques et analytiques profondes. Suit le système LMD.' },
  },
  BTech: {
    en: { name: 'BTech — Bachelor of Technology', duration: '3 years', entry: 'HND/BTS', desc: 'Technology-focused undergraduate degree combining engineering principles with practical application. Ideal for HND holders seeking to advance to degree level.' },
    fr: { name: 'BTech — Licence en Technologie', duration: '3 ans', entry: 'HND/BTS', desc: 'Diplôme de premier cycle axé sur la technologie, combinant principes d\'ingénierie et application pratique. Idéal pour les titulaires de HND.' },
  },
  licence_pro: {
    en: { name: 'Licence Professionnelle', duration: '3 years', entry: 'BTS/HND or 2 years of Licence', desc: 'Professional bachelor\'s degree with strong industry orientation. Designed to produce job-ready graduates with a combination of academic and professional competencies.' },
    fr: { name: 'Licence Professionnelle', duration: '3 ans', entry: 'BTS/HND ou 2 ans de Licence', desc: 'Licence professionnelle à forte orientation industrielle. Conçue pour produire des diplômés prêts à l\'emploi.' },
  },
  master: {
    en: { name: 'MSc — Master of Science', duration: '2 years (M1 + M2)', entry: 'BSc / Licence', desc: 'Research and theory-intensive postgraduate degree. Master 1 consolidates advanced knowledge; Master 2 involves an original research thesis.' },
    fr: { name: 'Master — Master ès Sciences', duration: '2 ans (M1 + M2)', entry: 'Licence / BSc', desc: 'Diplôme de deuxième cycle intensif en recherche. Master 1 consolide les connaissances avancées ; Master 2 implique une thèse de recherche originale.' },
  },
  MTech: {
    en: { name: 'MTech — Master of Technology', duration: '2 years', entry: 'BTech or BSc', desc: 'Applied postgraduate degree focusing on technological innovation and professional practice. Combines advanced study with industry project work.' },
    fr: { name: 'MTech — Master en Technologie', duration: '2 ans', entry: 'BTech ou Licence', desc: 'Diplôme de maîtrise appliqué axé sur l\'innovation technologique et la pratique professionnelle.' },
  },
  master_pro: {
    en: { name: 'Master Professionnel', duration: '2 years', entry: 'Licence / BSc', desc: 'Professional master\'s degree with strong links to industry. Includes mandatory internship and a professional dissertation. Prepares graduates for senior roles.' },
    fr: { name: 'Master Professionnel', duration: '2 ans', entry: 'Licence / BSc', desc: 'Diplôme de master professionnel avec de forts liens avec l\'industrie. Comprend un stage obligatoire et un mémoire professionnel.' },
  },
  phd: {
    en: { name: 'PhD / Doctorat', duration: '3+ years', entry: 'Master / MSc', desc: 'Highest academic qualification requiring original research contribution. Students conduct independent research and defend a thesis before a jury.' },
    fr: { name: 'Doctorat / PhD', duration: '3+ ans', entry: 'Master / MSc', desc: 'La plus haute qualification académique nécessitant une contribution de recherche originale. Soutenance de thèse devant un jury.' },
  },
};

const LEVEL_BADGE: Record<string, 'default' | 'gold' | 'green' | 'blue' | 'purple' | 'red' | 'orange'> = {
  certificate: 'green', diploma: 'gold', bachelor: 'blue', master: 'purple', phd: 'red', vocational: 'orange',
};

function DegreeInfoCard({ level, locale }: { level: string; locale: string }) {
  const [open, setOpen] = useState(false);
  const info = DEGREE_INFO[level];
  if (!info) return null;
  const d = locale === 'fr' ? info.fr : info.en;
  return (
    <div className="bg-blue-50 rounded-xl p-3 border border-blue-100 mb-3">
      <button onClick={() => setOpen(!open)} className="flex items-center gap-2 text-blue-700 font-semibold text-xs w-full text-left">
        ℹ️ {locale === 'fr' ? 'À propos de ce diplôme' : 'About this degree type'}
        {open ? <ChevronUp className="w-3 h-3 ml-auto" /> : <ChevronDown className="w-3 h-3 ml-auto" />}
      </button>
      <AnimatePresence>
        {open && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
            <div className="pt-2 text-xs text-blue-800 space-y-1">
              <p><strong>{d.name}</strong></p>
              <p>⏱ {locale === 'fr' ? 'Durée' : 'Duration'}: {d.duration} | 📋 {locale === 'fr' ? 'Niveau requis' : 'Entry'}: {d.entry}</p>
              <p>{d.desc}</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function ProgramsClient({ programs }: { programs: Program[] }) {
  const locale = useLocale();
  const [filterSchool, setFilterSchool] = useState('all');
  const [filterLevel, setFilterLevel] = useState('all');
  const [filterMode, setFilterMode] = useState('all');

  const schools = ['all', ...Array.from(new Set(programs.map(p => p.school)))];
  const levels = ['all', 'bachelor', 'master', 'phd', 'certificate', 'diploma', 'vocational'];

  const levelLabel: Record<string, { en: string; fr: string }> = {
    all: { en: 'All Levels', fr: 'Tous les niveaux' },
    bachelor: { en: 'Bachelor / Licence', fr: 'Licence / Bachelor' },
    master: { en: 'Master / MSc', fr: 'Master / MSc' },
    phd: { en: 'PhD / Doctorat', fr: 'Doctorat / PhD' },
    certificate: { en: 'Certificate / BTS', fr: 'Certificat / BTS' },
    diploma: { en: 'Diploma / HND', fr: 'Diplôme / HND' },
    vocational: { en: 'Vocational', fr: 'Professionnel' },
  };

  const filtered = programs.filter(p => {
    if (filterSchool !== 'all' && p.school !== filterSchool) return false;
    if (filterLevel !== 'all' && p.level !== filterLevel) return false;
    if (filterMode === 'online' && !p.is_online) return false;
    if (filterMode === 'campus' && p.is_online) return false;
    return true;
  });

  return (
    <section className="py-16 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Degree System Overview */}
        <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm mb-8">
          <h2 className="font-bold text-[#0A1628] font-heading text-lg mb-4">
            {locale === 'fr' ? 'Système de Diplômes — IU-ZTF' : 'Degree System — ZTF University Institute'}
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {Object.entries(DEGREE_INFO).map(([key, val]) => {
              const d = locale === 'fr' ? val.fr : val.en;
              return (
                <button key={key} onClick={() => setFilterLevel(key === 'BTS' || key === 'HND' || key === 'BTech' || key === 'MTech' || key === 'licence_pro' || key === 'master_pro' ? 'all' : key)}
                  className="text-left p-3 bg-gray-50 rounded-xl hover:bg-[#C9A84C]/10 transition border border-gray-100">
                  <p className="text-xs font-bold text-[#0A1628] leading-tight">{d.name.split(' — ')[0]}</p>
                  <p className="text-xs text-gray-400 mt-0.5">{d.duration}</p>
                </button>
              );
            })}
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 mb-8 flex flex-wrap gap-4">
          <div className="flex-1 min-w-[200px]">
            <label className="text-xs font-semibold text-gray-500 block mb-1.5 uppercase">
              {locale === 'fr' ? 'École' : 'School'}
            </label>
            <select value={filterSchool} onChange={e => setFilterSchool(e.target.value)}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:border-[#C9A84C] outline-none">
              <option value="all">{locale === 'fr' ? 'Toutes' : 'All'}</option>
              {schools.slice(1).map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
          <div className="flex-1 min-w-[160px]">
            <label className="text-xs font-semibold text-gray-500 block mb-1.5 uppercase">
              {locale === 'fr' ? 'Niveau' : 'Level'}
            </label>
            <select value={filterLevel} onChange={e => setFilterLevel(e.target.value)}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:border-[#C9A84C] outline-none">
              {levels.map(l => <option key={l} value={l}>{levelLabel[l] ? (locale === 'fr' ? levelLabel[l].fr : levelLabel[l].en) : l}</option>)}
            </select>
          </div>
          <div className="flex-1 min-w-[140px]">
            <label className="text-xs font-semibold text-gray-500 block mb-1.5 uppercase">
              {locale === 'fr' ? 'Mode' : 'Mode'}
            </label>
            <select value={filterMode} onChange={e => setFilterMode(e.target.value)}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:border-[#C9A84C] outline-none">
              <option value="all">{locale === 'fr' ? 'Tous' : 'All'}</option>
              <option value="campus">{locale === 'fr' ? 'En présentiel' : 'On Campus'}</option>
              <option value="online">{locale === 'fr' ? 'En ligne' : 'Online'}</option>
            </select>
          </div>
        </div>

        <p className="text-gray-500 text-sm mb-5">{filtered.length} {locale === 'fr' ? 'programme(s) trouvé(s)' : 'program(s) found'}</p>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map(program => (
            <motion.div key={program.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all">
              <div className="flex items-start justify-between mb-3">
                <Badge variant={LEVEL_BADGE[program.level] || 'default'}>
                  {levelLabel[program.level] ? (locale === 'fr' ? levelLabel[program.level].fr : levelLabel[program.level].en) : program.level}
                </Badge>
                {program.is_online && (
                  <span className="text-xs text-blue-600 bg-blue-50 px-2 py-1 rounded-full font-semibold">
                    {locale === 'fr' ? 'En ligne' : 'Online'}
                  </span>
                )}
              </div>

              <DegreeInfoCard level={program.level} locale={locale} />

              <h3 className="font-bold text-[#0A1628] font-heading text-base mb-1 leading-snug">
                {locale === 'fr' && program.name_fr ? program.name_fr : program.name_en}
              </h3>
              <p className="text-[#C9A84C] text-xs font-semibold mb-2">{program.school}</p>
              <p className="text-gray-500 text-sm mb-4 line-clamp-2">
                {locale === 'fr' && program.description_fr ? program.description_fr : program.description_en}
              </p>

              <div className="flex gap-4 text-sm text-gray-400 mb-5">
                {program.duration_years && (
                  <div className="flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5" />
                    {program.duration_years} {locale === 'fr' ? (program.duration_years === 1 ? 'an' : 'ans') : (program.duration_years === 1 ? 'year' : 'years')}
                  </div>
                )}
                {program.tuition_xaf && (
                  <div className="text-[#C9A84C] font-semibold text-xs">
                    {program.tuition_xaf.toLocaleString()} {locale === 'fr' ? 'FCFA/an' : 'XAF/yr'}
                  </div>
                )}
              </div>

              <Link
                href={`/${locale}/admission/apply?program=${encodeURIComponent(program.name_en)}&school=${encodeURIComponent(program.school)}`}
                className="w-full inline-flex items-center justify-center gap-2 bg-[#0A1628] text-white font-semibold py-3 rounded-xl hover:bg-[#C9A84C] hover:text-[#0A1628] transition text-sm">
                {locale === 'fr' ? 'Postuler' : 'Apply Now'} <ArrowRight className="w-4 h-4" />
              </Link>
            </motion.div>
          ))}
        </div>

        {filtered.length === 0 && (
          <div className="text-center py-16 text-gray-400">
            <p className="text-lg font-semibold mb-2">{locale === 'fr' ? 'Aucun programme trouvé' : 'No programs found'}</p>
            <p className="text-sm">{locale === 'fr' ? 'Essayez de modifier vos filtres' : 'Try adjusting your filters'}</p>
          </div>
        )}
      </div>
    </section>
  );
}
