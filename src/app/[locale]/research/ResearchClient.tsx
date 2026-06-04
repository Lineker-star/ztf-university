'use client';
import { useState } from 'react';
import { useLocale } from 'next-intl';
import type { Research } from '@/types/database';
import { FileText, Users, BookOpen, Search, Download } from 'lucide-react';

export default function ResearchClient({ research }: { research: Research[] }) {
  const locale = useLocale();
  const [search, setSearch] = useState('');
  const [filterSchool, setFilterSchool] = useState('all');

  const schools = ['all', ...Array.from(new Set(research.filter(r => r.school).map(r => r.school as string)))];

  const filtered = research.filter(r => {
    if (filterSchool !== 'all' && r.school !== filterSchool) return false;
    if (search) {
      const q = search.toLowerCase();
      return r.title_en.toLowerCase().includes(q) || (r.title_fr && r.title_fr.toLowerCase().includes(q));
    }
    return true;
  });

  const featured = filtered.filter(r => r.is_featured);
  const rest = filtered.filter(r => !r.is_featured);

  const getTitle = (r: Research) => (locale === 'fr' && r.title_fr) ? r.title_fr : r.title_en;
  const getAbstract = (r: Research) => (locale === 'fr' && r.abstract_fr) ? r.abstract_fr : r.abstract_en;

  return (
    <>
      <h2 className="text-2xl font-bold text-[#0A1628] font-heading mb-6">
        {locale === 'fr' ? 'Publications & Recherches' : 'Publications & Research'}
      </h2>

      {/* Search & Filters */}
      <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 mb-8 flex flex-wrap gap-4">
        <div className="flex-1 min-w-[240px] relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input value={search} onChange={e => setSearch(e.target.value)}
            placeholder={locale === 'fr' ? 'Rechercher...' : 'Search research...'}
            className="w-full pl-9 pr-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:border-[#C9A84C] outline-none" />
        </div>
        <div className="min-w-[220px]">
          <select value={filterSchool} onChange={e => setFilterSchool(e.target.value)}
            className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:border-[#C9A84C] outline-none">
            <option value="all">{locale === 'fr' ? 'Toutes les Écoles' : 'All Schools'}</option>
            {schools.slice(1).map(s => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>
      </div>

      {/* Featured */}
      {featured.length > 0 && (
        <div className="mb-10">
          <h3 className="text-xl font-bold text-[#0A1628] font-heading mb-5">
            {locale === 'fr' ? 'Recherches en Vedette' : 'Featured Research'}
          </h3>
          <div className="grid md:grid-cols-2 gap-5">
            {featured.map(r => <ResearchCard key={r.id} research={r} getTitle={getTitle} getAbstract={getAbstract} locale={locale} featured />)}
          </div>
        </div>
      )}

      {rest.length > 0 && (
        <div>
          <h3 className="text-xl font-bold text-[#0A1628] font-heading mb-5">
            {locale === 'fr' ? 'Toutes les Recherches' : 'All Research'}
          </h3>
          <div className="space-y-4">
            {rest.map(r => <ResearchCard key={r.id} research={r} getTitle={getTitle} getAbstract={getAbstract} locale={locale} />)}
          </div>
        </div>
      )}
    </>
  );
}

function ResearchCard({ research: r, getTitle, getAbstract, locale, featured = false }: {
  research: Research;
  getTitle: (r: Research) => string;
  getAbstract: (r: Research) => string | null;
  locale: string;
  featured?: boolean;
}) {
  return (
    <div className={`bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-all p-6 ${featured ? 'border-l-4 border-l-[#C9A84C]' : ''}`}>
      {featured && <span className="text-xs font-bold text-[#C9A84C] uppercase tracking-wider mb-2 block">
        {locale === 'fr' ? 'Recherche en Vedette' : 'Featured Research'}
      </span>}
      <h3 className="font-bold text-[#0A1628] font-heading text-lg mb-2 leading-snug">{getTitle(r)}</h3>
      {getAbstract(r) && <p className="text-gray-500 text-sm mb-4 line-clamp-3">{getAbstract(r)}</p>}
      <div className="flex flex-wrap gap-4 text-xs text-gray-400 mb-4">
        {r.authors && r.authors.length > 0 && (
          <div className="flex items-center gap-1"><Users className="w-3 h-3" /><span>{r.authors.join(', ')}</span></div>
        )}
        {r.journal && <div className="flex items-center gap-1"><BookOpen className="w-3 h-3" /><span>{r.journal}</span></div>}
        {r.publication_date && <div className="flex items-center gap-1"><FileText className="w-3 h-3" /><span>{new Date(r.publication_date).getFullYear()}</span></div>}
      </div>
      <div className="flex items-center gap-3">
        {r.school && <span className="text-xs bg-[#C9A84C]/10 text-[#A8893E] px-3 py-1 rounded-full font-semibold">{r.school}</span>}
        {r.pdf_url && (
          <a href={r.pdf_url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-xs text-blue-600 hover:text-blue-800 transition">
            <Download className="w-3 h-3" /> {locale === 'fr' ? 'Télécharger PDF' : 'Download PDF'}
          </a>
        )}
      </div>
    </div>
  );
}
