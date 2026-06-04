'use client';
import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Calendar, ArrowRight, Tag } from 'lucide-react';

export const BLOG_POSTS = [
  { id: '1', slug: 'graduation-ceremony-2025', title_en: 'ZTF University Institute Celebrates Successful 2025 Graduation Ceremony', title_fr: "L'Institut Universitaire ZTF Célèbre la Cérémonie de Remise de Diplômes 2025", excerpt_en: 'ZTF University Institute celebrated its annual graduation ceremony with over 100 graduates receiving their degrees and certificates in Bertoua, Cameroon. Special prizes were awarded to distinguished graduates.', excerpt_fr: "L'Institut Universitaire ZTF a célébré sa cérémonie annuelle de remise de diplômes avec plus de 100 diplômés à Bertoua. Des prix spéciaux ont été remis aux diplômés distingués.", date: '2025-07-15', category: 'news', cat_en: 'University News', cat_fr: 'Actualités Universitaires', image: '/images/1.jpg', author: 'ZTF University Communications', readTime: 3 },
  { id: '2', slug: 'admissions-open-2026-2027', title_en: 'Admissions Now Open for Academic Year 2026–2027', title_fr: "Ouverture des Inscriptions pour l'Année Académique 2026–2027", excerpt_en: 'ZTF University Institute is pleased to announce that admissions for the 2026–2027 academic year are now officially open across all programmes in our 3 Higher Institutes, 7 Schools, and 2 Vocational Training Institutes.', excerpt_fr: "L'Institut Universitaire ZTF a le plaisir d'annoncer l'ouverture officielle des inscriptions pour l'année académique 2026–2027 dans tous les programmes.", date: '2026-03-01', category: 'admissions', cat_en: 'Admissions', cat_fr: 'Admissions', image: '/images/4.jpg', author: 'Admissions Office', readTime: 2 },
  { id: '3', slug: 'national-day-parade-2025', title_en: 'IU-ZTF Students Represent the University at National Day Parade in Bertoua', title_fr: "Les Étudiants de l'IU-ZTF Représentent l'Université au Défilé de la Fête Nationale", excerpt_en: 'IU-ZTF students proudly marched through the streets of Bertoua in their university blue polo shirts, holding the Cameroonian flag during the national day celebration, drawing widespread admiration.', excerpt_fr: "Les étudiants de l'IU-ZTF ont fièrement défilé dans les rues de Bertoua en portant leurs polos bleus universitaires et le drapeau du Cameroun lors de la fête nationale.", date: '2025-05-20', category: 'student_life', cat_en: 'Student Life', cat_fr: 'Vie Étudiante', image: '/images/5.jpg', author: 'Student Affairs Office', readTime: 2 },
  { id: '4', slug: 'ztf-legacy-excellence', title_en: "The Legacy of Prof. Zacharias Tanee Fomum: Building Excellence in African Education", title_fr: "L'Héritage du Prof. Zacharias Tanee Fomum : Bâtir l'Excellence dans l'Éducation Africaine", excerpt_en: "Professor Zacharias Tanee Fomum (1945–2009) was one of Africa's greatest academic minds. With over 160 publications, 100+ supervised theses, and a Doctor of Science from Durham University, his legacy lives on at ZTF University Institute.", excerpt_fr: "Le Professeur Zacharias Tanee Fomum (1945–2009) était l'un des plus grands esprits académiques d'Afrique. Avec plus de 160 publications et 100+ thèses supervisées, son héritage continue d'inspirer l'IU-ZTF.", date: '2025-01-14', category: 'faith', cat_en: 'Faith & Learning', cat_fr: 'Foi & Apprentissage', image: '/images/Founder.jpeg', author: 'Editorial Team', readTime: 5 },
  { id: '5', slug: 'wcs-research-partnership', title_en: 'ZTF University Partners with World Conquest Science for Research Development', title_fr: "L'IU-ZTF s'associe à World Conquest Science pour le Développement de la Recherche", excerpt_en: 'ZTF University Institute has formalized its academic partnership with World Conquest Science (WCS). This collaboration advances research in tropical medicinal plants, drug development, and scientific education in Cameroon.', excerpt_fr: "L'Institut Universitaire ZTF a formalisé son partenariat académique avec World Conquest Science (WCS). Cette collaboration fait avancer la recherche en plantes médicinales tropicales.", date: '2025-09-10', category: 'research', cat_en: 'Research', cat_fr: 'Recherche', image: '/images/2.jpg', author: 'Research Office', readTime: 3 },
  { id: '6', slug: 'new-school-health-professions', title_en: 'ZTF University Establishes School of Health Professions (SHP/EMS)', title_fr: "L'IU-ZTF crée l'École des Métiers de la Santé (EMS)", excerpt_en: 'ZTF University Institute announces the establishment of the School of Health Professions (SHP/EMS), a specialized professional school dedicated to training highly skilled health professionals in hands-on, competency-based programmes.', excerpt_fr: "L'Institut Universitaire ZTF annonce la création de l'École des Métiers de la Santé (EMS), une école professionnelle spécialisée dédiée à la formation de professionnels de santé.", date: '2026-01-20', category: 'news', cat_en: 'University News', cat_fr: 'Actualités Universitaires', image: '/images/3.jpg', author: 'Office of the Rector', readTime: 2 },
];

const CATEGORIES = [
  { key: 'all', en: 'All', fr: 'Tout' },
  { key: 'news', en: 'University News', fr: 'Actualités' },
  { key: 'admissions', en: 'Admissions', fr: 'Admissions' },
  { key: 'student_life', en: 'Student Life', fr: 'Vie Étudiante' },
  { key: 'faith', en: 'Faith & Learning', fr: 'Foi & Apprentissage' },
  { key: 'research', en: 'Research', fr: 'Recherche' },
];

