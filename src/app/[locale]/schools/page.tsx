'use client';
export const dynamic = 'force-dynamic';

import { useLocale } from 'next-intl';
import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, ChevronUp, Leaf, Radio, Cpu, Heart, BarChart3, Scale, Users, Wrench, Globe, ArrowRight, Stethoscope } from 'lucide-react';

// ─── INSTITUTE DATA ──────────────────────────────────────────
const INSTITUTES = [
  {
    id: 'hiacomst',
    code_en: 'HIACOMST',
    code_fr: 'ISASCOMT',
    name_en: 'Higher Institute of Agronomy, Communication Sciences and Technology',
    name_fr: "Institut Supérieur d'Agronomie, des Sciences de la Communication et de Technologie",
    color: 'border-green-400',
    bg: 'bg-green-50',
    iconColor: 'text-green-600',
    icon: Leaf,
    schools: [
      {
        name_en: 'School of Agronomy and Biotechnology',
        name_fr: "École d'Agronomie et de Biotechnologie",
        icon: Leaf,
        color: 'text-green-600',
        bg: 'bg-green-50',
        courses: ['Agronomy', 'Forestry & Wildlife Management', 'Rural Sociology, Economics & Agricultural Extension', 'Aquaculture & Aquatic Product Development', 'Food Science & Biotechnology', 'Agricultural Project Management'],
      },
      {
        name_en: 'School of Engineering & Applied Technology',
        name_fr: "École d'Ingénierie et de Technologie Appliquée",
        icon: Cpu,
        color: 'text-orange-600',
        bg: 'bg-orange-50',
        courses: [
          'Computer Engineering: Software Engineering, Cyber Security, Cloud Computing, DevOps, Graphics & Web Design',
          'Electrical & Electronic Engineering: Renewable Energy, Power Systems, Automation',
          'Civil & Architectural Engineering: Architecture, Building Construction, Road Construction, Urban Planning',
          'Mechanical Engineering: Auto-mechanics, Aeronautics, Thermal Systems',
          'Networks & Telecommunication',
          'Audiovisual Systems Engineering',
          'Applied Sciences: Physics, Mathematics, Bio-Engineering, Environmental Engineering',
        ],
      },
      {
        name_en: 'School of Communication',
        name_fr: 'École de Communication',
        icon: Radio,
        color: 'text-blue-600',
        bg: 'bg-blue-50',
        courses: ['Journalism & Mass Communication', 'Corporate Communication', 'Trans-border & Intercultural Communication', 'Translation & Interpretation', 'Cinematographic & Audiovisual Productions', 'Strategic Leadership'],
      },
    ],
  },
  {
    id: 'hilepmah',
    code_en: 'HILEPMAH',
    code_fr: 'ISMEDMAH',
    name_en: 'Higher Institute of Legal Professions, Management and Humanities',
    name_fr: "Institut Supérieur des Métiers du Droit, de Management et des Humanités",
    color: 'border-indigo-400',
    bg: 'bg-indigo-50',
    iconColor: 'text-indigo-600',
    icon: Scale,
    schools: [
      {
        name_en: 'School of Legal Professions',
        name_fr: 'École des Métiers du Droit',
        icon: Scale,
        color: 'text-indigo-600',
        bg: 'bg-indigo-50',
        courses: ['Business & Corporate Law', 'Land Regime & Law Practice', 'International Security, Defense & African Cooperation', 'Human Rights & Social Justice', 'Conflict Resolution', 'International Relations', 'Public Administration', 'Decentralization & Local Governance', 'Customs & Transit', 'Tax Management', 'Land & Property Law'],
      },
      {
        name_en: 'School of Applied Economic Sciences',
        name_fr: 'École des Sciences Économiques Appliquées',
        icon: BarChart3,
        color: 'text-purple-600',
        bg: 'bg-purple-50',
        courses: ['Applied Economics', 'Accountancy', 'Banking & Finance', 'Business Management', 'Entrepreneurship', 'Insurance', 'Project Management', 'Logistics & Transport', 'Port & Shipping Management', 'Taxation'],
      },
      {
        name_en: 'School of Applied Human Sciences',
        name_fr: 'École des Sciences Humaines Appliquées',
        icon: Users,
        color: 'text-pink-600',
        bg: 'bg-pink-50',
        courses: ['Applied Linguistics', 'Human Resource Management', 'Sociology', 'Anthropology', 'Gender Studies', 'Psychology', 'Education & Pedagogy', 'Gerontology', 'Nonprofit Management', 'Family Studies', 'Human Services'],
      },
    ],
  },
  {
    id: 'hihs',
    code_en: 'HIHS',
    code_fr: 'ISSS',
    name_en: 'Higher Institute of Health Sciences',
    name_fr: 'Institut Supérieur des Sciences de la Santé',
    color: 'border-red-400',
    bg: 'bg-red-50',
    iconColor: 'text-red-600',
    icon: Heart,
    schools: [
      {
        name_en: 'School of Health Sciences',
        name_fr: 'École des Sciences de la Santé',
        icon: Heart,
        color: 'text-red-600',
        bg: 'bg-red-50',
        courses: ['Nursing Sciences', 'Medical Laboratory Analysis', 'Operating Room Assistant', 'Radiological Techniques', 'Physiotherapy', 'Pharmaceutical Sciences', 'Environmental Health Engineering', 'Public Health', 'Dentistry & Stomatology', 'Midwifery', 'Optician'],
      },
    ],
  },
  {
    id: 'shp',
    code_en: 'SHP',
    code_fr: 'EMS',
    name_en: 'School of Health Professions',
    name_fr: 'École des Métiers de la Santé',
    color: 'border-teal-400',
    bg: 'bg-teal-50',
    iconColor: 'text-teal-600',
    icon: Stethoscope,
    isStandalone: true,
    description_en: 'A specialized professional school dedicated to training highly skilled health professionals. Unlike the Higher Institute of Health Sciences which focuses on academic research and theory, SHP/EMS provides hands-on, competency-based training for direct patient care roles.',
    description_fr: "Une école professionnelle spécialisée dédiée à la formation de professionnels de santé hautement qualifiés. Contrairement à l'Institut Supérieur des Sciences de la Santé, l'EMS offre une formation pratique axée sur les compétences.",
    schools: [
      {
        name_en: 'School of Health Professions',
        name_fr: 'École des Métiers de la Santé',
        icon: Stethoscope,
        color: 'text-teal-600',
        bg: 'bg-teal-50',
        courses: ['Nursing (Infirmerie)', 'Midwifery (Sage-femme)', 'Medical Lab Technician', 'Pharmacy Technician', 'Physiotherapy', 'Dental Nursing', 'Operating Theatre Technician', 'Radiology Technician', 'Public Health Inspector', 'Health Administration'],
      },
    ],
  },
];

// VTI data
type VTIField = { field_en: string; field_fr: string; courses: { name: string; entry: string; fee: number }[] };
const IFPDD_FIELDS: VTIField[] = [
  {
    field_en: 'Field of Agronomy', field_fr: 'Domaine Agronomie',
    courses: [
      { name: 'Agropastoral Advisory', entry: 'GCE O/L or BEPC', fee: 200000 },
      { name: 'Agropastoral Entrepreneurship', entry: 'GCE O/L or BEPC', fee: 200000 },
      { name: 'Plant Production', entry: 'GCE O/L or BEPC', fee: 200000 },
      { name: 'Animal Production', entry: 'GCE O/L or BEPC', fee: 200000 },
      { name: 'Apiculture', entry: 'GCE O/L or BEPC', fee: 200000 },
      { name: 'Livestock Farming', entry: 'FSLC or CEP', fee: 150000 },
      { name: 'Agricultural Mechanisation', entry: 'GCE O/L or BEPC', fee: 200000 },
      { name: 'Pisciculture', entry: 'GCE O/L or BEPC', fee: 200000 },
      { name: 'Agro-Food Processing', entry: 'GCE O/L or BEPC', fee: 200000 },
      { name: 'Agricultural Project Management', entry: 'GCE A/L or BACC', fee: 250000 },
    ],
  },
  {
    field_en: 'Field of Applied Technology', field_fr: 'Domaine Technologie Appliquée',
    courses: [
      { name: 'Office Automation', entry: 'GCE O/L or BEPC', fee: 250000 },
      { name: 'Graphics Design', entry: 'GCE O/L or BEPC', fee: 250000 },
      { name: 'Computer Maintenance & Networking', entry: 'GCE O/L or BEPC', fee: 300000 },
      { name: 'Networks & Telecommunications', entry: 'GCE O/L or BEPC', fee: 300000 },
      { name: 'Web & App Design and Development', entry: 'GCE O/L or BEPC', fee: 250000 },
      { name: 'Cloud Computing', entry: 'GCE A/L or BACC', fee: 500000 },
      { name: 'IT Project Management', entry: 'Bachelor / Licence Pro', fee: 400000 },
      { name: 'Electrical Wiring', entry: 'CAP or GCE O/L', fee: 250000 },
      { name: 'Electrotechnics', entry: 'GCE O/L or BEPC', fee: 200000 },
      { name: 'Plumbing', entry: 'FSLC or CEP', fee: 150000 },
      { name: 'Masonry', entry: 'FSLC or CEP', fee: 200000 },
      { name: 'Metal Constructions', entry: 'GCE O/L or BEPC', fee: 250000 },
      { name: 'Auto-Mechanics', entry: 'GCE O/L or BEPC', fee: 250000 },
      { name: 'Topography', entry: 'GCE O/L or BEPC', fee: 250000 },
    ],
  },
  {
    field_en: 'Field of Communication', field_fr: 'Domaine Communication',
    courses: [
      { name: 'Multimedia Production', entry: 'GCE O/L or BEPC', fee: 300000 },
      { name: 'Radio & TV Broadcasting', entry: 'GCE O/L or BEPC', fee: 250000 },
      { name: 'Rural & Urban Communication', entry: 'GCE A/L or BACC', fee: 200000 },
      { name: 'Translation & Interpretation', entry: 'GCE A/L or BACC', fee: 250000 },
      { name: 'Film Production', entry: 'GCE O/L or BEPC', fee: 250000 },
    ],
  },
];
const IFPSH_FIELDS: VTIField[] = [
  {
    field_en: 'Field of Health Sciences', field_fr: 'Domaine Sciences de la Santé',
    courses: [
      { name: 'Paramedic', entry: 'GCE O/L or BEPC', fee: 250000 },
      { name: 'First-Aid & Emergency Care', entry: 'GCE O/L or BEPC', fee: 250000 },
      { name: 'Hospital Attendant', entry: 'GCE O/L or BEPC', fee: 150000 },
      { name: 'Dental Assistant', entry: 'GCE O/L or BEPC', fee: 200000 },
      { name: 'Physiotherapy Assistant', entry: 'GCE O/L or BEPC', fee: 300000 },
      { name: 'Pharmacy Technician', entry: 'GCE O/L or BEPC', fee: 250000 },
      { name: 'Medical Representative', entry: 'GCE A/L or BACC', fee: 300000 },
      { name: 'Embalmer', entry: 'FSLC or CEP', fee: 70000 },
    ],
  },
  {
    field_en: 'Field of Human Sciences', field_fr: 'Domaine Sciences Humaines',
    courses: [
      { name: 'Sewing & Styling', entry: 'FSLC or CEP', fee: 100000 },
      { name: 'Pastry Production', entry: 'FSLC or CEP', fee: 100000 },
      { name: 'Tourism', entry: 'GCE O/L or BEPC', fee: 200000 },
      { name: 'Hotel Management & Gastronomy', entry: 'GCE O/L or BEPC', fee: 250000 },
      { name: 'Humanitarian Administrator', entry: 'GCE A/L or BACC', fee: 300000 },
    ],
  },
  {
    field_en: 'Field of Applied Economic Sciences', field_fr: 'Domaine Sciences Économiques Appliquées',
    courses: [
      { name: 'Banking & Insurance', entry: 'GCE O/L or BEPC', fee: 250000 },
      { name: 'Computerized Accounting', entry: 'GCE A/L or BACC', fee: 300000 },
      { name: 'Human Resource Management', entry: 'GCE A/L or BACC', fee: 300000 },
      { name: 'Marketing Commerce Sales', entry: 'GCE O/L or BEPC', fee: 200000 },
      { name: 'Logistics & Transport', entry: 'GCE O/L or BEPC', fee: 250000 },
    ],
  },
];