export default function BlogPageClient({ locale }: { locale: string }) {
  const isFr = locale === 'fr';
  const [activeCategory, setActiveCategory] = useState('all');

  const filtered = activeCategory === 'all'
    ? BLOG_POSTS
    : BLOG_POSTS.filter(p => p.category === activeCategory);

  const featured = BLOG_POSTS[0];

  const getTitle = (p: typeof BLOG_POSTS[0]) => isFr ? p.title_fr : p.title_en;
  const getExcerpt = (p: typeof BLOG_POSTS[0]) => isFr ? p.excerpt_fr : p.excerpt_en;

  return (
    <>
      {/* HERO */}
      <section className="relative pt-16 lg:pt-20">
        <div className="relative h-64 md:h-80 overflow-hidden">
          <Image src="/images/4.jpg" alt="Blog" fill className="object-cover object-top" priority />
          <div className="absolute inset-0 bg-[#0A1628]/70" />
          <div className="relative h-full flex flex-col items-center justify-center text-center px-4">
            <h1 className="text-3xl md:text-5xl font-bold text-white font-heading mb-2">
              {isFr ? 'Blog & Actualités' : 'Blog & News'}
            </h1>
            <p className="text-gray-300 text-sm md:text-base">
              {isFr ? "Les dernières nouvelles de l'Institut Universitaire ZTF" : 'Latest updates from ZTF University Institute'}
            </p>
          </div>
        </div>
      </section>

      <section className="py-12 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Featured Post */}
          <div className="mb-12">
            <div className="inline-block bg-[#C9A84C] text-[#0A1628] text-xs font-bold px-3 py-1 rounded-full mb-4 uppercase">
              {isFr ? 'À la Une' : 'Featured'}
            </div>
            <Link href={`/${locale}/blog/${featured.slug}`}>
              <div className="bg-white rounded-3xl overflow-hidden shadow-lg hover:shadow-xl transition group grid md:grid-cols-2">
                <div className="relative h-56 md:h-auto">
                  <Image src={featured.image} alt={getTitle(featured)} fill className="object-cover group-hover:scale-105 transition-transform duration-500" sizes="(max-width: 768px) 100vw, 50vw" />
                </div>
                <div className="p-8 flex flex-col justify-center">
                  <span className="inline-block bg-[#C9A84C]/10 text-[#A8893E] text-xs font-bold px-3 py-1 rounded-full mb-3">
                    {isFr ? featured.cat_fr : featured.cat_en}
                  </span>
                  <h2 className="text-xl md:text-2xl font-bold text-[#0A1628] font-heading mb-3 group-hover:text-[#C9A84C] transition leading-snug">
                    {getTitle(featured)}
                  </h2>
                  <p className="text-gray-500 text-sm mb-4 line-clamp-3">{getExcerpt(featured)}</p>
                  <div className="flex items-center gap-3 text-xs text-gray-400">
                    <Calendar className="w-3.5 h-3.5" />
                    <span>{new Date(featured.date).toLocaleDateString(locale)}</span>
                    <span>·</span>
                    <span>{featured.readTime} {isFr ? 'min de lecture' : 'min read'}</span>
                  </div>
                  <span className="mt-4 inline-flex items-center gap-1 text-[#C9A84C] font-bold text-sm">
                    {isFr ? 'Lire la Suite' : 'Read More'} <ArrowRight className="w-4 h-4" />
                  </span>
                </div>
              </div>
            </Link>
          </div>

          {/* Category Filter */}
          <div className="flex flex-wrap gap-2 mb-8 overflow-x-auto pb-1">
            {CATEGORIES.map(cat => (
              <button key={cat.key} onClick={() => setActiveCategory(cat.key)}
                className={`flex-shrink-0 px-4 py-2 rounded-xl text-sm font-semibold transition ${
                  activeCategory === cat.key ? 'bg-[#0A1628] text-white' : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200'
                }`}>
                {isFr ? cat.fr : cat.en}
              </button>
            ))}
          </div>

          {/* Posts Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filtered.map(post => (
              <Link key={post.id} href={`/${locale}/blog/${post.slug}`}
                className="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all group">
                <div className="relative h-48 overflow-hidden">
                  <Image src={post.image} alt={getTitle(post)} fill className="object-cover group-hover:scale-105 transition-transform duration-300" sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw" />
                  <div className="absolute top-3 left-3">
                    <span className="bg-[#C9A84C] text-[#0A1628] text-xs font-bold px-2 py-0.5 rounded-full">
                      {isFr ? post.cat_fr : post.cat_en}
                    </span>
                  </div>
                </div>
                <div className="p-5">
                  <h3 className="font-bold text-[#0A1628] font-heading text-base mb-2 line-clamp-2 group-hover:text-[#C9A84C] transition leading-snug">
                    {getTitle(post)}
                  </h3>
                  <p className="text-gray-500 text-sm line-clamp-2 mb-3">{getExcerpt(post)}</p>
                  <div className="flex items-center justify-between text-xs text-gray-400">
                    <div className="flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      {new Date(post.date).toLocaleDateString(locale)}
                    </div>
                    <span className="flex items-center gap-1 text-[#C9A84C] font-semibold">
                      {isFr ? 'Lire' : 'Read'} <ArrowRight className="w-3 h-3" />
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>

          {filtered.length === 0 && (
            <div className="text-center py-16 text-gray-400">
              {isFr ? 'Aucun article dans cette catégorie.' : 'No articles in this category.'}
            </div>
          )}
        </div>
      </section>
    </>
  );
}