// ─── SUB-COMPONENTS ──────────────────────────────────────────
function SchoolCard({ school, locale }: { school: typeof INSTITUTES[0]['schools'][0]; locale: string }) {
  const [open, setOpen] = useState(false);
  const Icon = school.icon;
  return (
    <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
      <div className="p-5">
        <div className="flex items-start gap-3">
          <div className={`w-10 h-10 ${school.bg} ${school.color} rounded-xl flex items-center justify-center flex-shrink-0`}>
            <Icon className="w-5 h-5" />
          </div>
          <div className="flex-1 min-w-0">
            <h4 className="font-bold text-[#0A1628] font-heading text-sm leading-tight">
              {locale === 'fr' ? school.name_fr : school.name_en}
            </h4>
            <div className="flex flex-wrap gap-2 mt-3">
              <button
                onClick={() => setOpen(!open)}
                className="flex items-center gap-1 text-[#C9A84C] font-semibold text-xs hover:underline"
              >
                {open
                  ? (locale === 'fr' ? 'Réduire' : 'Collapse')
                  : (locale === 'fr' ? `${school.courses.length} filières` : `${school.courses.length} fields`)}
                {open ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
              </button>
            </div>
          </div>
        </div>
      </div>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <ul className="px-5 pb-4 space-y-1.5 border-t border-gray-50">
              {school.courses.map((c, i) => (
                <li key={i} className="flex gap-2 text-xs text-gray-600 pt-1.5">
                  <span className="text-[#C9A84C] font-bold">•</span>
                  <span>{c}</span>
                </li>
              ))}
            </ul>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function InstituteCard({ inst, locale }: { inst: typeof INSTITUTES[0]; locale: string }) {
  const Icon = inst.icon;
  const isStandalone = 'isStandalone' in inst && inst.isStandalone;
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`bg-white rounded-2xl border-2 ${inst.color} p-6 shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all`}
    >
      <div className="flex items-start gap-4 mb-4">
        <div className={`w-14 h-14 ${inst.bg} ${inst.iconColor} rounded-2xl flex items-center justify-center flex-shrink-0`}>
          <Icon className="w-7 h-7" />
        </div>
        <div>
          <div className={`inline-block text-xs font-bold px-3 py-1 rounded-full mb-1 ${isStandalone ? 'bg-teal-100 text-teal-800' : 'bg-[#C9A84C] text-[#0A1628]'}`}>
            {locale === 'fr' ? inst.code_fr : inst.code_en}
            {isStandalone && (
              <span className="ml-1 text-xs">(Standalone School)</span>
            )}
          </div>
          <h3 className="font-bold text-[#0A1628] font-heading text-sm leading-snug">
            {locale === 'fr' ? inst.name_fr : inst.name_en}
          </h3>
        </div>
      </div>

      {'description_en' in inst && inst.description_en && (
        <p className="text-gray-500 text-xs mb-4 leading-relaxed">
          {locale === 'fr' && 'description_fr' in inst ? inst.description_fr : inst.description_en}
        </p>
      )}

      <div className="space-y-2 mb-4">
        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
          {locale === 'fr' ? 'Écoles rattachées' : 'Schools under it'}:
        </p>
        {inst.schools.map(s => (
          <div key={s.name_en} className="flex items-center gap-2 text-sm text-gray-700">
            <span className="text-[#C9A84C]">→</span>
            {locale === 'fr' ? s.name_fr : s.name_en}
          </div>
        ))}
      </div>

      <Link
        href={`/${locale}/schools/programs?institute=${inst.id}`}
        className="inline-flex items-center gap-1 text-[#C9A84C] font-semibold text-sm hover:gap-2 transition-all"
      >
        {locale === 'fr' ? 'Voir les Programmes' : 'View Programs'} <ArrowRight className="w-4 h-4" />
      </Link>
    </motion.div>
  );
}

function VTITable({ fields, locale }: { fields: VTIField[]; locale: string }) {
  const [openField, setOpenField] = useState<string | null>(null);
  return (
    <div className="space-y-3">
      {fields.map(f => (
        <div key={f.field_en} className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
          <button
            onClick={() => setOpenField(openField === f.field_en ? null : f.field_en)}
            className="w-full flex items-center justify-between p-4 text-left hover:bg-gray-50 transition"
          >
            <div>
              <span className="font-bold text-[#0A1628] text-sm">{locale === 'fr' ? f.field_fr : f.field_en}</span>
              <span className="ml-2 text-xs text-gray-400">({f.courses.length} {locale === 'fr' ? 'spécialités' : 'specialties'})</span>
            </div>
            {openField === f.field_en ? <ChevronUp className="w-4 h-4 text-[#C9A84C]" /> : <ChevronDown className="w-4 h-4 text-[#C9A84C]" />}
          </button>
          <AnimatePresence>
            {openField === f.field_en && (
              <motion.div initial={{ height: 0 }} animate={{ height: 'auto' }} exit={{ height: 0 }} className="overflow-hidden">
                <div className="px-4 pb-4 overflow-x-auto">
                  <table className="w-full text-sm min-w-[400px]">
                    <thead>
                      <tr className="bg-gray-50">
                        <th className="text-left p-2 text-xs font-bold text-gray-500 uppercase">{locale === 'fr' ? 'Spécialité' : 'Specialty'}</th>
                        <th className="text-left p-2 text-xs font-bold text-gray-500 uppercase">{locale === 'fr' ? 'Niveau Requis' : 'Entry Level'}</th>
                        <th className="text-right p-2 text-xs font-bold text-gray-500 uppercase">{locale === 'fr' ? 'Frais (FCFA)' : 'Fee (XAF)'}</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                      {f.courses.map((c, i) => (
                        <tr key={i} className="hover:bg-gray-50">
                          <td className="p-2 text-[#0A1628] font-medium text-xs">{c.name}</td>
                          <td className="p-2 text-gray-500 text-xs">{c.entry}</td>
                          <td className="p-2 text-right font-bold text-[#C9A84C] text-xs">{c.fee.toLocaleString()}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      ))}
    </div>
  );
}

// ─── MAIN PAGE ───────────────────────────────────────────────
export default function SchoolsPage() {
  const locale = useLocale();
  const isFr = locale === 'fr';
  const [tab, setTab] = useState<'institutes' | 'schools' | 'vocational'>('institutes');

  const tabs = [
    { key: 'institutes', en: '4 Higher Institutes', fr: '4 Instituts Supérieurs' },
    { key: 'schools', en: '7 Schools Detail', fr: 'Détail des 7 Écoles' },
    { key: 'vocational', en: 'Vocational Training', fr: 'Formation Professionnelle' },
  ];

  return (
    <>
      {/* Hero */}
      <section className="relative pt-16 lg:pt-20">
        <div className="relative h-64 md:h-80 overflow-hidden">
          <Image src="/images/3.jpg" alt="Schools" fill className="object-cover" priority />
          <div className="absolute inset-0 bg-[#0A1628]/65" />
          <div className="relative h-full flex flex-col items-center justify-center text-center px-4">
            <h1 className="text-3xl md:text-5xl font-bold text-white font-heading mb-3">
              {isFr ? 'Nos Écoles & Instituts Supérieurs' : 'Our Schools & Higher Institutes'}
            </h1>
            <p className="text-gray-300 text-sm md:text-base max-w-2xl">
              {isFr
                ? '3 Instituts Supérieurs + 1 École Spécialisée · 7 Écoles · 2 Instituts de Formation Professionnelle'
                : '3 Higher Institutes + 1 Specialist School · 7 Schools · 2 Vocational Training Institutes'}
            </p>
          </div>
        </div>
      </section>

      <section className="py-12 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Tab Bar */}
          <div className="flex flex-wrap gap-2 mb-10 justify-center">
            {tabs.map(t => (
              <button
                key={t.key}
                onClick={() => setTab(t.key as typeof tab)}
                className={`px-5 py-2.5 rounded-xl font-semibold transition text-sm ${
                  tab === t.key ? 'bg-[#0A1628] text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {isFr ? t.fr : t.en}
              </button>
            ))}
          </div>

          {/* TAB 1 — Higher Institutes */}
          {tab === 'institutes' && (
            <div>
              <div className="text-center mb-8">
                <h2 className="text-2xl font-bold text-[#0A1628] font-heading">
                  {isFr ? '3 Instituts Supérieurs + 1 École Spécialisée' : '3 Higher Institutes + 1 Specialist School'}
                </h2>
                <p className="text-gray-500 text-sm mt-2 max-w-2xl mx-auto">
                  {isFr
                    ? 'L\'IU-ZTF est structurée autour de 3 Instituts Supérieurs regroupant 7 Écoles, et d\'une École des Métiers de la Santé spécialisée.'
                    : 'ZTF University Institute is structured around 3 Higher Institutes grouping 7 Schools, and one specialist School of Health Professions.'}
                </p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {INSTITUTES.map(inst => (
                  <InstituteCard key={inst.id} inst={inst} locale={locale} />
                ))}
              </div>
              <div className="mt-8 text-center">
                <Link
                  href={`/${locale}/schools/programs`}
                  className="inline-flex items-center gap-2 bg-[#C9A84C] text-[#0A1628] font-bold px-8 py-3 rounded-xl hover:bg-[#E8C96A] transition"
                >
                  {isFr ? 'Voir Tous les Programmes Académiques' : 'View All Academic Programs'} <ArrowRight className="w-5 h-5" />
                </Link>
              </div>
            </div>
          )}

          {/* TAB 2 — 7 Schools Detail */}
          {tab === 'schools' && (
            <div>
              {INSTITUTES.map(inst => (
                <div key={inst.id} id={inst.id} className="mb-10">
                  <div className="flex items-center gap-3 mb-4">
                    <div className={`inline-block text-xs font-bold px-3 py-1 rounded-full ${inst.id === 'shp' ? 'bg-teal-100 text-teal-800' : 'bg-[#C9A84C] text-[#0A1628]'}`}>
                      {isFr ? inst.code_fr : inst.code_en}
                    </div>
                    <h3 className="text-lg font-bold text-[#0A1628] font-heading">
                      {isFr ? inst.name_fr : inst.name_en}
                    </h3>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {inst.schools.map(s => (
                      <SchoolCard key={s.name_en} school={s} locale={locale} />
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* TAB 3 — Vocational */}
          {tab === 'vocational' && (
            <div id="vocational" className="space-y-10">
              <div>
                <div className="flex items-center gap-4 mb-5">
                  <div className="w-12 h-12 bg-yellow-50 text-yellow-600 rounded-xl flex items-center justify-center">
                    <Wrench className="w-6 h-6" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-[#0A1628] font-heading">IFPDD</h2>
                    <p className="text-gray-500 text-sm">
                      {isFr ? 'Institut de Formation Professionnelle pour le Développement Durable' : 'Vocational Training Institute for Sustainable Development'}
                    </p>
                  </div>
                </div>
                <VTITable fields={IFPDD_FIELDS} locale={locale} />
              </div>
              <div>
                <div className="flex items-center gap-4 mb-5">
                  <div className="w-12 h-12 bg-teal-50 text-teal-600 rounded-xl flex items-center justify-center">
                    <Globe className="w-6 h-6" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-[#0A1628] font-heading">IFPSH</h2>
                    <p className="text-gray-500 text-sm">
                      {isFr ? 'Institut de Formation Professionnelle des Sciences Humaines' : 'Vocational Training Institute for Human Sciences'}
                    </p>
                  </div>
                </div>
                <VTITable fields={IFPSH_FIELDS} locale={locale} />
              </div>
            </div>
          )}
        </div>
      </section>
    </>
  );
}
